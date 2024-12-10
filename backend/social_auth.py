from flask_dance.contrib.google import make_google_blueprint, google
from flask_dance.contrib.facebook import make_facebook_blueprint, facebook
from flask_dance.contrib.azure import make_azure_blueprint, azure
from flask import Flask, jsonify, redirect, url_for
from functools import wraps
import os

def init_social_auth(app):
    # Google OAuth Configuration
    google_bp = make_google_blueprint(
        client_id="your-google-client-id",
        client_secret="your-google-client-secret",
        scope=["profile", "email"]
    )
    app.register_blueprint(google_bp, url_prefix="/login")

    # Facebook OAuth Configuration
    facebook_bp = make_facebook_blueprint(
        client_id="your-facebook-client-id",
        client_secret="your-facebook-client-secret",
        scope=["email"]
    )
    app.register_blueprint(facebook_bp, url_prefix="/login")

    # Microsoft OAuth Configuration
    azure_bp = make_azure_blueprint(
        client_id="your-microsoft-client-id",
        client_secret="your-microsoft-client-secret",
        scope=["User.Read"]
    )
    app.register_blueprint(azure_bp, url_prefix="/login")

    return app

def handle_social_auth(auth_routes):
    @auth_routes.app.route("/api/auth/google")
    def google_login():
        if not google.authorized:
            return redirect(url_for("google.login"))
            
        resp = google.get("/oauth2/v1/userinfo")
        if resp.ok:
            user_info = resp.json()
            # Handle user data
            email = user_info["email"]
            name = user_info["name"]
            # Check if user exists or create new user
            user = auth_routes.db.get_user_by_email(email)
            if not user:
                auth_routes.db.create_social_user(email, name, "google")
            
            # Generate JWT token
            token = auth_routes.create_token(email)
            return jsonify({
                "status": "success",
                "token": token,
                "user": {
                    "email": email,
                    "name": name
                }
            })
        return jsonify({"status": "error", "message": "Failed to get user info"})

    @auth_routes.app.route("/api/auth/facebook")
    def facebook_login():
        if not facebook.authorized:
            return redirect(url_for("facebook.login"))
            
        resp = facebook.get("/me?fields=email,name")
        if resp.ok:
            user_info = resp.json()
            email = user_info["email"]
            name = user_info["name"]
            # Handle user data similar to Google
            user = auth_routes.db.get_user_by_email(email)
            if not user:
                auth_routes.db.create_social_user(email, name, "facebook")
            
            token = auth_routes.create_token(email)
            return jsonify({
                "status": "success",
                "token": token,
                "user": {
                    "email": email,
                    "name": name
                }
            })
        return jsonify({"status": "error", "message": "Failed to get user info"})

    @auth_routes.app.route("/api/auth/microsoft")
    def microsoft_login():
        if not azure.authorized:
            return redirect(url_for("azure.login"))
            
        resp = azure.get("/v1.0/me")
        if resp.ok:
            user_info = resp.json()
            email = user_info["userPrincipalName"]
            name = user_info["displayName"]
            # Handle user data similar to Google
            user = auth_routes.db.get_user_by_email(email)
            if not user:
                auth_routes.db.create_social_user(email, name, "microsoft")
            
            token = auth_routes.create_token(email)
            return jsonify({
                "status": "success",
                "token": token,
                "user": {
                    "email": email,
                    "name": name
                }
            })
        return jsonify({"status": "error", "message": "Failed to get user info"})