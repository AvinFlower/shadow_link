# app/routes/admin.py
from flask import Blueprint, jsonify
from app.decorators import admin_required

admin_bp = Blueprint('admin', __name__, url_prefix='/api')

@admin_bp.route('/admin', methods=['GET'])
@admin_required
def admin():
    return jsonify({'message': 'Welcome, admin!'}), 200
