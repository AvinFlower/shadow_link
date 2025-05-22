# F:\Education\OOP\shadow_link\server\app\grpc_server\config_service.py
import grpc
from concurrent import futures
from datetime import datetime, timezone
from dateutil.relativedelta import relativedelta
import uuid
import base64
import os
from grpc_reflection.v1alpha import reflection

# Импорт сгенерированных protobuf-классов
from app.generated_grpc import config_service_pb2, config_service_pb2_grpc
from app.models.server import Server
from app.models.user_configuration import UserConfiguration
from app.models.user import User
from app.extensions import db
from app.utils.vps_data import (
    insert_inbound_record,
    insert_traffic_record,
    restart_xui,
    count_users_on_port,
    get_vps_clients_configurations,
    get_cached_user_count
)
from app import create_app

app = create_app()

class ConfigurationServiceServicer(config_service_pb2_grpc.ConfigurationServiceServicer):
    def CreateConfiguration(self, request, context):
        with app.app_context():
            # Простая валидация
            if not request.country or request.months not in (1,3,6,12):
                context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
                context.set_details("Неверные входные данные")
                return config_service_pb2.CreateConfigResponse()

            # Выбор первого свободного сервера
            servers = Server.query.filter_by(country=request.country).all()
            selected = next(
                (s for s in servers
                 if get_cached_user_count(s.host, s.port, s.ssh_username, s.ssh_password) < s.max_users),
                None
            )
            if not selected:
                context.set_code(grpc.StatusCode.NOT_FOUND)
                context.set_details("Нет свободных серверов")
                return config_service_pb2.CreateConfigResponse()

            # Генерация параметров
            email = f"Unknown_Soldier_{request.user_id}_{uuid.uuid4().hex[:8]}"
            client_uuid = base64.urlsafe_b64encode(uuid.uuid4().bytes).rstrip(b"=").decode()
            flow = os.environ.get("FLOW", "")

            try:
                # Шаг 1: добавить inbound и получить ссылку
                link = insert_inbound_record(
                    email, client_uuid,
                    selected.host, selected.port,
                    flow, request.user_id, request.months,
                    selected.ssh_username, selected.ssh_password, selected.x_ui_port
                )
                # Шаг 2: учёт трафика
                insert_traffic_record(email, selected.port, request.months,
                                      selected.host, selected.ssh_username, selected.ssh_password)
                # Шаг 3: перезапуск XUI
                # restart_xui(selected.host, selected.port,
                #             selected.ssh_username, selected.ssh_password)

                # Шаг 4: сохранить в БД
                exp = datetime.now(timezone.utc) + relativedelta(months=request.months)
                cfg = UserConfiguration(
                    user_id=request.user_id,
                    server_id=selected.id,
                    client_uuid=client_uuid,
                    config_link=link,
                    expiration_date=exp,
                    months=request.months
                )
                db.session.add(cfg)
                db.session.commit()

                # Ответ gRPC
                return config_service_pb2.CreateConfigResponse(
                    config_link=link,
                    expiration_date=exp.isoformat(),
                    price={1:100,3:250,6:500,12:1000}[request.months]
                )
            except Exception as e:
                db.session.rollback()
                context.set_code(grpc.StatusCode.INTERNAL)
                context.set_details(str(e))
                return config_service_pb2.CreateConfigResponse()
            
    
    def SyncConfigurations(self, request, context):
        with app.app_context():
            # 1. Проверка пользователя (существует ли)
            user = User.query.get(request.user_id)
            if not user:
                context.set_code(grpc.StatusCode.NOT_FOUND)
                context.set_details("User not found")
                return config_service_pb2.SyncConfigsResponse()

            # 2. Собираем локальные конфигурации и их UUID
            local_configs = UserConfiguration.query.filter_by(user_id=request.user_id).all()
            local_uuids = {cfg.client_uuid for cfg in local_configs}

            # 3. Получаем все конфиги с VPS
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
                    for c in clients:
                        c['server_id'] = srv.id
                        vps_entries.append(c)
                except Exception:
                    # Просто пропускаем недоступные машины
                    continue

            # Фильтруем только записи для данного user_id
            user_vps = [c for c in vps_entries if c.get('user_id') == request.user_id]
            vps_uuids = {c['id'] for c in user_vps}

            # 4. Вычисляем новые и удалённые UUID
            new_uuids     = vps_uuids - local_uuids
            removed_uuids = local_uuids - vps_uuids

            try:
                # 5. Добавляем и обновляем
                for entry in user_vps:
                    cuuid = entry['id']
                    exp_date = datetime.fromtimestamp(entry['expiryTime'] / 1000, tz=timezone.utc)

                    if cuuid in new_uuids:
                        new_cfg = UserConfiguration(
                            user_id       = request.user_id,
                            server_id     = entry['server_id'],
                            client_uuid   = cuuid,
                            config_link   = entry.get('link'),
                            expiration_date = exp_date,
                            months        = entry.get('months')
                        )
                        db.session.add(new_cfg)
                    else:
                        cfg = next(cfg for cfg in local_configs if cfg.client_uuid == cuuid)
                        cfg.config_link     = entry.get('link')
                        cfg.expiration_date = exp_date
                        cfg.months          = entry.get('months')

                # 6. Удаляем старые
                for cfg in local_configs:
                    if cfg.client_uuid in removed_uuids:
                        db.session.delete(cfg)

                db.session.commit()

                return config_service_pb2.SyncConfigsResponse(
                    message="Configurations synchronized successfully"
                )
            except Exception as e:
                db.session.rollback()
                context.set_code(grpc.StatusCode.INTERNAL)
                context.set_details(str(e))
                return config_service_pb2.SyncConfigsResponse()

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=5))
    config_service_pb2_grpc.add_ConfigurationServiceServicer_to_server(
        ConfigurationServiceServicer(), server
    )

    SERVICE_NAMES = (
        config_service_pb2.DESCRIPTOR.services_by_name['ConfigurationService'].full_name,
        reflection.SERVICE_NAME,
    )
    reflection.enable_server_reflection(SERVICE_NAMES, server)

    server.add_insecure_port('[::]:50052')
    print("gRPC ConfigurationService listening on 50052")
    server.start()
    server.wait_for_termination()


if __name__ == "__main__":
    serve()