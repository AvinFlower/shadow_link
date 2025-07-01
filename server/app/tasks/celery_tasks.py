# # app/tasks/celery_tasks.py

# from app.extensions import celery
# from app.models.server import Server

# import redis
# from dotenv import load_dotenv
# import os
# from celery.schedules import crontab

# # Загрузка .env
# load_dotenv()
# redis_client = redis.Redis.from_url(os.getenv('REDIS_URL'))


# @celery.task(bind=True)
# def update_user_count_cache(self, host, port, ssh_username, ssh_password, ttl=60):
#     # локальный импорт, чтобы не тянуть create_app и прочее
#     from app.utils.vps_data import count_users_on_port

#     try:
#         count = count_users_on_port(host, port, ssh_username, ssh_password)
#         redis_client.set(f"vps:users:{host}:{port}", count, ex=ttl)
#         return count
#     except Exception as e:
#         self.retry(exc=e, countdown=10, max_retries=3)


# @celery.task
# def update_all_vps_user_counts():
#     """
#     Ежеминутно обновляем кеш по всем VPS.
#     Контекст Flask берётся из celery_worker.ContextTask.
#     """
#     print("[USERS_COUNT]", flush=True)
#     try:
#         servers = Server.query.all()
#     except Exception as e:
#         print(f"[ERROR] Failed to fetch servers: {e}", flush=True)
#         return 

#     for srv in servers:
#         update_user_count_cache.delay(
#             srv.host, srv.port, srv.ssh_username, srv.ssh_password
#         )


# @celery.on_after_configure.connect
# def setup_periodic_tasks_counts(sender, **kwargs):
#     update_all_vps_user_counts.apply_async()
#     sender.add_periodic_task(
#         crontab(minute='*/1'),
#         update_all_vps_user_counts.s(),
#         name='update-vps-user-counts-every-minute'
#     )




# @celery.task
# def sync_all_user_configurations():
#     """
#     Каждые 3 минуты синхронизируем данные конфигураций
#     с VPS для всех пользователей.
#     """
#     print("[SYNC_USER_CONFIGURATIONS]", flush=True)

#     # локальные импорты, чтобы избежать циклических зависимостей
#     from app import create_app
#     from app.models.user import User
#     from app.grpc_server.config_service import ConfigurationServiceServicer
#     from app.generated_grpc.config_service_pb2 import SyncConfigsRequest

#     flask_app = create_app()
#     with flask_app.app_context():
#         service = ConfigurationServiceServicer()

#         for user in User.query.all():
#             try:
#                 print(f"[SYNC_TASK] user_id={user.id}", flush=True)
#                 req = SyncConfigsRequest(user_id=user.id)
#                 service.SyncConfigurations(req, context=None)
#             except Exception as e:
#                 # логируем ошибку и продолжаем со следующим
#                 print(f"[SYNC_TASK][ERROR] user_id={user.id}: {e}", flush=True)
#                 continue

#     print("[SYNC_TASK] completed synchronizing all user configurations", flush=True)


# @celery.on_after_configure.connect
# def setup_periodic_tasks_sync(sender, **kwargs):
#     sync_all_user_configurations.apply_async()
#     sender.add_periodic_task(
#         crontab(minute='*/1'),
#         sync_all_user_configurations.s(),
#         name='sync-configs-every-3-minutes'
#     )


# @celery.task
# def load_servers_from_env():
#     from app import create_app, db
#     from app.models.server import Server
#     from sqlalchemy.exc import IntegrityError

#     flask_app = create_app()
#     with flask_app.app_context():
#         i = 1
#         added = 0
#         while True:
#             host = os.getenv(f"HOST{i}")
#             if not host:
#                 break  # нет следующего сервера

#             try:
#                 port = os.getenv(f"PORT{i}")
#                 existing_server = Server.query.filter_by(host=host, port=port).first()
#                 if existing_server:
#                     print(f"[ENV_LOAD] Server {host}:{port} уже существует. Пропускаем.", flush=True)
#                     i += 1
#                     continue

#                 server = Server(
#                     country=os.getenv(f"COUNTRY{i}"),
#                     host=host,
#                     port=port,
#                     ssh_username=os.getenv(f"USERNAME{i}"),
#                     ssh_password=os.getenv(f"PASSWORD{i}"),
#                     max_users=int(os.getenv(f"MAX_USERS{i}")),
#                     x_ui_port=int(os.getenv(f"PORT_X_UI{i}")),
#                     ui_panel_link=os.getenv(f"UI_PANEL_LINK{i}")
#                 )

#                 db.session.add(server)
#                 db.session.commit()
#                 print(f"[ENV_LOAD] Добавлен сервер: {host}:{port}", flush=True)
#                 added += 1

#             except IntegrityError as e:
#                 db.session.rollback()
#                 print(f"[ENV_LOAD][ERROR] Ошибка добавления {host}:{port}: {e}", flush=True)
#             except Exception as e:
#                 print(f"[ENV_LOAD][ERROR] Ошибка чтения сервера #{i}: {e}", flush=True)

#             i += 1

#         print(f"[ENV_LOAD] Всего добавлено серверов: {added}", flush=True)
        

# @celery.on_after_configure.connect
# def setup_periodic_tasks_sync(sender, **kwargs):
#     load_servers_from_env.apply_async()
#     sender.add_periodic_task(
#         crontab(minute='*/1'),
#         sync_all_user_configurations.s(),
#         name='sync-servers-every-10-minutes'
#     )


# app/tasks/celery_tasks.py

from app.extensions import celery
from app.models.server import Server
import redis, os
from dotenv import load_dotenv
from celery.schedules import crontab

load_dotenv()
redis_client = redis.Redis.from_url(os.getenv('REDIS_URL'))


@celery.task(bind=True)
def update_user_count_cache(self, host, port, ssh_username, ssh_password, ttl=60):
    from app.utils.vps_data import count_users_on_port
    try:
        count = count_users_on_port(host, port, ssh_username, ssh_password)
        redis_client.set(f"vps:users:{host}:{port}", count, ex=ttl)
        return count
    except Exception as e:
        self.retry(exc=e, countdown=10, max_retries=3)


@celery.task
def update_all_vps_user_counts():
    print("[USERS_COUNT]", flush=True)
    try:
        servers = Server.query.all()
    except Exception as e:
        print(f"[ERROR] Failed to fetch servers: {e}", flush=True)
        return

    for srv in servers:
        # фильтрация «плохих» портов
        if not srv.port or int(srv.port) == 0:
            print(f"[SKIP] Invalid port for {srv.host}:{srv.port}", flush=True)
            continue
        update_user_count_cache.delay(
            srv.host, int(srv.port), srv.ssh_username, srv.ssh_password
        )


@celery.task
def sync_all_user_configurations():
    print("[SYNC_USER_CONFIGURATIONS]", flush=True)
    from app import create_app
    from app.models.user import User
    from app.grpc_server.config_service import ConfigurationServiceServicer
    from app.generated_grpc.config_service_pb2 import SyncConfigsRequest

    flask_app = create_app()
    with flask_app.app_context():
        service = ConfigurationServiceServicer()
        for user in User.query.all():
            try:
                print(f"[SYNC_TASK] user_id={user.id}", flush=True)
                req = SyncConfigsRequest(user_id=user.id)
                service.SyncConfigurations(req, context=None)
            except Exception as e:
                print(f"[SYNC_TASK][ERROR] user_id={user.id}: {e}", flush=True)


@celery.task
def load_servers_from_env():
    from app import create_app, db
    from app.models.server import Server
    from sqlalchemy.exc import IntegrityError

    flask_app = create_app()
    with flask_app.app_context():
        i, added = 1, 0
        while True:
            host = os.getenv(f"HOST{i}")
            if not host:
                break
            port = os.getenv(f"PORT{i}")
            if not port or int(port) == 0:
                print(f"[ENV_LOAD][SKIP] Invalid port for {host}:{port}", flush=True)
                i += 1
                continue
            existing = Server.query.filter_by(host=host, port=port).first()
            if existing:
                print(f"[ENV_LOAD] Exists: {host}:{port}", flush=True)
            else:
                try:
                    server = Server(
                        country=os.getenv(f"COUNTRY{i}"),
                        host=host,
                        port=port,
                        ssh_username=os.getenv(f"USERNAME{i}"),
                        ssh_password=os.getenv(f"PASSWORD{i}"),
                        max_users=int(os.getenv(f"MAX_USERS{i}", 0)),
                        x_ui_port=int(os.getenv(f"PORT_X_UI{i}", 0)),
                        ui_panel_link=os.getenv(f"UI_PANEL_LINK{i}")
                    )
                    db.session.add(server)
                    db.session.commit()
                    added += 1
                    print(f"[ENV_LOAD] Added: {host}:{port}", flush=True)
                except IntegrityError as e:
                    db.session.rollback()
                    print(f"[ENV_LOAD][ERROR] {host}:{port}: {e}", flush=True)
            i += 1
        print(f"[ENV_LOAD] Total added: {added}", flush=True)


@celery.on_after_configure.connect
def setup_all_periodic_tasks(sender, **kwargs):
    # сразу при старте
    update_all_vps_user_counts.s().apply_async()
    sync_all_user_configurations.s().apply_async()
    load_servers_from_env.s().apply_async()

    # расписание
    sender.add_periodic_task(
        crontab(minute='*/1'),
        update_all_vps_user_counts.s(),
        name='update-vps-user-counts-every-minute'
    )
    sender.add_periodic_task(
        crontab(minute='*/1'),
        sync_all_user_configurations.s(),
        name='sync-configs-every-3-minutes'
    )
    sender.add_periodic_task(
        crontab(minute='*/1'),
        load_servers_from_env.s(),
        name='load-servers-every-10-minutes'
    )