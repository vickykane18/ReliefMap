from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///reliefmap.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class ReliefCenter(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    lat = db.Column(db.Float, nullable=False)
    lng = db.Column(db.Float, nullable=False)

with app.app_context():
    db.create_all()

@app.route("/api/centers", methods=["GET"])
def get_centers():
    centers = ReliefCenter.query.all()
    return jsonify([
        {"id": c.id, "name": c.name, "type": c.type, "lat": c.lat, "lng": c.lng}
        for c in centers
    ])

@app.route("/api/centers/<int:center_id>", methods=["GET"])
def get_center(center_id):
    center = ReliefCenter.query.get(center_id)
    if center:
        return jsonify({"id": center.id, "name": center.name, "type": center.type,
                        "lat": center.lat, "lng": center.lng})
    return jsonify({"error": "Center not found"}), 404

@app.route("/api/centers", methods=["POST"])
def add_center():
    data = request.get_json()
    new_center = ReliefCenter(name=data["name"], type=data["type"],
                              lat=data["lat"], lng=data["lng"])
    db.session.add(new_center)
    db.session.commit()
    return jsonify({"id": new_center.id, "name": new_center.name,
                    "type": new_center.type, "lat": new_center.lat,
                    "lng": new_center.lng}), 201

@app.route("/api/stats", methods=["GET"])
def stats():
    hospitals = ReliefCenter.query.filter_by(type="Hospital").count()
    food = ReliefCenter.query.filter_by(type="Food").count()
    shelter = ReliefCenter.query.filter_by(type="Shelter").count()
    return jsonify({"Hospitals": hospitals, "Food Centers": food, "Shelters": shelter})

if __name__ == "__main__":
    app.run(debug=True)
