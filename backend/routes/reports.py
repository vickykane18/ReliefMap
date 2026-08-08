"""
===========================================================
ReliefMap
Disaster Report & Workflow Routes
Author : Vigneshan S
Year : 2026
===========================================================
"""

from flask import Blueprint, jsonify, request

from database import db
from models.disaster_report import DisasterReport
from models.mission import Mission
from services.workflow_service import WorkflowService

reports_bp = Blueprint(
    "reports",
    __name__,
    url_prefix="/aoi"
)


@reports_bp.route("/reports", methods=["GET"])
def get_reports():
    status = request.args.get("status")
    query = DisasterReport.query.order_by(DisasterReport.created_at.desc())

    if status:
        query = query.filter_by(status=status)

    reports = query.all()

    return jsonify({
        "success": True,
        "count": len(reports),
        "data": [r.to_dict() for r in reports]
    }), 200


@reports_bp.route("/reports/<int:report_id>", methods=["GET"])
def get_report(report_id):
    report = DisasterReport.query.get(report_id)

    if not report:
        return jsonify({
            "success": False,
            "message": "Report not found."
        }), 404

    return jsonify({
        "success": True,
        "data": report.to_dict()
    }), 200


@reports_bp.route("/reports", methods=["POST"])
def create_report():
    body = request.get_json()

    if not body:
        return jsonify({
            "success": False,
            "message": "Invalid request."
        }), 400

    required = ["reporter_name", "disaster_type", "location", "description"]
    missing = [f for f in required if not body.get(f)]

    if missing:
        return jsonify({
            "success": False,
            "message": f"Missing fields: {', '.join(missing)}"
        }), 400

    report = WorkflowService.create_report(body)

    return jsonify({
        "success": True,
        "message": "Disaster report submitted. AI analysis complete.",
        "data": report.to_dict()
    }), 201


@reports_bp.route("/reports/<int:report_id>/approve", methods=["PUT"])
def approve_report(report_id):
    body = request.get_json() or {}

    report, error = WorkflowService.approve_report(
        report_id,
        collector_name=body.get("collector_name", "District Collector"),
        collector_notes=body.get("collector_notes", "")
    )

    if error:
        return jsonify({
            "success": False,
            "message": error
        }), 400

    return jsonify({
        "success": True,
        "message": "Report approved. Resources allocated and volunteers assigned.",
        "data": report.to_dict()
    }), 200


@reports_bp.route("/reports/<int:report_id>/reject", methods=["PUT"])
def reject_report(report_id):
    body = request.get_json() or {}

    report, error = WorkflowService.reject_report(
        report_id,
        collector_name=body.get("collector_name", "District Collector"),
        collector_notes=body.get("collector_notes", "")
    )

    if error:
        return jsonify({
            "success": False,
            "message": error
        }), 400

    return jsonify({
        "success": True,
        "message": "Report rejected.",
        "data": report.to_dict()
    }), 200


@reports_bp.route("/reports/pending", methods=["GET"])
def pending_reports():
    reports = DisasterReport.query.filter_by(
        status="pending_approval"
    ).order_by(
        DisasterReport.risk_score.desc()
    ).all()

    return jsonify({
        "success": True,
        "count": len(reports),
        "data": [r.to_dict() for r in reports]
    }), 200


@reports_bp.route("/reports/workflow/stats", methods=["GET"])
def workflow_stats():
    return jsonify({
        "success": True,
        "data": WorkflowService.get_workflow_stats()
    }), 200


@reports_bp.route("/missions", methods=["GET"])
def get_missions():
    status = request.args.get("status")
    query = Mission.query.order_by(Mission.created_at.desc())

    if status:
        query = query.filter_by(status=status)

    missions = query.all()

    enriched = []
    for mission in missions:
        data = mission.to_dict()
        report = DisasterReport.query.get(mission.report_id)
        if report:
            data["report"] = {
                "id": report.id,
                "disaster_type": report.disaster_type,
                "location": report.location,
                "severity": report.severity,
                "reporter_name": report.reporter_name,
                "risk_score": report.risk_score,
                "risk_level": report.risk_level
            }
        enriched.append(data)

    return jsonify({
        "success": True,
        "count": len(enriched),
        "data": enriched
    }), 200


@reports_bp.route("/missions/<int:mission_id>", methods=["GET"])
def get_mission(mission_id):
    mission = Mission.query.get(mission_id)

    if not mission:
        return jsonify({
            "success": False,
            "message": "Mission not found."
        }), 404

    data = mission.to_dict()
    report = DisasterReport.query.get(mission.report_id)
    if report:
        data["report"] = report.to_dict()

    return jsonify({
        "success": True,
        "data": data
    }), 200


@reports_bp.route("/missions/<int:mission_id>/complete", methods=["PUT"])
def complete_mission(mission_id):
    body = request.get_json() or {}

    mission, error = WorkflowService.complete_mission(
        mission_id,
        completion_notes=body.get("completion_notes", "")
    )

    if error:
        return jsonify({
            "success": False,
            "message": error
        }), 400

    data = mission.to_dict()
    report = DisasterReport.query.get(mission.report_id)
    if report:
        data["report"] = report.to_dict()

    return jsonify({
        "success": True,
        "message": "Mission completed. Final report generated.",
        "data": data
    }), 200
