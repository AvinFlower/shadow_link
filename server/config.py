import secrets
from os import environ

class Config:
    SQLALCHEMY_DATABASE_URI = environ.get('DATABASE_URL')
    SECRET_KEY = environ.get('SECRET_KEY')
    
    SESSION_COOKIE_SAMESITE = "None"  # Разрешить кросс-доменные cookie
    SESSION_COOKIE_SECURE = True      # Только по HTTPS (важно даже на localhost с браузером)
    SESSION_COOKIE_HTTPONLY = True    # Без доступа через JS
    SESSION_COOKIE_NAME = "session"   # Имя куки (опционально)

    # Можно также настроить время жизни сессии
    PERMANENT_SESSION_LIFETIME = 60 * 60 * 24 * 7  # 7 дней

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False