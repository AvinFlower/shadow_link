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
import uuid, os, base64
import grpc
from app.generated_grpc import config_service_pb2, config_service_pb2_grpc


user_configurations_bp = Blueprint('user_configurations', __name__, url_prefix='/api')


# POST /api/users/<id>/configurations — создать конфигурацию (самому себе)
@user_configurations_bp.route('/users/configurations/<int:user_id>', methods=['POST'])
@jwt_required()
def create_configuration(user_id):
    data = request.get_json()
    country = data.get('country')
    months = data.get('months')

    if not country or months not in (1, 3, 6, 12):
        return jsonify(error="Неверные входные данные"), 400

    try:
        # Создаем канал и stub
        channel = grpc.insecure_channel('grpc_config:50052')
        stub = config_service_pb2_grpc.ConfigurationServiceStub(channel)

        # Формируем gRPC запрос
        grpc_request = config_service_pb2.CreateConfigRequest(
            user_id=user_id,
            country=country,
            months=months
        )

        # Вызываем gRPC метод
        grpc_response = stub.CreateConfiguration(grpc_request)

        if grpc_response.config_link == "":
            # Если пустая ссылка — значит что-то не так (gRPC вернул ошибку)
            return jsonify(error="Ошибка при создании конфигурации"), 500

        # Возвращаем успешный ответ
        return jsonify(
            config_link=grpc_response.config_link,
            expiration_date=grpc_response.expiration_date,
            price=grpc_response.price
        ), 201

    except grpc.RpcError as e:
        # Обработка ошибок gRPC
        return jsonify(error=f"gRPC ошибка: {e.details()}"), 500



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
    if int(get_jwt_identity()) != user_id:
        return jsonify(error="Unauthorized"), 403

    channel = grpc.insecure_channel('grpc_config:50052')
    stub    = config_service_pb2_grpc.ConfigurationServiceStub(channel)
    req     = config_service_pb2.SyncConfigsRequest(user_id=user_id)

    try:
        res = stub.SyncConfigurations(req)
        return jsonify(message=res.message), 200
    except grpc.RpcError as e:
        code = e.code()
        http = 500
        if code == grpc.StatusCode.NOT_FOUND:
            http = 404
        elif code == grpc.StatusCode.INVALID_ARGUMENT:
            http = 400
        return jsonify(error=e.details()), http
