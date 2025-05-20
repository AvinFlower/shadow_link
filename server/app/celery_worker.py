# F:\Education\OOP\shadow_link\server\app\celery_worker.py
from app import create_app
from app.extensions import celery

# Создаём Flask-приложение и загружаем конфигурацию
flask_app = create_app()
celery.conf.update(flask_app.config)

# Оборачиваем все задачи в контекст Flask
class ContextTask(celery.Task):
    def __call__(self, *args, **kwargs):
        with flask_app.app_context():
            return self.run(*args, **kwargs)

celery.Task = ContextTask

# Автодискавер тасков
celery.autodiscover_tasks(['app.tasks.celery_tasks'])