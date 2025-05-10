import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app, db
from app.models.user import User

app = create_app()

with app.app_context():
    # Создание пользователей
    admin_user = User(
        username='admin',
        email='admin@example.com',
        birth_date='1990-01-01',
        full_name='Administrator',
        role='admin'
    )
    admin_user.set_password('adminpassword')
    db.session.add(admin_user)

    regular_user = User(
        username='user',
        email='user@example.com',
        birth_date='1990-01-01',
        full_name='User',
        role='user'
    )
    regular_user.set_password('userpassword')
    db.session.add(regular_user)

    db.session.commit()
    print("Test users added successfully.")



# docker cp F:\Education\OOP\shadow_link\server\app\insert_test_users.py flaskapp:/app/insert_test_users.py
# docker exec -it flaskapp bash
# python /app/insert_test_users.py
