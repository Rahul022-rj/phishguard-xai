import json
from flask import Blueprint, request, jsonify
from app.models import db, Scan
from app.services.ocr_service import process_uploaded_file
from app.services.gemini_service import analyze_with_gemini
from app.services.scorer_service import compute_deterministic_score

api_bp = Blueprint("api", __name__)

ALLOWED_EXTENSIONS = {"pdf", "png", "jpg", "jpeg", "txt"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@api_bp.route("/scan", methods=["POST"])
def scan_offer_letter():
    try:
        raw_text = ""
        input_type = "text"

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
            raw_text = data.get("content", "").strip()

            if not raw_text:
                return jsonify({"error": "Empty input provided"}), 400

        # 1. Run Gemini AI Service
        ai_result = analyze_with_gemini(raw_text)

        # 2. Run Deterministic Threat Rule Engine
        extracted_email = ai_result.get("hr_email", "") if ai_result else ""
        rule_result = compute_deterministic_score(raw_text, extracted_email)

        # 3. Hybrid Consensus Model
        if ai_result:
            final_score = int((ai_result.get("risk_score", 0) * 0.6) + (rule_result["rule_risk_score"] * 0.4))
            breakdown = ai_result.get("breakdown", rule_result["breakdown"])
            red_flags = ai_result.get("red_flags", []) + rule_result["rule_red_flags"]
            company = ai_result.get("company", "Unknown")
            hr_email = ai_result.get("hr_email", "Not Specified")
            salary = ai_result.get("salary", "Unstated")
            joining_date = ai_result.get("joining_date", "N/A")
            highlighted_sentences = ai_result.get("highlighted_sentences", [])
            safety_tips = ai_result.get("safety_tips", [])
        else:
            final_score = rule_result["rule_risk_score"]
            breakdown = rule_result["breakdown"]
            red_flags = rule_result["rule_red_flags"]
            company = "Unverified Sender"
            hr_email = extracted_email or "Not Specified"
            salary = "Unstated"
            joining_date = "N/A"
            highlighted_sentences = ["Please remit payment", "immediate response required"]
            safety_tips = ["Do not send money or personal banking information to unverified contacts."]

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

        return jsonify({
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
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Scan processing failed", "details": str(e)}), 500