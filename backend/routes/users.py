"""
===========================================================
ReliefMap
Users Routes
Author : Vigneshan S
Year : 2026
===========================================================
"""

from flask import Blueprint, jsonify, request

from database import db
from models.user import User

users_bp = Blueprint(
    "users",
    __name__,
    url_prefix="/aoi"
)

# ===========================================================
# GET ALL USERS
# GET /aoi/users
# ===========================================================

@users_bp.route("/users", methods=["GET"])
def get_users():

    users = User.query.order_by(User.id).all()

    return jsonify({

        "success": True,

        "count": len(users),

        "data": [

            user.to_dict()

            for user in users

        ]

    }), 200


# ===========================================================
# GET USER BY ID
# GET /aoi/users/<id>
# ===========================================================

@users_bp.route("/users/<int:user_id>", methods=["GET"])
def get_user(user_id):

    user = User.query.get(user_id)

    if not user:

        return jsonify({

            "success": False,

            "message": "User not found."

        }), 404

    return jsonify({

        "success": True,

        "data": user.to_dict()

    }), 200


# ===========================================================
# CREATE USER
# POST /aoi/users
# ===========================================================

@users_bp.route("/users", methods=["POST"])
def create_user():

    body = request.get_json()

    email = body.get("email")

    existing = User.query.filter_by(

        email=email

    ).first()

    if existing:

        return jsonify({

            "success": False,

            "message": "Email already exists."

        }), 400

    user = User(

        username=body.get("username"),

        email=email,

        password=body.get("password"),

        role=body.get("role", "Volunteer"),

        phone=body.get("phone"),

        avatar=body.get("avatar", "default.png"),

        address=body.get("address"),

        city=body.get("city"),

        state=body.get("state"),

        country=body.get("country", "India")

    )

    db.session.add(user)

    db.session.commit()

    return jsonify({

        "success": True,

        "message": "User created successfully.",

        "data": user.to_dict()

    }), 201


# ===========================================================
# UPDATE USER
# PUT /aoi/users/<id>
# ===========================================================

@users_bp.route("/users/<int:user_id>", methods=["PUT"])
def update_user(user_id):

    user = User.query.get(user_id)

    if not user:

        return jsonify({

            "success": False,

            "message": "User not found."

        }), 404

    body = request.get_json()

    user.username = body.get(

        "username",

        user.username

    )

    user.email = body.get(

        "email",

        user.email

    )

    user.role = body.get(

        "role",

        user.role

    )

    user.phone = body.get(

        "phone",

        user.phone

    )

    user.avatar = body.get(

        "avatar",

        user.avatar

    )

    user.address = body.get(

        "address",

        user.address

    )

    user.city = body.get(

        "city",

        user.city

    )

    user.state = body.get(

        "state",

        user.state

    )

    user.country = body.get(

        "country",

        user.country

    )

    if body.get("password"):

        user.password = body.get("password")

    db.session.commit()

    return jsonify({

        "success": True,

        "message": "User updated successfully.",

        "data": user.to_dict()

    }), 200


# ===========================================================
# DELETE USER
# DELETE /aoi/users/<id>
# ===========================================================

@users_bp.route("/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):

    user = User.query.get(user_id)

    if not user:

        return jsonify({

            "success": False,

            "message": "User not found."

        }), 404

    db.session.delete(user)

    db.session.commit()

    return jsonify({

        "success": True,

        "message": "User deleted successfully."

    }), 200


# ===========================================================
# USER ROLES
# GET /aoi/users/roles
# ===========================================================

@users_bp.route("/users/roles", methods=["GET"])
def get_roles():

    return jsonify({

        "success": True,

        "data": [

            "Administrator",

            "Volunteer",

            "NGO",

            "Citizen"

        ]

    }), 200