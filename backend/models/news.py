"""
===========================================================
ReliefMap
News Model
Author : Vigneshan S
Year : 2026
===========================================================
"""

from datetime import datetime
from database import db


class News(db.Model):
    """
    News Table
    """

    __tablename__ = "news"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    title = db.Column(
        db.String(200),
        nullable=False
    )

    content = db.Column(
        db.Text,
        nullable=False
    )

    image = db.Column(
        db.String(255),
        default="news-placeholder.jpg"
    )

    category = db.Column(
        db.String(50),
        default="General"
    )
    # Flood
    # Medical
    # Food
    # Shelter
    # Weather
    # General

    priority = db.Column(
        db.String(20),
        default="Medium"
    )
    # Low
    # Medium
    # High
    # Critical

    author = db.Column(
        db.String(120),
        default="ReliefMap Admin"
    )

    location = db.Column(
        db.String(150)
    )

    is_active = db.Column(
        db.Boolean,
        default=True
    )

    views = db.Column(
        db.Integer,
        default=0
    )

    published_at = db.Column(
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

            "title": self.title,

            "content": self.content,

            "image": self.image,

            "category": self.category,

            "priority": self.priority,

            "author": self.author,

            "location": self.location,

            "views": self.views,

            "is_active": self.is_active,

            "created_at": self.published_at.isoformat(),

            "updated_at": self.updated_at.isoformat()

        }

    def __repr__(self):

        return f"<News {self.title}>"