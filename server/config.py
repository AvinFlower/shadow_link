import secrets
import os

class Config:
    # Конфигурация базы данных
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')  # Подключение к базе данных
    SECRET_KEY = os.environ.get('SECRET_KEY')  # Секретный ключ для безопасности приложения

    # Конфигурация сессий
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
    JWT_ACCESS_TOKEN_EXPIRES = 60 * 60 * 24 * 7

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False
    # Важно добавить настройки для работы в продакшене, например:
    SQLALCHEMY_TRACK_MODIFICATIONS = False  # Отключение отслеживания изменений в базе данных