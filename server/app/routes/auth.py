# app/routes/auth.py
from flask import Blueprint, request, jsonify, make_response
from flask_login import login_user, logout_user, current_user, login_required
from ..models.user import User
from ..extensions import db
from datetime import datetime

auth_bp = Blueprint('auth', __name__, url_prefix='/api')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data['username']
    email = data['email']
    password = data['password']
    birth_date = data['birth_date']
    full_name = data.get('full_name', '')
    role = data.get('role', 'user')
    proxy_credits = data.get('proxy_credits', 0)

    try:
        birth_date = datetime.strptime(birth_date, "%d.%m.%Y").date()
    except ValueError:
        return make_response(jsonify({'message': 'Invalid date format, use dd.mm.yyyy'}), 400)

    if User.find_by_username(username):
        return make_response(jsonify({'message': 'Username already exists'}), 400)

    if User.query.filter_by(email=email).first():
        return make_response(jsonify({'message': 'Email already exists'}), 400)

    new_user = User(
        username=username,
        email=email,
        birth_date=birth_date,
        full_name=full_name,
        role=role,
        proxy_credits=proxy_credits
    )
    new_user.set_password(password)

    try:
        db.session.add(new_user)
        db.session.commit()
        login_user(new_user)
        response = jsonify({'message': 'User created successfully', **new_user.to_json()})
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        return response, 201
    except Exception as e:
        db.session.rollback()
        return make_response(jsonify({'message': 'Error creating user', 'error': str(e)}), 500)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return make_response(jsonify({'message': 'Username and password are required'}), 400)

    user = User.find_by_username(username)
    if user and user.check_password(password):
        login_user(user)
        user.last_login = datetime.utcnow()
        db.session.commit()
        return jsonify(user.to_json()), 200

    return make_response(jsonify({'message': 'Invalid username or password'}), 401)

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'}), 200

@auth_bp.route('/change-password', methods=['POST'])
@login_required
def change_password():
    data = request.get_json()
    if not current_user.check_password(data.get('old_password')):
        return make_response(jsonify({'message': 'Invalid current password'}), 400)
    current_user.set_password(data.get('new_password'))
    db.session.commit()
    return jsonify(current_user.to_json()), 200
