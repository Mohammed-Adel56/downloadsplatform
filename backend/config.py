import secrets
import os
from datetime import timedelta

class Config:
    # Generate a secure random secret key
    SECRET_KEY = "25E66FA4C66447E02B9E51133E70DFFA89E5987BB5E5EA7D4EB3B8B5AEFE542F"
    PAYPAL_CLIENT_ID = 'AT7-WMO3p5uFo_78BiRcWbM0yI1dn6WmQmA-2obmZyAit9kAi_Cu5834oN-MAqlv6NVZGpSkh3IJH551'
    PAYPAL_CLIENT_SECRET = 'ENxJvteh_9ixQwJM9y9FUTa6K_gCCvM6N4QpPc5-CfKaDCrONB0gx7aLQKBwzyf-6kAKcEjjfoUsz82V'
    PAYPAL_MODE = "sandbox"  # Change to "live" for production
    
    # JWT Settings
    JWT_SECRET_KEY = SECRET_KEY
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=15)
    
    # Email Settings (for Outlook)
    # MAIL_SERVER = 'sandbox.smtp.mailtrap.io'
    # MAIL_PORT = 2525
    # MAIL_USERNAME = '643a0dde772069'
    # MAIL_PASSWORD = '8b79f457b7d225'
    # MAIL_USE_TLS = True
    # MAIL_USE_SSL = False
      # Resend API Key
    RESEND_API_KEY = 're_Kccu3HMj_2Nrv1g9kupB162aRWHbTse5W'  # Replace with your Resend API key
    
    # Database Settings
    DATABASE_NAME = 'users.db'
    
    # Application Settings
    DEBUG = True
    CORS_HEADERS = 'Content-Type'
     # Cookie Settings
    COOKIE_SECURE = True  # Set to False in development if not using HTTPS
    COOKIE_HTTPONLY = True
    COOKIE_SAMESITE = 'Lax'
    SESSION_COOKIE_SECURE = True
    # Other Settings
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    
    @staticmethod
    def init_app(app):
        pass

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False
    # In production, you should set SECRET_KEY as an environment variable
    SECRET_KEY = os.getenv('SECRET_KEY', secrets.token_hex(32))

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}