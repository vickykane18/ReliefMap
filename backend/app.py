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
    app.run(
        host=Config.HOST,
        port=Config.PORT,
        debug=Config.DEBUG
    )