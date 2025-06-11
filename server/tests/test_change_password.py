# tests/test_auth_change_and_profile.py
import json
import pytest
from flask_jwt_extended import create_access_token

def get_token(client, init_user):
    # можно напрямую пользоваться JWT-фабрикой
    return create_access_token(identity=str(init_user.id))

def test_change_password_and_profile(client, init_user, app):
    token = get_token(client, init_user)
    headers = {'Authorization': f'Bearer {token}'}

    # 1) Смена пароля
    change_payload = {"old_password": "oldpass", "new_password": "new1234"}
    resp = client.post('/api/change-password',
                       headers=headers,
                       data=json.dumps(change_payload),
                       content_type='application/json')
    assert resp.status_code == 200

    # проверяем, что теперь oldpass не проходит, а new1234 — проходит
    from app.models.user import User
    u = User.query.get(init_user.id)
    assert not u.check_password("oldpass")
    assert u.check_password("new1234")

    # 2) Получение профиля
    resp2 = client.get('/api/profile', headers=headers)
    assert resp2.status_code == 200
    data = resp2.get_json()
    assert data['username'] == init_user.username
    assert data['email'] == init_user.email
