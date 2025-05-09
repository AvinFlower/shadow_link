from ..extensions import db

class Server(db.Model):
    __tablename__ = 'servers'
    
    id = db.Column(db.Integer, primary_key=True)
    country = db.Column(db.String(150), nullable=False)
    ip = db.Column(db.String(200), nullable=False)
    port = db.Column(db.String(200), nullable=False)
    username = db.Column(db.String(200), nullable=False)
    password = db.Column(db.String(200), nullable=False)

    configurations = db.relationship('UserConfiguration', back_populates='server')