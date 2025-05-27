# app/__init__.py
from flask import Flask
from app.logging_config import configure_logging
import uuid
from flask import g, request
from app.extensions import db, bcrypt, login_manager, cors, jwt
from app.routes.auth import auth_bp
from app.routes.users import users_bp
from app.routes.admin import admin_bp
from app.routes.servers import server_bp
from app.routes.user_configurations import user_configurations_bp
from app.models.user import User

def create_app():
    app = Flask(__name__)

    # Загрузка конфигурации
    app.config.from_object('config.Config')

    # Инициализация логирования сразу после загрузки конфига
    configure_logging(
        host=app.config['LOGSTASH_HOST'],
        port=app.config['LOGSTASH_PORT']
    )

    @app.before_request
    def start_trace():
        # создаём уникальный ID на каждый HTTP-запрос
        g.trace_id = str(uuid.uuid4())
    
    @app.after_request
    def end_trace(response):
        # отдаём его клиенту (опционально) и возвращаем response
        response.headers['X-Trace-ID'] = g.trace_id
        return response
    
    # Инициализация расширений
    db.init_app(app)
    bcrypt.init_app(app)
    login_manager.init_app(app)
    cors.init_app(app, origins=[app.config.get('CORS_ORIGINS', 'http://localhost:3000')], supports_credentials=True)
    jwt.init_app(app)

    # Загрузка пользователя для Flask-Login
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    # Общие заголовки CORS
    @app.after_request
    def after_request(response):
        response.headers['X-Trace-ID'] = getattr(g, "trace_id", "unknown")
        response.headers['Access-Control-Allow-Origin'] = app.config.get('CORS_ORIGINS', 'http://localhost:3000')
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        return response

    # Регистрация blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(server_bp)
    app.register_blueprint(user_configurations_bp)

    # Создание таблиц
    with app.app_context():
        db.create_all()

    return app