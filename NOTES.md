Files created: backend/, frontend/, db_schema.sql
Instructions are in README.md


from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = "user"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(100), unique=True)
    password_hash = db.Column(db.String(200))
    status = db.Column(db.String(20), default="pending")
    role = db.Column(db.String(20), default="user")  # user/employee

class Admin(db.Model):
    __tablename__ = "admins"
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

class PersonalDetails(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
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
    extra = db.Column(db.Text)

class Document(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    filename = db.Column(db.String(512))
    original_filename = db.Column(db.String(512))
