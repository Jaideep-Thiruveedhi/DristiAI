# D:\SIH 2026\backend\routes\screenings.py

import os
from uuid import uuid4

from flask import Blueprint, current_app, request, jsonify
from werkzeug.utils import secure_filename

from extensions import db
from inference import predict
from models import Patient, Screening
from utils.decorators import role_required


# ============================================================
# BLUEPRINT
# ============================================================

screenings_bp = Blueprint(
    "screenings",
    __name__,
    url_prefix="/api/screenings"
)


# ============================================================
# UPLOAD CONFIGURATION
# ============================================================

UPLOAD_FOLDER = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "frontend",
    "static",
    "uploads",
    "screenings"
)

ALLOWED_EXTENSIONS = {
    "jpg",
    "jpeg",
    "png"
}


# ============================================================
# FILE VALIDATION
# ============================================================

def allowed_file(filename):

    return (
        "." in filename
        and filename.rsplit(
            ".",
            1
        )[1].lower() in ALLOWED_EXTENSIONS
    )


def _screening_image_file_path(screening):

    if not screening.image_path:

        return None

    normalized_path = screening.image_path.lstrip("/")

    if normalized_path.startswith(
        "static/uploads/screenings/"
    ):

        return os.path.join(
            UPLOAD_FOLDER,
            os.path.basename(normalized_path)
        )

    return None


def _refresh_missing_prediction(screening):

    needs_prediction = (
        not screening.heatmap_base64
        or screening.model_version == "DR-Mock-v1"
    )

    if not needs_prediction:

        return

    image_file_path = _screening_image_file_path(
        screening
    )

    if not image_file_path or not os.path.exists(
        image_file_path
    ):

        return

    model = current_app.config.get(
        "DR_MODEL"
    )

    if model is None:

        return

    try:

        result = predict(
            image_file_path,
            model
        )

        screening.dr_grade = result["severity"]
        screening.confidence = round(
            result["confidence"] * 100,
            2
        )
        screening.referable = (
            result["severity"] >= 2
        )
        screening.explanation = (
            "The AI model classified this image as "
            f"{result['severity_label']} "
            f"(DR Grade {result['severity']}). "
            "The prediction indicates findings that may "
            + (
                "require further evaluation by an ophthalmologist."
                if screening.referable
                else "be appropriate for routine screening follow-up."
            )
        )
        screening.model_version = "EfficientNet-B0-DR-v1"
        screening.heatmap_base64 = result["heatmap_base64"]

        db.session.commit()

    except Exception as error:

        db.session.rollback()

        print(
            "Unable to refresh prediction:",
            error
        )


# ============================================================
# CREATE SCREENING
# ============================================================

@screenings_bp.route(
    "",
    methods=["POST"]
)
@role_required("HEALTH_WORKER")
def create_screening():

    patient_id = request.form.get(
        "patient_id",
        ""
    ).strip()


    # --------------------------------------------------------
    # VALIDATE PATIENT ID
    # --------------------------------------------------------

    if not patient_id:

        return jsonify({
            "error": "Patient ID is required"
        }), 400


    patient = Patient.query.filter_by(
        patient_id=patient_id
    ).first()


    if not patient:

        return jsonify({
            "error": "Patient not found"
        }), 404


    # --------------------------------------------------------
    # GET IMAGE
    # --------------------------------------------------------

    image = request.files.get(
        "image"
    )


    if not image or not image.filename:

        return jsonify({
            "error": "Fundus image is required"
        }), 400


    # --------------------------------------------------------
    # VALIDATE IMAGE TYPE
    # --------------------------------------------------------

    if not allowed_file(
        image.filename
    ):

        return jsonify({
            "error": (
                "Only JPG, JPEG and PNG "
                "images are allowed"
            )
        }), 400


    # --------------------------------------------------------
    # GET AI RESULT
    # --------------------------------------------------------

    try:

        dr_grade = int(
            request.form.get(
                "dr_grade"
            )
        )

        confidence = float(
            request.form.get(
                "confidence"
            )
        )

        referable = (
            request.form.get(
                "referable"
            ) == "true"
        )

    except (
        TypeError,
        ValueError
    ):

        return jsonify({
            "error": "Invalid screening result"
        }), 400


    # --------------------------------------------------------
    # VALIDATE DR GRADE
    # --------------------------------------------------------

    if dr_grade < 0 or dr_grade > 4:

        return jsonify({
            "error": (
                "DR grade must be between "
                "0 and 4"
            )
        }), 400


    # --------------------------------------------------------
    # VALIDATE CONFIDENCE
    # --------------------------------------------------------

    if confidence < 0 or confidence > 100:

        return jsonify({
            "error": (
                "Confidence must be between "
                "0 and 100"
            )
        }), 400


    # --------------------------------------------------------
    # GET EXPLANATION
    # --------------------------------------------------------

    explanation = request.form.get(
        "explanation",
        ""
    ).strip()


    # --------------------------------------------------------
    # GET MODEL VERSION
    # --------------------------------------------------------

    model_version = request.form.get(
        "model_version",
        "DR-Mock-v1"
    ).strip()


    heatmap_base64 = request.form.get(
        "heatmap_base64",
        ""
    ).strip()


    # --------------------------------------------------------
    # CREATE UPLOAD DIRECTORY
    # --------------------------------------------------------

    os.makedirs(
        UPLOAD_FOLDER,
        exist_ok=True
    )


    # --------------------------------------------------------
    # CREATE UNIQUE FILE NAME
    # --------------------------------------------------------

    extension = (
        image.filename
        .rsplit(
            ".",
            1
        )[1]
        .lower()
    )


    filename = (
        f"{patient.patient_id}_"
        f"{uuid4().hex}."
        f"{extension}"
    )


    safe_filename = secure_filename(
        filename
    )


    # --------------------------------------------------------
    # SAVE IMAGE
    # --------------------------------------------------------

    image_file_path = os.path.join(
        UPLOAD_FOLDER,
        safe_filename
    )


    image.save(
        image_file_path
    )


    # --------------------------------------------------------
    # CREATE IMAGE URL
    # --------------------------------------------------------

    image_path = (
        "/static/uploads/screenings/"
        f"{safe_filename}"
    )


    # --------------------------------------------------------
    # CREATE SCREENING RECORD
    # --------------------------------------------------------

    screening = Screening(

        patient_id=patient.id,

        image_path=image_path,

        dr_grade=dr_grade,

        confidence=confidence,

        referable=referable,

        explanation=explanation,

        model_version=model_version,

        heatmap_base64=heatmap_base64 or None
    )


    db.session.add(
        screening
    )


    # --------------------------------------------------------
    # SAVE DATABASE RECORD
    # --------------------------------------------------------

    try:

        db.session.commit()

    except Exception as error:

        db.session.rollback()


        if os.path.exists(
            image_file_path
        ):

            os.remove(
                image_file_path
            )


        print(
            "Unable to save screening:",
            error
        )


        return jsonify({
            "error": (
                "Unable to save screening "
                "to the database"
            )
        }), 500


    # --------------------------------------------------------
    # SUCCESS RESPONSE
    # --------------------------------------------------------

    return jsonify({

        "message":
            "Screening saved successfully",

        "screening":
            screening.to_dict()

    }), 201


# ============================================================
# GET SINGLE SCREENING
# ============================================================

@screenings_bp.route(
    "/<int:screening_id>",
    methods=["GET"]
)
@role_required("HEALTH_WORKER")
def get_screening(
    screening_id
):

    screening = Screening.query.get(
        screening_id
    )


    if not screening:

        return jsonify({
            "error": "Screening not found"
        }), 404


    _refresh_missing_prediction(
        screening
    )


    # --------------------------------------------------------
    # RETURN SCREENING + PATIENT
    # --------------------------------------------------------

    return jsonify({

        "screening":
            screening.to_dict(),

        "patient":
            screening.patient.to_dict()

    }), 200


# ============================================================
# GET PATIENT SCREENING HISTORY
# ============================================================

@screenings_bp.route(
    "/patient/<patient_id>",
    methods=["GET"]
)
@role_required("HEALTH_WORKER")
def get_patient_screenings(
    patient_id
):

    patient = Patient.query.filter_by(
        patient_id=patient_id
    ).first()


    if not patient:

        return jsonify({
            "error": "Patient not found"
        }), 404


    screenings = Screening.query.filter_by(
        patient_id=patient.id
    ).order_by(
        Screening.created_at.desc()
    ).all()


    return jsonify({

        "screenings": [

            screening.to_dict()

            for screening in screenings

        ]

    }), 200
