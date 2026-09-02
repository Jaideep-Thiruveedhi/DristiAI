# D:\SIH 2026\backend\extensions.py
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS


# Database
db = SQLAlchemy()

# JWT authentication
jwt = JWTManager()

# Cross-Origin Resource Sharing
cors = CORS()