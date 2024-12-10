from flask import Blueprint, request, jsonify, make_response
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
import re
from config import Config
import hashlib
class AuthRoutes:
    def __init__(self, app, database, email_service, config):
        self.app = app
        self.db = database
        self.email = email_service
        self.config = config
        self.init_routes()

    def create_token(self, user_id):
        return jwt.encode(
            {
                'user_id': user_id,
                'exp': datetime.utcnow() + timedelta(days=15)
            },
            self.config.SECRET_KEY,
            algorithm='HS256'
        )
    def set_auth_cookie(self, response, token):
        response.set_cookie(
            'auth_token',
            token,
            max_age=15 * 24 * 60 * 60,  # 15 days in seconds
            httponly=True,
            secure=True,  # Enable in production with HTTPS
            samesite='Lax'
        )
        return response

    def init_routes(self):
        @self.app.route('/api/auth/register', methods=['POST'])
        def register():
            data = request.get_json()
            email = data.get('email')
            password = data.get('password')
            is_admin = data.get("isAdmin",False)
            
            if not email or not password:
                return jsonify({'error': 'البريد الإلكتروني وكلمة المرور مطلوبان'}), 400
                
            if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
                return jsonify({'error': 'صيغة البريد الإلكتروني غير صحيحة'}), 400
                
            if len(password) < 8:
                return jsonify({'error': 'يجب أن تكون كلمة المرور 8 أحرف على الأقل'}), 400
            print("*************")
            print(is_admin)
            if is_admin:
                 try:
                    user_id = self.db.create_user(email, password, 1)  
                    user = self.db.get_user_by_email(email) 
                    if not user:
                        return jsonify({'error': 'المستخدم غير موجود'}), 404
                    # Generate token
                    token = self.create_token(user_id)
                    # print("*******************")
                    # print(token)
                    # Create response
                    response = make_response(jsonify({
                        'success':True ,
                        'token': token,
                        'user': {
                            'id':user['id'],
                            'email': user['email'],
                            'firstName': user.get('first_name'),
                            'lastName': user.get('last_name'),
                            'isVerified': True
                        }
                    }))
                
                    # Set cookie with token
                    response.set_cookie(
                        'auth_token',
                        value=token,
                        max_age=15 * 24 * 60 * 60,  # 15 days
                        domain="localhost",
                        httponly=False,
                        secure=False,  # Set to True in production with HTTPS
                        samesite='Lax',
                        path='/'
                    )
                    response.headers.update({
                    'Access-Control-Allow-Origin': 'http://localhost:5173',
                    'Access-Control-Allow-Credentials': 'true',
                    'Access-Control-Expose-Headers': 'Set-Cookie'
                    })
                    return response# Ensure create_user accepts is_admin 
                 except Exception as e:
                    return jsonify({'error': str(e)}), 500
            
            if self.db.get_user_by_email(email):
                print("*****************");
                return jsonify({'error': 'البريد الإلكتروني مسجل مسبقاً'}), 409
                
            hashed_password = generate_password_hash(password)
            if not self.db.create_user(email, hashed_password):
                return jsonify({'error': 'فشل في إنشاء الحساب'}), 500
            
            otp = self.email.generate_otp()
            if not self.db.store_otp(email, otp, 'verification'):
                return jsonify({'error': 'فشل في إنشاء رمز التحقق'}), 500
                
            if not self.email.send_verification_email(email, otp):
                return jsonify({'error': 'فشل في إرسال رمز التحقق'}), 500
            
            return jsonify({'message': 'تم التسجيل بنجاح'}), 201

        @self.app.route('/api/auth/login', methods=['POST'])
        def login():
            data = request.get_json()
            email = data.get('email')
            password = data.get('password')
            is_admin = data.get("isAdmin",False)
            
            if not email or not password:
                return jsonify({'error': 'البريد الإلكتروني وكلمة المرور مطلوبان'}), 400
            print("**********************")
            print(is_admin)    
            if is_admin:
                 try:
                    # user_id = self.db.get_user_by_email(email)  
                    user = self.db.get_user_by_email(email) 
                    if not user:
                        return jsonify({'error': 'المستخدم غير موجود'}), 404
                    # Generate token
                    token = self.create_token(user["id"])
                    # print("*******************")
                    # print(token)
                    # Create response
                    response = make_response(jsonify({
                        'success':True ,
                        'token': token,
                        'user': {
                            'id':user['id'],
                            'email': user['email'],
                            'firstName': user.get('first_name'),
                            'lastName': user.get('last_name'),
                            'isVerified': True
                        }
                    }))
                
                    # Set cookie with token
                    response.set_cookie(
                        'auth_token',
                        value=token,
                        max_age=15 * 24 * 60 * 60,  # 15 days
                        domain="localhost",
                        httponly=False,
                        secure=False,  # Set to True in production with HTTPS
                        samesite='Lax',
                        path='/'
                    )
                    response.headers.update({
                    'Access-Control-Allow-Origin': 'http://localhost:5173',
                    'Access-Control-Allow-Credentials': 'true',
                    'Access-Control-Expose-Headers': 'Set-Cookie'
                    })
                    return response# Ensure create_user accepts is_admin 
                 except Exception as e:
                    return jsonify({'error': str(e)}), 500
            

            user = self.db.get_user_by_email(email)
            if not user:
                return jsonify({'error': 'البريد الإلكتروني غير مسجل'}), 404
                
            if not check_password_hash(user['password'], password):
                return jsonify({'error': 'كلمة المرور غير صحيحة'}), 401
            print("**************")
            print(user["is_verified"])
                
            if not user['is_verified']:
                return jsonify({'error': 'يرجى تأكيد البريد الإلكتروني أولاً'}), 403
            
            token = self.create_token(user['id'])
            response = make_response(jsonify({
                'token': token,
                'user': {
                    'id':user['id'],
                    'email': user['email'],
                    'firstName': user['first_name'],
                    'lastName': user['last_name']
                }
            }), 200)


            self.set_auth_cookie(response, token)
                
            return response

        @self.app.route('/api/auth/verify-otp', methods=['POST'])
        def verify_otp():
            data = request.get_json()
            email = data.get('email')
            otp = data.get('otp')
            otp_type = data.get('type', 'verification')
            
            if not email or not otp:
                return jsonify({'error': 'البريد الإلكتروني ورمز التحقق مطلوبان'}), 400
            
            if not self.db.verify_otp(email, otp, otp_type):
                return jsonify({'error': 'رمز التحقق غير صحيح أو منتهي الصلاحية'}), 400
            # Get user details
           
            # print(user)
            
             # Update user verification status if this is a verification OTP
            if otp_type == 'verification':
                print("//////////////****************");
                print("Updating verification status...")
                update_success = self.db.update_user_verification(email, True)
                if not update_success:
                    return jsonify({'error': 'فشل في تحديث حالة التحقق'}), 500
                

            print("**************")
            user = self.db.get_user_by_email(email) 
            if not user:
               return jsonify({'error': 'المستخدم غير موجود'}), 404
            print(user["is_verified"])
            # Generate token
            token = self.create_token(user['id'])
            # print("*******************")
            # print(token)
             # Create response
            response = make_response(jsonify({
                'message': 'تم التحقق بنجاح',
                'token': token,
                'user': {
                    'id':user['id'],
                    'email': user['email'],
                    'firstName': user.get('first_name'),
                    'lastName': user.get('last_name'),
                    'isVerified': True
                }
            }))
        
            # Set cookie with token
            response.set_cookie(
                'auth_token',
                value=token,
                max_age=15 * 24 * 60 * 60,  # 15 days
                domain="localhost",
                httponly=False,
                secure=False,  # Set to True in production with HTTPS
                samesite='Lax',
                path='/'
            )
            response.headers.update({
            'Access-Control-Allow-Origin': 'http://localhost:5173',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Expose-Headers': 'Set-Cookie'
            })
        
            return response

        @self.app.route('/api/auth/forgot-password', methods=['POST'])
        def forgot_password():
            data = request.get_json()
            email = data.get('email')
            
            if not email:
                return jsonify({'error': 'البريد الإلكتروني مطلوب'}), 400
            
            user = self.db.get_user_by_email(email)
            if not user:
                return jsonify({'error': 'البريد الإلكتروني غير مسجل'}), 404
            
            otp = self.email.generate_otp()
            if not self.db.store_otp(email, otp, 'reset'):
                return jsonify({'error': 'فشل في إنشاء رمز التحقق'}), 500
                
            if not self.email.send_reset_password_email(email, otp):
                return jsonify({'error': 'فشل في إرسال رمز التحقق'}), 500
            
            return jsonify({'message': 'تم إرسال رمز إعادة التعيين'}), 200
        


        @self.app.route('/api/auth/resend-otp', methods=['POST'])
        def resend_otp():
            try:
                data = request.get_json()
                email = data.get('email')
                otp_type = data.get('type', 'verification')
                
                if not email:
                    return jsonify({'error': 'البريد الإلكتروني مطلوب'}), 400
                    
                # Check if user exists
                user = self.db.get_user_by_email(email)
                if not user:
                    return jsonify({'error': 'البريد الإلكتروني غير مسجل'}), 404
                    
                # Generate new OTP
                otp = self.email.generate_otp()
                
                # Store new OTP
                if not self.db.store_otp(email, otp, otp_type):
                    return jsonify({'error': 'فشل في إنشاء رمز التحقق الجديد'}), 500
                    
                # Send email based on OTP type
                if otp_type == 'verification':
                    if not self.email.send_verification_email(email, otp):
                        return jsonify({'error': 'فشل في إرسال رمز التحقق'}), 500
                elif otp_type == 'reset':
                    if not self.email.send_reset_password_email(email, otp):
                        return jsonify({'error': 'فشل في إرسال رمز التحقق'}), 500
                        
                return jsonify({'message': 'تم إرسال رمز التحقق الجديد بنجاح'}), 200
                
            except Exception as e:
                print(f"Error in resend OTP: {str(e)}")
                return jsonify({'error': 'حدث خطأ أثناء إعادة إرسال رمز التحقق'}), 500


        @self.app.route('/api/auth/reset-password', methods=['POST'])
        def reset_password():
            data = request.get_json()
            email = data.get('email')
            print(email)
           
            new_password = data.get('new_password')
            print(new_password)
            
            if not all([email, new_password]):
                
                return jsonify({'error': 'جميع الحقول مطلوبة'}), 400
            
            if len(new_password) < 8:
                return jsonify({'error': 'يجب أن تكون كلمة المرور 8 أحرف على الأقل'}), 400
            
            
            hashed_password = generate_password_hash(new_password)
            if not self.db.update_password(email, hashed_password):
               
                return jsonify({'error': 'فشل في تحديث كلمة المرور'}), 500
            
            return jsonify({'message': 'تم تحديث كلمة المرور بنجاح'}), 200
        @self.app.route('/api/auth/social-login', methods=['POST'])
        def social_login():
            try:
                data = request.get_json()
                email = data.get('email')
                print(data.get("firstName"))
                print(data.get("lastName"))
                
                if not email:
                    return jsonify({'error': 'البريد الإلكتروني مطلوب'}), 400
                    
                # Check if user exists
                user = self.db.get_user_by_email(email)
                
                if not user:
                    # Create new user if doesn't exist
                    if not self.db.create_social_user(
                        email=email,
                          # Social login users don't need password
                        name=data.get("firstName") + " " + data.get("lastName"),
                          # Social login users are automatically verified
                    ):
                        return jsonify({'error': 'فشل في إنشاء الحساب'}), 500
                        
                    # Get the newly created user
                    user = self.db.get_user_by_email(email)
                    
                # Generate token
                token = self.create_token(user['id'])
                print("**************************")
                print(token)
                # Create response
                response = make_response(jsonify({
                    'message': 'تم تسجيل الدخول بنجاح',
                    'token': token,
                    'user': {
                        'id':user['id'],
                        'email': user['email'],
                        'firstName': user.get('first_name'),
                        'lastName': user.get('last_name'),
                        'isVerified': True
                    }
                }))
                
                # Set cookie
                response.set_cookie(
                'auth_token',
                value=token,
                max_age=15 * 24 * 60 * 60,  # 15 days
                domain="localhost",
                httponly=False,
                secure=False,  # Set to True in production with HTTPS
                samesite='Lax',
                path='/'
                )
                response.headers.update({
                'Access-Control-Allow-Origin': 'http://localhost:5173',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Expose-Headers': 'Set-Cookie'
                })
                print(response)
                return response
                
            except Exception as e:
                print(f"Social login error: {str(e)}")
                return jsonify({'error': 'حدث خطأ أثناء تسجيل الدخول'}), 500
        @self.app.route('/api/auth/update-user-details', methods=['POST'])
        def update_user_details():
            data = request.get_json()
            print(data);
            email = data.get('email')
            
            if not email:
                return jsonify({'error': 'البريد الإلكتروني مطلوب'}), 400
            
            if not self.db.update_user_details(email, data):
                return jsonify({'error': 'فشل في تحديث البيانات'}), 500
            
            return jsonify({'message': 'تم تحديث البيانات بنجاح'}), 200
        @self.app.route('/api/auth/logout', methods=['POST'])
        def logout():
            response = make_response(jsonify({'message': 'تم تسجيل الخروج بنجاح'}), 200)
              # Clear the auth token cookie
            response.set_cookie('auth_token', '',expires=0, httponly=True, secure=False, samesite='Lax', path='/')
            response.headers.update({
                'Access-Control-Allow-Origin': 'http://localhost:5173',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Expose-Headers': 'Set-Cookie'
                })
            print("**************")
            print(response)
            return response


        @self.app.route('/api/auth/updateUserDetails', methods=['POST'])
        def updateUserDetails():
            try:
                data = request.get_json()
                
                # Get user_id from the token in cookie
                token = request.cookies.get('auth_token')
                if not token:
                    return jsonify({'error': 'Authentication required'}), 401
                    
                try:
                    payload = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
                    user_id = payload['user_id']
                except jwt.InvalidTokenError:
                    return jsonify({'error': 'Invalid token'}), 401
                
                # Get user's current email
                user = self.db.get_user_by_id(user_id)
                if not user:
                    return jsonify({'error': 'User not found'}), 404
                    
                # Update user details
                if self.db.update_user_details(user['email'], data):
                    # Get updated user data
                    updated_user = self.db.get_user_by_id(user_id)
                    print(updated_user);
                    return jsonify({
                        'message': 'تم تحديث البيانات بنجاح',
                        'user': updated_user
                    }), 200
                else:
                    return jsonify({'error': 'فشل في تحديث البيانات'}), 500
                    
            except Exception as e:
                print(f"Error updating user details: {e}")
                return jsonify({'error': str(e)}), 500
                

        @self.app.route('/api/auth/check-auth', methods=['GET'])
        def check_auth():
            try:
                # Get token from cookie and print all cookies for debugging
                token = request.cookies.get('auth_token')
                print(f"Checking auth token: {token}") 
                if not token:
                    print("No auth token found in cookies")
                    return jsonify({'authenticated': False}), 200
                    
                try:
                    # Verify token and print decoded data
                    payload = jwt.decode(token, self.config.SECRET_KEY, algorithms=['HS256'])
                    print(f"Decoded token payload: {payload}")
                    user_id = payload['user_id']
                    
                    # Get user data
                    user = self.db.get_user_by_id(user_id)
                    print(f"Found user data: {user}")
                    
                    if not user:
                        print(f"No user found for id: {user_id}")
                        return jsonify({'authenticated': False}), 200
                    # print("*************")
                    # print(user["password"]);
                    
                    response_data = {
                        'authenticated': True,
                        
                        'user': {
                            'id': user['id'],
                            'email': user['email'],
                            'firstName': user.get('first_name'),
                            'lastName': user.get('last_name'),
                            'password':user.get("password"),
                            "birthDate":user.get("birth_date",""),
                            "country":user.get("country",""),
                            "gender":user.get("gender",""),
                            "phone":user.get("phone",""),
                            'isVerified': user.get('is_verified', False)
                        }
                    }
                    print(f"Sending response: {response_data}")
                    return jsonify(response_data), 200
                    
                except jwt.ExpiredSignatureError:
                    print("Token has expired")
                    return jsonify({'authenticated': False, 'error': 'Token expired'}), 200
                except jwt.InvalidTokenError as e:
                    print(f"Invalid token error: {str(e)}")
                    return jsonify({'authenticated': False, 'error': 'Invalid token'}), 200
                    
            except Exception as e:
                print(f"Auth check error: {str(e)}")
                import traceback
                traceback.print_exc()
                return jsonify({'authenticated': False, 'error': 'Server error'}), 500
            