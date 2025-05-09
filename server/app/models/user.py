# app/models/user.py
from app.extensions import db, bcrypt
from flask_login import UserMixin
from datetime import datetime

class User(UserMixin, db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    birth_date = db.Column(db.Date, nullable=False)
    full_name = db.Column(db.String(150), nullable=False)
    last_login = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    role = db.Column(db.String(50), default='user')

    configurations = db.relationship('UserConfiguration', back_populates='user')

    def set_password(self, password):
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password, password)

    def to_json(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'full_name': self.full_name,
            'birth_date': self.birth_date.strftime("%d.%m.%Y"),
            'role': self.role,
            'last_login': self.last_login.strftime("%d.%m.%Y %H:%M:%S") if self.last_login else None,
            'created_at': self.created_at.strftime("%d.%m.%Y %H:%M:%S")
        }

    @classmethod
    def find_by_username(cls, username):
        return cls.query.filter_by(username=username).first()

    @classmethod
    def find_by_id(cls, user_id):
        return cls.query.get(user_id)

# INSERT INTO users (username, email, password, role, birth_date, full_name, last_login, created_at)
# VALUES (
#     'admin', 
#     'admin@example.com', 
#     '$2b$12$C1g0vfrnQ0UGgXEgPsoCFEg7Av7fpQQOY5yINH1Gp7D38C8KOe8tm', 
#     'admin', 
#     '1990-01-01', 
#     'Administrator', 
#     CURRENT_TIMESTAMP, 
#     CURRENT_TIMESTAMP
# );


# INSERT INTO users (username, email, password, role, birth_date, full_name, last_login, created_at)
# VALUES (
#     'user', 
#     'user@example.com', 
#     '$2b$12$C1g0vfrnQ0UGgXEgPsoCFEg7Av7fpQQOY5yINH1Gp7D38C8KOe8tm', 
#     'user', 
#     '1990-01-01', 
#     'User', 
#     CURRENT_TIMESTAMP, 
#     CURRENT_TIMESTAMP
# );