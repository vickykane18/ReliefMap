"""
===========================================================
ReliefMap
Analytics Service
Author : Vigneshan S
Year : 2026
===========================================================
"""

from collections import Counter

from models.center import ReliefCenter
from models.news import News
from models.user import User
from models.contact import Contact


class AnalyticsService:
    """
    Dashboard Analytics Service
    """

    # =======================================================
    # OVERVIEW
    # =======================================================

    @staticmethod
    def overview():

        centers = ReliefCenter.query.count()

        users = User.query.count()

        news = News.query.count()

        contacts = Contact.query.count()

        volunteers = sum(

            center.volunteers

            for center in ReliefCenter.query.all()

        )

        resources = sum(

            center.available_resources

            for center in ReliefCenter.query.all()

        )

        return {

            "centers": centers,

            "users": users,

            "news": news,

            "contacts": contacts,

            "volunteers": volunteers,

            "resources": resources

        }

    # =======================================================
    # CENTER DISTRIBUTION
    # =======================================================

    @staticmethod
    def center_distribution():

        distribution = Counter()

        centers = ReliefCenter.query.all()

        for center in centers:

            distribution[center.type] += 1

        return dict(distribution)

    # =======================================================
    # STATUS DISTRIBUTION
    # =======================================================

    @staticmethod
    def status_distribution():

        distribution = Counter()

        centers = ReliefCenter.query.all()

        for center in centers:

            distribution[center.status] += 1

        return dict(distribution)

    # =======================================================
    # VOLUNTEER ANALYTICS
    # =======================================================

    @staticmethod
    def volunteer_statistics():

        centers = ReliefCenter.query.all()

        total = sum(

            c.volunteers

            for c in centers

        )

        average = (

            total / len(centers)

            if centers else 0

        )

        highest = max(

            centers,

            key=lambda c: c.volunteers,

            default=None

        )

        return {

            "total": total,

            "average": round(average,2),

            "highest_center":

                highest.name if highest else None,

            "highest_count":

                highest.volunteers if highest else 0

        }

    # =======================================================
    # RESOURCE ANALYTICS
    # =======================================================

    @staticmethod
    def resource_statistics():

        centers = ReliefCenter.query.all()

        total = sum(

            c.available_resources

            for c in centers

        )

        average = (

            total / len(centers)

            if centers else 0

        )

        return {

            "total": total,

            "average": round(average,2)

        }

    # =======================================================
    # LOCATION SUMMARY
    # =======================================================

    @staticmethod
    def location_summary():

        locations = Counter()

        centers = ReliefCenter.query.all()

        for center in centers:

            locations[center.location] += 1

        return dict(locations)

    # =======================================================
    # CONTACT ANALYTICS
    # =======================================================

    @staticmethod
    def contact_statistics():

        return {

            "pending":

                Contact.query.filter_by(

                    status="Pending"

                ).count(),

            "read":

                Contact.query.filter_by(

                    status="Read"

                ).count(),

            "replied":

                Contact.query.filter_by(

                    status="Replied"

                ).count(),

            "closed":

                Contact.query.filter_by(

                    status="Closed"

                ).count()

        }

    # =======================================================
    # NEWS ANALYTICS
    # =======================================================

    @staticmethod
    def news_statistics():

        categories = Counter()

        articles = News.query.all()

        total_views = 0

        for article in articles:

            categories[article.category] += 1

            total_views += article.views

        return {

            "articles": len(articles),

            "views": total_views,

            "categories": dict(categories)

        }

    # =======================================================
    # COMPLETE DASHBOARD
    # =======================================================

    @staticmethod
    def dashboard():

        return {

            "overview":

                AnalyticsService.overview(),

            "center_distribution":

                AnalyticsService.center_distribution(),

            "status_distribution":

                AnalyticsService.status_distribution(),

            "volunteer_statistics":

                AnalyticsService.volunteer_statistics(),

            "resource_statistics":

                AnalyticsService.resource_statistics(),

            "location_summary":

                AnalyticsService.location_summary(),

            "contact_statistics":

                AnalyticsService.contact_statistics(),

            "news_statistics":

                AnalyticsService.news_statistics()

        }


# ===========================================================
# TEST
# ===========================================================

if __name__ == "__main__":

    print(

        "Analytics Service Ready"

    )