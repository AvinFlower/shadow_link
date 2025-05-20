# app/extensions.py
import os
from celery import Celery
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from flask_cors import CORS
from flask_jwt_extended import JWTManager

db = SQLAlchemy()
bcrypt = Bcrypt()
login_manager = LoginManager()
cors = CORS()
jwt = JWTManager()

# Проливаем сюда URL брокера и бэкенда РЕАЛЬНО при создании
celery = Celery(
    'app',
    broker=os.getenv('REDIS_URL'),
    backend=os.getenv('REDIS_URL')
)

def init_celery(app):
    # Подтягиваем настройки из Flask-конфига
    celery.conf.update(app.config)

    # Автодискавер тасков — ключ к магии
    celery.autodiscover_tasks(['app.tasks.celery_tasks'])

    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask
