"""
===========================================================
ReliefMap
Settings Routes
Author : Vigneshan S
Year : 2026
===========================================================
"""

from flask import Blueprint, jsonify, request

settings_bp = Blueprint(
    "settings",
    __name__,
    url_prefix="/aoi"
)

# ===========================================================
# IN-MEMORY SETTINGS
# Replace with database in production
# ===========================================================

app_settings = {

    "theme": "light",

    "language": "English",

    "notifications": True

}

# ===========================================================
# GET SETTINGS
# GET /aoi/settings
# ===========================================================

@settings_bp.route("/settings", methods=["GET"])
def get_settings():

    return jsonify({

        "success": True,

        "message": "Settings loaded successfully.",

        "data": app_settings

    }), 200


# ===========================================================
# UPDATE SETTINGS
# PUT /aoi/settings/update
# ===========================================================

@settings_bp.route("/settings/update", methods=["PUT"])
def update_settings():

    body = request.get_json()

    if not body:

        return jsonify({

            "success": False,

            "message": "Invalid request body."

        }), 400

    app_settings["theme"] = body.get(

        "theme",

        app_settings["theme"]

    )

    app_settings["language"] = body.get(

        "language",

        app_settings["language"]

    )

    app_settings["notifications"] = body.get(

        "notifications",

        app_settings["notifications"]

    )

    return jsonify({

        "success": True,

        "message": "Settings updated successfully.",

        "data": app_settings

    }), 200


# ===========================================================
# RESET SETTINGS
# POST /aoi/settings/reset
# ===========================================================

@settings_bp.route("/settings/reset", methods=["POST"])
def reset_settings():

    app_settings["theme"] = "light"

    app_settings["language"] = "English"

    app_settings["notifications"] = True

    return jsonify({

        "success": True,

        "message": "Settings reset successfully.",

        "data": app_settings

    }), 200


# ===========================================================
# AVAILABLE THEMES
# GET /aoi/settings/themes
# ===========================================================

@settings_bp.route("/settings/themes", methods=["GET"])
def get_themes():

    return jsonify({

        "success": True,

        "data": [

            "light",

            "dark",

            "blue",

            "green"

        ]

    }), 200


# ===========================================================
# AVAILABLE LANGUAGES
# GET /aoi/settings/languages
# ===========================================================

@settings_bp.route("/settings/languages", methods=["GET"])
def get_languages():

    return jsonify({

        "success": True,

        "data": [

            "English",

            "Tamil"

        ]

    }), 200


# ===========================================================
# SETTINGS HEALTH
# GET /aoi/settings/status
# ===========================================================

@settings_bp.route("/settings/status", methods=["GET"])
def settings_status():

    return jsonify({

        "success": True,

        "module": "Settings",

        "status": "Running",

        "version": "1.0"

    }), 200