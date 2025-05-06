# app/__init__.py
from flask import Flask
from .extensions import db, bcrypt, login_manager, cors, jwt
from .routes.auth import auth_bp
from .routes.users import users_bp
from .routes.admin import admin_bp
from .models.user import User

def create_app():
    app = Flask(__name__)

    # Конфигурация
    app.config.from_object('config.Config')

    # Инициализация расширений
    db.init_app(app)
    bcrypt.init_app(app)
    login_manager.init_app(app)
    cors.init_app(app, origins=["http://localhost:3000", "http://another-frontend.com"], supports_credentials=True)
    jwt.init_app(app)

    # Загрузка пользователя
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    # Добавление заголовков после запроса
    @app.after_request
    def after_request(response):
        response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        return response

    # Регистрация blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(admin_bp)

    with app.app_context():
        db.create_all()

    return app
