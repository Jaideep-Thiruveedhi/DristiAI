# D:\SIH 2026\backend\routes\dashboards.py

from flask import (
    Blueprint,
    render_template,
    make_response,
    jsonify,
    redirect,
    url_for
)

from models import Patient, Screening
from utils.decorators import role_required


dashboards_bp = Blueprint(
    "dashboards",
    __name__,
    url_prefix="/"
)


def no_cache(response):
    """
    Prevent the browser from caching protected dashboard pages.
    """
    response.headers["Cache-Control"] = (
        "no-store, no-cache, must-revalidate, max-age=0"
    )
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"

    return response


# ============================================================
# HEALTH WORKER DASHBOARD
# ============================================================

@dashboards_bp.route("/health-worker/dashboard")
@role_required("HEALTH_WORKER")
def health_worker_dashboard():

    response = make_response(
        render_template(
            "health_worker/dashboard.html"
        )
    )

    return no_cache(response)


# ============================================================
# HEALTH WORKER DASHBOARD DATA
# ============================================================

@dashboards_bp.route(
    "/api/dashboard/health-worker",
    methods=["GET"]
)
@role_required("HEALTH_WORKER")
def health_worker_dashboard_data():

    # --------------------------------------------------------
    # TOTAL PATIENTS
    # --------------------------------------------------------

    total_patients = Patient.query.count()


    # --------------------------------------------------------
    # TOTAL SCREENINGS
    # --------------------------------------------------------

    total_screenings = Screening.query.count()


    # --------------------------------------------------------
    # PENDING SYNC
    #
    # Offline synchronization is not implemented yet.
    # Therefore this currently remains 0.
    # --------------------------------------------------------

    pending_sync = 0


    # --------------------------------------------------------
    # RECENT SCREENINGS
    # --------------------------------------------------------

    recent_screenings = (
        Screening.query
        .join(Patient)
        .order_by(
            Screening.created_at.desc()
        )
        .limit(5)
        .all()
    )


    recent_data = []


    for screening in recent_screenings:

        patient = screening.patient


        recent_data.append({

            "id": screening.id,

            "patient_id":
                patient.patient_id,

            "patient_name":
                patient.name,

            "dr_grade":
                screening.dr_grade,

            "confidence":
                screening.confidence,

            "referable":
                screening.referable,

            "created_at":
                (
                    screening.created_at.isoformat()
                    if screening.created_at
                    else None
                )

        })


    # --------------------------------------------------------
    # RETURN DASHBOARD DATA
    # --------------------------------------------------------

    return jsonify({

        "statistics": {

            "patients":
                total_patients,

            "screenings":
                total_screenings,

            "pending_sync":
                pending_sync

        },

        "recent_screenings":
            recent_data

    }), 200


# ============================================================
# PATIENTS LIST
# ============================================================

@dashboards_bp.route("/health-worker/patients")
@role_required("HEALTH_WORKER")
def health_worker_patients():

    response = make_response(
        render_template(
            "health_worker/patients.html"
        )
    )

    return no_cache(response)


# ============================================================
# ADD NEW PATIENT
# ============================================================

@dashboards_bp.route("/health-worker/patients/new")
@role_required("HEALTH_WORKER")
def new_patient():

    response = make_response(
        render_template(
            "health_worker/new_patient.html"
        )
    )

    return no_cache(response)


# ============================================================
# PATIENT DETAILS
# ============================================================

@dashboards_bp.route(
    "/health-worker/patients/<patient_id>"
)
@role_required("HEALTH_WORKER")
def patient_details(patient_id):

    response = make_response(
        render_template(
            "health_worker/patient_details.html",
            patient_id=patient_id
        )
    )

    return no_cache(response)


# ============================================================
# NEW SCREENING
# ============================================================

@dashboards_bp.route(
    "/health-worker/patients/<patient_id>/screening/new"
)
@role_required("HEALTH_WORKER")
def new_screening(patient_id):

    response = make_response(
        render_template(
            "health_worker/new_screening.html",
            patient_id=patient_id
        )
    )

    return no_cache(response)


@dashboards_bp.route(
    "/health-worker/screenings/new/<patient_id>"
)
def new_screening_shortcut(patient_id):

    return redirect(
        url_for(
            "dashboards.new_screening",
            patient_id=patient_id
        )
    )


# ============================================================
# SCREENING REPORT
# ============================================================

@dashboards_bp.route(
    "/health-worker/patients/<patient_id>/screening/<int:screening_id>"
)
@role_required("HEALTH_WORKER")
def screening_report(
    patient_id,
    screening_id
):

    response = make_response(
        render_template(
            "health_worker/screening_report.html",
            patient_id=patient_id,
            screening_id=screening_id
        )
    )

    return no_cache(response)


# ============================================================
# DOCTOR DASHBOARD
# ============================================================

@dashboards_bp.route("/doctor/dashboard")
@role_required("DOCTOR")
def doctor_dashboard():

    response = make_response(
        render_template(
            "doctor/dashboard.html"
        )
    )

    return no_cache(response)


# ============================================================
# ADMIN DASHBOARD
# ============================================================

@dashboards_bp.route("/admin/dashboard")
@role_required("ADMIN")
def admin_dashboard():

    response = make_response(
        render_template(
            "admin/dashboard.html"
        )
    )

    return no_cache(response)
