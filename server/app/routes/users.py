# app/routes/users.py
from flask import Blueprint, jsonify, request, make_response
from datetime import datetime, timezone
from dateutil.relativedelta import relativedelta
from flask_jwt_extended import jwt_required, get_jwt_identity

from ..models.user import User, UserConfiguration
from ..extensions import db
from ..vps_data import (
    insert_inbound_record,
    insert_traffic_record,
    restart_xui,
    generate_vless_link
)

import uuid
import os

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

# POST /api/users/<id>/configurations — создать конфигурацию (самому себе)
@users_bp.route('/users/<int:user_id>/configurations', methods=['POST'])
@jwt_required()
def create_configuration(user_id):
    data = request.get_json()
    country = data.get('country')  # Получаем страну от пользователя
    duration_months = int(data.get('duration_months', 1))  # по умолчанию 1 месяц
    price_by_months = {1: 100, 3: 250, 6: 500, 12: 1000}
    price = price_by_months.get(duration_months)
    
    if price is None:
        return jsonify({"error": "Неверный срок подписки"}), 400

    if not country:
        return jsonify({"error": "Страна не указана"}), 400

    expiration = datetime.utcnow() + timedelta(days=30 * duration_months)

    # Получаем сервер по стране
    server = Server.query.filter_by(country=country).first()
    if not server:
        return jsonify({"error": "Сервер с указанной страной не найден"}), 404

    unique_email = f"UnknownSoldier_{str(uuid.uuid4())[:8]}"
    new_uuid = str(uuid.uuid4())
    port_number = server.port  # Берем порт из базы данных сервера
    flow = server.flow  # Берем flow из базы данных сервера

    try:
        # Вставляем данные в систему (условно)
        insert_inbound_record(email=unique_email, new_uuid=new_uuid, port_number=port_number, flow=flow, user_id=user_id)
        insert_traffic_record(email=unique_email, port_number=port_number)
        restart_xui()

        # Генерируем ссылку конфигурации
        link = generate_vless_link(email=unique_email, new_uuid=new_uuid, port_number=port_number, flow=flow)

        # Создаем конфигурацию для пользователя
        config = UserConfiguration(
            user_id=user_id,
            client_uuid=new_uuid,
            config_link=link,
            expiration_date=expiration,
            country=country,
            price=price
        )
        db.session.add(config)
        db.session.commit()

        return jsonify({
            "config_link": link,
            "expiration_date": expiration.isoformat(),
            "country": country,
            "price": price
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# GET /api/users/<id>/configurations — список конфигураций (самому себе)
@users_bp.route('/users/<int:user_id>/configurations', methods=['GET'])
@jwt_required()
def get_configurations(user_id):
    current_user_id = int(get_jwt_identity())
    if current_user_id != user_id:
        return jsonify({"error": "Unauthorized"}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    configs = UserConfiguration.query.filter_by(user_id=user.id).order_by(UserConfiguration.created_at.desc()).all()
    return jsonify([{  
        "config_link": c.config_link,
        "expiration_date": c.expiration_date.isoformat(),
        "created_at": c.created_at.isoformat()
    } for c in configs]), 200
