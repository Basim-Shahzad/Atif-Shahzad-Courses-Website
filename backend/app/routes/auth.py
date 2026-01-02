from flask import Blueprint, request, jsonify, make_response
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, get_jwt, get_jti, set_access_cookies, set_refresh_cookies
from app import db, bcrypt
from app.models.User import User
from app.models.TokenBlackList import TokenBlocklist
import re
from flask_wtf.csrf import generate_csrf
from app.services.extenstions import limiter
from app.models.RefreshToken import RefreshToken
from flask_wtf.csrf import generate_csrf
from app.services.extenstions import limiter, csrf


auth_bp = Blueprint('auth', __name__)

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    if len(password) < 8:
        return False
    if not re.search(r'[A-Z]', password):
        return False
    if not re.search(r'[a-z]', password):
        return False
    if not re.search(r'\d', password):
        return False
    return True

@auth_bp.route('/csrf-token', methods=['GET'])
def get_csrf_token():
    token = generate_csrf()
    response = make_response(jsonify({"csrfToken": token}))
    response.set_cookie(
        "XSRF-TOKEN",
        token,
        domain=".dratifshahzad.com",
        secure=True,
        httponly=False,
        samesite="None",
        max_age=3600,
    )
    return response

@auth_bp.route('/register', methods=['POST'])
@limiter.limit("10 per hour")
@csrf.exempt
def register():
    try:
        data = request.get_json()
        
        required_fields = ['email', 'password', 'name']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        if not validate_password(password):
            return jsonify({'error': 'Password must be at least 8 characters with uppercase, lowercase, and number'}), 400
        
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already registered'}), 409
        
        password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
        user = User(
            email=email,
            password_hash=password_hash,
            name=data['name'].strip(),
        )
        
        db.session.add(user)
        db.session.commit()
        
        access_token = create_access_token(
            identity=str(user.uid), 
            additional_claims={"role": user.role.value}
        )
        refresh_token = create_refresh_token(
            identity=str(user.uid)
        )

        jti = get_jti(refresh_token)
        db.session.add(RefreshToken(uid=user.uid, jti=jti))
        db.session.commit()
        
        response = make_response(jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict()
        }), 201)

        set_access_cookies(response, access_token)
        set_refresh_cookies(response, refresh_token)
        
        return response
        
    except Exception as e:
        db.session.rollback()
        print(f"Registration error: {str(e)}")
        return jsonify({'error': 'Registration failed'}), 500
    
@auth_bp.route('/login', methods=['POST'])
@limiter.limit("10 per hour")
@csrf.exempt
def login():
    try:
        data = request.get_json()
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password required'}), 400

        email = data['email'].lower().strip()
        password = data['password']
        user = User.query.filter_by(email=email).first()

        if not user or not bcrypt.check_password_hash(user.password_hash, password):
            return jsonify({'error': 'Invalid credentials'}), 401

        if not user.is_active:
            return jsonify({'error': 'Account deactivated'}), 401

        access_token = create_access_token(
            identity=str(user.uid),
            additional_claims={"role": user.role.value}
        )
        refresh_token = create_refresh_token(identity=str(user.uid))

        jti = get_jti(refresh_token)
        db.session.add(RefreshToken(uid=user.uid, jti=jti))
        db.session.commit()

        response = jsonify({
            'message': 'Login successful',
            'user': user.to_dict()
        })

        set_access_cookies(response, access_token)
        set_refresh_cookies(response, refresh_token)

        return response, 200

    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'error': 'Login failed'}), 500

@auth_bp.route('/refresh', methods=['POST'])
@limiter.limit("10 per hour")
@csrf.exempt
@jwt_required(refresh=True)
def refresh():
    try:
        identity = get_jwt_identity()
        jti = get_jwt()['jti'] # this is the current refresh token's jti

        token_in_db = RefreshToken.query.filter_by(jti=jti, revoked=False).first()
        if not token_in_db:
            return jsonify({"error": "Token revoked or invalid"}), 401
        
        token_in_db.revoked = True

        user = User.query.get(int(identity))
        if not user:
            return jsonify({"error": "User not found"}), 404

        new_access_token = create_access_token(
            identity=str(user.uid),
            additional_claims={"role": user.role.value}
        )

        new_refresh_token = create_refresh_token(identity=str(user.uid))
        new_jti = get_jti(new_refresh_token)
        db.session.add(RefreshToken(uid=user.uid, jti=new_jti))
        db.session.commit()
        
        response = make_response(jsonify({"message": "Token refreshed"}), 200)

        set_access_cookies(response, new_access_token)
        set_refresh_cookies(response, new_refresh_token)

        return response
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Token refresh failed"}), 401

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
@csrf.exempt
def get_current_user():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'user': user.to_dict()}), 200
    except Exception as e:
        print(f"Get current user error: {str(e)}")
        return jsonify({'error': 'Failed to get user'}), 401

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
@csrf.exempt
def change_password():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data.get('current_password') or not data.get('new_password'):
            return jsonify({'error': 'Current and new password required'}), 400
        
        user = User.query.get(int(current_user_id))
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if not bcrypt.check_password_hash(user.password_hash, data['current_password']):
            return jsonify({'error': 'Current password incorrect'}), 401
        
        if not validate_password(data['new_password']):
            return jsonify({'error': 'New password must be at least 8 characters with uppercase, lowercase, and number'}), 400
        
        user.password_hash = bcrypt.generate_password_hash(data['new_password']).decode('utf-8')
        db.session.commit()
        
        return jsonify({'message': 'Password changed successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Change password error: {str(e)}")
        return jsonify({'error': 'Password change failed'}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required(verify_type=False)
@csrf.exempt
def logout():
    try:
        jti = get_jwt()["jti"]
        token_type = get_jwt()["type"]
        identity = get_jwt_identity()

        if token_type == "refresh" or identity:
            RefreshToken.query.filter_by(uid=int(identity), revoked=False).update({"revoked": True})

        db.session.add(TokenBlocklist(jti=jti))


        db.session.commit()

        response = make_response(jsonify({"message": "Logged out successfully"}), 200)
        response.set_cookie('access_token_cookie', '', expires=0)
        response.set_cookie('refresh_token_cookie', '', expires=0)

        return response
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Logout failed"}), 500