from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    scans = db.relationship('Scan', backref='user', lazy=True)

class Scan(db.Model):
    __tablename__ = 'scans'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    input_type = db.Column(db.String(20), nullable=False) # file, text, url
    company_name = db.Column(db.String(150), nullable=True)
    hr_email = db.Column(db.String(150), nullable=True)
    offered_salary = db.Column(db.String(100), nullable=True)
    joining_date = db.Column(db.String(100), nullable=True)
    
    risk_score = db.Column(db.Integer, nullable=False) # 0 to 100
    risk_level = db.Column(db.String(20), nullable=False) # Low, Medium, High, Critical
    confidence = db.Column(db.Integer, default=90)
    
    # Stored as JSON strings
    breakdown_json = db.Column(db.Text, nullable=True)
    red_flags_json = db.Column(db.Text, nullable=True)
    highlighted_sentences_json = db.Column(db.Text, nullable=True)
    safety_tips_json = db.Column(db.Text, nullable=True)
    
    raw_text = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    chats = db.relationship('ChatHistory', backref='scan', lazy=True)

class ChatHistory(db.Model):
    __tablename__ = 'chat_history'

    id = db.Column(db.Integer, primary_key=True)
    scan_id = db.Column(db.Integer, db.ForeignKey('scans.id'), nullable=False)
    role = db.Column(db.String(20), nullable=False) # user or assistant
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class ReportedScam(db.Model):
    __tablename__ = 'reported_scams'

    id = db.Column(db.Integer, primary_key=True)
    scan_id = db.Column(db.Integer, db.ForeignKey('scans.id'), nullable=True)
    domain_or_email = db.Column(db.String(150), nullable=False)
    reason = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)