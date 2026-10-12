"""
===========================================================
ReliefMap
Authentication Routes (Citizen / NGO / Volunteer / Admin)
Author : Vigneshan S
Year : 2026
===========================================================
"""

import secrets

from flask import Blueprint, jsonify, request

from werkzeug.security import (
    generate_password_hash,
    check_password_hash
)

from database import db
from models.user import User

auth_bp = Blueprint(
    "auth",
    __name__,
    url_prefix="/aoi/auth"
)

# Simple in-memory token store (maps token -> user id)
# For production, replace with JWT / server-side sessions.
_sessions = {}


# ===========================================================
# VALID ROLES
# ===========================================================

VALID_ROLES = ("Citizen", "NGO", "Volunteer", "Administrator")


# ===========================================================
# REGISTER
# POST /aoi/auth/register
# ===========================================================

@auth_bp.route("/register", methods=["POST"])
def register():

    body = request.get_json() or {}

    username = (body.get("username") or "").strip()
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""
    role = body.get("role") or "Citizen"
    phone = (body.get("phone") or "").strip()

    # --- Validation ---
    missing = [
        field for field in ("username", "email", "password")
        if not body.get(field)
    ]

    if missing:

        return jsonify({
            "success": False,
            "message": f"Missing fields: {', '.join(missing)}"
        }), 400

    if role not in VALID_ROLES:

        return jsonify({
            "success": False,
            "message": "Invalid role. Choose Citizen, NGO, Volunteer or Administrator."
        }), 400

    if len(password) < 6:

        return jsonify({
            "success": False,
            "message": "Password must be at least 6 characters."
        }), 400

    existing = User.query.filter_by(email=email).first()

    if existing:

        return jsonify({
            "success": False,
            "message": "An account with this email already exists."
        }), 409

    # --- Create user ---
    user = User(

        username=username,
        email=email,
        password=generate_password_hash(password),
        role=role,
        phone=phone,
        avatar="default.png",
        country="India"
    )

    db.session.add(user)
    db.session.commit()

    data = user.to_dict()
    data.pop("is_active", None)
    data.pop("created_at", None)

    return jsonify({
        "success": True,
        "message": "Account created successfully.",
        "data": data
    }), 201


# ===========================================================
# LOGIN
# POST /aoi/auth/login
# ===========================================================

@auth_bp.route("/login", methods=["POST"])
def login():

    body = request.get_json() or {}

    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""

    if not email or not password:

        return jsonify({
            "success": False,
            "message": "Email and password are required."
        }), 400

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password, password):

        return jsonify({
            "success": False,
            "message": "Invalid email or password."
        }), 401

    if not user.is_active:

        return jsonify({
            "success": False,
            "message": "This account has been deactivated."
        }), 403

    # Create session token
    token = secrets.token_hex(24)
    _sessions[token] = user.id

    data = user.to_dict()
    data.pop("is_active", None)
    data.pop("created_at", None)

    return jsonify({
        "success": True,
        "message": f"Welcome back, {user.username}!",
        "token": token,
        "data": data
    }), 200


# ===========================================================
# GET CURRENT USER
# GET /aoi/auth/me
# ===========================================================

@auth_bp.route("/me", methods=["GET"])
def me():

    token = request.headers.get(
        "Authorization",
        ""
    ).replace("Bearer ", "")

    user_id = _sessions.get(token)

    if not user_id:

        return jsonify({
            "success": False,
            "message": "Not authenticated."
        }), 401

    user = User.query.get(user_id)

    if not user:

        return jsonify({
            "success": False,
            "message": "User not found."
        }), 404

    data = user.to_dict()
    data.pop("is_active", None)
    data.pop("created_at", None)

    return jsonify({
        "success": True,
        "data": data
    }), 200


# ===========================================================
# LOGOUT
# POST /aoi/auth/logout
# ===========================================================

@auth_bp.route("/logout", methods=["POST"])
def logout():

    token = request.headers.get(
        "Authorization",
        ""
    ).replace("Bearer ", "")

    _sessions.pop(token, None)

    return jsonify({
        "success": True,
        "message": "Logged out successfully."
    }), 200


# ===========================================================
# END
# ===========================================================
