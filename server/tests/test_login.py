# F:\Education\OOP\shadow_link\server\tests\test-login.py
import json

def test_login_success(client, init_user):
    payload = {"username": init_user.username, "password": "oldpass"}
    resp = client.post('/api/login',
                       data=json.dumps(payload),
                       content_type='application/json')

    assert resp.status_code == 200
    data = resp.get_json()
    assert data['message'] == 'Login successful'
    assert 'jwt_token' in data['access']
    # убедимся, что last_login обновился
    from app.models.user import User
    u = User.query.get(init_user.id)
    assert u.last_login is not None
