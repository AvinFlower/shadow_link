from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta, timezone

from app.models.user_configuration import UserConfiguration
from app.models.server import Server
from app.models.user import User

from app.extensions import db

from app.utils.vps_data import (
    insert_inbound_record,
    insert_traffic_record,
    restart_xui,
    count_users_on_port,
    get_vps_clients_configurations
)
import uuid, os


user_configurations_bp = Blueprint('user_configurations', __name__, url_prefix='/api')


# POST /api/users/<id>/configurations — создать конфигурацию (самому себе)
@user_configurations_bp.route('/users/configurations/<int:user_id>', methods=['POST'])
# @jwt_required()
def create_configuration(user_id):
    data = request.get_json()
    country = data.get('country')
    months = int(data.get('months'))
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
    unique_email = f"Unknown_Soldier_{user_id}"
    client_uuid = str(uuid.uuid4())
    flow = os.environ["FLOW"]

    try:
        # 1) Добавить в inbounds + сразу получить готовый линк
        config_link = insert_inbound_record(
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
            config_link=config_link,
            expiration_date=datetime.utcnow() + timedelta(days=30 * months),
            months=months
        )
        db.session.add(config)
        db.session.commit()

        return jsonify(
            config_link=config_link,
            expiration_date=config.expiration_date.isoformat(),
            country=country,
            price=price
        ), 201

    except Exception as e:
        db.session.rollback()
        return jsonify(error=str(e)), 500


# GET /api/users/<id>/configurations — список конфигураций (самому себе)
@user_configurations_bp.route('/users/configurations/<int:user_id>', methods=['GET'])
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



# PUT /api/users/<id>/configurations/sync — синхронизация конфигураций с сервером
@user_configurations_bp.route('/users/configurations/sync/<int:user_id>', methods=['PUT'])
@jwt_required()
def sync_configurations(user_id):
    current_user_id = int(get_jwt_identity())
    if current_user_id != user_id:
        return jsonify({"error": "Unauthorized"}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Получаем локальные конфигурации пользователя
    local_configs = UserConfiguration.query.filter_by(user_id=user_id).all()
    local_uuids = {c.client_uuid for c in local_configs}

    # Собираем все VPS конфигурации по всем серверам
    vps_entries = []
    servers = Server.query.all()
    for srv in servers:
        try:
            clients = get_vps_clients_configurations(
                host=srv.host,
                port=srv.port,
                ssh_username=srv.ssh_username,
                ssh_password=srv.ssh_password,
                x_ui_port=srv.x_ui_port
            )
            for client in clients:
                # Добавляем идентификатор сервера к каждой записи
                client['server_id'] = srv.id
                vps_entries.append(client)
        except Exception:
            # Игнорируем серверы, к которым не удалось подключиться
            continue

    # Фильтр только по текущему пользователю
    user_vps = [c for c in vps_entries if c.get('user_id') == user_id]
    vps_uuids = {c.get('id') for c in user_vps}

    # Определяем новые и устаревшие
    new_uuids = vps_uuids - local_uuids
    removed_uuids = local_uuids - vps_uuids

    try:
        # Добавляем новые конфигурации
        for entry in user_vps:
            client_uuid = entry.get('id')
            if client_uuid in new_uuids:
                exp_ms = entry.get('expiryTime')
                exp_date = datetime.fromtimestamp(exp_ms / 1000, tz=timezone.utc)
                new_config = UserConfiguration(
                    user_id=user_id,
                    server_id=entry['server_id'],
                    client_uuid=client_uuid,
                    config_link=entry.get('link'),
                    expiration_date=exp_date,
                    months=entry.get('months', 0)
                )
                db.session.add(new_config)

        # Удаляем устаревшие конфигурации
        for cfg in local_configs:
            if cfg.client_uuid in removed_uuids:
                db.session.delete(cfg)

        db.session.commit()
        return jsonify({"message": "Configurations synchronized successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify(error=str(e)), 500
