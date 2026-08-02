"""
===========================================================
ReliefMap
Contact Model
Author : Vigneshan S
Year : 2026
===========================================================
"""

from datetime import datetime
from database import db


class Contact(db.Model):
    """
    Contact Messages Table
    """

    __tablename__ = "contacts"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    name = db.Column(
        db.String(120),
        nullable=False
    )

    email = db.Column(
        db.String(150),
        nullable=False
    )

    phone = db.Column(
        db.String(20)
    )

    subject = db.Column(
        db.String(200),
        nullable=False
    )

    message = db.Column(
        db.Text,
        nullable=False
    )

    status = db.Column(
        db.String(30),
        default="Pending"
    )
    # Pending
    # Read
    # Replied
    # Closed

    admin_notes = db.Column(
        db.Text
    )

    ip_address = db.Column(
        db.String(50)
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    def to_dict(self):

        return {

            "id": self.id,

            "name": self.name,

            "email": self.email,

            "phone": self.phone,

            "subject": self.subject,

            "message": self.message,

            "status": self.status,

            "admin_notes": self.admin_notes,

            "ip_address": self.ip_address,

            "created_at": self.created_at.isoformat(),

            "updated_at": self.updated_at.isoformat()

        }

    def __repr__(self):

        return f"<Contact {self.name}>"