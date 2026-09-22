import re

# High-risk free/disposable domain list commonly used by fake recruiters
SUSPICIOUS_DOMAINS = [
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "protonmail.com",
    "yandex.com", "mail.com", "zoho.com", "gmx.com", "tempmail.com"
]

# Keywords triggering specific risk categories
PAYMENT_KEYWORDS = ["processing fee", "registration fee", "laptop fee", "security deposit", "wire transfer", "crypto", "usdt", "gift card", "pay upfront", "remit"]
URGENCY_KEYWORDS = ["immediate", "within 24 hours", "urgent", "expires today", "strictly required", "act now", "limited time"]
SALARY_KEYWORDS = ["$200,000", "$300,000", "per day", "daily payout", "1000/day", "500/day"]

def compute_deterministic_score(raw_text: str, extracted_email: str = "") -> dict:
    """
    Evaluates text against security rules and outputs calibrated breakdown scores.
    """
    text_lower = raw_text.lower()
    email_lower = extracted_email.lower() if extracted_email else ""

    payment_score = 0
    domain_score = 0
    urgency_score = 0
    salary_score = 0
    contact_score = 0

    detected_rules = []

    # 1. Payment Demand Rule
    for kw in PAYMENT_KEYWORDS:
        if kw in text_lower:
            payment_score = max(payment_score, 90)
            detected_rules.append({
                "title": "Upfront Payment Request Detected",
                "description": f"Text explicitly contains payment keyword: '{kw}'."
            })
            break

    # 2. Recruiter Email Domain Rule
    if email_lower:
        domain_parts = email_lower.split("@")
        if len(domain_parts) > 1:
            domain = domain_parts[1]
            if domain in SUSPICIOUS_DOMAINS:
                domain_score = 85
                detected_rules.append({
                    "title": "Free Public Email Provider Used",
                    "description": f"Official offer sent from public email domain (@{domain}) rather than corporate domain."
                })
    
    # 3. Urgency / Pressure Rule
    for kw in URGENCY_KEYWORDS:
        if kw in text_lower:
            urgency_score = max(urgency_score, 75)
            detected_rules.append({
                "title": "Artificial High-Pressure Urgency",
                "description": f"Coercive urgency phrase detected: '{kw}'."
            })
            break

    # 4. Salary Anomaly Rule
    for kw in SALARY_KEYWORDS:
        if kw in text_lower:
            salary_score = max(salary_score, 80)
            detected_rules.append({
                "title": "Unrealistic Compensation Structure",
                "description": f"Offer mentions disproportionate pay structure: '{kw}'."
            })
            break

    # 5. Missing Contact Address Rule
    if "address" not in text_lower and "suite" not in text_lower and "street" not in text_lower:
        contact_score = 45

    # Compute Weighted Threat Index
    overall_score = int(
        (payment_score * 0.35) +
        (domain_score * 0.25) +
        (urgency_score * 0.20) +
        (salary_score * 0.10) +
        (contact_score * 0.10)
    )

    # Classify Risk Level
    if overall_score >= 80:
        risk_level = "Critical"
    elif overall_score >= 50:
        risk_level = "High"
    elif overall_score >= 25:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    return {
        "rule_risk_score": overall_score,
        "rule_risk_level": risk_level,
        "breakdown": {
            "payment_demands": payment_score,
            "domain_authenticity": domain_score,
            "language_urgency": urgency_score,
            "salary_anomaly": salary_score,
            "contact_verification": contact_score
        },
        "rule_red_flags": detected_rules
    }