# D:\SIH 2026\backend\utils\decorators.py
from functools import wraps
from flask import jsonify, session, redirect, url_for
from models import User


def login_required(fn):
    """
    Requires the user to be logged in.

    If the user is not authenticated, redirect
    them to the login page.
    """

    @wraps(fn)
    def wrapper(*args, **kwargs):

        user_id = session.get("user_id")

        # User is not logged in
        if not user_id:
            return redirect(url_for("auth.login_page"))

        # Find user in database
        user = User.query.get(user_id)

        # User no longer exists
        if not user:
            session.clear()

            return redirect(url_for("auth.login_page"))

        return fn(*args, **kwargs)

    return wrapper


def role_required(*roles):
    """
    Requires the user to be logged in and have
    one of the specified roles.

    Example:

        @role_required("ADMIN")

        @role_required("ADMIN", "DOCTOR")
    """

    def decorator(fn):

        @wraps(fn)
        def wrapper(*args, **kwargs):

            # Check whether user is logged in
            user_id = session.get("user_id")

            if not user_id:
                return redirect(
                    url_for("auth.login_page")
                )

            # Get user from database
            user = User.query.get(user_id)

            # Session contains an invalid user
            if not user:
                session.clear()

                return redirect(
                    url_for("auth.login_page")
                )

            # Check user's role
            if user.role not in roles:

                return jsonify({
                    "error": "Forbidden",
                    "message": (
                        "This page requires one of: "
                        + ", ".join(roles)
                    )
                }), 403

            return fn(*args, **kwargs)

        return wrapper

    return decorator