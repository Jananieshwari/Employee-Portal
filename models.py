# backend/models.py
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = "users"   # matches your MySQL table
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255))
    email = db.Column(db.String(255), unique=True)
    password_hash = db.Column(db.String(255))
    status = db.Column(db.String(20), default="pending")
    role = db.Column(db.String(20), default="user")  # user / employee / admin

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "status": self.status,
            "role": self.role
        }

class Admin(db.Model):
    __tablename__ = "admins"  # matches corrected DB schema
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

class PersonalDetails(db.Model):
    __tablename__ = "personal_details"   # matches table name
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    full_name = db.Column(db.String(255))
    phone = db.Column(db.String(50))
    address = db.Column(db.Text)
    department = db.Column(db.String(255))
    college = db.Column(db.String(255))
    state = db.Column(db.String(255))
    pincode = db.Column(db.String(20))
    nationality = db.Column(db.String(100))
    blood_group = db.Column(db.String(10))
    mother_name = db.Column(db.String(255))
    father_name = db.Column(db.String(255))
    tenth_percentage = db.Column(db.String(20))
    twelfth_percentage = db.Column(db.String(20))
    pg_percentage = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    def to_dict(self):
        return {
            "full_name": self.full_name,
            "phone": self.phone,
            "address": self.address,
            "department": self.department,
            "college": self.college,
            "state": self.state,
            "pincode": self.pincode,
            "nationality": self.nationality,
            "blood_group": self.blood_group,
            "mother_name": self.mother_name,
            "father_name": self.father_name,
            "tenth_percentage": self.tenth_percentage,
            "twelfth_percentage": self.twelfth_percentage,
            "pg_percentage": self.pg_percentage,
            "created_at": self.created_at
        }

class Document(db.Model):
    __tablename__ = "documents"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    filename = db.Column(db.String(512))
    original_filename = db.Column(db.String(512))
    uploaded_at = db.Column(db.DateTime, server_default=db.func.now())
