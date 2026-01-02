from flask import Flask
from flask_cors import CORS
from datetime import timedelta
import os
import sys
from dotenv import load_dotenv
from app.services.extenstions import db, bcrypt, jwt, limiter, csrf
from flask_migrate import Migrate
from app.models.TokenBlackList import TokenBlocklist

# Load environment
FLASK_ENV = os.getenv("FLASK_ENV", "development")
load_dotenv(f".env.{FLASK_ENV}")

migrate = Migrate()

def create_app():
    app = Flask(__name__)

    # Basic config
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')
    app.config['JWT_TOKEN_LOCATION'] = ['cookies']
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=30)
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=7)
    app.config['JWT_COOKIE_CSRF_PROTECT'] = True
    app.config['JWT_ACCESS_CSRF_COOKIE_NAME'] = "csrf_access_token"
    app.config['JWT_ACCESS_CSRF_HEADER_NAME'] = "X-CSRF-TOKEN"
    app.config['JWT_ACCESS_COOKIE_NAME'] = 'access_token_cookie'
    app.config['JWT_REFRESH_COOKIE_NAME'] = 'refresh_token_cookie'
    app.config['JWT_CSRF_IN_COOKIES'] = True

    # Environment-specific security
    if FLASK_ENV == "production":
        app.config['JWT_COOKIE_SECURE'] = True
        app.config['JWT_COOKIE_SAMESITE'] = 'None'
        app.config['SESSION_COOKIE_DOMAIN'] = ".dratifshahzad.com"
        app.config['SESSION_COOKIE_SECURE'] = True
        allowed_origins = [
            "https://dratifshahzad.com",
            "https://www.dratifshahzad.com",
            "https://api.dratifshahzad.com"
        ]
    else:
        app.config['JWT_COOKIE_SECURE'] = False
        app.config['JWT_COOKIE_SAMESITE'] = 'Lax'
        app.config['SESSION_COOKIE_DOMAIN'] = None
        app.config['SESSION_COOKIE_SECURE'] = False
        allowed_origins = [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174",
        ]

    # Validate env variables
    for key in ["SECRET_KEY", "JWT_SECRET_KEY", "SQLALCHEMY_DATABASE_URI"]:
        if not app.config[key]:
            raise ValueError(f"{key} environment variable is required")

    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    csrf.init_app(app)
    migrate.init_app(app, db)
    limiter.init_app(app)

    # CORS
    CORS(app, origins=allowed_origins, supports_credentials=True)

    # Health check route
    @app.route('/api/')
    def api_health_check():
        return {'status': 'API is running', 'version': '1.0'}, 200

    # Dev-only debug info
    if FLASK_ENV != "production":
        @app.route('/api/debug')
        def debug_info():
            return {
                'python_version': sys.version,
                'flask_env': FLASK_ENV,
                'database_url': 'configured' if os.environ.get('DATABASE_URL') else 'not configured',
                'routes': [str(rule) for rule in app.url_map.iter_rules()]
            }, 200

    # JWT token blocklist
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        jti = jwt_payload["jti"]
        token = db.session.query(TokenBlocklist.id).filter_by(jti=jti).first()
        return token is not None

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.courses import courses_bp
    from app.routes.ncaaa_courses import ncaaa_courses_bp
    from app.routes.about import about_bp
    from app.routes.admin import admin_bp, admin_ncaaa_bp

    for bp in [auth_bp, courses_bp, ncaaa_courses_bp, about_bp, admin_bp, admin_ncaaa_bp]:
        app.register_blueprint(bp, url_prefix='/api')

    return app