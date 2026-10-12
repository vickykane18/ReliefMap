"""
===========================================================
ReliefMap
AI Routes
Author : Vigneshan S
Year : 2026
===========================================================
"""

from flask import Blueprint, jsonify, request

from services.ai_service import AIService
from services.workflow_service import WorkflowService

ai_bp = Blueprint(
    "ai",
    __name__,
    url_prefix="/aoi"
)


@ai_bp.route("/ai/insights", methods=["GET"])
def get_ai_insights():
    insights = AIService.generate_insights()
    workflow = WorkflowService.get_workflow_stats()

    return jsonify({
        "success": True,
        "data": {
            **insights,
            "workflow": workflow
        }
    }), 200


@ai_bp.route("/ai/recommendation", methods=["GET"])
def get_ai_recommendation():
    return jsonify({
        "success": True,
        "data": {
            "recommendation": AIService.ai_recommendation(),
            "disaster": AIService.disaster_level()
        }
    }), 200


@ai_bp.route("/ai/chat", methods=["POST"])
def ai_chat():
    body = request.get_json() or {}
    question = body.get("message", "").strip()

    if not question:
        return jsonify({
            "success": False,
            "message": "Message is required."
        }), 400

    response = AIService.generate_chat_response(question)

    return jsonify({
        "success": True,
        "data": {
            "message": response
        }
    }), 200
