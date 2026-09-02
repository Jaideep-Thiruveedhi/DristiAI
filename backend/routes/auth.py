# D:\SIH 2026\backend\routes\auth.py
from flask import Blueprint, request, jsonify, render_template, session, redirect, url_for

from extensions import db
from models import User
from models.user import VALID_ROLES


auth_bp = Blueprint(
    "auth",
    __name__,
    url_prefix="/api/auth"
)


# ============================================================
# HTML PAGES
# ============================================================

@auth_bp.route("/login-page", methods=["GET"])
def login_page():
    return render_template("login.html")


@auth_bp.route("/register-page", methods=["GET"])
def register_page():
    return render_template("register.html")


# ============================================================
# REGISTER API
# ============================================================

@auth_bp.route("/register", methods=["POST"])
def register():

    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "error": "Request body must be JSON"
        }), 400

    required = ["name", "email", "password", "role"]

    missing = [
        field for field in required
        if not data.get(field)
    ]

    if missing:
        return jsonify({
            "error": f"Missing required fields: {', '.join(missing)}"
        }), 400

    name = data["name"].strip()
    email = data["email"].strip().lower()
    password = data["password"]
    role = data["role"].strip().upper()

    if len(name) < 2:
        return jsonify({
            "error": "Name must be at least 2 characters"
        }), 400

    if len(password) < 8:
        return jsonify({
            "error": "Password must be at least 8 characters"
        }), 400

    # ADMIN cannot be publicly registered
    public_roles = {
        "HEALTH_WORKER",
        "DOCTOR"
    }

    if role not in public_roles:
        return jsonify({
            "error": "Invalid role",
            "message": (
                "Allowed roles for registration: "
                "DOCTOR, HEALTH_WORKER"
            )
        }), 400

    if User.query.filter_by(email=email).first():
        return jsonify({
            "error": "An account with this email already exists"
        }), 409

    user = User(
        name=name,
        email=email,
        role=role
    )

    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    return jsonify({
        "message": "Registration successful",
        "user": user.to_dict()
    }), 201


# ============================================================
# LOGIN API
# ============================================================

@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "error": "Request body must be JSON"
        }), 400

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({
            "error": "Email and password are required"
        }), 400

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({
            "error": "Invalid email or password"
        }), 401

    # --------------------------------------------------------
    # Create Flask session
    # --------------------------------------------------------

    session.clear()

    session["user_id"] = user.id
    session["role"] = user.role

    return jsonify({
        "message": "Login successful",
        "user": user.to_dict()
    }), 200


# ============================================================
# CURRENT USER
# ============================================================

@auth_bp.route("/me", methods=["GET"])
def me():

    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "error": "Not authenticated"
        }), 401

    user = User.query.get(user_id)

    if not user:
        session.clear()

        return jsonify({
            "error": "User not found"
        }), 401

    return jsonify(user.to_dict()), 200


# ============================================================
# LOGOUT
# ============================================================

@auth_bp.route("/logout", methods=["POST"])
def logout():

    session.clear()

    return jsonify({
        "message": "Logged out successfully"
    }), 200