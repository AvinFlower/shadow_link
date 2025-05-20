# F:\Education\OOP\shadow_link\server\test_count_users.py
import os
os.environ['REDIS_URL'] = "redis://default:tSDGpb1l6S5Tq8kOd8KVoZUrOvPnsDmw@redis-12735.c328.europe-west3-1.gce.redns.redis-cloud.com:12735/0"

from app.utils.vps_data import count_users_on_port

if __name__ == "__main__":
    host = "192.145.28.171"
    port = 11122
    username = "root"
    password = "OJBLSZR5vTf3f3"

    count = count_users_on_port(host, port, username, password)
    print(f"Количество пользователей на сервере {host} (порт {port}): {count}")
