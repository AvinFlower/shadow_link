import os
from datetime import timedelta

class BaseConfig:
    # SQLAlchemy
    SQLALCHEMY_DATABASE_URI    = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False  # продакшен-опция

    # Flask-сессии и JWT
    SECRET_KEY                 = os.getenv('SECRET_KEY', os.urandom(32))
    JWT_SECRET_KEY             = os.getenv('JWT_SECRET_KEY', SECRET_KEY)
    JWT_ACCESS_TOKEN_EXPIRES   = timedelta(days=7)

    # Celery
    BROKER_URL                 = os.getenv('REDIS_URL')
    RESULT_BACKEND             = os.getenv('REDIS_URL')
    RESULT_EXPIRES             = 3600
    TASK_IGNORE_RESULT         = False

    # Logstash / Observability
    LOGSTASH_HOST              = os.getenv('LOGSTASH_HOST', 'logstash')
    LOGSTASH_PORT              = int(os.getenv('LOGSTASH_PORT', 5000))

class DevelopmentConfig(BaseConfig):
    DEBUG                      = True

class ProductionConfig(BaseConfig):
    DEBUG                      = False

class Config(DevelopmentConfig):
    """По умолчанию берем DevelopmentConfig"""
    pass