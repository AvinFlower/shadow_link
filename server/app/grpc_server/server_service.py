# F:\Education\OOP\shadow_link\server\app\grpc_server\server_service.py

import grpc, os
from concurrent import futures
from grpc_reflection.v1alpha import reflection

from app import create_app
from app.generated_grpc import server_service_pb2, server_service_pb2_grpc
from app.models.server import Server
from app.extensions import db

# ─── ПОДКЛЮЧЕНИЕ REDIS «НА МЕСТЕ» ───────────────────────────────────────────────
import redis
from dotenv import load_dotenv

load_dotenv()
# Используем переменную окружения REDIS_URL, которую ты прописал в docker-compose.yml
redis_client = redis.Redis.from_url(os.getenv("REDIS_URL"))

# Вспомогательная функция для формирования ключа в Redis
def _redis_key_for_server_count(server_id: int) -> str:
    return f"server:{server_id}:active_config_count"
# ────────────────────────────────────────────────────────────────────────────────

app = create_app()

class ServerServiceServicer(server_service_pb2_grpc.ServerServiceServicer):
    def ListServers(self, request, context):
        # Работа с базой в контексте приложения
        with app.app_context():
            query = Server.query
            if request.country:
                query = query.filter_by(country=request.country)
            servers = query.all()

            response_servers = []
            for s in servers:
                # 1) Пытаемся взять значение из Redis
                key = _redis_key_for_server_count(s.id)
                raw = redis_client.get(key)
                if raw is not None:
                    try:
                        users_count = int(raw)
                    except ValueError:
                        users_count = None
                else:
                    users_count = None

                # 2) Если ключа нет или он «битый» — пересчитываем из БД и кладём в Redis
                if users_count is None:
                    from app.models.user_configuration import UserConfiguration as UC
                    users_count = UC.query.filter_by(server_id=s.id).count()
                    # Записываем в Redis с TTL = 300 секунд (5 минут)
                    redis_client.set(key, users_count, ex=300)

                # 3) Собираем ответный объект с полем users_count
                response_servers.append(
                    server_service_pb2.ServerInfo(
                        id=s.id,
                        country=s.country,
                        host=s.host,
                        port=str(s.port),
                        ssh_username=s.ssh_username,
                        ssh_password=s.ssh_password,
                        max_users=s.max_users,
                        x_ui_port=s.x_ui_port,
                        users_count=users_count,
                        ui_panel_link=s.ui_panel_link,
                    )
                )

            return server_service_pb2.ListServersResponse(servers=response_servers)

    # def CreateServer(self, request, context):
    #     srv = Server(
    #         country=request.country,
    #         host=request.host,
    #         port=request.port,
    #         ssh_username=request.ssh_username,
    #         ssh_password=request.ssh_password,
    #         max_users=request.max_users,
    #         x_ui_port=request.x_ui_port
    #     )
    #     db.session.add(srv)
    #     db.session.commit()
    #     return server_service_pb2.CreateServerResponse(
    #         id=srv.id,
    #         message="Server created"
    #     )

    # def UpdateServer(self, request, context):
    #     srv = Server.query.get(request.id)
    #     if not srv:
    #         context.set_code(grpc.StatusCode.NOT_FOUND)
    #         context.set_details("Server not found")
    #         return server_service_pb2.UpdateServerResponse()
    #     for field in ['country','host','port','ssh_username','ssh_password','max_users','x_ui_port']:
    #         setattr(srv, field, getattr(request, field))
    #     db.session.commit()
    #     return server_service_pb2.UpdateServerResponse(message="Server updated")

    # def DeleteServer(self, request, context):
    #     srv = Server.query.get(request.id)
    #     if not srv:
    #         context.set_code(grpc.StatusCode.NOT_FOUND)
    #         context.set_details("Server not found")
    #         return server_service_pb2.DeleteServerResponse()
    #     db.session.delete(srv)
    #     db.session.commit()
    #     return server_service_pb2.DeleteServerResponse(message="Server deleted")

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=5))
    server_service_pb2_grpc.add_ServerServiceServicer_to_server(
        ServerServiceServicer(), server
    )

    SERVICE_NAMES = (
        server_service_pb2.DESCRIPTOR.services_by_name['ServerService'].full_name,
        reflection.SERVICE_NAME,
    )
    reflection.enable_server_reflection(SERVICE_NAMES, server)

    server.add_insecure_port('[::]:50051')
    print("gRPC ServerService listening on 50051")
    server.start()
    server.wait_for_termination()

if __name__ == '__main__':
    serve()
