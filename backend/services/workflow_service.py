"""
===========================================================
ReliefMap
Workflow Service
Author : Vigneshan S
Year : 2026

Orchestrates the disaster response pipeline:
  Citizen report -> AI analysis -> Collector approval ->
  Resource allocation -> Volunteer assignment -> Mission complete -> Report
===========================================================
"""

from datetime import datetime

from database import db
from models.center import ReliefCenter
from models.disaster_report import DisasterReport
from models.mission import Mission
from services.ai_service import AIService


class WorkflowService:

    SEVERITY_ALLOCATION = {
        "Low": {"food": 50, "water": 80, "medicine": 20, "volunteers": 5},
        "Medium": {"food": 120, "water": 200, "medicine": 50, "volunteers": 12},
        "High": {"food": 250, "water": 400, "medicine": 100, "volunteers": 25},
        "Critical": {"food": 500, "water": 800, "medicine": 200, "volunteers": 40},
    }

    @staticmethod
    def create_report(data):
        report = DisasterReport(
            reporter_name=data.get("reporter_name"),
            reporter_phone=data.get("reporter_phone"),
            reporter_email=data.get("reporter_email"),
            disaster_type=data.get("disaster_type"),
            severity=data.get("severity", "Medium"),
            location=data.get("location"),
            latitude=data.get("latitude"),
            longitude=data.get("longitude"),
            description=data.get("description"),
            status="reported"
        )

        db.session.add(report)
        db.session.commit()

        WorkflowService.analyze_report(report.id)

        return DisasterReport.query.get(report.id)

    @staticmethod
    def analyze_report(report_id):
        report = DisasterReport.query.get(report_id)
        if not report:
            return None

        analysis = AIService.analyze_report(report)

        report.risk_score = analysis["risk_score"]
        report.risk_level = analysis["risk_level"]
        report.ai_analysis = analysis["analysis"]
        report.ai_recommendation = analysis["recommendation"]
        report.recommended_center_id = analysis["recommended_center_id"]
        report.status = "pending_approval"
        report.updated_at = datetime.utcnow()

        db.session.commit()
        return report

    @staticmethod
    def approve_report(report_id, collector_name, collector_notes=""):
        report = DisasterReport.query.get(report_id)
        if not report:
            return None, "Report not found."

        if report.status not in ("pending_approval", "analyzed"):
            return None, f"Report cannot be approved (status: {report.status})."

        center = ReliefCenter.query.get(report.recommended_center_id)
        if not center:
            return None, "Recommended relief center not found."

        allocation = WorkflowService.SEVERITY_ALLOCATION.get(
            report.severity,
            WorkflowService.SEVERITY_ALLOCATION["Medium"]
        )

        if center.available_resources < allocation["food"]:
            return None, "Insufficient resources at recommended center."

        if center.volunteers < allocation["volunteers"]:
            return None, "Insufficient volunteers at recommended center."

        center.available_resources -= allocation["food"] + allocation["medicine"]
        center.volunteers -= allocation["volunteers"]
        if center.available_resources < 100:
            center.status = "Busy"

        mission = Mission(
            report_id=report.id,
            center_id=center.id,
            status="active",
            food_allocated=allocation["food"],
            water_allocated=allocation["water"],
            medicine_allocated=allocation["medicine"],
            volunteers_assigned=allocation["volunteers"]
        )

        report.status = "active"
        report.collector_name = collector_name
        report.collector_notes = collector_notes
        report.approved_at = datetime.utcnow()
        report.updated_at = datetime.utcnow()

        db.session.add(mission)
        db.session.commit()

        return report, None

    @staticmethod
    def reject_report(report_id, collector_name, collector_notes=""):
        report = DisasterReport.query.get(report_id)
        if not report:
            return None, "Report not found."

        report.status = "rejected"
        report.collector_name = collector_name
        report.collector_notes = collector_notes
        report.updated_at = datetime.utcnow()

        db.session.commit()
        return report, None

    @staticmethod
    def complete_mission(mission_id, completion_notes=""):
        mission = Mission.query.get(mission_id)
        if not mission:
            return None, "Mission not found."

        if mission.status == "completed":
            return None, "Mission already completed."

        report = DisasterReport.query.get(mission.report_id)
        if not report:
            return None, "Linked report not found."

        mission.status = "completed"
        mission.completion_notes = completion_notes
        mission.completed_at = datetime.utcnow()
        mission.final_report = WorkflowService.generate_final_report(report, mission)

        report.status = "completed"
        report.updated_at = datetime.utcnow()

        db.session.commit()
        return mission, None

    @staticmethod
    def generate_final_report(report, mission):
        center_name = mission.center.name if mission.center else "Unknown"
        duration = "N/A"
        if mission.completed_at and mission.created_at:
            delta = mission.completed_at - mission.created_at
            hours = delta.total_seconds() / 3600
            duration = f"{hours:.1f} hours"

        return (
            f"=== ReliefMap Mission Report ===\n"
            f"Report ID: {report.id}\n"
            f"Disaster Type: {report.disaster_type}\n"
            f"Location: {report.location}\n"
            f"Severity: {report.severity}\n"
            f"Risk Score: {report.risk_score}/100 ({report.risk_level})\n\n"
            f"--- Response Summary ---\n"
            f"Approved by: {report.collector_name}\n"
            f"Relief Center: {center_name}\n"
            f"Resources Deployed: {mission.food_allocated} food, "
            f"{mission.water_allocated} water, {mission.medicine_allocated} medicine\n"
            f"Volunteers Assigned: {mission.volunteers_assigned}\n"
            f"Mission Duration: {duration}\n\n"
            f"--- AI Analysis ---\n"
            f"{report.ai_analysis}\n\n"
            f"--- Completion Notes ---\n"
            f"{mission.completion_notes or 'Mission completed successfully.'}\n\n"
            f"Status: COMPLETED\n"
            f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}"
        )

    @staticmethod
    def get_workflow_stats():
        total = DisasterReport.query.count()
        reported = DisasterReport.query.filter_by(status="reported").count()
        analyzed = DisasterReport.query.filter(
            DisasterReport.status.in_(["analyzed", "pending_approval"])
        ).count()
        pending = DisasterReport.query.filter_by(status="pending_approval").count()
        active = DisasterReport.query.filter_by(status="active").count()
        completed = DisasterReport.query.filter_by(status="completed").count()
        rejected = DisasterReport.query.filter_by(status="rejected").count()
        missions_active = Mission.query.filter_by(status="active").count()
        missions_completed = Mission.query.filter_by(status="completed").count()

        return {
            "total_reports": total,
            "reported": reported,
            "analyzed": analyzed,
            "pending_approval": pending,
            "active_missions": active,
            "completed_missions": completed,
            "rejected": rejected,
            "missions_active": missions_active,
            "missions_completed": missions_completed
        }

    @staticmethod
    def get_pipeline():
        """Return counts for each workflow stage for the pipeline stepper."""
        stats = WorkflowService.get_workflow_stats()
        return [
            {"key": "reported", "label": "Reported", "count": stats["reported"]},
            {"key": "analyzed", "label": "AI Analyzed", "count": stats["analyzed"]},
            {"key": "pending", "label": "Pending Approval", "count": stats["pending_approval"]},
            {"key": "active", "label": "Active Mission", "count": stats["active_missions"]},
            {"key": "completed", "label": "Completed", "count": stats["completed_missions"]}
        ]
