import os
import json
from google import genai
from google.genai import types

def analyze_with_gemini(raw_text: str) -> dict:
    """
    Sends offer letter text to Google Gemini 1.5 Flash using structured JSON enforcement.
    """
    api_key = os.getenv("GEMINI_API_KEY", "")
    
    if not api_key:
        print("[Gemini Service Warning]: GEMINI_API_KEY is not set. Returning fallback mock structure.")
        return None

    try:
        client = genai.Client(api_key=api_key)

        system_instruction = """
You are PhishGuard XAI, an expert cybersecurity AI inspector specializing in identifying fake job offer letters, employment scams, and phishing attempts.

Analyze the user's provided text and return ONLY a valid JSON object without any backticks, markdown code blocks, or explanatory text.

The JSON output MUST STRICTLY follow this key structure:
{
  "company": "Extracted company name or Unknown",
  "hr_email": "Extracted recruiter email or Not Specified",
  "salary": "Extracted compensation details or Unstated",
  "joining_date": "Extracted start date or N/A",
  "risk_score": Integer (0 to 100 representing scam probability),
  "risk_level": String ("Low", "Medium", "High", or "Critical"),
  "confidence": Integer (0 to 100),
  "breakdown": {
    "payment_demands": Integer (0-100),
    "domain_authenticity": Integer (0-100),
    "language_urgency": Integer (0-100),
    "salary_anomaly": Integer (0-100),
    "contact_verification": Integer (0-100)
  },
  "red_flags": [
    {
      "title": "Short title of anomaly",
      "description": "Clear explanation of why this feature indicates a scam"
    }
  ],
  "highlighted_sentences": [
    "Exact verbatim substring from the raw text that represents a scam red flag"
  ],
  "safety_tips": [
    "Actionable advice for the job seeker"
  ]
}
"""

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=f"Analyze this job offer letter / recruitment message:\n\n{raw_text}",
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.1,
                response_mime_type="application/json"
            ),
        )

        # Parse JSON output
        response_text = response.text.strip()
        
        # Clean any potential leftover markdown code block delimiters if present
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]

        parsed_json = json.loads(response_text.strip())
        return parsed_json

    except Exception as e:
        print(f"[Gemini Service Error]: {str(e)}")
        return None