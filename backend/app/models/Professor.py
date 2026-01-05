from app.services.extenstions import db
from datetime import datetime

class Professor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    kau_id = db.Column(db.String(7), unique=True, nullable=False) # change 'VARCHAR' to 'STRING' SQL Injection Risk in Professor Model
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.now)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }