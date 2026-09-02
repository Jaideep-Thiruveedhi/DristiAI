from .auth import auth_bp
from .dashboards import dashboards_bp
from .patients import patients_bp
from .screenings import screenings_bp


__all__ = [
    "auth_bp",
    "dashboards_bp",
    "patients_bp",
    "screenings_bp"
]