"""
===========================================================
ReliefMap
Contact Routes
Author : Vigneshan S
Year : 2026
===========================================================
"""

from flask import Blueprint, jsonify, request

from database import db
from models.contact import Contact

contact_bp = Blueprint(
    "contact",
    __name__,
    url_prefix="/aoi"
)

# ===========================================================
# GET ALL CONTACTS
# GET /aoi/contact
# ===========================================================

@contact_bp.route("/contact", methods=["GET"])
def get_contacts():

    contacts = Contact.query.order_by(
        Contact.created_at.desc()
    ).all()

    return jsonify({

        "success": True,

        "count": len(contacts),

        "data": [

            contact.to_dict()

            for contact in contacts

        ]

    }), 200


# ===========================================================
# GET CONTACT BY ID
# GET /aoi/contact/<id>
# ===========================================================

@contact_bp.route("/contact/<int:contact_id>", methods=["GET"])
def get_contact(contact_id):

    contact = Contact.query.get(contact_id)

    if not contact:

        return jsonify({

            "success": False,

            "message": "Contact message not found."

        }), 404

    return jsonify({

        "success": True,

        "data": contact.to_dict()

    }), 200


# ===========================================================
# CREATE CONTACT MESSAGE
# POST /aoi/contact
# ===========================================================

@contact_bp.route("/contact", methods=["POST"])
def create_contact():

    body = request.get_json()

    if not body:

        return jsonify({

            "success": False,

            "message": "Invalid request."

        }), 400

    contact = Contact(

        name=body.get("name"),

        email=body.get("email"),

        phone=body.get("phone"),

        subject=body.get("subject", "General Inquiry"),

        message=body.get("message"),

        ip_address=request.remote_addr

    )

    db.session.add(contact)

    db.session.commit()

    return jsonify({

        "success": True,

        "message": "Message submitted successfully.",

        "data": contact.to_dict()

    }), 201


# ===========================================================
# UPDATE CONTACT STATUS
# PUT /aoi/contact/<id>
# ===========================================================

@contact_bp.route("/contact/<int:contact_id>", methods=["PUT"])
def update_contact(contact_id):

    contact = Contact.query.get(contact_id)

    if not contact:

        return jsonify({

            "success": False,

            "message": "Contact message not found."

        }), 404

    body = request.get_json()

    contact.status = body.get(

        "status",

        contact.status

    )

    contact.admin_notes = body.get(

        "admin_notes",

        contact.admin_notes

    )

    db.session.commit()

    return jsonify({

        "success": True,

        "message": "Contact updated successfully.",

        "data": contact.to_dict()

    }), 200


# ===========================================================
# DELETE CONTACT
# DELETE /aoi/contact/<id>
# ===========================================================

@contact_bp.route("/contact/<int:contact_id>", methods=["DELETE"])
def delete_contact(contact_id):

    contact = Contact.query.get(contact_id)

    if not contact:

        return jsonify({

            "success": False,

            "message": "Contact message not found."

        }), 404

    db.session.delete(contact)

    db.session.commit()

    return jsonify({

        "success": True,

        "message": "Contact deleted successfully."

    }), 200


# ===========================================================
# CONTACT STATISTICS
# GET /aoi/contact/stats
# ===========================================================

@contact_bp.route("/contact/stats", methods=["GET"])
def contact_stats():

    total = Contact.query.count()

    pending = Contact.query.filter_by(

        status="Pending"

    ).count()

    replied = Contact.query.filter_by(

        status="Replied"

    ).count()

    closed = Contact.query.filter_by(

        status="Closed"

    ).count()

    return jsonify({

        "success": True,

        "data": {

            "total": total,

            "pending": pending,

            "replied": replied,

            "closed": closed

        }

    }), 200