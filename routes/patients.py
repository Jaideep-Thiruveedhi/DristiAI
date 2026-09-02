from flask import Blueprint, request, jsonify
from extensions import db
from models import Patient
from utils.decorators import role_required


patients_bp = Blueprint(
    "patients",
    __name__,
    url_prefix="/api/patients"
)


# ============================================================
# CREATE PATIENT
# ============================================================

@patients_bp.route("", methods=["POST"])
@role_required("HEALTH_WORKER")
def create_patient():

    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "error": "Request body must be JSON"
        }), 400

    name = data.get("name", "").strip()
    age = data.get("age")
    gender = data.get("gender", "").strip()
    mobile_number = data.get("mobile_number", "").strip()

    if not name or age is None or not gender:
        return jsonify({
            "error": "Name, age and gender are required"
        }), 400

    try:
        age = int(age)
    except (TypeError, ValueError):
        return jsonify({
            "error": "Age must be a valid number"
        }), 400

    if age < 0 or age > 120:
        return jsonify({
            "error": "Age must be between 0 and 120"
        }), 400

    # Generate next Patient ID
    last_patient = (
        Patient.query
        .order_by(Patient.id.desc())
        .first()
    )

    next_number = 1 if not last_patient else last_patient.id + 1

    patient_id = f"P-{next_number:06d}"

    patient = Patient(
        patient_id=patient_id,
        name=name,
        age=age,
        gender=gender,
        mobile_number=mobile_number or None
    )

    db.session.add(patient)
    db.session.commit()

    return jsonify({
        "message": "Patient created successfully",
        "patient": patient.to_dict()
    }), 201


# ============================================================
# LIST / SEARCH PATIENTS
# ============================================================

@patients_bp.route("", methods=["GET"])
@role_required("HEALTH_WORKER")
def get_patients():

    search = request.args.get("q", "").strip()

    query = Patient.query

    if search:
        search_pattern = f"%{search}%"

        query = query.filter(
            db.or_(
                Patient.patient_id.ilike(search_pattern),
                Patient.name.ilike(search_pattern),
                Patient.mobile_number.ilike(search_pattern)
            )
        )

    patients = (
        query
        .order_by(Patient.id.desc())
        .all()
    )

    return jsonify({
        "patients": [
            patient.to_dict()
            for patient in patients
        ]
    }), 200


# ============================================================
# GET SINGLE PATIENT
# ============================================================

@patients_bp.route("/<patient_id>", methods=["GET"])
@role_required("HEALTH_WORKER")
def get_patient(patient_id):

    patient = Patient.query.filter_by(
        patient_id=patient_id
    ).first()

    if not patient:
        return jsonify({
            "error": "Patient not found"
        }), 404

    return jsonify({
        "patient": patient.to_dict()
    }), 200