"""
===========================================================
ReliefMap
Mission Model
Author : Vigneshan S
Year : 2026
===========================================================
"""

from datetime import datetime
from database import db


class Mission(db.Model):
    """Relief mission created after collector approval."""

    __tablename__ = "missions"

    id = db.Column(db.Integer, primary_key=True)

    report_id = db.Column(
        db.Integer,
        db.ForeignKey("disaster_reports.id"),
        nullable=False,
        unique=True
    )

    center_id = db.Column(
        db.Integer,
        db.ForeignKey("relief_centers.id"),
        nullable=False
    )

    status = db.Column(db.String(30), default="active")
    # active -> completed

    food_allocated = db.Column(db.Integer, default=0)
    water_allocated = db.Column(db.Integer, default=0)
    medicine_allocated = db.Column(db.Integer, default=0)
    volunteers_assigned = db.Column(db.Integer, default=0)

    completion_notes = db.Column(db.Text)
    final_report = db.Column(db.Text)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)

    center = db.relationship("ReliefCenter", foreign_keys=[center_id])

    def to_dict(self):
        center = None
        if self.center:
            center = self.center.to_dict()

        return {
            "id": self.id,
            "report_id": self.report_id,
            "center_id": self.center_id,
            "center": center,
            "status": self.status,
            "food_allocated": self.food_allocated,
            "water_allocated": self.water_allocated,
            "medicine_allocated": self.medicine_allocated,
            "volunteers_assigned": self.volunteers_assigned,
            "completion_notes": self.completion_notes,
            "final_report": self.final_report,
            "created_at": self.created_at.isoformat(),
            "completed_at": self.completed_at.isoformat() if self.completed_at else None
        }

    def __repr__(self):
        return f"<Mission {self.id} report={self.report_id}>"
