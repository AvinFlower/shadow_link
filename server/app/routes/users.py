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
    generate_vless_link,
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


# POST /api/users/<id>/configurations — создать конфигурацию (самому себе)
@users_bp.route('/users/configurations/<int:user_id>', methods=['POST'])
# @jwt_required()
def create_configuration(user_id):
    data = request.get_json()
    country = data.get('country')
    months = int(data.get('duration_months', 1))
    price_map = {1: 100, 3: 250, 6: 500, 12: 1000}
    price = price_map.get(months)
    
    if not country or price is None:
        return jsonify(error="Неверные входные данные"), 400

    # Выбор свободного сервера по стране
    servers = Server.query.filter_by(country=country).all()
    selected = None
    for srv in servers:
        if srv.max_users is not None and count_users_on_port(srv.host, srv.port, srv.ssh_username, srv.ssh_password) < srv.max_users:
            selected = srv
            break

    if not selected:
        return jsonify(error="Нет свободных серверов для этой страны"), 400

    # Извлечение SSH-данных из выбранного сервера
    host = selected.host
    port = selected.port
    ssh_username = selected.ssh_username
    ssh_password = selected.ssh_password

    # Параметры
    unique_email = f"UnknownSoldier_{uuid.uuid4().hex[:8]}"
    client_uuid = str(uuid.uuid4())
    flow = os.environ["FLOW"]

    try:
        # 1) Добавить в inbounds + сразу получить готовый линк
        link = insert_inbound_record(
            unique_email, client_uuid,
            host, port,
            flow, user_id, months,
            ssh_username, ssh_password, selected.x_ui_port
        )

        # 2) Трафик
        insert_traffic_record(unique_email, port, months, host, ssh_username, ssh_password)

        # 3) Перезапуск
        restart_xui(host, port, ssh_username, ssh_password)

        # 4) Количество пользователей
        count = count_users_on_port(host, port, ssh_username, ssh_password)

        # 5) Сохранение в БД
        config = UserConfiguration(
            user_id=user_id,
            server_id=selected.id,
            client_uuid=client_uuid,
            config_link=link,
            expiration_date=datetime.utcnow() + timedelta(days=30 * months),
            price=price,
            flow=flow
        )
        db.session.add(config)
        db.session.commit()

        return jsonify(
            config_link=link,
            expiration_date=config.expiration_date.isoformat(),
            country=country,
            price=price
        ), 201

    except Exception as e:
        db.session.rollback()
        return jsonify(error=str(e)), 500


# GET /api/users/<id>/configurations — список конфигураций (самому себе)
@users_bp.route('/users/configurations/<int:user_id>', methods=['GET'])
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
