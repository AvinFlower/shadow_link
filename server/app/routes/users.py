# app/routes/users.py
from flask import Blueprint, jsonify, request, make_response
from flask_login import login_required, current_user
from ..models.user import User, UserConfiguration
from ..extensions import db
from datetime import datetime, timedelta

users_bp = Blueprint('users', __name__, url_prefix='/api')

@users_bp.route('/user', methods=['GET'])
@login_required
def get_user():
    return jsonify(current_user.to_json()), 200

@users_bp.route('/users', methods=['GET'])
def get_users():
    return jsonify([user.to_json() for user in User.query.all()]), 200

@users_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user_by_id(user_id):
    user = User.query.get(user_id)
    return jsonify(user.to_json()), 200 if user else (jsonify({'message': 'user not found'}), 404)

@users_bp.route('/users/<int:user_id>', methods=['PUT'])
@login_required
def update_user(user_id):
    data = request.get_json()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    for field in ['username','email','full_name','role','proxy_credits']:
        if field in data:
            setattr(user, field, data[field])
    if 'birth_date' in data:
        user.birth_date = datetime.strptime(data['birth_date'], "%d.%m.%Y")
    if 'password' in data:
        user.set_password(data['password'])

    db.session.commit()
    return jsonify(user.to_json()), 200

@users_bp.route('/users/<int:user_id>', methods=['DELETE'])
# @login_required
def user_delete(user_id):
    user = User.query.get(user_id)
    if user:
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User deleted'}), 200
    return jsonify({'message': 'User not found'}), 404

@users_bp.route('/users/<int:user_id>/configurations', methods=['POST'])
# @login_required
def create_configuration(user_id):
    if current_user.id != user_id and current_user.role != 'admin':
        return jsonify({'message': 'Forbidden'}), 403

    # Получаем данные из запроса
    data = request.get_json()
    config_link = data.get('config_link')
    
    if not config_link:
        return jsonify({'message': 'Config link is required'}), 400

    # Генерируем дату окончания (например, через 30 дней)
    expiration_date = datetime.utcnow() + timedelta(days=30)

    # Создаем новую конфигурацию для пользователя
    new_config = UserConfiguration(
        user_id=user_id,
        config_link=config_link,
        expiration_date=expiration_date
    )

    try:
        db.session.add(new_config)
        db.session.commit()
        return jsonify({
            'message': 'Configuration created successfully',
            'config_link': config_link,
            'expiration_date': expiration_date.strftime('%Y-%m-%d %H:%M:%S')
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error creating configuration', 'error': str(e)}), 500
