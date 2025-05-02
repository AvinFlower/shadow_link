from flask import Flask, request, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_login import LoginManager, login_user, login_required, logout_user, current_user, UserMixin
from flask_bcrypt import Bcrypt
from os import environ
from datetime import datetime
import secrets
from functools import wraps

# ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
app = Flask(__name__)

# Включение CORS для разрешения запросов с указанных источников
CORS(app, origins=["http://localhost:3000", "http://another-frontend.com"], supports_credentials=True)

app.config['SQLALCHEMY_DATABASE_URI'] = environ.get('DATABASE_URL') # Конфигурация подключения к базе данных через переменную окружения DATABASE_URL
app.config['SECRET_KEY'] = secrets.token_hex(16)                    # Генерация секретного ключа для защиты сессий

XUI_API_URL=http://<IP_или_HOST_LINUX>:9000                         # адрес твоего Flask-API на Linux
XUI_API_TOKEN=<токен_доступа>                                       # если ты будешь защитить Linux-API токеном

# Инициализация объектов для работы с базой данных и хеширования паролей
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

# Инициализация менеджера сессий пользователей
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Функция для загрузки пользователя по ID (используется Flask-Login)
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Обработка всех запросов для добавления нужных заголовков в ответ
@app.after_request
def after_request(response):
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'  # Разрешаем доступ только с этого источника
    response.headers['Access-Control-Allow-Credentials'] = 'true'  # Разрешаем использование куки
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'  # Разрешаем методы
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'  # Разрешаем заголовки
    return response

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    birth_date = db.Column(db.Date, nullable=False)
    full_name = db.Column(db.String(150), nullable=False)
    last_login = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    role = db.Column(db.String(50), default='user')
    proxy_credits = db.Column(db.Integer, default=0)

    def set_password(self, password):
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')
        
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password, password)

    def to_json(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'full_name': self.full_name,
            'birth_date': self.birth_date.strftime("%d.%m.%Y"),
            'role': self.role,
            'proxy_credits': self.proxy_credits,
            'last_login': self.last_login.strftime("%d.%m.%Y %H:%M:%S") if self.last_login else None,
            'created_at': self.created_at.strftime("%d.%m.%Y %H:%M:%S")
        }

    #ПОИСК ПОЛЬЗОВАТЕЛЯ ПО ЛОГИНУ
    @classmethod
    def find_by_username(cls, username):
        return cls.query.filter_by(username=username).first()

    # ПОИСК ПОЛЬЗОВАТЕЛЯ ПО ID
    @classmethod
    def find_by_id(cls, user_id):
        return cls.query.get(user_id)


# ФУНКЦИЯ ДЛЯ ПРОВЕРКИ НА АДМИНА
def admin_required(f):
    @wraps(f)
    @login_required
    def decorated_function(*args, **kwargs):
        if current_user.role != 'admin':
            return jsonify({'error': 'Forbidden'}), 403
        return f(*args, **kwargs)
    return decorated_function

with app.app_context():
    db.create_all()

@app.route('/api/register', methods=['OPTIONS'])
def register_options():
    return '', 204

@app.route('/api/login', methods=['OPTIONS'])
def login_options():
    return '', 204

@app.route('/api/admin', methods=['GET'])
@admin_required
def admin():
    return jsonify({'message': 'Welcome, admin!'}), 200


# РЕГИСТРАЦИЯ
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data['username']
    email = data['email']
    password = data['password']
    birth_date = data['birth_date']
    full_name = data.get('full_name', '')
    role = data.get('role', 'user')
    proxy_credits = data.get('proxy_credits', 0)

    try:
        birth_date = datetime.strptime(birth_date, "%d.%m.%Y").date()
    except ValueError:
        return make_response(jsonify({'message': 'Invalid date format, use dd.mm.yyyy'}), 400)

    if User.find_by_username(username):
        return make_response(jsonify({'message': 'Username already exists'}), 400)

    if User.query.filter_by(email=email).first():
        return make_response(jsonify({'message': 'Email already exists'}), 400)

    new_user = User(
        username=username,
        email=email,
        birth_date=birth_date,
        full_name=full_name,
        role=role,
        proxy_credits=proxy_credits
    )
    new_user.set_password(password)

    try:
        db.session.add(new_user)
        db.session.commit()
        login_user(new_user)
        response = jsonify({'message': 'User created successfully', **new_user.to_json()})
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        return response, 201
    except Exception as e:
        db.session.rollback()
        return make_response(jsonify({'message': 'Error creating user', 'error': str(e)}), 500)


# ЛОГИН
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return make_response(jsonify({'message': 'Username and password are required'}), 400)

    user = User.find_by_username(username)
    if user and user.check_password(password):
        login_user(user)
        user.last_login = datetime.utcnow()
        db.session.commit()
        return jsonify(user.to_json()), 200

    return make_response(jsonify({'message': 'Invalid username or password'}), 401)


# ВЫХОД
@app.route('/api/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'}), 200

@app.route('/api/user', methods=['GET'])
@login_required
def get_user():
    return jsonify(current_user.to_json()), 200

@app.route('/api/users', methods=['GET'])
def get_users():
    try:
        return jsonify([user.to_json() for user in User.query.all()]), 200
    except Exception as e:
        return make_response(jsonify({'message': 'Error getting users', 'error': str(e)}), 500)


# ПОЛУЧЕНИЕ ПОЛЬЗОВАТЕЛЯ ПО ID
@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user_by_id(user_id):
    user = User.query.get(user_id)
    return jsonify(user.to_json()), 200 if user else (jsonify({'message': 'user not found'}), 404)


#ОБНОВЛЕНИЕ ПОЛЬЗОВАТЕЛЯ ПО ID
@app.route('/api/users/<int:user_id>', methods=['PUT'])
@login_required
def update_user(user_id):
    data = request.get_json()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    for field in ['username','email','full_name','role','proxy_credits']:
        if field in data:
            setattr(user, field, data[field])
    if 'birth_date' in data:
        user.birth_date = datetime.strptime(data['birth_date'], "%d.%m.%Y")
    if 'password' in data:
        user.set_password(data['password'])

    db.session.commit()
    return jsonify(user.to_json()), 200


# СМЕНА ПАРОЛЯ
@app.route('/api/change-password', methods=['POST'])
@login_required
def change_password():
    data = request.get_json()
    if not current_user.check_password(data.get('old_password')):
        return make_response(jsonify({'message': 'Invalid current password'}), 400)
    current_user.set_password(data.get('new_password'))
    db.session.commit()
    return jsonify(current_user.to_json()), 200


# УДАЛЕНИЕ ПОЛЬЗОВАТЕЛЯ ПО ID
@app.route('/api/users/<int:user_id>', methods=['DELETE'])
@login_required
def user_delete(user_id):
    user = User.query.get(user_id)
    if user:
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User deleted'}), 200
    return jsonify({'message': 'User not found'}), 404


# ПОЛУЧЕНИЕ ПРОКСИ СЕРВЕРОВ
@app.route('/api/proxy-services', methods=['GET'])
def get_proxy_services():
    services = [
        {'id': 1, 'name': 'Basic Proxy', 'description': 'Basic proxy service', 'price': 5, 'credits': 100},
        {'id': 2, 'name': 'Premium Proxy', 'description': 'High-speed proxy', 'price': 15, 'credits': 500},
        {'id': 3, 'name': 'Enterprise Proxy', 'description': 'Dedicated IPs', 'price': 50, 'credits': 2000}
    ]
    return jsonify(services)


# КУПЛЕННЫЕ ПРОКСИ
@app.route('/api/my-proxies', methods=['GET'])
@login_required
def get_my_proxies():
    proxies = [{'id': 101, 'ip': '185.123.xxx.xxx', 'port': 8080, 'country': 'Netherlands', 'status': 'active', 'expiresAt': '2025-05-22'}]
    return jsonify(proxies)


if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=4000)