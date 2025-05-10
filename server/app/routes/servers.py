from flask import Blueprint, request, jsonify, make_response
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models.user import User
from app.models.server import Server
from app.utils.insert_servers import insert_servers



server_bp = Blueprint('servers', __name__, url_prefix='/api')


# GET /api/servers — получить все серверы
@server_bp.route('/servers', methods=['GET'])
# @jwt_required()
def get_servers():
    # current_user_id = int(get_jwt_identity())
    # current = User.query.get(current_user_id)
    # if not current or current.role != 'admin':
#        return jsonify({'message': 'Access denied'}), 403
    
    servers = Server.query.all()
    return jsonify([{
        "id": s.id,
        "country": s.country,
        "ip": s.ip,
        "port": s.port,
        "username": s.username,
        "password": s.password
    } for s in servers]), 200

# POST /api/servers — создать новый сервер (только админ)
@server_bp.route('/servers/import-from-env', methods=['POST'])
# @jwt_required()
def import_servers_from_env():
    # current_user_id = int(get_jwt_identity())
    # current = User.query.get(current_user_id)
    # if not current or current.role != 'admin':
#        return jsonify({'message': 'Access denied'}), 403

    insert_servers()
    return jsonify({'message': 'Servers from .env inserted'}), 201


# PUT /api/servers/<int:server_id> — обновить сервер (только админ)
@server_bp.route('/servers/<int:server_id>', methods=['PUT'])
# @jwt_required()
def update_server(server_id):
    current_user_id = int(get_jwt_identity())
    current = User.query.get(current_user_id)
    # if not current or current.role != 'admin':
#        return jsonify({'message': 'Access denied'}), 403

    server = Server.query.get(server_id)
    if not server:
        return jsonify({'message': 'Server not found'}), 404

    data = request.get_json() or {}
    for field in ['country', 'ip', 'port', 'username', 'password']:
        if field in data:
            setattr(server, field, data[field])

    db.session.commit()
    return jsonify({'message': 'Server updated'}), 200

# DELETE /api/servers/<int:server_id> — удалить сервер (только админ)
@server_bp.route('/servers/<int:server_id>', methods=['DELETE'])
# @jwt_required()
def delete_server(server_id):
    current_user_id = int(get_jwt_identity())
    current = User.query.get(current_user_id)
    # if not current or current.role != 'admin':
#        return jsonify({'message': 'Access denied'}), 403

    server = Server.query.get(server_id)
    if not server:
        return jsonify({'message': 'Server not found'}), 404

    db.session.delete(server)
    db.session.commit()
    return jsonify({'message': 'Server deleted'}), 200
