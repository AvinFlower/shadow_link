from flask import Flask, request, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_login import LoginManager, login_user, login_required, logout_user, current_user, UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from os import environ
from datetime import datetime
import secrets

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://another-frontend.com"], supports_credentials=True)
app.config['SQLALCHEMY_DATABASE_URI'] = environ.get('DATABASE_URL')
app.config['SECRET_KEY'] = secrets.token_hex(16)
db = SQLAlchemy(app)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'  # Страница входа по умолчанию

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.after_request
def after_request(response):
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
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
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # Время создания
    role = db.Column(db.String(50), default='user')  # Роль пользователя
    proxy_credits = db.Column(db.Integer, default=0)  # Кредиты прокси

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def to_json(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'full_name': self.full_name,
            'birth_date': self.birth_date.strftime("%d.%m.%Y"),  # Преобразуем дату в строку
            'role': self.role,
            'proxy_credits': self.proxy_credits,
            'last_login': self.last_login.strftime("%d.%m.%Y %H:%M:%S") if self.last_login else None,
            'created_at': self.created_at.strftime("%d.%m.%Y %H:%M:%S")
        }

    @classmethod
    def find_by_username(cls, username):
        return cls.query.filter_by(username=username).first()

    @classmethod
    def find_by_id(cls, user_id):
        return cls.query.get(user_id)


# Инициализация базы данных
with app.app_context():
    db.create_all()


@app.route('/api/register', methods=['OPTIONS'])
def register_options():
    return '', 204

@app.route('/api/login', methods=['OPTIONS'])
def login_options():
    return '', 204


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

    # Преобразование даты рождения в формат даты
    try:
        # Преобразуем строку в формат datetime (dd.mm.yyyy)
        birth_date = datetime.strptime(birth_date, "%d.%m.%Y").date()
    except ValueError:
        # Ошибка, если дата не соответствует формату
        return make_response(jsonify({'message': 'Invalid date format, use dd.mm.yyyy'}), 400)

    # Проверка на существование пользователя с таким же именем или email
    if User.find_by_username(username):
        return make_response(jsonify({'message': 'Username already exists'}), 400)

    if User.query.filter_by(email=email).first():  # Проверка уникальности email
        return make_response(jsonify({'message': 'Email already exists'}), 400)

    # Хеширование пароля
    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
    # Создание нового пользователя
    new_user = User(
        username=username,
        email=email,
        password=hashed_password,
        birth_date=birth_date,
        full_name=full_name,
        role=role,
        proxy_credits=proxy_credits
    )

    try:
        # Добавление нового пользователя в базу данных
        db.session.add(new_user)
        db.session.commit()
        login_user(new_user)
        # Возвращаем успешный ответ с данными нового пользователя
        response = jsonify({'message': 'User created successfully', **new_user.to_json()})
        response.headers['Access-Control-Allow-Credentials'] = 'true'  # Заголовок для поддержки cookies
        return response, 201
    except Exception as e:
        # Логирование ошибки и возврат информации о ней
        db.session.rollback()
        print(f"Error: {e}")
        return make_response(jsonify({'message': 'Error creating user', 'error': str(e)}), 500)

    
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return make_response(jsonify({'message': 'Username and password are required'}), 400)

    user = User.find_by_username(username)
    if user and check_password_hash(user.password, password):
        login_user(user)
        user.last_login = datetime.utcnow()
        db.session.commit()
        return jsonify(user.to_json()), 200

    return make_response(jsonify({'message': 'Invalid username or password'}), 401)


@app.route('/api/logout', methods=['POST'])
@login_required
def logout():
    try:
        logout_user()
        print("User logged out successfully")
        return jsonify({'message': 'Logged out successfully'}), 200
    except Exception as e:
        print(f"Logout error: {str(e)}")
        return jsonify({'message': 'Error during logout', 'error': str(e)}), 500


# Получение информации о текущем пользователе
@app.route('/api/user', methods=['GET'])
@login_required
def get_user():
    return jsonify(current_user.to_json()), 200

# Получение всех пользователей
@app.route('/api/users', methods=['GET'])
def get_users():
    try:
        users = User.query.all()
        users_data = [user.to_json() for user in users]
        return jsonify(users_data), 200
    except Exception as e:
        return make_response(jsonify({'message': 'Error getting users', 'error': str(e)}), 500)

# Получение пользователя по ID
@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user_by_id(user_id):
    try:
        user = User.query.get(user_id)
        if user:
            return jsonify(user.to_json()), 200
        return jsonify({'message': 'user not found'}), 404
    except Exception as e:
        return make_response(jsonify({'message': 'Error getting user', 'error': str(e)}), 500)

# Обновление пользователя
@app.route('/api/users/<int:user_id>', methods=['PUT'])
@login_required
def update_user(user_id):
    try:
        data = request.get_json()
        user = User.query.get(user_id)
        if user:
            user.username = data.get('username', user.username)
            user.email = data.get('email', user.email)
            db.session.commit()
            return jsonify(user.to_json()), 200
        return jsonify({'message': 'User not found'}), 404
    except Exception as e:
        return jsonify({'message': 'Error updating user', 'error': str(e)}), 500

# Удаление пользователя
@app.route('/api/users/<int:user_id>', methods=['DELETE'])
@login_required
def user_delete(user_id):
    try:
        user = User.query.get(user_id)
        if user:
            db.session.delete(user)
            db.session.commit()
            return jsonify({'message': 'User deleted'}), 200
        return jsonify({'message': 'User not found'}), 404
    except Exception as e:
        return jsonify({'message': 'Error deleting user', 'error': str(e)}), 500

# Публичный маршрут для получения информации о прокси сервисах
@app.route('/api/proxy-services', methods=['GET'])
def get_proxy_services():
    services = [
        {
            'id': 1,
            'name': 'Basic Proxy',
            'description': 'Базовый прокси-сервис для обычного серфинга',
            'price': 5,
            'credits': 100
        },
        {
            'id': 2,
            'name': 'Premium Proxy',
            'description': 'Премиум прокси с высокой скоростью и поддержкой',
            'price': 15,
            'credits': 500
        },
        {
            'id': 3,
            'name': 'Enterprise Proxy',
            'description': 'Корпоративный прокси с выделенными IP-адресами',
            'price': 50,
            'credits': 2000
        }
    ]
    return jsonify(services)

# Защищенный маршрут для получения прокси-серверов пользователя
@app.route('/api/my-proxies', methods=['GET'])
@login_required
def get_my_proxies():
    # Если пользователь не авторизован
    if not current_user.is_authenticated:
        return jsonify({'error': 'Необходимо войти в систему'}), 401
    
    # Заглушка для демонстрации
    proxies = [
        {
            'id': 101,
            'ip': '185.123.xxx.xxx',
            'port': 8080,
            'country': 'Netherlands',
            'status': 'active',
            'expiresAt': '2025-05-22T00:00:00'  # пример даты
        }
    ]
    return jsonify(proxies)


if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=4000)