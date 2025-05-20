# F:\Education\OOP\shadow_link\server\app\tasks\celery_tasks.py
from app.extensions import celery
import os
import redis
from dotenv import load_dotenv

load_dotenv()

redis_client = redis.Redis.from_url(os.getenv('REDIS_URL'))

@celery.task(bind=True)
def update_user_count_cache(self, host: str, port: int, ssh_username: str, ssh_password: str, ttl: int = 60):
    """
    Подключаемся по SSH, считаем юзеров, пишем в Redis с TTL.
    """
    from app.utils.vps_data import count_users_on_port

    cache_key = f"vps:users:{host}:{port}"
    try:
        count = count_users_on_port(host, port, ssh_username, ssh_password)
        redis_client.set(cache_key, count, ex=ttl)
        return count
    except Exception as e:
        self.retry(exc=e, countdown=10, max_retries=3)
        return None