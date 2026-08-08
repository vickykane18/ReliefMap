"""
===========================================================
ReliefMap Test Data Seeder
Author : Vigneshan S
Year : 2026

Populates the database with rich, connected test data for
all tables:
  - Users (Citizen / NGO / Volunteer / Administrator)
  - News articles (various categories & priorities)
  - Contact messages
  - Disaster Reports (in multiple workflow statuses)
  - Missions (linked to reports & relief centers)

Run:  python seed_test_data.py
===========================================================
"""

from datetime import datetime, timedelta

from database import db
from app import app

from models.center import ReliefCenter
from models.user import User
from models.news import News
from models.contact import Contact
from models.disaster_report import DisasterReport
from models.mission import Mission


def seed_users():
    """Seed users across all roles with hashed passwords."""
    from werkzeug.security import generate_password_hash

    existing_emails = {u.email for u in User.query.all()}

    users = [
        dict(
            username="admin",
            email="admin@reliefmap.com",
            password="admin123",
            role="Administrator",
            phone="9000000001",
            city="Chennai",
            state="Tamil Nadu",
            country="India",
        ),
        dict(
            username="rahul",
            email="rahul@reliefmap.com",
            password="rahul123",
            role="Volunteer",
            phone="9000000002",
            city="Chennai",
            state="Tamil Nadu",
            country="India",
        ),
        dict(
            username="priya",
            email="priya@reliefmap.com",
            password="priya123",
            role="NGO",
            phone="9000000003",
            city="Chennai",
            state="Tamil Nadu",
            country="India",
        ),
        dict(
            username="kavin",
            email="kavin@reliefmap.com",
            password="kavin123",
            role="Citizen",
            phone="9000000004",
            city="Chennai",
            state="Tamil Nadu",
            country="India",
        ),
        dict(
            username="meena",
            email="meena@reliefmap.com",
            password="meena123",
            role="Volunteer",
            phone="9000000005",
            city="Madurai",
            state="Tamil Nadu",
            country="India",
        ),
        dict(
            username="arun",
            email="arun@reliefmap.com",
            password="arun123",
            role="NGO",
            phone="9000000006",
            city="Coimbatore",
            state="Tamil Nadu",
            country="India",
        ),
    ]

    created = 0
    for u in users:
        if u["email"] in existing_emails:
            continue
        user = User(
            username=u["username"],
            email=u["email"],
            password=generate_password_hash(u["password"]),
            role=u["role"],
            phone=u["phone"],
            city=u["city"],
            state=u["state"],
            country=u["country"],
            avatar="default.png",
            is_active=True,
        )
        db.session.add(user)
        created += 1

    db.session.commit()
    print(f"✅ Users seeded: {created} new")


def seed_news():
    """Seed news / alert articles."""
    if News.query.count() > 0:
        print("ℹ️  News already has data, skipping.")
        return

    now = datetime.utcnow()
    news_items = [
        dict(
            title="Heavy Rains Trigger Urban Flooding in Chennai",
            content=(
                "Continuous heavy rainfall has caused waterlogging across several "
                "low-lying areas of Chennai. Relief teams are on standby and shelters "
                "have been opened in affected zones. Citizens are advised to avoid "
                "unnecessary travel and stay in safe locations."
            ),
            image="news1.jpg",
            category="Flood",
            priority="Critical",
            author="ReliefMap Admin",
            location="Chennai",
            views=342,
            published_at=now - timedelta(hours=2),
        ),
        dict(
            title="Emergency Medical Camps Set Up in Cyclone-Hit Areas",
            content=(
                "Following cyclone landfall, medical camps have been deployed to "
                "provide free treatment, medicines and first aid to affected residents. "
                "Volunteers can register at the nearest camp to assist."
            ),
            image="news2.jpg",
            category="Medical",
            priority="High",
            author="Health Department",
            location="Nagapattinam",
            views=215,
            published_at=now - timedelta(hours=6),
        ),
        dict(
            title="Free Food Distribution Centers Opened",
            content=(
                "Multiple food distribution centers are now operational to serve cooked "
                "meals and drinking water to displaced families. Packaged ration kits are "
                "also available for collection."
            ),
            image="news3.jpg",
            category="Food",
            priority="Medium",
            author="ReliefMap Admin",
            location="Cuddalore",
            views=128,
            published_at=now - timedelta(days=1),
        ),
        dict(
            title="Weather Update: Cyclone Monitoring Underway",
            content=(
                "Meteorological department is closely tracking a low-pressure system in "
                "the Bay of Bengal. Preparatory measures are being taken across coastal "
                "districts. Stay tuned for official advisories."
            ),
            image="news-placeholder.jpg",
            category="Weather",
            priority="High",
            author="Meteorology Dept",
            location="Bay of Bengal",
            views=96,
            published_at=now - timedelta(days=2),
        ),
        dict(
            title="Shelter Capacity Expansion Completed",
            content=(
                "Temporary shelters have been expanded to accommodate more families. "
                "Each shelter now has access to clean water, sanitation and medical "
                "facilities. Residents are encouraged to move to safe zones."
            ),
            image="news-placeholder.jpg",
            category="Shelter",
            priority="Medium",
            author="ReliefMap Admin",
            location="Chennai",
            views=74,
            published_at=now - timedelta(days=3),
        ),
    ]

    for n in news_items:
        db.session.add(News(**n))

    db.session.commit()
    print(f"✅ News seeded: {len(news_items)}")


def seed_contacts():
    """Seed sample contact messages."""
    if Contact.query.count() > 0:
        print("ℹ️  Contacts already has data, skipping.")
        return

    now = datetime.utcnow()
    contacts = [
        dict(
            name="Ramesh Kumar",
            email="ramesh@gmail.com",
            phone="9881234561",
            subject="Need drinking water supply",
            message=(
                "Our area has been without clean drinking water for two days after "
                "the flooding. Please arrange water tankers as soon as possible."
            ),
            status="Pending",
            ip_address="192.168.1.10",
            created_at=now - timedelta(days=1),
        ),
        dict(
            name="Divya",
            email="divya@yahoo.com",
            phone="9881234562",
            subject="Volunteer registration help",
            message=(
                "I would like to volunteer for the relief operations. How can I "
                "register with my team and get an assignment?"
            ),
            status="Read",
            ip_address="192.168.1.11",
            created_at=now - timedelta(days=2),
        ),
        dict(
            name="Suresh",
            email="suresh@gmail.com",
            phone="9881234563",
            subject="Report coordinate error",
            message=(
                "The shelter location shown on the map appears to be incorrect. "
                "Please verify the coordinates for the SRM shelter."
            ),
            status="Replied",
            admin_notes="Coordinates verified and updated. Thank you for reporting.",
            ip_address="192.168.1.12",
            created_at=now - timedelta(days=3),
        ),
        dict(
            name="Lakshmi",
            email="lakshmi@gmail.com",
            phone="9881234564",
            subject="Donation inquiry",
            message=(
                "I would like to donate food and medical supplies. Who can I "
                "coordinate with and where should the items be dropped?"
            ),
            status="Closed",
            admin_notes="Donation drop-off coordinated with Anna Nagar Food Center.",
            ip_address="192.168.1.13",
            created_at=now - timedelta(days=4),
        ),
    ]

    for c in contacts:
        db.session.add(Contact(**c))

    db.session.commit()
    print(f"✅ Contacts seeded: {len(contacts)}")


def seed_disasters_and_missions():
    """Seed disaster reports across statuses and link missions."""
    if DisasterReport.query.count() > 1:
        print("ℹ️  Disaster reports already have data, skipping full seed.")
        return

    centers = ReliefCenter.query.all()
    if not centers:
        print("⚠️  No relief centers found. Run seed.py first.")
        return

    now = datetime.utcnow()

    # Build helper to find a center by type
    def center_of(c_type):
        for c in centers:
            if c.type == c_type:
                return c
        return centers[0]

    reports_data = [
        dict(
            reporter_name="Kavin",
            reporter_phone="9080000001",
            reporter_email="kavin@reliefmap.com",
            disaster_type="Flood",
            severity="High",
            location="Velachery, Chennai",
            latitude=12.9791,
            longitude=80.2206,
            description=(
                "Water level has risen to waist height in our street. Several families "
                "are trapped in their homes, including children and elderly. Need "
                "immediate rescue and evacuation support."
            ),
            status="active",
            collector_name="District Collector",
            collector_notes="Rescue team deployed. Families evacuated to shelter.",
            approved_at=now - timedelta(hours=20),
        ),
        dict(
            reporter_name="Meena",
            reporter_phone="9080000002",
            reporter_email="meena@reliefmap.com",
            disaster_type="Cyclone",
            severity="Critical",
            location="Nagapattinam coastal",
            latitude=10.7679,
            longitude=79.8417,
            description=(
                "Severe cyclone damage to homes and power lines. People are injured "
                "and in urgent need of medical attention and shelter. Critical "
                "situation in the coastal belt."
            ),
            status="pending_approval",
        ),
        dict(
            reporter_name="Arun",
            reporter_phone="9080000003",
            reporter_email="arun@reliefmap.com",
            disaster_type="Fire",
            severity="Medium",
            location="T Nagar, Chennai",
            latitude=13.0418,
            longitude=80.2341,
            description=(
                "A fire broke out in a commercial building. Fire department responded "
                "quickly. Some smoke inhalation cases reported. Need medical check-ups "
                "for those affected."
            ),
            status="pending_approval",
        ),
        dict(
            reporter_name="Priya",
            reporter_phone="9080000004",
            reporter_email="priya@reliefmap.com",
            disaster_type="Earthquake",
            severity="Low",
            location="Coimbatore",
            latitude=11.0168,
            longitude=76.9558,
            description=(
                "Minor tremors felt in the area. A few buildings reported cracks. "
                "No casualties reported. Requesting assessment team to inspect "
                "structural safety."
            ),
            status="completed",
            collector_name="District Collector",
            collector_notes="Assessment completed. No structural risk found.",
            approved_at=now - timedelta(days=5),
        ),
        dict(
            reporter_name="Rahul",
            reporter_phone="9080000005",
            reporter_email="rahul@reliefmap.com",
            disaster_type="Medical",
            severity="Medium",
            location="Perungudi, Chennai",
            latitude=12.9609,
            longitude=80.2409,
            description=(
                "Several residents showing symptoms of waterborne disease after the "
                "flood. Need mobile medical camp and medicine distribution at the "
                "community center."
            ),
            status="rejected",
            collector_name="District Collector",
            collector_notes="Duplicated with existing medical camp request. Rejected to avoid overlap.",
        ),
    ]

    # Map status -> allocation for missions
    allocations = {
        "High": {"food": 250, "water": 400, "medicine": 100, "volunteers": 25},
        "Critical": {"food": 500, "water": 800, "medicine": 200, "volunteers": 40},
        "Medium": {"food": 120, "water": 200, "medicine": 50, "volunteers": 12},
        "Low": {"food": 50, "water": 80, "medicine": 20, "volunteers": 5},
    }

    created_reports = 0
    created_missions = 0

    for rd in reports_data:
        report = DisasterReport(
            reporter_name=rd["reporter_name"],
            reporter_phone=rd["reporter_phone"],
            reporter_email=rd["reporter_email"],
            disaster_type=rd["disaster_type"],
            severity=rd["severity"],
            location=rd["location"],
            latitude=rd["latitude"],
            longitude=rd["longitude"],
            description=rd["description"],
            status=rd["status"],
            collector_name=rd.get("collector_name"),
            collector_notes=rd.get("collector_notes"),
            approved_at=rd.get("approved_at"),
            risk_score={
                "High": 78, "Critical": 92, "Medium": 55, "Low": 28,
            }.get(rd["severity"], 50),
            risk_level={
                "High": "High", "Critical": "Critical", "Medium": "Moderate", "Low": "Low",
            }.get(rd["severity"], "Moderate"),
            ai_analysis=(
                f"AI analyzed a {rd['severity']} severity {rd['disaster_type']} "
                f"report from {rd['location']}."
            ),
            ai_recommendation=(
                f"Deploy relief team to {rd['location']} and monitor closely."
            ),
        )
        db.session.add(report)
        db.session.flush()  # assign id

        # Link a recommended center based on disaster type
        preferred_type = {
            "Flood": "Shelter",
            "Cyclone": "Shelter",
            "Fire": "Hospital",
            "Earthquake": "Hospital",
            "Medical": "Hospital",
        }.get(rd["disaster_type"], "Shelter")
        report.recommended_center_id = center_of(preferred_type).id

        created_reports += 1

        # Create a mission for active & completed reports
        if rd["status"] in ("active", "completed"):
            alloc = allocations.get(rd["severity"], allocations["Medium"])
            mission = Mission(
                report_id=report.id,
                center_id=report.recommended_center_id,
                status="completed" if rd["status"] == "completed" else "active",
                food_allocated=alloc["food"],
                water_allocated=alloc["water"],
                medicine_allocated=alloc["medicine"],
                volunteers_assigned=alloc["volunteers"],
                completion_notes=(
                    "Mission completed. All residents assisted and area declared safe."
                    if rd["status"] == "completed" else None
                ),
                completed_at=now - timedelta(days=4) if rd["status"] == "completed" else None,
            )
            db.session.add(mission)
            created_missions += 1

    db.session.commit()
    print(f"✅ Disaster reports seeded: {created_reports} new")
    print(f"✅ Missions seeded: {created_missions} new")


def seed_all():
    with app.app_context():
        print("🌱 Seeding test data...")
        seed_users()
        seed_news()
        seed_contacts()
        seed_disasters_and_missions()
        print("🎉 Test data seeding complete!")


if __name__ == "__main__":
    seed_all()
