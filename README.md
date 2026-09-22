# PhishGuard XAI — Explainable AI Fake Offer Letter & Phishing Inspector 🛡️✨

**PhishGuard XAI** is a full-stack cybersecurity inspector built for **Google Build with AI / PromptWars**. It combines **Google Gemini 1.5 Flash** structured JSON Explainable AI (XAI) analysis with multi-factor rule engines to identify fake offer letters, recruitment document scams, and phishing job portals in real time.

---

## 🚀 Key Features

- **📄 Document & Screenshot OCR**: Multi-format text extraction from PDF offer letters (`pypdf`) and screenshot image files (`pytesseract` / `Pillow`).
- **🌐 URL Phishing Analyzer**: Scrapes recruitment web portals to evaluate protocol security (HTTPS/SSL), high-risk TLDs, and brand impersonation anomalies.
- **📊 Explainable AI Threat Matrix**:
  - **Scam Threat Index**: Weighted risk score (0–100%) with threat categorization.
  - **Risk Vector Radar Chart**: 5-axis visual breakdown mapping payment demands, urgency, domain reputation, contact verification, and salary anomalies.
  - **Red Flag Anomalies**: Specific security alerts accompanied by verbatim highlighted text snippets.
- **💬 Interactive AI Security Assistant**: Multi-turn contextual chat drawer powered by Gemini 2.5 Flash grounded in the scanned document or URL data.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React + Vite
- **Styling**: Tailwind CSS (Dark Cyber Glassmorphism Design System)
- **Data Visualization**: Chart.js (`react-chartjs-2`)
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Backend
- **Framework**: Python Flask + Flask-CORS
- **Database**: SQLAlchemy + SQLite (`phishguard.db`)
- **Server**: Gunicorn
- **AI Model**: Google Gemini 1.5 Flash via `google-genai` SDK
- **OCR Engine**: `pypdf` + `pytesseract` + `Pillow`
- **Web Scraper**: `requests` + `BeautifulSoup4`

---

## 📁 Repository Structure

```text
phishguard-xai/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/         # ScannerUpload, ThreatGauge, RiskRadar, RedFlagCard, UrlTelemetryCard, ChatDrawer
│   │   ├── pages/              # Dashboard.jsx
│   │   ├── services/           # api.js
│   │   └── index.css           # Tailwind directives & glassmorphism theme
│   ├── vercel.json             # Vercel SPA routing rewrites
│   └── vite.config.js
└── server/                     # Flask Backend API
    ├── app/
    │   ├── services/
    │   │   ├── gemini_service.py # Gemini 1.5 Flash structured JSON XAI engine
    │   │   ├── ocr_service.py    # PDF & Image text extraction
    │   │   ├── scorer_service.py # Deterministic multi-factor rule engine
    │   │   └── url_service.py    # URL phishing & domain security analyzer
    │   ├── models.py           # SQLAlchemy database schemas
    │   └── routes.py           # API endpoints (/api/scan, /api/chat, /api/history)
    ├── run.py
    └── requirements.txt
