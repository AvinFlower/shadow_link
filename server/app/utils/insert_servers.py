# server/app/utils/insert_servers.py

import os
from dotenv import load_dotenv
from app.models.server import Server
from app.extensions import db

# ─── ЗАГРУЖАЕМ ПЕРЕМЕННЫЕ ИЗ .env ──────────────────────────────────────────────
load_dotenv()  # Если .env находится в корне проекта, он найдёт его автоматически
# ────────────────────────────────────────────────────────────────────────────────

def insert_servers():
    i = 1
    while True:
        # 1) Вытаскиваем переменные из окружения
        host          = os.getenv(f'HOST{i}')
        if not host:
            # Больше нет серверов вида HOST1, HOST2, ... — выходим
            break

        country       = os.getenv(f'COUNTRY{i}', '').strip()
        port_str      = os.getenv(f'PORT{i}', '').strip()
        ssh_username  = os.getenv(f'USERNAME{i}', '').strip()
        ssh_password  = os.getenv(f'PASSWORD{i}', '').strip()
        max_users_str = os.getenv(f'MAX_USERS{i}', '').strip()
        x_ui_port_str = os.getenv(f'PORT_X_UI{i}', '').strip()
        ui_panel_link = os.getenv(f'UI_PANEL_LINK{i}', '').strip()

        # 2) Проверяем наличие обязательных переменных
        if not all([host, country, port_str, ssh_username, ssh_password, max_users_str, x_ui_port_str, ui_panel_link]):
            print(f"[insert_servers] Пропускаем сервер {i}: не хватает данных.")
            i += 1
            continue

        # 3) Конвертируем порты и max_users в int
        try:
            ssh_port  = int(port_str)
            max_users = int(max_users_str)
            x_ui_port = int(x_ui_port_str)
        except ValueError as ve:
            print(f"[insert_servers] Ошибка конвертации числовых полей для сервера {i}: {ve}")
            i += 1
            continue

        # 4) Проверяем, есть ли уже такой сервер (по host + порт SSH)
        existing_server = Server.query.filter_by(host=host, port=str(ssh_port)).first()
        if existing_server:
            print(f"[insert_servers] Сервер #{i} ({host}:{ssh_port}) уже существует, пропускаем.")
            i += 1
            continue

        # 5) Создаём новый объект Server
        new_server = Server(
            country       = country,
            host          = host,
            port          = str(ssh_port),   # модель port — String, кладём "11122"
            ssh_username  = ssh_username,
            ssh_password  = ssh_password,
            max_users     = max_users,
            x_ui_port     = x_ui_port,
            ui_panel_link = ui_panel_link
        )

        # 6) Пишем в БД
        db.session.add(new_server)
        try:
            db.session.commit()
            print(f"[insert_servers] Сервер #{i} ({host}:{ssh_port}) добавлен успешно.")
        except Exception as e:
            db.session.rollback()
            print(f"[insert_servers] Ошибка при добавлении сервера #{i} ({host}:{ssh_port}): {e}")

        i += 1


if __name__ == "__main__":
    insert_servers()
