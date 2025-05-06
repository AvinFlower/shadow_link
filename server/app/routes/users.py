# app/routes/users.py
from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
import uuid
import os
from datetime import datetime, timezone
from dateutil.relativedelta import relativedelta

from ..models.user import User, UserConfiguration
from ..extensions import db
from ..vps_data import (
    insert_inbound_record,
    insert_traffic_record,
    restart_xui,
    generate_vless_link
)


users_bp = Blueprint('users', __name__, url_prefix='/api')

@users_bp.route('/user', methods=['GET'])
@login_required
def get_user():
    return jsonify(current_user.to_json()), 200

@users_bp.route('/users', methods=['GET'])
def get_users():
    return jsonify([user.to_json() for user in User.query.all()]), 200

@users_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user_by_id(user_id):
    user = User.query.get(user_id)
    return jsonify(user.to_json()), 200 if user else (jsonify({'message': 'user not found'}), 404)

@users_bp.route('/users/<int:user_id>', methods=['PUT'])
@login_required
def update_user(user_id):
    data = request.get_json()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    for field in ['username','email','full_name','role','proxy_credits']:
        if field in data:
            setattr(user, field, data[field])
    if 'birth_date' in data:
        user.birth_date = datetime.strptime(data['birth_date'], "%d.%m.%Y")
    if 'password' in data:
        user.set_password(data['password'])

    db.session.commit()
    return jsonify(user.to_json()), 200

@users_bp.route('/users/<int:user_id>', methods=['DELETE'])
# @login_required
def user_delete(user_id):
    user = User.query.get(user_id)
    if user:
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User deleted'}), 200
    return jsonify({'message': 'User not found'}), 404

@users_bp.route('/users/<int:user_id>/configurations', methods=['POST'])
def create_configuration(user_id):
    # Проверяем, что пользователь существует и совпадает с текущим
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    # if user.id != current_user.id:
    #     return jsonify({"error": "Unauthorized"}), 403

    # Генерация случайного UUID
    new_uuid = str(uuid.uuid4())  # Генерация UUID
    port_number = int(os.environ.get("PORT_SUBSCRIPTION", 32955))  # Получаем порт из переменной окружения
    flow = os.environ.get("FLOW", "xtls-rprx-vision")  # Получаем flow из переменной окружения

    try:
        # Передаём user.email и параметры в функции vps_data
        insert_inbound_record(
            email=user.email,
            new_uuid=new_uuid,
            port_number=port_number,
            flow=flow
        )
        insert_traffic_record(
            email=user.email,
            port_number=port_number
        )
        restart_xui()

        # Генерируем ссылку и дату окончания
        link = generate_vless_link(
            email=user.email,
            new_uuid=new_uuid,
            port_number=port_number,
            flow=flow
        )
        expiration = datetime.now(timezone.utc) + relativedelta(months=1)

        # Сохраняем в БД
        config = UserConfiguration(
            user_id=user.id,
            config_link=link,
            expiration_date=expiration
        )
        db.session.add(config)
        db.session.commit()

        return jsonify({
            "config_link": link,
            "expiration_date": expiration.isoformat()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
    

@users_bp.route('/users/<int:user_id>/configurations', methods=['GET'])
def get_latest_configuration(user_id):
    # Проверяем, что пользователь существует и совпадает с текущим
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    # if user.id != current_user.id:
    #     return jsonify({"error": "Unauthorized"}), 403

    # Получаем последнюю конфигурацию по дате создания
    config = UserConfiguration.query \
        .filter_by(user_id=user.id) \
        .order_by(UserConfiguration.created_at.desc()) \
        .first()

    if not config:
        return jsonify({"error": "Конфигурации не найдены"}), 404

    return jsonify({
        "config_link": config.config_link,
        "expiration_date": config.expiration_date.isoformat(),
        "created_at": config.created_at.isoformat()
    }), 200
