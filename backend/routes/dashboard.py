"""
===========================================================
ReliefMap
Dashboard Routes
Author : Vigneshan S
Year : 2026
===========================================================
"""

from flask import Blueprint, jsonify
from sqlalchemy import func

from database import db
from models.center import ReliefCenter

dashboard_bp = Blueprint(
    "dashboard",
    __name__,
    url_prefix="/aoi"
)


# ===========================================================
# GET DASHBOARD STATISTICS
# GET /aoi/stats
# ===========================================================

@dashboard_bp.route("/stats", methods=["GET"])
def get_dashboard_stats():

    hospitals = db.session.query(
        func.count(ReliefCenter.id)
    ).filter(
        ReliefCenter.type == "Hospital"
    ).scalar()

    food_centers = db.session.query(
        func.count(ReliefCenter.id)
    ).filter(
        ReliefCenter.type == "Food Center"
    ).scalar()

    shelters = db.session.query(
        func.count(ReliefCenter.id)
    ).filter(
        ReliefCenter.type == "Shelter"
    ).scalar()

    volunteers = db.session.query(
        func.sum(ReliefCenter.volunteers)
    ).scalar() or 0

    resources = db.session.query(
        func.sum(ReliefCenter.available_resources)
    ).scalar() or 0

    active_centers = db.session.query(
        func.count(ReliefCenter.id)
    ).filter(
        ReliefCenter.status == "Open"
    ).scalar()

    busy_centers = db.session.query(
        func.count(ReliefCenter.id)
    ).filter(
        ReliefCenter.status == "Busy"
    ).scalar()

    closed_centers = db.session.query(
        func.count(ReliefCenter.id)
    ).filter(
        ReliefCenter.status == "Closed"
    ).scalar()

    response = {

        "success": True,

        "message": "Dashboard statistics loaded successfully.",

        "data": {

            "Hospitals": hospitals,

            "Food Centers": food_centers,

            "Shelters": shelters,

            "Volunteers": volunteers,

            "Resources": resources,

            "Active Centers": active_centers,

            "Busy Centers": busy_centers,

            "Closed Centers": closed_centers

        }

    }

    return jsonify(response), 200


# ===========================================================
# DASHBOARD HEALTH
# GET /aoi/dashboard
# ===========================================================

@dashboard_bp.route("/dashboard", methods=["GET"])
def dashboard_status():

    return jsonify({

        "success": True,

        "module": "Dashboard",

        "status": "Running",

        "version": "1.0"

    }), 200