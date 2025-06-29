# app/routes/auth.py
from flask import Blueprint, request, jsonify, make_response
from app.models.user import User
from app.extensions import db
from datetime import datetime, timedelta
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt

auth_bp = Blueprint('auth', __name__, url_prefix='/api')


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    if not all(key in data for key in ['username', 'email', 'password', 'birth_date']):
        return make_response(jsonify({'message': 'Missing required fields'}), 400)

    username = data['username']
    email = data['email']
    password = data['password']
    birth_date = data['birth_date']
    full_name = data.get('full_name', '')
    role = data.get('role', 'user')

    try:
        birth_date = datetime.strptime(birth_date, "%d.%m.%Y").date()
    except ValueError:
        return make_response(jsonify({'message': 'Invalid date format, use dd.mm.yyyy'}), 400)

    if User.find_by_username(username):
        return make_response(jsonify({'message': 'Username already exists'}), 400)

    if User.query.filter_by(email=email).first():
        return make_response(jsonify({'message': 'Email already exists'}), 400)

    user = User(
        username=username,
        email=email,
        birth_date=birth_date,
        full_name=full_name,
        role=role,
    )
    user.set_password(password)

    try:
        db.session.add(user)
        db.session.commit()
        access_token = create_access_token(identity=str(user.id), expires_delta=timedelta(days=7))

        return jsonify({
            'message': 'Registration successful',
            'access': {
                'jwt_token': access_token,
                'expires_at': (datetime.utcnow() + timedelta(days=7)).isoformat()
            },
            'user': user.to_json()
        }), 201

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
    if not user or not user.check_password(password):
        return make_response(jsonify({'message': 'Invalid username or password'}), 401)

    user.last_login = datetime.utcnow()
    db.session.commit()

    access_token = create_access_token(identity=str(user.id), expires_delta=timedelta(days=7))

    return jsonify({
        'message': 'Login successful',
        'access': {
            'jwt_token': access_token,
            'expires_at': (datetime.utcnow() + timedelta(days=7)).isoformat()
        },
        'user': user.to_json()
    }), 200


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    jti = get_jwt()['jti']  # Получаем уникальный идентификатор токена
    expiration_time = datetime.utcnow()  # Время аннулирования токена

    resp = jsonify({'message': 'Logged out successfully'})
    resp.set_cookie('token', '', expires=0)  # Удаляем куку с токеном на клиенте

    return resp, 200


@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    data = request.get_json() or {}

    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return make_response(jsonify({'message': 'User not found'}), 404)

    if not user.check_password(data.get('old_password')):
        return make_response(jsonify({'message': 'Invalid current password'}), 400)

    user.set_password(data.get('new_password'))
    db.session.commit()

    return jsonify(user.to_json()), 200

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    user_id = get_jwt_identity()

    try:
        user_id = int(user_id)
    except ValueError:
        return make_response(jsonify({'message': 'Invalid user id format'}), 401)

    user = User.query.get(user_id)
    if not user:
        return make_response(jsonify({'message': 'User not found'}), 404)

    return jsonify(user.to_json()), 200
