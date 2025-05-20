# F:\Education\OOP\shadow_link\server\app\celery_worker.py
from app import create_app
from app.extensions import celery, init_celery

flask_app = create_app()

if __name__ == '__main__':
    init_celery(flask_app)
    celery.worker_main()