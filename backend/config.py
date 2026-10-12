"""
===========================================================
ReliefMap
Configuration
Author : Vigneshan S
===========================================================
"""

import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))


class Config:

    SECRET_KEY = os.getenv(
        "SECRET_KEY",
        "reliefmap-secret-key-2026"
    )

    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{os.path.join(BASE_DIR,'reliefmap.db')}"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JSON_SORT_KEYS = False

    # Disable debug mode for production-ready prototype
    DEBUG = False

    HOST = "0.0.0.0"

    PORT = 5000