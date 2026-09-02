# D:\SIH 2026\backend\app.py
import os
from flask import Flask
from config import Config
from extensions import db, jwt, cors
from routes import (
    auth_bp,
    dashboards_bp,
    patients_bp,
    screenings_bp
)


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Ensure instance folder exists
    os.makedirs(os.path.join(os.path.dirname(__file__), "instance"), exist_ok=True)

    # Init extensions
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app)
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboards_bp)
    app.register_blueprint(patients_bp)
    app.register_blueprint(screenings_bp)

    # Create tables
    with app.app_context():
        db.create_all()
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


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)