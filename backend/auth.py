from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User, UserProfile
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    
    # Check required fields
    if not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check if user exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    # Create user
    hashed_password = generate_password_hash(data['password'])
    user = User(
        username=data['username'],
        email=data['email'],
        password_hash=hashed_password
    )
    
    db.session.add(user)
    db.session.commit()
    
    # Create profile
    profile = UserProfile(
        user_id=user.id,
        full_name=data.get('full_name', ''),
        age=data.get('age'),
        weight=data.get('weight'),
        height=data.get('height'),
        fitness_level=data.get('fitness_level', 'Beginner')
    )
    
    db.session.add(profile)
    db.session.commit()
    
    # Create token for immediate login
    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({
        'message': 'User created successfully',
        'access_token': access_token,
        'user_id': user.id,
        'username': user.username
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    
    if not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password required'}), 400
    
    user = User.query.filter_by(username=data['username']).first()
    
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({
        'access_token': access_token,
        'user_id': user.id,
        'username': user.username,
        'message': 'Login successful'
    }), 200

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = int(get_jwt_identity())
    profile = UserProfile.query.filter_by(user_id=user_id).first()
    user = User.query.get(user_id)
    
    if not profile or not user:
        return jsonify({'error': 'Profile not found'}), 404
    
    return jsonify({
        'username': user.username,
        'email': user.email,
        'full_name': profile.full_name,
        'age': profile.age,
        'weight': profile.weight,
        'height': profile.height,
        'fitness_level': profile.fitness_level
    }), 200

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    data = request.json
    profile = UserProfile.query.filter_by(user_id=user_id).first()
    
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404
    
    # Update profile fields
    update_fields = ['full_name', 'age', 'weight', 'height', 'fitness_level']
    for key in update_fields:
        if key in data:
            setattr(profile, key, data[key])
    
    db.session.commit()
    return jsonify({'message': 'Profile updated successfully'}), 200

@auth_bp.route('/check-auth', methods=['GET'])
@jwt_required()
def check_auth():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'authenticated': True,
        'user_id': user_id,
        'username': user.username
    }), 200