import os
from dotenv import load_dotenv
from app.models.server import Server
from app.extensions import db

# Загружаем переменные из .env
load_dotenv()

def insert_servers():
    i = 1  # Начинаем с первого сервера
    while True:
        # Проверяем, есть ли переменная для текущего сервера
        host = os.getenv(f'HOST{i}')
        if not host:  # Если переменной нет, значит, серверов больше нет
            break

        # Извлекаем остальные данные для сервера
        country = os.getenv(f'COUNTRY{i}')  # Например, COUNTRY1, COUNTRY2 и т.д.
        port = os.getenv(f'PORT{i}')
        ssh_username = os.getenv(f'USERNAME{i}')
        ssh_password = os.getenv(f'PASSWORD{i}')
        max_users = os.getenv(f'MAX_USERS{i}')

        if not all([host, port, ssh_username, ssh_password, max_users]):
            print(f"Пропущен сервер {i} из-за отсутствующих данных.")
            i += 1
            continue
        
        existing_server = Server.query.filter_by(host=host, port=port).first()
        if existing_server:
            print(f"Сервер {i} уже существует, пропускаем.")
            i += 1
            continue


        # Создаем новый сервер с использованием данных из .env
        new_server = Server(
            country=country,
            host=host,
            port=port,
            ssh_username=ssh_username,
            ssh_password=ssh_password,
            max_users=max_users
        )

        # Добавляем сервер в сессию и коммитим изменения
        db.session.add(new_server)
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print(f"Ошибка при добавлении сервера {i}: {e}")


        print(f"Сервер {i} добавлен успешно!")
        i += 1  # Переходим к следующему серверу

if __name__ == "__main__":
    # Вставляем серверы
    insert_servers()
