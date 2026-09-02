# D:\SIH 2026\backend\app.py
import os

os.environ.setdefault("MPLCONFIGDIR", os.path.join(os.path.dirname(__file__), "instance", "matplotlib"))
os.environ.setdefault("XDG_CACHE_HOME", os.path.join(os.path.dirname(__file__), "instance", "cache"))

from flask import Flask, jsonify, redirect, request, url_for
from sqlalchemy import inspect, text
from config import Config
from extensions import db, jwt, cors
from inference import load_model, predict
from routes import (
    auth_bp,
    dashboards_bp,
    patients_bp,
    screenings_bp
)

BASE_DIR = os.path.dirname(__file__)
PROJECT_DIR = os.path.dirname(BASE_DIR)
FRONTEND_DIR = os.path.join(PROJECT_DIR, "frontend")

model = load_model(os.path.join(BASE_DIR, "best_model.pth"))


def create_app(config_class=Config):
    app = Flask(
        __name__,
        template_folder=os.path.join(FRONTEND_DIR, "templates"),
        static_folder=os.path.join(FRONTEND_DIR, "static"),
        static_url_path="/static"
    )
    app.config.from_object(config_class)
    app.config["DR_MODEL"] = model

    # Ensure instance folder exists
    os.makedirs(os.path.join(BASE_DIR, "instance"), exist_ok=True)

    # Init extensions
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app)

    @app.route("/")
    def index():
        return redirect(url_for("auth.login_page"))

    @app.route("/predict", methods=["POST"])
    def predict_route():
        if "image" not in request.files:
            return jsonify({"error": "No image uploaded"}), 400

        image = request.files["image"]
        if not image.filename:
            return jsonify({"error": "No image uploaded"}), 400

        try:
            result = predict(image.read(), model)
        except Exception as error:
            print("Prediction failed:", error)
            return jsonify({"error": "Unable to analyze image"}), 500

        return jsonify(result), 200

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboards_bp)
    app.register_blueprint(patients_bp)
    app.register_blueprint(screenings_bp)

    # Create tables
    with app.app_context():
        db.create_all()
        _ensure_screening_columns()
        _seed_admin()

    return app


def _seed_admin():
    """Create a default admin account if none exists."""
    from models import User
    if not User.query.filter_by(role="ADMIN").first():
        admin = User(name="Admin", email="admin@example.com", role="ADMIN")
        admin.set_password("admin1234")
        db.session.add(admin)
        db.session.commit()
        print("Seeded default admin: admin@example.com / admin1234")


def _ensure_screening_columns():
    """Add lightweight SQLite columns that older local databases may not have."""
    inspector = inspect(db.engine)
    columns = {
        column["name"]
        for column in inspector.get_columns("screenings")
    }

    if "heatmap_base64" not in columns:
        db.session.execute(
            text("ALTER TABLE screenings ADD COLUMN heatmap_base64 TEXT")
        )
        db.session.commit()


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000, use_reloader=False)
