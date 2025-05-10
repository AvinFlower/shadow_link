# app/models/user_configuration.py
from app.extensions import db
from datetime import datetime

class UserConfiguration(db.Model):
    __tablename__ = 'user_configurations'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    server_id = db.Column(db.Integer, db.ForeignKey('servers.id'), nullable=False)
    client_uuid = db.Column(db.String(36), unique=True, nullable=False)
    config_link = db.Column(db.String(255), nullable=False)
    price = db.Column(db.Integer, nullable=False)
    expiration_date = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    flow = db.Column(db.String(200), nullable=False)

    user = db.relationship('User', back_populates='configurations')
    server = db.relationship('Server', back_populates='configurations')