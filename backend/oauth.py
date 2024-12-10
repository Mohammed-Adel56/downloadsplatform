from flask import Flask, url_for, redirect, session, jsonify
from flask_dance.contrib.google import make_google_blueprint, google
from oauthlib.oauth2.rfc6749.errors import TokenExpiredError
from functools import wraps
import os

def init_oauth(app, db):
    # Configure Google OAuth
    google_bp = make_google_blueprint(
        client_id=app.config['GOOGLE_CLIENT_ID'],
        client_secret=app.config['GOOGLE_CLIENT_SECRET'],
        scope=[
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email"
        ],
        redirect_url="/api/auth/google/callback"
    )
    
    app.register_blueprint(google_bp, url_prefix="/login")

    @app.route("/api/auth/google/login")
    def google_login():
        if not google.authorized:
            return redirect(url_for("google.login"))
        try:
            resp = google.get("/oauth2/v2/userinfo")
            assert resp.ok, resp.text
            email = resp.json()["email"]
            name = resp.json().get("name", "")
            picture = resp.json().get("picture", "")
            
            # Check if user exists
            user = db.get_user_by_email(email)
            if not user:
                # Create new user
                db.create_social_user(email, name, "google")
            
            # Create session
            session['user_email'] = email
            
            return jsonify({
                "status": "success",
                "message": "Successfully logged in with Google",
                "user": {
                    "email": email,
                    "name": name,
                    "picture": picture
                }
            })
            
        except TokenExpiredError:
            return redirect(url_for("google.login"))
        except Exception as e:
            print(f"Google login error: {str(e)}")
            return jsonify({
                "status": "error",
                "message": "Failed to login with Google"
            }), 500

    @app.route("/api/auth/google/callback")
    def google_callback():
        if not google.authorized:
            return jsonify({
                "status": "error",
                "message": "Authorization failed"
            }), 401
            
        return redirect("http://localhost:5173")  # Redirect to your frontend