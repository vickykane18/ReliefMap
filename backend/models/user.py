"""
===========================================================
ReliefMap
User Model
Author : Vigneshan S
Year : 2026
===========================================================
"""

from datetime import datetime
from database import db


class User(db.Model):
    """
    User Table
    """

    __tablename__ = "users"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    username = db.Column(
        db.String(100),
        nullable=False
    )

    email = db.Column(
        db.String(150),
        unique=True,
        nullable=False
    )

    password = db.Column(
        db.String(255),
        nullable=False
    )

    role = db.Column(
        db.String(50),
        default="Volunteer"
    )

    phone = db.Column(
        db.String(20)
    )

    avatar = db.Column(
        db.String(255),
        default="default.png"
    )

    address = db.Column(
        db.Text
    )

    city = db.Column(
        db.String(100)
    )

    state = db.Column(
        db.String(100)
    )

    country = db.Column(
        db.String(100),
        default="India"
    )

    is_active = db.Column(
        db.Boolean,
        default=True
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

            "username": self.username,

            "email": self.email,

            "role": self.role,

            "phone": self.phone,

            "avatar": self.avatar,

            "address": self.address,

            "city": self.city,

            "state": self.state,

            "country": self.country,

            "is_active": self.is_active,

            "created_at": self.created_at.isoformat()

        }

    def __repr__(self):

        return f"<User {self.username}>"