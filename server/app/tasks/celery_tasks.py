# app/tasks/celery_tasks.py

from app.extensions import celery
from app.models.server import Server

import redis
from dotenv import load_dotenv
import os
from celery.schedules import crontab

# Загрузка .env
load_dotenv()
redis_client = redis.Redis.from_url(os.getenv('REDIS_URL'))


@celery.task(bind=True)
def update_user_count_cache(self, host, port, ssh_username, ssh_password, ttl=60):
    # локальный импорт, чтобы не тянуть create_app и прочее
    from app.utils.vps_data import count_users_on_port

    try:
        count = count_users_on_port(host, port, ssh_username, ssh_password)
        redis_client.set(f"vps:users:{host}:{port}", count, ex=ttl)
        return count
    except Exception as e:
        self.retry(exc=e, countdown=10, max_retries=3)


@celery.task
def update_all_vps_user_counts():
    """
    Ежеминутно обновляем кеш по всем VPS.
    Контекст Flask берётся из celery_worker.ContextTask.
    """
    try:
        servers = Server.query.all()
    except Exception as e:
        print(f"[ERROR] Failed to fetch servers: {e}", flush=True)
        return

    for srv in servers:
        update_user_count_cache.delay(
            srv.host, srv.port, srv.ssh_username, srv.ssh_password
        )


@celery.on_after_configure.connect
def setup_periodic_tasks_counts(sender, **kwargs):
    sender.add_periodic_task(
        crontab(minute='*/1'),
        update_all_vps_user_counts.s(),
        name='update-vps-user-counts-every-minute'
    )




@celery.task
def sync_all_user_configurations():
    """
    Каждые 3 минуты синхронизируем данные конфигураций
    с VPS для всех пользователей.
    """
    print("[SYNC_TASK] start synchronizing all user configurations", flush=True)

    # локальные импорты, чтобы избежать циклических зависимостей
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
                # логируем ошибку и продолжаем со следующим
                print(f"[SYNC_TASK][ERROR] user_id={user.id}: {e}", flush=True)
                continue

    print("[SYNC_TASK] completed synchronizing all user configurations", flush=True)


@celery.on_after_configure.connect
def setup_periodic_tasks_sync(sender, **kwargs):
    sender.add_periodic_task(
        crontab(minute='*/3'),
        sync_all_user_configurations.s(),
        name='sync-configs-every-3-minutes'
    )
