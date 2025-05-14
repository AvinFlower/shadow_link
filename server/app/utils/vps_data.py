# app/utils/vps_data.py
import base64
import paramiko
import json
from datetime import datetime, timezone
from dateutil.relativedelta import relativedelta
from pathlib import Path
from dotenv import load_dotenv
import os
import uuid as _uuid
from urllib.parse import quote

# Загрузка переменных окружения (PUBLIC_KEY, DOMAIN)
load_dotenv()

# Получение значений переменных
public_key = os.getenv('PUBLIC_KEY')
domain = os.getenv('DOMAIN')

def count_users_on_port(
    host: str, 
    port: int, 
    ssh_ssh_username: str, 
    ssh_ssh_password: str,
) -> int:
    # Подключаемся по SSH через нужный порт
    ssh = ssh_connect(host, port, ssh_ssh_username, ssh_ssh_password)
    
    try:
        # Путь к базе данных
        db_path = "/etc/x-ui/x-ui.db"
        
        # Команда для извлечения данных из таблицы inbounds
        cmd = f"sqlite3 {db_path} \"SELECT settings FROM inbounds;\""
        stdin, stdout, stderr = ssh.exec_command(cmd)
        out = stdout.read().decode().strip()
        if not out:
            raise RuntimeError(f"Inbound на сервере {host} не найден")

        # Парсим настройки из результата
        try:
            cfg = json.loads(out)
            clients = cfg.get('clients', [])
            return len(clients)
        except json.JSONDecodeError as e:
            print(f"Ошибка при декодировании JSON: {e}")
            return 0

    except Exception as e:
        print(f"Ошибка при выполнении команды: {e}")
        return 0
    finally:
        ssh.close()


def ssh_connect(host: str, port: int, ssh_username: str, ssh_password: str) -> paramiko.SSHClient:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(host, port=port, username=ssh_username, password=ssh_password)
    return ssh


def restart_xui(host: str, port: int, ssh_username: str, ssh_password: str):
    ssh = ssh_connect(host, port, ssh_username, ssh_password)
    try:
        ssh.exec_command("systemctl restart x-ui")
    finally:
        ssh.close()


def insert_traffic_record(
    email: str,
    port: int,
    months: int,
    host: str,
    ssh_username: str,
    ssh_password: str
):
    ssh = ssh_connect(host, port, ssh_username, ssh_password)
    try:
        db_path = "/etc/x-ui/x-ui.db"
        expiry_ms = int((datetime.now(timezone.utc) + relativedelta(months=months)).timestamp() * 1000)
        sql = (
            "INSERT INTO client_traffics "
            "(inbound_id, enable, email, up, down, expiry_time, total, reset) VALUES ("
            f"(SELECT id FROM inbounds),"
            f"1, '{email}', 0, 0, {expiry_ms}, 0, 0);"
        )
        ssh.exec_command(f'sqlite3 {db_path} "{sql}"')
    finally:
        ssh.close()


def insert_inbound_record(
    email: str,
    client_uuid: str,
    host: str,
    port: int,
    flow: str,
    user_id: int,
    months: int,
    ssh_username: str,
    ssh_password: str,
    x_ui_port: str
) -> str:
    try:
        ssh = ssh_connect(host, port, ssh_username, ssh_password)
        db_path = "/etc/x-ui/x-ui.db"

        sql = (
            'SELECT id, '
            '       json(settings) AS settings, '
            '       json_extract(stream_settings, \'$.realitySettings.shortIds[0]\') AS first_short_id '
            f'FROM inbounds WHERE port = {x_ui_port};'
        )

        cmd = f'sqlite3 {db_path} \"{sql}\"'
        stdin, stdout, stderr = ssh.exec_command(cmd)
        out = stdout.read().decode().strip()

        if not out:
            raise Exception(f"Inbound на порту {x_ui_port} не найден")

        inbound_id, settings_json, first_short_id = out.split("|", 2)
        if not first_short_id:
            raise Exception(f"No first_short_id found in line: {out}")

        # Загружаем JSON и добавляем клиента
        cfg = json.loads(settings_json)
        # sub_id = _uuid.uuid4().hex[:12]
        expiry_ms = int((datetime.now(timezone.utc) + relativedelta(months=months)).timestamp() * 1000)


        # ⬇️ Генерируем ссылку заранее
        config_link = generate_vless_link(email, client_uuid, host, x_ui_port, flow, first_short_id)
        
        client = {
            "host": host,
            "user_id": user_id,
            "months": months,
            "link": config_link,
            "empty_data_here": "=============================BELOW_IS_THE_VPS_DATA=============================",
            "email": email,
            "enable": True,
            "expiryTime": expiry_ms,
            "flow": flow,
            "id": client_uuid,
            # "subId": sub_id,
            "limitIp": 0,
            "reset": 0,
            "tgId": "",
            "totalGB": 0
        }

        cfg["clients"].append(client)

        # Формируем строку JSON с отступами (столбик)
        pretty_json = json.dumps(cfg, indent=4)
        
        # Кодирование JSON через base64 для безопасности
        encoded_cfg = base64.b64encode(pretty_json.encode()).decode()

        # Формируем запрос с base64
        upd_cmd = (
            f'echo "{encoded_cfg}" | base64 -d | '
            f'xargs -0 -I {{}} sqlite3 {db_path} '
            f'"UPDATE inbounds SET settings = \'{{}}\' WHERE id = {inbound_id};"'
        )

        stdin, stdout, stderr = ssh.exec_command(upd_cmd)
        err = stderr.read().decode().strip()
        if err:
            raise Exception(f"Ошибка при выполнении UPDATE: {err}")

        # Возвращаем ссылку
        return config_link

    finally:
        ssh.close()
        
        
def generate_vless_link(
    email: str,
    client_uuid: str,
    host: str,
    x_ui_port: int,
    flow: str,
    sid: str
) -> str:
    """
    Составляем vless:// ссылку, используя переданный host и port.
    """
    spx = quote('/')  # => '%2F'
    params = (
        f"type=tcp&security=reality"
        f"&pbk={public_key}"
        f"&fp=chrome&sni={domain}"
        f"&sid={sid}&spx={spx}&flow={flow}"
    )
    return f"vless://{client_uuid}@{host}:{x_ui_port}?{params}#{email}"



def get_vps_clients_configurations(host, port, ssh_username, ssh_password, x_ui_port):
    try:
        ssh = ssh_connect(host, port, ssh_username, ssh_password)
        db_path = "/etc/x-ui/x-ui.db"

        # Извлекаем clients из JSON-колонки settings, а не из stream_settings
        sql = (
            'SELECT json_extract(settings, \'$.clients\') AS clients '
            f'FROM inbounds WHERE port = {x_ui_port};'
        )

        cmd = f'sqlite3 {db_path} "{sql}"'
        stdin, stdout, stderr = ssh.exec_command(cmd)
        out = stdout.read().decode().strip()

        if not out:
            raise Exception("Конфигурации клиентов на VPS не найдены")

        clients = json.loads(out)  # теперь это массив dict-ов с нужными полями
        return clients

    finally:
        ssh.close()