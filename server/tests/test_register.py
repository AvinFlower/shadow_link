# F:\Education\OOP\shadow_link\server\tests\test-register.py
import json
from datetime import datetime
from app.models.user import User
import random


def test_register_success(client):
    suffix = random.randint(1000, 9999)
    payload = {
        "username": f"newuser{suffix}",
        "email": f"new{suffix}@example.com",
        "password": "secret123",
        "birth_date": "15.06.2000",
        "full_name": "New User"
    }
    resp = client.post('/api/register',
                       data=json.dumps(payload),
                       content_type='application/json')

    assert resp.status_code == 201
    data = resp.get_json()
    assert data['message'] == 'User created successfully'
    assert 'access_token' in data

    u = User.query.filter_by(email=payload['email']).first()
    assert u is not None
    assert u.username == payload['username']
    assert u.password != payload['password']
