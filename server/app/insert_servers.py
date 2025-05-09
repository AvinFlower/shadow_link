import os
from dotenv import load_dotenv
from .models.server import Server
from .extensions import db

# Загружаем переменные из .env
load_dotenv()

def insert_servers():
    i = 1  # Начинаем с первого сервера
    while True:
        # Проверяем, есть ли переменная для текущего сервера
        ip = os.getenv(f'HOST{i}')
        if not ip:  # Если переменной нет, значит, серверов больше нет
            break

        # Извлекаем остальные данные для сервера
        country = os.getenv(f'COUNTRY{i}')  # Например, COUNTRY1, COUNTRY2 и т.д.
        ssh_port = os.getenv(f'SSH_PORT{i}')
        username = os.getenv(f'USER{i}')
        password = os.getenv(f'PASS{i}')
        port_subscription = os.getenv(f'PORT_SUBSCRIPTION{i}')
        flow = os.getenv(f'FLOW{i}')

        if not all([ip, ssh_port, username, password, port_subscription, flow]):
            print(f"Пропущен сервер {i} из-за отсутствующих данных.")
            i += 1
            continue

        # Создаем новый сервер с использованием данных из .env
        new_server = Server(
            country=country,
            ip=ip,
            port=port_subscription,  # Используем PORT_SUBSCRIPTION для порта
            username=username,
            password=password
        )

        # Добавляем сервер в сессию и коммитим изменения
        db.session.add(new_server)
        db.session.commit()

        print(f"Сервер {i} добавлен успешно!")
        i += 1  # Переходим к следующему серверу

if __name__ == "__main__":
    # Вставляем серверы
    insert_servers()
