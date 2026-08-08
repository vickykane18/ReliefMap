"""
===========================================================
ReliefMap
AI Service
Author : Vigneshan S
Year : 2026
===========================================================
"""

import math

from models.center import ReliefCenter
from models.news import News
from models.disaster_report import DisasterReport


class AIService:
    """
    ReliefMap AI Prediction Service
    """

    @staticmethod
    def get_statistics():

        centers = ReliefCenter.query.all()

        total_centers = len(centers)

        total_volunteers = sum(
            center.volunteers or 0
            for center in centers
        )

        total_resources = sum(
            center.available_resources or 0
            for center in centers
        )

        return {
            "centers": centers,
            "total_centers": total_centers,
            "total_volunteers": total_volunteers,
            "total_resources": total_resources
        }

    # =======================================================
    # DISASTER RISK ANALYSIS
    # =======================================================

    @staticmethod
    def disaster_level():

        stats = AIService.get_statistics()

        centers = stats["total_centers"]
        volunteers = stats["total_volunteers"]
        resources = stats["total_resources"]

        score = 0

        if centers == 0:
            score += 50
        elif centers < 5:
            score += 30
        elif centers < 10:
            score += 15

        if volunteers < 20:
            score += 40
        elif volunteers < 100:
            score += 25

        if resources < 200:
            score += 40
        elif resources < 500:
            score += 25

        if score >= 80:
            level = "Critical"

        elif score >= 60:
            level = "High"

        elif score >= 30:
            level = "Moderate"

        else:
            level = "Low"

        return {

            "risk_score": score,

            "risk_level": level

        }

    # =======================================================
    # RESOURCE FORECAST
    # =======================================================

    @staticmethod
    def resource_forecast():

        resources = AIService.get_statistics()["total_resources"]

        if resources < 200:

            forecast = "Very High Demand"

        elif resources < 500:

            forecast = "High Demand"

        elif resources < 1000:

            forecast = "Medium Demand"

        else:

            forecast = "Sufficient Resources"

        return {

            "available_resources": resources,

            "forecast": forecast

        }

    # =======================================================
    # VOLUNTEER ANALYSIS
    # =======================================================

    @staticmethod
    def volunteer_analysis():

        volunteers = AIService.get_statistics()["total_volunteers"]

        if volunteers < 20:

            recommendation = "Critical shortage. Recruit volunteers immediately."

        elif volunteers < 50:

            recommendation = "Volunteer count is low."

        elif volunteers < 150:

            recommendation = "Volunteer availability is moderate."

        else:

            recommendation = "Volunteer availability is sufficient."

        return {

            "total_volunteers": volunteers,

            "recommendation": recommendation

        }

    # =======================================================
    # BEST RELIEF CENTERS
    # =======================================================

    @staticmethod
    def recommend_centers():

        centers = ReliefCenter.query.filter_by(
            status="Open"
        ).order_by(
            ReliefCenter.available_resources.desc()
        ).limit(5).all()

        return [

            center.to_dict()

            for center in centers

        ]

    # =======================================================
    # EMERGENCY ALERTS
    # =======================================================

    @staticmethod
    def emergency_alerts():

        alerts = News.query.filter(

            News.priority.in_(

                ["High", "Critical"]

            )

        ).all()

        return [

            item.to_dict()

            for item in alerts

        ]

    # =======================================================
    # AI RECOMMENDATION
    # =======================================================

    @staticmethod
    def ai_recommendation():

        disaster = AIService.disaster_level()["risk_level"]

        if disaster == "Critical":

            return (
                "Deploy emergency response teams immediately, "
                "increase food distribution, and activate all shelters."
            )

        elif disaster == "High":

            return (
                "Increase volunteers, replenish medical supplies, "
                "and monitor affected areas closely."
            )

        elif disaster == "Moderate":

            return (
                "Continue monitoring disaster-prone areas and "
                "maintain adequate relief resources."
            )

        return (
            "System is stable. Continue routine monitoring."
        )

    # =======================================================
    # COMPLETE AI INSIGHTS
    # =======================================================

    @staticmethod
    def generate_insights():

        pending = DisasterReport.query.filter_by(
            status="pending_approval"
        ).count()

        active = DisasterReport.query.filter_by(
            status="active"
        ).count()

        latest = DisasterReport.query.order_by(
            DisasterReport.created_at.desc()
        ).first()

        disaster = AIService.disaster_level()
        if latest and latest.risk_score:
            disaster = {
                "risk_score": latest.risk_score,
                "risk_level": latest.risk_level
            }

        return {

            "disaster": disaster,

            "resources": AIService.resource_forecast(),

            "volunteers": AIService.volunteer_analysis(),

            "recommended_centers": AIService.recommend_centers(),

            "alerts": AIService.emergency_alerts(),

            "ai_recommendation": AIService.ai_recommendation(),

            "pending_reports": pending,

            "active_missions": active,

            "latest_report": latest.to_dict() if latest else None

        }

    # =======================================================
    # ANALYZE DISASTER REPORT
    # =======================================================

    @staticmethod
    def analyze_report(report):
        severity_scores = {
            "Low": 20,
            "Medium": 45,
            "High": 70,
            "Critical": 90
        }

        type_scores = {
            "Flood": 15,
            "Fire": 20,
            "Earthquake": 25,
            "Cyclone": 18,
            "Medical": 10,
            "Landslide": 22,
            "Other": 8
        }

        score = severity_scores.get(report.severity, 45)
        score += type_scores.get(report.disaster_type, 8)

        desc = (report.description or "").lower()
        urgent_words = [
            "trapped", "injured", "children", "elderly",
            "collapse", "drowning", "urgent", "critical", "death"
        ]
        for word in urgent_words:
            if word in desc:
                score += 5

        score = min(score, 100)

        if score >= 80:
            level = "Critical"
        elif score >= 60:
            level = "High"
        elif score >= 30:
            level = "Moderate"
        else:
            level = "Low"

        center = AIService.find_nearest_center(
            report.latitude,
            report.longitude,
            report.disaster_type
        )

        center_name = center.name if center else "nearest relief center"
        center_id = center.id if center else None

        analysis = (
            f"AI analyzed a {report.severity} severity {report.disaster_type} "
            f"report from {report.location}. "
            f"Risk score: {score}/100 ({level}). "
            f"Recommended deployment to {center_name}."
        )

        if level == "Critical":
            recommendation = (
                f"IMMEDIATE ACTION: Deploy emergency teams to {report.location}. "
                f"Activate {center_name} with maximum resources. "
                f"Assign at least 40 volunteers. Notify all nearby shelters."
            )
        elif level == "High":
            recommendation = (
                f"Deploy relief team to {report.location} via {center_name}. "
                f"Increase food and medical supplies. "
                f"Monitor area every 30 minutes."
            )
        elif level == "Moderate":
            recommendation = (
                f"Send assessment team to {report.location}. "
                f"Prepare resources at {center_name} for potential escalation."
            )
        else:
            recommendation = (
                f"Log and monitor situation at {report.location}. "
                f"Keep {center_name} on standby."
            )

        return {
            "risk_score": score,
            "risk_level": level,
            "analysis": analysis,
            "recommendation": recommendation,
            "recommended_center_id": center_id
        }

# =======================================================
    # AI CHAT ASSISTANT (DATA-AWARE)
    # =======================================================

    @staticmethod
    def generate_chat_response(question):
        """Answer a user question using live database data."""
        question = (question or "").lower()
        stats = AIService.get_statistics()
        workflow = AIService.get_workflow_snapshot()

        # --- Help ---
        if any(word in question for word in ["help", "what can you", "hi", "hello", "hey"]):
            return (
                "I'm the ReliefMap AI Assistant. I can help you with:\n"
                "• Hospitals & medical help\n"
                "• Shelters & food centers\n"
                "• Volunteer availability\n"
                "• Disaster risk & alerts\n"
                "• Active missions & workflow\n"
                "Try asking 'which hospitals are open?' or 'how many volunteers are there?'"
            )

        # --- Hospitals ---
        if any(word in question for word in ["hospital", "medical", "doctor", "clinic", "treatment"]):
            hospitals = ReliefCenter.query.filter_by(type="Hospital", status="Open").all()
            if not hospitals:
                return "No open hospitals found right now. Emergency medical teams are on standby."
            lines = ["Open hospitals:"]
            for h in hospitals[:4]:
                lines.append(
                    f"• {h.name} ({h.location}) — "
                    f"{h.available_resources} resources, {h.volunteers} volunteers"
                )
            return "\n".join(lines)

        # --- Shelters ---
        if any(word in question for word in ["shelter", "evacuat", "refuge", "housing", "safe place"]):
            shelters = ReliefCenter.query.filter_by(type="Shelter", status="Open").all()
            if not shelters:
                return "No open shelters detected. Emergency shelter deployment is being prepared."
            lines = ["Open shelters:"]
            for s in shelters[:4]:
                lines.append(
                    f"• {s.name} ({s.location}) — "
                    f"capacity {s.capacity}, {s.available_resources} resources"
                )
            return "\n".join(lines)

        # --- Food ---
        if any(word in question for word in ["food", "meal", "water", "eat", "ration"]):
            food = ReliefCenter.query.filter_by(type="Food Center", status="Open").all()
            forecast = AIService.resource_forecast()
            if food:
                lines = ["Food distribution centers:"]
                for f in food[:4]:
                    lines.append(
                        f"• {f.name} ({f.location}) — {f.available_resources} units available"
                    )
                lines.append(f"\nResource forecast: {forecast['forecast']} "
                             f"({forecast['available_resources']} total units).")
                return "\n".join(lines)
            return f"Resource forecast: {forecast['forecast']} " \
                   f"({forecast['available_resources']} total units available)."

        # --- Volunteers ---
        if any(word in question for word in ["volunteer", "recruit", "people to help", "staff"]):
            analysis = AIService.volunteer_analysis()
            return (
                f"There are {analysis['total_volunteers']} volunteers available.\n"
                f"{analysis['recommendation']}"
            )

        # --- Disaster / risk ---
        if any(word in question for word in ["disaster", "risk", "danger", "threat", "flood", "storm", "earthquake"]):
            disaster = AIService.disaster_level()
            alerts = AIService.emergency_alerts()
            lines = [
                f"Current disaster risk level: {disaster['risk_level']} "
                f"(score {disaster['risk_score']}/100)."
            ]
            if alerts:
                lines.append("Active emergency alerts:")
                for a in alerts[:3]:
                    lines.append(f"• {a.get('title', 'Alert')} — {a.get('priority', 'High')}")
            lines.append(f"\nAI recommendation: {AIService.ai_recommendation()}")
            return "\n".join(lines)

        # --- Centers ---
        if any(word in question for word in ["center", "centre", "relief center", "location"]):
            centers = AIService.recommend_centers()
            if not centers:
                return "No relief centers available right now."
            lines = ["Top recommended relief centers:"]
            for c in centers[:4]:
                lines.append(
                    f"• {c.get('name')} ({c.get('type')}) — "
                    f"{c.get('location')}, {c.get('resources')} resources"
                )
            return "\n".join(lines)

        # --- Missions / workflow ---
        if any(word in question for word in ["mission", "workflow", "pipeline", "progress", "active mission"]):
            pipeline = workflow
            return (
                f"Workflow status:\n"
                f"• Reports: {pipeline['total_reports']}\n"
                f"• Pending approval: {pipeline['pending_approval']}\n"
                f"• Active missions: {pipeline['active_missions']}\n"
                f"• Completed: {pipeline['completed_missions']}"
            )

        # --- Resources ---
        if any(word in question for word in ["resource", "supply", "stock", "inventory"]):
            forecast = AIService.resource_forecast()
            return (
                f"Total available resources: {forecast['available_resources']} units.\n"
                f"Forecast: {forecast['forecast']}."
            )

        # --- Suggestion ---
        return (
            "I'm not sure about that. You can ask me about:\n"
            "• hospitals, shelters, food centers\n"
            "• volunteers, resources, disaster risk\n"
            "• active missions and workflow"
        )

    @staticmethod
    def get_workflow_snapshot():
        from services.workflow_service import WorkflowService
        return WorkflowService.get_workflow_stats()

    # =======================================================
    # FIND NEAREST CENTER
    # =======================================================

    @staticmethod
    def find_nearest_center(lat, lon, disaster_type=None):
        centers = ReliefCenter.query.filter_by(status="Open").all()
        if not centers:
            centers = ReliefCenter.query.all()
        if not centers:
            return None

        type_preference = {
            "Medical": "Hospital",
            "Fire": "Hospital",
            "Flood": "Shelter",
            "Cyclone": "Shelter",
            "Earthquake": "Hospital"
        }
        preferred = type_preference.get(disaster_type)

        if preferred:
            preferred_centers = [c for c in centers if c.type == preferred]
            if preferred_centers:
                centers = preferred_centers

        if lat and lon:
            def distance(c):
                return math.sqrt(
                    (c.latitude - lat) ** 2 + (c.longitude - lon) ** 2
                )
            return min(centers, key=distance)

        return max(centers, key=lambda c: c.available_resources or 0)


# ===========================================================
# TEST
# ===========================================================

if __name__ == "__main__":

    print("✅ AI Service Ready")