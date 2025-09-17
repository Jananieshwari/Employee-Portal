# backend/app.py
"""
Flask backend for Iconic Dream Focus - Employee Onboarding Portal
Corrected / cleaned version. Copy-paste into backend/app.py
"""

import os
import shutil
import logging
import traceback
from datetime import timedelta

from flask import Flask, request, jsonify, send_file, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required,
    get_jwt_identity, get_jwt
)
from sqlalchemy.exc import IntegrityError

import json
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from flask_mail import Mail, Message
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
from dotenv import load_dotenv

# Import models from same folder (backend/models.py)
from models import db, User, Admin, PersonalDetails, Document

load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app = Flask(__name__, static_folder=None)

# ---------- CONFIG ----------
# Use env var SQLALCHEMY_DATABASE_URI if set (e.g. mysql+pymysql://user:pass@host/db)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'SQLALCHEMY_DATABASE_URI',
    'sqlite:///' + os.path.join(BASE_DIR, 'app.db')
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config["JWT_SECRET_KEY"] = os.getenv('JWT_SECRET_KEY', 'dev-jwt-secret')
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['PROPAGATE_EXCEPTIONS'] = True
app.config['JSON_SORT_KEYS'] = False

# Mail (for production set env vars)
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', '')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', '587') or 587)
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME', '')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD', '')
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True') == 'True'
app.config['MAIL_USE_SSL'] = os.getenv('MAIL_USE_SSL', 'False') == 'True'
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_USERNAME', 'noreply@example.com')

# logging
app.logger.setLevel(logging.DEBUG)

# Initialize extensions
db.init_app(app)
jwt = JWTManager(app)

# CORS: allow frontend ports (or use "*" for dev)
CORS(app,
     resources={r"/api/*": {"origins": "*"}},
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

mail = Mail(app)
serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])

ALLOWED_EXTENSIONS = set(['png','jpg','jpeg','gif','pdf','doc','docx','txt'])

# ---------------- Helpers ----------------
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def ensure_default_admin():
    """Create default admin if none exists (hashed password)."""
    admin_email = os.getenv('DEFAULT_ADMIN_EMAIL', 'info1@icondf.com')
    admin_password = os.getenv('DEFAULT_ADMIN_PASSWORD', 'Admin12')
    # do not store plaintext: use hashed password
    with app.app_context():
        if Admin.query.count() == 0:
            app.logger.info("Creating default admin: %s", admin_email)
            admin = Admin(email=admin_email, password_hash=generate_password_hash(admin_password))
            db.session.add(admin)
            db.session.commit()

def setup():
    """Create all tables and default admin"""
    with app.app_context():
        db.create_all()
        ensure_default_admin()


# ---------------- CORS / JWT callbacks ----------------
@app.before_request
def handle_preflight():
    if request.method == 'OPTIONS':
        # quick response for preflight
        resp = app.make_response(('', 204))
        resp.headers['Access-Control-Allow-Origin'] = request.headers.get('Origin') or '*'
        resp.headers['Access-Control-Allow-Credentials'] = 'true'
        resp.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        resp.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
        return resp

@app.after_request
def add_cors_headers(response):
    origin = request.headers.get("Origin") or "*"
    response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Expose-Headers"] = "Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"

    return response

@jwt.unauthorized_loader
def custom_unauthorized_callback(error_string):
    app.logger.warning("JWT unauthorized: %s", error_string)
    return jsonify({"msg": "Missing Authorization Header"}), 401

@jwt.invalid_token_loader
def custom_invalid_token_callback(reason):
    app.logger.warning("JWT invalid token: %s", reason)
    return jsonify({"msg": "Invalid token"}), 422

# Centralized exception handler for debugging (returns message + logs stack)
@app.errorhandler(Exception)
def handle_exception(e):
    # Print full traceback to server console for debugging
    tb = traceback.format_exc()
    app.logger.error("Unhandled exception: %s\n%s", e, tb)
    # For development return the text (safe if local)
    return jsonify({"msg": "Server error", "error": str(e)}), 500

# ---------------- Routes ----------------

@app.route("/")
def home():
    return jsonify({"msg": "Backend is running successfully!"})

# ---------------- Request Access (user registers request) ----------------
@app.route('/api/request-access', methods=['POST'])
def request_access():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"msg": "Invalid JSON"}), 400

        name = data.get("name")
        email = data.get("email")
        password = data.get("password")

        if not all([name, email, password]):
            return jsonify({"msg": "Missing fields"}), 400

        # Hash password
        hashed_pw = generate_password_hash(password)

        new_user = User(name=name, email=email, password_hash=hashed_pw, status="pending")
        db.session.add(new_user)
        db.session.commit()

        return jsonify({"msg": "Request submitted successfully"}), 201

    except Exception as e:
        import traceback
        traceback.print_exc()  # This will show the exact error in your backend console
        return jsonify({"msg": "Server error", "error": str(e)}), 500

# ---------------- Admin login ----------------
@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"msg": "Email and password required"}), 400

    admin = Admin.query.filter_by(email=email).first()
    if not admin or not check_password_hash(admin.password_hash, password):
        return jsonify({"msg": "Invalid credentials"}), 401

    access_token = create_access_token(
        identity=str(admin.id),
        additional_claims={"role": "admin"},
        expires_delta=timedelta(hours=12)
    )
    return jsonify({"access_token": access_token}), 200

# ---------------- Pending users (admin) ----------------
@app.route('/api/admin/pending', methods=['GET'])
@jwt_required()
def admin_pending():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"msg": "Admin access only"}), 403

    employees = User.query.filter_by(status="pending").all()
    out = [{"id": u.id, "name": u.name, "email": u.email, "status": u.status} for u in employees]
    return jsonify(out), 200

# ---------------- Register (employee) ----------------
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get("name"); email = data.get("email"); password = data.get("password")

    if not name or not email or not password:
        return jsonify({"msg": "Name, email, and password are required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "User with this email already exists"}), 400

    new_user = User(name=name, email=email, password_hash=generate_password_hash(password), role="employee", status="pending")
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"msg": f"Employee {name} registered successfully and is pending approval"}), 201

# ---------------- Approve / reject (admin) ----------------
@app.route('/api/admin/approve/<int:user_id>', methods=['POST'])
@jwt_required()
def admin_approve(user_id):
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({"msg": "Admin access only"}), 403

    data = request.json or {}
    action = data.get('action', 'approve')
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    user.status = 'approved' if action == 'approve' else 'rejected'
    db.session.commit()
    return jsonify({"msg": "Updated successfully", "user_id": user.id, "status": user.status}), 200

# Alternative PUT approve (kept for compatibility)
@app.route('/api/admin/approve/<int:user_id>', methods=['PUT'])
@jwt_required()
def approve_user(user_id):
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({"msg": "Admin access only"}), 403
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
    user.status = "approved"
    db.session.commit()
    return jsonify({"msg": f"User {user.email} approved"}), 200

@app.route('/api/admin/reject/<int:user_id>', methods=['PUT'])
@jwt_required()
def reject_user(user_id):
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({"msg": "Admin access only"}), 403
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
    user.status = "rejected"
    db.session.commit()
    return jsonify({"msg": f"User {user.email} rejected"}), 200

# ---------------- User login (status checked) ----------------
@app.route('/api/auth/login', methods=['POST'])
def user_login():
    data = request.get_json() or {}
    email = data.get("email"); password = data.get("password")
    if not email or not password:
        return jsonify({"msg":"Email and password required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"msg": "Bad email or password"}), 401
    if user.status != 'approved':
        return jsonify({"msg": "User not approved by admin yet", "status": user.status}), 403

    token = create_access_token(identity=str(user.id), additional_claims={"role": "user"}, expires_delta=timedelta(hours=12))
    return jsonify({"access_token": token, "user": {"id": user.id, "email": user.email, "role": "user"}}), 200

# ---------------- Admin: list approved ----------------
@app.route('/api/admin/approved', methods=['GET'])
@jwt_required()
def admin_approved():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"msg": "Admin access only"}), 403
    approved_users = User.query.filter_by(status="approved").all()
    out = [{"id": u.id, "name": u.name, "email": u.email, "role": u.role, "status": u.status} for u in approved_users]
    return jsonify(out), 200

# ---------------- Save user details (user only) ----------------
@app.route('/api/user/details', methods=['POST'])
@jwt_required()
def save_details():
    claims = get_jwt()
    if claims.get('role') != 'user':
        return jsonify({"msg": "User access only"}), 403

    user_id = int(get_jwt_identity())
    data = request.json or {}
    pd = PersonalDetails.query.filter_by(user_id=user_id).first()
    if not pd:
        pd = PersonalDetails(user_id=user_id)

    fields = ["full_name","phone","address","department","college","state","pincode",
              "nationality","blood_group","mother_name","father_name",
              "tenth_percentage","twelfth_percentage","pg_percentage"]
    for f in fields:
        if f in data:
            setattr(pd, f, data.get(f))

    pd.extra = json.dumps({k: v for k, v in data.items() if k not in fields})
    db.session.add(pd)
    db.session.commit()
    return jsonify({"msg": "Personal details saved"}), 200

# ---------------- File upload (user) ----------------
@app.route('/api/user/upload', methods=['POST'])
@jwt_required()
def upload_files():
    claims = get_jwt()
    if claims.get('role') != 'user':
        return jsonify({"msg": "User access only"}), 403

    user_id = int(get_jwt_identity())
    files = request.files.getlist('files')
    if not files:
        return jsonify({"msg": "No files uploaded"}), 400

    saved = []
    user_folder = os.path.join(app.config['UPLOAD_FOLDER'], str(user_id))
    os.makedirs(user_folder, exist_ok=True)

    for f in files:
        if f and allowed_file(f.filename):
            orig = f.filename
            filename = secure_filename(f.filename)
            target = os.path.join(user_folder, filename)
            base, ext = os.path.splitext(filename)
            counter = 1
            while os.path.exists(target):
                filename = f"{base}_{counter}{ext}"
                target = os.path.join(user_folder, filename)
                counter += 1
            f.save(target)
            doc = Document(user_id=user_id, filename=filename, original_filename=orig)
            db.session.add(doc)
            saved.append({"filename": filename, "original": orig})
    db.session.commit()
    return jsonify({"msg": "Files saved", "files": saved}), 201

# ---------------- List user files ----------------
@app.route('/api/user/files', methods=['GET'])
@jwt_required()
def list_user_files():
    claims = get_jwt()
    if claims.get('role') != 'user':
        return jsonify({"msg": "User access only"}), 403
    user_id = int(get_jwt_identity())
    docs = Document.query.filter_by(user_id=user_id).all()
    out = [{"id": d.id, "filename": d.filename, "original": d.original_filename} for d in docs]
    return jsonify(out), 200

# ---------------- Delete a user file ----------------
@app.route('/api/user/delete-file', methods=['POST'])
@jwt_required()
def delete_user_file():
    claims = get_jwt()
    if claims.get('role') != 'user':
        return jsonify({"msg": "User access only"}), 403
    user_id = int(get_jwt_identity())
    data = request.json or {}
    filename = data.get('filename')
    if not filename:
        return jsonify({"msg":"filename required"}), 400
    doc = Document.query.filter_by(user_id=user_id, filename=filename).first()
    if not doc:
        return jsonify({"msg":"File not found"}), 404
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], str(user_id), doc.filename)
    try:
        if os.path.exists(filepath):
            os.remove(filepath)
    except Exception as e:
        app.logger.exception("Error deleting file: %s", e)
    db.session.delete(doc)
    db.session.commit()
    return jsonify({"msg":"File deleted"}), 200

# ---------------- Admin: list all users + details ----------------
@app.route('/api/admin/users', methods=['GET'])
@jwt_required()
def admin_get_users():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"msg": "Admin access only"}), 403

    users = User.query.all()
    out = []
    for u in users:
        pd = PersonalDetails.query.filter_by(user_id=u.id).first()
        docs = Document.query.filter_by(user_id=u.id).all()
        out.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "status": u.status,
            "personal": pd.to_dict() if pd else None,
            "documents": [{"filename": d.filename, "original": d.original_filename} for d in docs]
        })
    return jsonify(out), 200

# ---------------- Public API: all users (non-auth) ----------------
@app.route('/api/users', methods=['GET'])
def get_users_public():
    users = User.query.all()
    out = [{"id": u.id, "name": u.name, "email": u.email, "status": u.status} for u in users]
    return jsonify(out), 200

# ---------------- Admin: download user file ----------------
@app.route('/api/admin/download/<int:user_id>/<path:filename>', methods=['GET'])
@jwt_required()
def admin_download(user_id, filename):
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({"msg": "Admin access only"}), 403
    user_folder = os.path.join(app.config['UPLOAD_FOLDER'], str(user_id))
    path = os.path.join(user_folder, filename)
    if not os.path.exists(path):
        return jsonify({"msg": "File not found"}), 404
    return send_file(path, as_attachment=True)

# ---------------- Admin: delete user + files ----------------
@app.route('/api/admin/delete-user/<int:user_id>', methods=['DELETE'])
@jwt_required()
def admin_delete_user(user_id):
    claims = get_jwt()
    app.logger.info("DELETE request for user %s by claims: %s", user_id, claims)
    if claims.get('role') != 'admin':
        return jsonify({"msg": "Admin access only"}), 403
    u = User.query.get(user_id)
    if not u:
        return jsonify({"msg": "User not found"}), 404
    user_folder = os.path.join(app.config['UPLOAD_FOLDER'], str(user_id))
    try:
        if os.path.exists(user_folder):
            shutil.rmtree(user_folder)
    except Exception as e:
        app.logger.exception("Error deleting folder: %s", e)
    # delete personal details and documents automatically via DB cascade if configured
    db.session.delete(u)
    db.session.commit()
    return jsonify({"msg":"User and files deleted"}), 200

# ---------------- Admin: forgot / reset password ----------------
@app.route('/api/admin/forgot-password', methods=['POST'])
def admin_forgot_password():
    data = request.json or {}
    email = data.get('email')
    admin = Admin.query.filter_by(email=email).first()
    if not admin:
        return jsonify({"msg":"no admin with that email"}), 404
    token = serializer.dumps(email, salt='password-reset-salt')
    reset_link = url_for('admin_reset_password', token=token, _external=True)
    try:
        msg = Message("Password reset for Iconic Dream Focus - Admin", recipients=[email])
        msg.body = f"Click the link to reset admin password (valid for 1 hour):\n\n{reset_link}"
        mail.send(msg)
    except Exception as e:
        app.logger.warning("Mail send failed: %s", e)
        # return link for testing/dev if mail not configured
        return jsonify({"msg":"mail send failed (check config), using test link","reset_link":reset_link}), 200
    return jsonify({"msg":"reset link sent to admin email"}), 200

@app.route('/api/admin/reset-password/<token>', methods=['POST'])
def admin_reset_password(token):
    data = request.json or {}
    try:
        email = serializer.loads(token, salt='password-reset-salt', max_age=3600)
    except SignatureExpired:
        return jsonify({"msg":"token expired"}), 400
    except BadSignature:
        return jsonify({"msg":"invalid token"}), 400
    admin = Admin.query.filter_by(email=email).first()
    if not admin:
        return jsonify({"msg":"admin not found"}), 404
    new_password = data.get('password')
    if not new_password:
        return jsonify({"msg":"password required"}), 400
    admin.password_hash = generate_password_hash(new_password)
    db.session.commit()
    return jsonify({"msg":"password changed"}), 200

# ---------------- Run ----------------
if __name__ == "__main__":
    setup()
    # debug=True prints tracebacks to console
    app.run(host='0.0.0.0', port=5000)
