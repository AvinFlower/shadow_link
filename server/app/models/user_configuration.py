# app/models/user_configuration.py
from app.extensions import db
from datetime import datetime
from dateutil.relativedelta import relativedelta

class UserConfiguration(db.Model):
    __tablename__ = 'user_configurations'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    server_id = db.Column(db.Integer, db.ForeignKey('servers.id'), nullable=False)
    client_uuid = db.Column(db.String(36), unique=True, nullable=False)
    config_link = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime)
    expiration_date = db.Column(db.DateTime, nullable=False)
    months = db.Column(db.Integer, nullable=False)

    user = db.relationship('User', back_populates='configurations')
    server = db.relationship('Server', back_populates='configurations')

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        if self.expiration_date and self.months:
            self.created_at = self.expiration_date - relativedelta(months=self.months)
