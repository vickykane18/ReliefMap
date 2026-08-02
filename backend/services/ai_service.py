"""
===========================================================
ReliefMap
AI Service
Author : Vigneshan S
Year : 2026
===========================================================
"""

from models.center import ReliefCenter
from models.news import News


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

        return {

            "disaster": AIService.disaster_level(),

            "resources": AIService.resource_forecast(),

            "volunteers": AIService.volunteer_analysis(),

            "recommended_centers": AIService.recommend_centers(),

            "alerts": AIService.emergency_alerts(),

            "ai_recommendation": AIService.ai_recommendation()

        }


# ===========================================================
# TEST
# ===========================================================

if __name__ == "__main__":

    print("✅ AI Service Ready")