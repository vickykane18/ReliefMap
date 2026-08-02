"""
===========================================================
ReliefMap
Map Routes
Author : Vigneshan S
Year : 2026
===========================================================
"""

from flask import Blueprint, jsonify, request

from database import db
from models.center import ReliefCenter

map_bp = Blueprint(
    "map",
    __name__,
    url_prefix="/aoi"
)

# ===========================================================
# GET ALL RELIEF CENTERS
# GET /aoi/map
# ===========================================================

@map_bp.route("/map", methods=["GET"])
def get_relief_centers():

    centers = ReliefCenter.query.all()

    data = []

    for center in centers:

        data.append(center.to_dict())

    return jsonify({

        "success": True,

        "message": "Relief centers loaded successfully.",

        "count": len(data),

        "data": data

    }), 200


# ===========================================================
# GET CENTER BY ID
# GET /aoi/map/<id>
# ===========================================================

@map_bp.route("/map/<int:center_id>", methods=["GET"])
def get_center(center_id):

    center = ReliefCenter.query.get(center_id)

    if not center:

        return jsonify({

            "success": False,

            "message": "Relief center not found."

        }), 404

    return jsonify({

        "success": True,

        "data": center.to_dict()

    }), 200


# ===========================================================
# ADD RELIEF CENTER
# POST /aoi/map
# ===========================================================

@map_bp.route("/map", methods=["POST"])
def add_center():

    body = request.get_json()

    center = ReliefCenter(

        name=body.get("name"),

        type=body.get("type"),

        location=body.get("location"),

        latitude=body.get("lat"),

        longitude=body.get("lon"),

        capacity=body.get("capacity", 0),

        available_resources=body.get("resources", 0),

        volunteers=body.get("volunteers", 0),

        contact_person=body.get("contact_person"),

        contact_number=body.get("contact_number"),

        email=body.get("email"),

        status=body.get("status", "Open"),

        description=body.get("description")

    )

    db.session.add(center)

    db.session.commit()

    return jsonify({

        "success": True,

        "message": "Relief center added successfully.",

        "data": center.to_dict()

    }), 201


# ===========================================================
# UPDATE RELIEF CENTER
# PUT /aoi/map/<id>
# ===========================================================

@map_bp.route("/map/<int:center_id>", methods=["PUT"])
def update_center(center_id):

    center = ReliefCenter.query.get(center_id)

    if not center:

        return jsonify({

            "success": False,

            "message": "Center not found."

        }), 404

    body = request.get_json()

    center.name = body.get("name", center.name)
    center.type = body.get("type", center.type)
    center.location = body.get("location", center.location)
    center.latitude = body.get("lat", center.latitude)
    center.longitude = body.get("lon", center.longitude)
    center.capacity = body.get("capacity", center.capacity)
    center.available_resources = body.get("resources", center.available_resources)
    center.volunteers = body.get("volunteers", center.volunteers)
    center.contact_person = body.get("contact_person", center.contact_person)
    center.contact_number = body.get("contact_number", center.contact_number)
    center.email = body.get("email", center.email)
    center.status = body.get("status", center.status)
    center.description = body.get("description", center.description)

    db.session.commit()

    return jsonify({

        "success": True,

        "message": "Relief center updated successfully.",

        "data": center.to_dict()

    }), 200


# ===========================================================
# DELETE RELIEF CENTER
# DELETE /aoi/map/<id>
# ===========================================================

@map_bp.route("/map/<int:center_id>", methods=["DELETE"])
def delete_center(center_id):

    center = ReliefCenter.query.get(center_id)

    if not center:

        return jsonify({

            "success": False,

            "message": "Center not found."

        }), 404

    db.session.delete(center)

    db.session.commit()

    return jsonify({

        "success": True,

        "message": "Relief center deleted successfully."

    }), 200


# ===========================================================
# GET CENTER TYPES
# GET /aoi/map/types
# ===========================================================

@map_bp.route("/map/types", methods=["GET"])
def center_types():

    return jsonify({

        "success": True,

        "data": [

            "Hospital",

            "Shelter",

            "Food Center",

            "Medical Camp"

        ]

    }), 200