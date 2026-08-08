"""
===========================================================
ReliefMap
Disaster Report Model
Author : Vigneshan S
Year : 2026
===========================================================
"""

from datetime import datetime
from database import db


class DisasterReport(db.Model):
    """Citizen disaster reports with AI analysis and approval status."""

    __tablename__ = "disaster_reports"

    id = db.Column(db.Integer, primary_key=True)

    reporter_name = db.Column(db.String(120), nullable=False)
    reporter_phone = db.Column(db.String(20))
    reporter_email = db.Column(db.String(150))

    disaster_type = db.Column(db.String(50), nullable=False)
    severity = db.Column(db.String(20), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    description = db.Column(db.Text, nullable=False)

    status = db.Column(db.String(30), default="reported")
    # reported -> analyzed -> pending_approval -> approved -> active -> completed | rejected

    risk_score = db.Column(db.Integer, default=0)
    risk_level = db.Column(db.String(20))
    ai_analysis = db.Column(db.Text)
    ai_recommendation = db.Column(db.Text)
    recommended_center_id = db.Column(db.Integer, db.ForeignKey("relief_centers.id"))

    collector_name = db.Column(db.String(120))
    collector_notes = db.Column(db.Text)
    approved_at = db.Column(db.DateTime)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    mission = db.relationship(
        "Mission",
        backref="report",
        uselist=False,
        cascade="all, delete-orphan"
    )

    recommended_center = db.relationship(
        "ReliefCenter",
        foreign_keys=[recommended_center_id]
    )

    def to_dict(self):
        center = None
        if self.recommended_center:
            center = self.recommended_center.to_dict()

        mission_data = None
        if self.mission:
            mission_data = self.mission.to_dict()

        return {
            "id": self.id,
            "reporter_name": self.reporter_name,
            "reporter_phone": self.reporter_phone,
            "reporter_email": self.reporter_email,
            "disaster_type": self.disaster_type,
            "severity": self.severity,
            "location": self.location,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "description": self.description,
            "status": self.status,
            "risk_score": self.risk_score,
            "risk_level": self.risk_level,
            "ai_analysis": self.ai_analysis,
            "ai_recommendation": self.ai_recommendation,
            "recommended_center_id": self.recommended_center_id,
            "recommended_center": center,
            "collector_name": self.collector_name,
            "collector_notes": self.collector_notes,
            "approved_at": self.approved_at.isoformat() if self.approved_at else None,
            "mission": mission_data,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }

    def __repr__(self):
        return f"<DisasterReport {self.id} {self.disaster_type}>"
