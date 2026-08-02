from database import db
from models.center import ReliefCenter

def seed_database():

    if ReliefCenter.query.count() > 0:
        print("Database already seeded.")
        return

    centers = [

        ReliefCenter(
            name="Apollo Hospital",
            type="Hospital",
            location="Greams Road, Chennai",
            latitude=13.0635,
            longitude=80.2518,
            capacity=500,
            available_resources=350,
            volunteers=40,
            contact_person="Dr. Kumar",
            contact_number="9876543210",
            email="apollo@reliefmap.com",
            status="Open",
            description="24x7 Emergency Hospital"
        ),

        ReliefCenter(
            name="MIOT Hospital",
            type="Hospital",
            location="Manapakkam",
            latitude=13.0218,
            longitude=80.1856,
            capacity=400,
            available_resources=260,
            volunteers=30,
            contact_person="Dr. Raj",
            contact_number="9876543211",
            email="miot@reliefmap.com",
            status="Open",
            description="Multi Specialty Hospital"
        ),

        ReliefCenter(
            name="SRM Relief Shelter",
            type="Shelter",
            location="Ramapuram",
            latitude=13.0319,
            longitude=80.1764,
            capacity=1000,
            available_resources=900,
            volunteers=75,
            contact_person="Coordinator",
            contact_number="9876543212",
            email="srm@reliefmap.com",
            status="Open",
            description="Emergency Shelter"
        ),

        ReliefCenter(
            name="Anna Nagar Food Center",
            type="Food Center",
            location="Anna Nagar",
            latitude=13.0850,
            longitude=80.2101,
            capacity=700,
            available_resources=650,
            volunteers=50,
            contact_person="Food Officer",
            contact_number="9876543213",
            email="food@reliefmap.com",
            status="Open",
            description="Free Food Distribution"
        ),

        ReliefCenter(
            name="Volunteer Command Center",
            type="Volunteer",
            location="Egmore",
            latitude=13.0732,
            longitude=80.2609,
            capacity=200,
            available_resources=180,
            volunteers=120,
            contact_person="Volunteer Lead",
            contact_number="9876543214",
            email="volunteer@reliefmap.com",
            status="Open",
            description="Emergency Volunteer Team"
        )

    ]

    db.session.add_all(centers)
    db.session.commit()

    print("✅ Relief Centers Seeded Successfully")