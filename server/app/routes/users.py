# app/routes/users.py
from flask import Blueprint, jsonify, request, make_response
from datetime import datetime, timezone, timedelta
from dateutil.relativedelta import relativedelta
from flask_jwt_extended import jwt_required, get_jwt_identity
import uuid
import os
from dotenv import load_dotenv
import hashlib


from app.models.server import Server
from app.models.user import User
from app.models.user_configuration import UserConfiguration
from app.extensions import db
from app.utils.vps_data import (
    insert_inbound_record,
    insert_traffic_record,
    restart_xui,
    count_users_on_port 
)

users_bp = Blueprint('users', __name__, url_prefix='/api')

# GET /api/user — возвращает текущего пользователя по JWT
@users_bp.route('/user', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    return jsonify(user.to_json()), 200

# GET /api/users — список всех пользователей (только для админа)
@users_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    current_user_id = int(get_jwt_identity())
    current = User.query.get(current_user_id)
    if not current or current.role != 'admin':
        return jsonify({'message': 'Access denied'}), 403

    users = User.query.all()
    return jsonify([u.to_json() for u in users]), 200

# GET /api/users/<id> — просмотр пользователя (самому себе или админ)
@users_bp.route('/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_by_id(user_id):
    current_user_id = int(get_jwt_identity())
    current = User.query.get(current_user_id)
    if current_user_id != user_id and (not current or current.role != 'admin'):
        return jsonify({'message': 'Access denied'}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    return jsonify(user.to_json()), 200

# PUT /api/users/<id> — обновление профиля (самому себе или админ)
@users_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    data = request.get_json() or {}
    current_user_id = int(get_jwt_identity())
    current = User.query.get(current_user_id)

    # Только сам пользователь или админ
    if current_user_id != user_id and (not current or current.role != 'admin'):
        return jsonify({'message': 'Access denied'}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    # Обновляем поля
    for field in ['username', 'email', 'full_name', 'role']:
        if field in data:
            setattr(user, field, data[field])

    if 'birth_date' in data:
        try:
            user.birth_date = datetime.strptime(data['birth_date'], "%d.%m.%Y").date()
        except ValueError:
            return jsonify({'message': 'Invalid date format, use dd.mm.yyyy'}), 400

    if 'password' in data:
        user.set_password(data['password'])

    db.session.commit()
    return jsonify(user.to_json()), 200

# DELETE /api/users/<id> — удаление (самому себе или админ)
@users_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    current_user_id = int(get_jwt_identity())
    current = User.query.get(current_user_id)

    if current_user_id != user_id and (not current or current.role != 'admin'):
        return jsonify({'message': 'Access denied'}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted'}), 200