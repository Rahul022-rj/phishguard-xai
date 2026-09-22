from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.models import db

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    db.init_app(app)

    # Automatically create database tables on startup
    with app.app_context():
        db.create_all()

    # Register API routes
    from app.routes import api_bp
    app.register_blueprint(api_bp, url_prefix="/api")

    @app.route("/")
    def health_check():
        return {"status": "online", "service": "PhishGuard XAI API Engine"}, 200

    return app