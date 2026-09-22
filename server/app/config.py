import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "cyber-secret-phishguard-2026")
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///phishguard.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB file upload limit
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")