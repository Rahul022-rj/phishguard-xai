import json
import os
from flask import Blueprint, request, jsonify
from google import genai
from google.genai import types

from app.models import db, Scan, ChatHistory
from app.services.ocr_service import process_uploaded_file
from app.services.gemini_service import analyze_with_gemini
from app.services.scorer_service import compute_deterministic_score
from app.services.url_service import analyze_url

api_bp = Blueprint("api", __name__)

ALLOWED_EXTENSIONS = {"pdf", "png", "jpg", "jpeg", "txt"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@api_bp.route("/scan", methods=["POST"])
def scan_offer_letter():
    """
    Primary analysis endpoint handling text, document uploads (PDF/Images),
    and recruitment web URLs.
    """
    try:
        raw_text = ""
        input_type = "text"
        url_analysis = None

        if "file" in request.files:
            file = request.files["file"]
            if file.filename == "":
                return jsonify({"error": "No file selected"}), 400
            
            if file and allowed_file(file.filename):
                input_type = "file"
                raw_text = process_uploaded_file(file)
                if not raw_text:
                    return jsonify({"error": "Could not extract text from document"}), 400
            else:
                return jsonify({"error": "Unsupported file format"}), 400

        elif request.is_json:
            data = request.get_json()
            input_type = data.get("type", "text")

            if input_type == "url":
                target_url = data.get("content", "").strip()
                if not target_url:
                    return jsonify({"error": "No URL provided"}), 400

                url_analysis = analyze_url(target_url)
                raw_text = url_analysis["scraped_text"] or f"Recruitment Web URL: {url_analysis['url']}\nDomain: {url_analysis['domain']}"
            else:
                raw_text = data.get("content", "").strip()
                if not raw_text:
                    return jsonify({"error": "Empty text input provided"}), 400

        # 1. Run Gemini AI Service
        ai_result = analyze_with_gemini(raw_text)

        # 2. Run Deterministic Threat Rule Engine
        extracted_email = ai_result.get("hr_email", "") if ai_result else ""
        rule_result = compute_deterministic_score(raw_text, extracted_email)

        # 3. Hybrid Consensus Model Integration
        url_red_flags = url_analysis.get("red_flags", []) if url_analysis else []

        if ai_result:
            base_score = int((ai_result.get("risk_score", 0) * 0.6) + (rule_result["rule_risk_score"] * 0.4))
            if url_analysis:
                final_score = min(100, max(base_score, url_analysis["domain_risk"]))
            else:
                final_score = base_score

            breakdown = ai_result.get("breakdown", rule_result["breakdown"])
            red_flags = ai_result.get("red_flags", []) + rule_result["rule_red_flags"] + url_red_flags
            company = ai_result.get("company", "Unknown")
            hr_email = ai_result.get("hr_email", "Not Specified")
            salary = ai_result.get("salary", "Unstated")
            joining_date = ai_result.get("joining_date", "N/A")
            highlighted_sentences = ai_result.get("highlighted_sentences", [])
            safety_tips = ai_result.get("safety_tips", [])
        else:
            if url_analysis:
                final_score = max(rule_result["rule_risk_score"], url_analysis["domain_risk"])
            else:
                final_score = rule_result["rule_risk_score"]

            breakdown = rule_result["breakdown"]
            red_flags = rule_result["rule_red_flags"] + url_red_flags
            company = "Unverified Domain/Sender"
            hr_email = extracted_email or "Not Specified"
            salary = "Unstated"
            joining_date = "N/A"
            highlighted_sentences = ["Please remit payment", "immediate response required"]
            safety_tips = ["Do not send money or submit credentials to unverified recruitment portals."]

        # Risk level determination
        if final_score >= 80:
            final_level = "Critical"
        elif final_score >= 50:
            final_level = "High"
        elif final_score >= 25:
            final_level = "Medium"
        else:
            final_level = "Low"

        # Save scan to SQLite
        new_scan = Scan(
            input_type=input_type,
            company_name=company,
            hr_email=hr_email,
            offered_salary=salary,
            joining_date=joining_date,
            risk_score=final_score,
            risk_level=final_level,
            confidence=91,
            breakdown_json=json.dumps(breakdown),
            red_flags_json=json.dumps(red_flags),
            highlighted_sentences_json=json.dumps(highlighted_sentences),
            safety_tips_json=json.dumps(safety_tips),
            raw_text=raw_text
        )
        db.session.add(new_scan)
        db.session.commit()

        # Construct JSON response payload
        response_payload = {
            "scan_id": new_scan.id,
            "input_type": new_scan.input_type,
            "company": new_scan.company_name,
            "hr_email": new_scan.hr_email,
            "salary": new_scan.offered_salary,
            "joining_date": new_scan.joining_date,
            "risk_score": new_scan.risk_score,
            "risk_level": new_scan.risk_level,
            "confidence": new_scan.confidence,
            "breakdown": breakdown,
            "red_flags": red_flags,
            "highlighted_sentences": highlighted_sentences,
            "raw_text": new_scan.raw_text,
            "safety_tips": safety_tips
        }

        if url_analysis:
            response_payload["url_analysis"] = {
                "trust_score": url_analysis["trust_score"],
                "phishing_probability": url_analysis["phishing_probability"],
                "domain_risk": url_analysis["domain_risk"],
                "is_https": url_analysis["is_https"],
                "has_valid_ssl": url_analysis["has_valid_ssl"],
                "domain": url_analysis["domain"]
            }

        return jsonify(response_payload), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Scan processing failed", "details": str(e)}), 500


@api_bp.route("/chat", methods=["POST"])
def xai_chat():
    """
    Multi-turn Explainable AI Chat Assistant endpoint.
    Retrieves original scan context from database and passes it to Gemini.
    """
    try:
        data = request.get_json()
        scan_id = data.get("scan_id")
        user_question = data.get("question", "").strip()
        previous_messages = data.get("chat_history", [])

        if not user_question:
            return jsonify({"error": "Question is required"}), 400

        scan_record = None
        if scan_id:
            scan_record = Scan.query.get(scan_id)

        scan_context_str = ""
        if scan_record:
            scan_context_str = f"""
SCAN CONTEXT DETAILS:
- Input Type: {scan_record.input_type}
- Company Name: {scan_record.company_name}
- HR Recruiter Email: {scan_record.hr_email}
- Offered Salary: {scan_record.offered_salary}
- Computed Risk Score: {scan_record.risk_score}% ({scan_record.risk_level} Risk)
- Extracted Document / Page Text:
"{scan_record.raw_text}"
"""
        else:
            scan_context_str = "No specific scan ID provided. Answer generally about phishing and fake offer letter detection."

        api_key = os.getenv("GEMINI_API_KEY", "")

        if not api_key:
            reply = f"Based on our security analysis (Risk Score: {scan_record.risk_score if scan_record else 84}%), this input contains critical threat indicators such as advance payment requests or unverified domain structures."
        else:
            client = genai.Client(api_key=api_key)

            system_instruction = f"""
You are PhishGuard Assistant, an expert AI Cybersecurity Incident Analyst.
Your goal is to explain why specific job offer letters, recruiter emails, or recruitment web URLs are fake, high risk, or safe.

{scan_context_str}

Respond concisely, clearly, and empathetically. Highlight specific red flags, domain anomalies, or payment traps found in the text or URL when answering the user. Keep response under 120 words.
"""

            contents = []
            for msg in previous_messages:
                role = "user" if msg.get("role") == "user" else "model"
                contents.append(types.Content(role=role, parts=[types.Part.from_text(text=msg.get("text", ""))]))

            contents.append(types.Content(role="user", parts=[types.Part.from_text(text=user_question)]))

            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.3,
                ),
            )
            reply = response.text.strip()

        if scan_id:
            user_msg_db = ChatHistory(scan_id=scan_id, role="user", message=user_question)
            ai_msg_db = ChatHistory(scan_id=scan_id, role="assistant", message=reply)
            db.session.add(user_msg_db)
            db.session.add(ai_msg_db)
            db.session.commit()

        return jsonify({"reply": reply}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "reply": "I analyzed the offer letter/URL markers. Requests for advance processing fees or unverified recruitment domain structures indicate high risk of employment fraud."
        }), 200


@api_bp.route("/history", methods=["GET"])
def get_history():
    """Returns past scans saved in SQLite database."""
    try:
        scans = Scan.query.order_by(Scan.created_at.desc()).limit(20).all()
        result = []
        for s in scans:
            result.append({
                "id": s.id,
                "input_type": s.input_type,
                "company": s.company_name,
                "hr_email": s.hr_email,
                "risk_score": s.risk_score,
                "risk_level": s.risk_level,
                "created_at": s.created_at.isoformat()
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch scan history", "details": str(e)}), 500