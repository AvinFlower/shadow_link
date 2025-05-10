# app/models/server.py
from app.extensions import db

class Server(db.Model):
    __tablename__ = 'servers'
    
    id = db.Column(db.Integer, primary_key=True)
    country = db.Column(db.String(150), nullable=False)
    host = db.Column(db.String(200), nullable=False)
    port = db.Column(db.String(200), nullable=False)
    ssh_username = db.Column(db.String(200), nullable=False)
    ssh_password = db.Column(db.String(200), nullable=False)
    max_users = db.Column(db.Integer, nullable=False)
    x_ui_port = db.Column(db.Integer, nullable=False)

    configurations = db.relationship('UserConfiguration', back_populates='server')
