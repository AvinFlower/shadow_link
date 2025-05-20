# app/extensions.py
import os
from celery import Celery
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from flask_cors import CORS
from flask_jwt_extended import JWTManager

# Экземпляры расширений
db = SQLAlchemy()
bcrypt = Bcrypt()
login_manager = LoginManager()
cors = CORS()
jwt = JWTManager()
celery = Celery('app')

# Создание единого объекта Celery без контекста
# celery = Celery(
#     'app', )
    # broker=os.getenv('REDIS_URL'),
    # backend=os.getenv('REDIS_URL')
# )

# stub: инициализации Celery из Flask больше не требуется
def init_celery(app):
    pass