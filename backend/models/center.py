"""
===========================================================
ReliefMap
Relief Center Model
Author : Vigneshan S
Year : 2026
===========================================================
"""

from datetime import datetime
from database import db


class ReliefCenter(db.Model):
    """
    Relief Center Table
    """

    __tablename__ = "relief_centers"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    name = db.Column(
        db.String(150),
        nullable=False
    )

    type = db.Column(
        db.String(50),
        nullable=False
    )
    # Hospital
    # Shelter
    # Food Center
    # Medical Camp

    location = db.Column(
        db.String(200),
        nullable=False
    )

    latitude = db.Column(
        db.Float,
        nullable=False
    )

    longitude = db.Column(
        db.Float,
        nullable=False
    )

    capacity = db.Column(
        db.Integer,
        default=0
    )

    available_resources = db.Column(
        db.Integer,
        default=0
    )

    volunteers = db.Column(
        db.Integer,
        default=0
    )

    contact_person = db.Column(
        db.String(120)
    )

    contact_number = db.Column(
        db.String(20)
    )

    email = db.Column(
        db.String(150)
    )

    status = db.Column(
        db.String(30),
        default="Open"
    )
    # Open
    # Busy
    # Closed

    description = db.Column(
        db.Text
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

            "type": self.type,

            "location": self.location,

            "lat": self.latitude,

            "lon": self.longitude,

            "capacity": self.capacity,

            "resources": self.available_resources,

            "volunteers": self.volunteers,

            "contact_person": self.contact_person,

            "contact_number": self.contact_number,

            "email": self.email,

            "status": self.status,

            "description": self.description,

            "updated_at": self.updated_at.isoformat()

        }

    def __repr__(self):

        return f"<ReliefCenter {self.name}>"