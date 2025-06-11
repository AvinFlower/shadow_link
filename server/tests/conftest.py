import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest
from app import create_app, db
from app.models.user import User
from datetime import datetime
from sqlalchemy.orm import sessionmaker, scoped_session

# env
os.environ.setdefault('REDIS_URL', 'redis://localhost:6379/0')
os.environ.setdefault('LOGSTASH_HOST', 'localhost')

@pytest.fixture(scope='session')
def app():
    app = create_app()
    app.config.update({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'JWT_SECRET_KEY': 'test-secret',
        'BCRYPT_LOG_ROUNDS': 4
    })
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

@pytest.fixture(scope='function', autouse=True)
def session(app):
    connection = db.engine.connect()
    transaction = connection.begin()

    factory = sessionmaker(bind=connection)
    Session = scoped_session(factory)
    db.session = Session

    yield Session

    transaction.rollback()
    connection.close()
    Session.remove()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def init_user(session):
    u = User(
        username='existing',
        email='exist@example.com',
        birth_date=datetime.strptime('01.01.1990', '%d.%m.%Y').date(),
        full_name='Exist User'
    )
    u.set_password('oldpass')
    session.add(u)
    session.commit()
    return u
