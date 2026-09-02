from datetime import datetime, timezone

from extensions import db


class Screening(db.Model):

    __tablename__ = "screenings"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    patient_id = db.Column(
        db.Integer,
        db.ForeignKey("patients.id"),
        nullable=False
    )

    image_path = db.Column(
        db.String(255),
        nullable=True
    )

    dr_grade = db.Column(
        db.Integer,
        nullable=True
    )

    confidence = db.Column(
        db.Float,
        nullable=True
    )

    referable = db.Column(
        db.Boolean,
        nullable=True
    )

    explanation = db.Column(
        db.Text,
        nullable=True
    )

    model_version = db.Column(
        db.String(50),
        nullable=True
    )

    heatmap_base64 = db.Column(
        db.Text,
        nullable=True
    )

    created_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    patient = db.relationship(
        "Patient",
        backref=db.backref(
            "screenings",
            lazy=True
        )
    )

    def to_dict(self):

        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "image_path": self.image_path,
            "dr_grade": self.dr_grade,
            "confidence": self.confidence,
            "referable": self.referable,
            "explanation": self.explanation,
            "model_version": self.model_version,
            "heatmap_base64": self.heatmap_base64,
            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            )
        }
