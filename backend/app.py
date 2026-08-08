"""
===========================================================
ReliefMap Backend
Author : Vigneshan S
Year : 2026
===========================================================
"""

from flask import Flask
from flask_cors import CORS

from config import Config
from database import db

from routes.dashboard import dashboard_bp
from routes.map import map_bp
from routes.news import news_bp
from routes.users import users_bp
from routes.settings import settings_bp
from routes.contact import contact_bp
from routes.reports import reports_bp
from routes.ai import ai_bp
from routes.auth import auth_bp

from models.disaster_report import DisasterReport
from models.mission import Mission


def create_app():

    app = Flask(__name__)

    app.config.from_object(Config)

    CORS(app)

    db.init_app(app)

    app.register_blueprint(dashboard_bp)
    app.register_blueprint(map_bp)
    app.register_blueprint(news_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(settings_bp)
    app.register_blueprint(contact_bp)
    app.register_blueprint(reports_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(auth_bp)

    @app.route("/")
    def home():
        return {
            "project": "ReliefMap",
            "status": "Running",
            "version": "1.0"
        }

    return app


app = create_app()

from seed import seed_database

with app.app_context():
    db.create_all()
    seed_database()


if __name__ == "__main__":
    import os

    port = int(os.environ.get("PORT", Config.PORT))

    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )

    