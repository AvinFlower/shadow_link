from app.extensions import celery
from app.models.server import Server
import redis
from dotenv import load_dotenv
import os
from celery.schedules import crontab

# Загрузка переменных окружения
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

# Снимаем bind=True, больше не нужен self
@celery.task
def update_all_vps_user_counts():
    """
    Получаем все VPS-серверы из базы и запускаем обновление кэша для каждого.
    Выполняется уже внутри Flask-контекста благодаря ContextTask.
    """
    try:
        servers = Server.query.all()
    except Exception as e:
        print(f"[ERROR] Failed to fetch servers from DB: {e}", flush=True)
        return

    for srv in servers:
        update_user_count_cache.delay(
            srv.host, srv.port, srv.ssh_username, srv.ssh_password
        )

@celery.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(
        crontab(minute='*/1'),
        update_all_vps_user_counts.s()
    )
