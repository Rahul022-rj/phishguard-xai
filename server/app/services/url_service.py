import re
import urllib.parse
import ssl
import socket
import requests
from bs4 import BeautifulSoup

SUSPICIOUS_TLDS = [".xyz", ".top", ".club", ".online", ".site", ".tk", ".ml", ".ga", ".cf", ".gq", ".vip", ".work"]
BRAND_KEYWORDS = ["google", "microsoft", "amazon", "apple", "netflix", "paypal", "meta", "linkedin", "capgemini", "tcs", "infosys"]
PAYMENT_KEYWORDS = ["fee", "deposit", "wire", "crypto", "usdt", "pay", "registration", "charge", "payment"]

def check_ssl_certificate(domain: str) -> bool:
    """Verifies if the target domain has a valid active SSL/TLS certificate."""
    try:
        context = ssl.create_default_context()
        with socket.create_connection((domain, 443), timeout=3) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                return True
    except Exception:
        return False

def analyze_url(target_url: str) -> dict:
    """
    Fetches and inspects a target URL for domain anomalies, security posture,
    and phishing heuristics.
    """
    if not target_url.startswith(("http://", "https://")):
        target_url = "https://" + target_url

    parsed_url = urllib.parse.urlparse(target_url)
    domain = parsed_url.netloc or parsed_url.path.split('/')[0]
    
    # 1. Basic Protocol & Domain Checks
    is_https = parsed_url.scheme == "https"
    has_valid_ssl = check_ssl_certificate(domain) if is_https else False
    
    has_suspicious_tld = any(domain.endswith(tld) for tld in SUSPICIOUS_TLDS)
    brand_impersonation = [brand for brand in BRAND_KEYWORDS if brand in domain.lower() and not domain.lower().endswith(f"{brand}.com")]

    # 2. Page Content Inspection
    scraped_text = ""
    has_login_form = False
    payment_terms_found = []
    
    try:
        response = requests.get(target_url, timeout=5, headers={"User-Agent": "PhishGuard-Bot/1.0"})
        soup = BeautifulSoup(response.text, "html.parser")
        
        # Check for inputs indicating credential harvesting
        if soup.find("input", {"type": "password"}) or soup.find("form"):
            has_login_form = True

        scraped_text = soup.get_text(separator=" ").strip()
        text_lower = scraped_text.lower()

        # Check for payment demands in body
        for kw in PAYMENT_KEYWORDS:
            if kw in text_lower:
                payment_terms_found.append(kw)

    except Exception as e:
        print(f"[URL Service Error]: {str(e)}")

    # 3. Scoring Matrix
    domain_risk = 10
    red_flags = []

    if not is_https:
        domain_risk += 30
        red_flags.append({
            "title": "Insecure HTTP Protocol",
            "description": "Website uses unencrypted HTTP instead of HTTPS."
        })

    if has_suspicious_tld:
        domain_risk += 35
        red_flags.append({
            "title": "High-Risk Top Level Domain",
            "description": f"Domain uses a suspicious TLD commonly associated with scams."
        })

    if brand_impersonation:
        domain_risk += 45
        red_flags.append({
            "title": "Suspected Brand Impersonation",
            "description": f"Domain name contains brand name '{brand_impersonation[0]}' but is not hosted on its official domain."
        })

    if has_login_form and not is_https:
        domain_risk += 40
        red_flags.append({
            "title": "Unsecured Login Form",
            "description": "Credential input form detected over insecure HTTP connection."
        })

    if payment_terms_found:
        domain_risk += 25
        red_flags.append({
            "title": "Upfront Payment Terms Detected",
            "description": f"Page contains financial transaction keywords: {', '.join(payment_terms_found[:3])}."
        })

    domain_risk = min(domain_risk, 100)
    trust_score = max(0, 100 - domain_risk)
    phishing_probability = domain_risk

    return {
        "url": target_url,
        "domain": domain,
        "is_https": is_https,
        "has_valid_ssl": has_valid_ssl,
        "trust_score": trust_score,
        "phishing_probability": phishing_probability,
        "domain_risk": domain_risk,
        "has_login_form": has_login_form,
        "payment_terms": payment_terms_found,
        "red_flags": red_flags,
        "scraped_text": scraped_text[:2000]  # First 2000 chars for AI context
    }