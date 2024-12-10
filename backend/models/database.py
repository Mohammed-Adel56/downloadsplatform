import sqlite3
from sqlite3 import Error
from datetime import datetime, timedelta
import threading
from contextlib import contextmanager

import os
class Database:
    def __init__(self, db_name='users.db'):
        self.db_name = db_name
        self._local = threading.local()

    def get_db(self):
        if not hasattr(self._local, 'connection'):
            self._local.connection = sqlite3.connect(self.db_name)
            self._local.connection.row_factory = sqlite3.Row
        return self._local.connection

            
    
    def close_all(self):
        """Close all thread-local connections"""
        if hasattr(self._local, 'connection'):
            self._local.connection.close()
            del self._local.connection

    def __del__(self):
        """Destructor to ensure all connections are closed"""
        self.close_all()
    def init_db(self):
        conn = sqlite3.connect(self.db_name)
        c = conn.cursor()
            
        # Add debug print
        print("Initializing database...")
        
        c.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                first_name TEXT,
                last_name TEXT,
                birth_date TEXT,
                country TEXT,
                gender TEXT,
                phone TEXT,
                status TEXT DEFAULT 'active',
                is_verified INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')




        # Create OTP table
        c.execute('''
                CREATE TABLE IF NOT EXISTS otp (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT NOT NULL,
                    otp TEXT NOT NULL,
                    type TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP NOT NULL,
                    is_used INTEGER DEFAULT 0
                )
            ''')

        # Subscriptions table
        c.execute('''
            CREATE TABLE IF NOT EXISTS subscriptions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                type TEXT NOT NULL,
                tier TEXT NOT NULL,
                payment_method TEXT,
                start_date TIMESTAMP,
                end_date TIMESTAMP,
                status TEXT DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        ''')




        # Create notifications table
        c.execute('''
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                target_audience TEXT NOT NULL,  -- 'all' or 'subscribers'
                subscription_tier TEXT,         -- NULL for all users, or specific tier
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'active'
            )
        ''')



            # Create notification_recipients table for tracking who received each notification
        c.execute('''
            CREATE TABLE IF NOT EXISTS notification_recipients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                notification_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                read_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (notification_id) REFERENCES notifications(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        ''')

         #   table
        c.execute('''
            CREATE TABLE IF NOT EXISTS advertisements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                manager_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                url TEXT,
                budget REAL,
                repetitions INTEGER,
                image_url TEXT,
                duration TEXT,
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (manager_id) REFERENCES users(id)
            )
        ''')

        # Content Management table
        c.execute('''
            CREATE TABLE IF NOT EXISTS content (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                type TEXT NOT NULL,
                description TEXT,
                status TEXT DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # Services table
        c.execute('''
            CREATE TABLE IF NOT EXISTS services (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                type TEXT NOT NULL,
                description TEXT,
                duration TEXT,
                repetitions INTEGER,
                price REAL,
                image_url TEXT,
                status TEXT DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')



        # Add the new column for image_url
        # c.execute('''
        #     ALTER TABLE services ADD COLUMN image_url TEXT
        # ''')

         # Add analytics tables
        c.execute('''
        CREATE TABLE IF NOT EXISTS user_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            start_time TIMESTAMP,
            end_time TIMESTAMP,
            duration INTEGER,
            is_authenticated BOOLEAN DEFAULT FALSE,
            operating_system TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
            )
        ''')
        
        c.execute('''
            CREATE TABLE IF NOT EXISTS downloads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                url TEXT NOT NULL,
                format_type TEXT,
                download_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                file_size INTEGER,  -- in bytes
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        ''')
        
        c.execute('''
            CREATE TABLE IF NOT EXISTS urls (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                url TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
         ''')
        
        c.execute("PRAGMA table_info(users)")
        
        columns = c.fetchall()
        print("Users table schema:", columns)
        
        conn.commit()
        conn.close()

    def create_user(self, email, password,is_verified=0):
        try:
            conn = sqlite3.connect(self.db_name)
            cursor = conn.cursor()
            
            # Add debug print
            print(f"Creating user with email: {email}")
            
            cursor.execute("""
                INSERT INTO users (email, password, is_verified)
                VALUES (?, ?, ?)
            """, (email, password,is_verified))
            
            conn.commit()
            return True
            
        except Exception as e:
            print(f"Database error in create_user: {e}")
            return False
        finally:
            conn.close()



    # Advertisement Methods
    def create_advertisement(self, user_id, data):
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO advertisements (
                        manager_id, title, description, url, 
                        budget,repetitions, image_url, duration,status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?,?,?)
                """, (
                    user_id, data['title'], data['description'], 
                    data['url'], data['budget'],data['repetitions'], data['image_url'],
                    data['duration'],data["status"],
                ))
                conn.commit()
                return cursor.lastrowid
        except Exception as e:
            print(f"Error creating advertisement: {e}")
            return False


     # User Management Methods
    def get_all_users(self):
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT id, email, first_name, last_name, birth_date, 
                           country, gender, phone, status, is_verified, created_at 
                    FROM users
                    ORDER BY created_at DESC
                """)
                users = cursor.fetchall()
                return [{
                    'id': user[0],
                    'email': user[1],
                    'first_name': user[2],
                    'last_name': user[3],
                    'birth_date': user[4],
                    'country': user[5],
                    'gender': user[6],
                    'phone': user[7],
                    'status': user[8],
                    'is_verified': bool(user[9]),
                    'created_at': user[10]
                } for user in users]
        except Exception as e:
            print(f"Error fetching all users: {e}")
            return [] # User Management Methods
    
    
    def update_advertisement_status(self, ad_id, status):
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    UPDATE advertisements
                    SET status = ?
                    WHERE id = ?
                """, (status, ad_id))
                conn.commit()
                return cursor.rowcount > 0
        except Exception as e:
            print(f"Error updating advertisement status: {e}")
            return False


    def update_advertisement(self, ad_id, data):
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(""" 
                    UPDATE advertisements 
                    SET title = ?, description = ?, url = ?, 
                        budget = ?, repetitions = ?, image_url = ?, 
                        duration = ?, status = ? 
                    WHERE id = ?
                """, (
                    data['title'], data['description'], data['url'],
                    data['budget'], data['repetitions'], data['image_url'],
                    data['duration'], data['status'], ad_id
                ))
                conn.commit()
                return cursor.rowcount > 0
        except Exception as e:
            print(f"Error updating advertisement: {e}")
            return False


    def update_user_status(self, user_id, new_status):
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    UPDATE users 
                    SET status = ? 
                    WHERE id = ?
                """, (new_status, user_id))
                conn.commit()
                return cursor.rowcount > 0
        except Exception as e:
            print(f"Error updating user status: {e}")
            return False




    def get_all_advertisements(self):
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT a.*, u.first_name || ' ' || u.last_name as manager_name
                    FROM advertisements a
                    LEFT JOIN users u ON a.manager_id = u.id
                    ORDER BY a.created_at DESC
                """)
                ads = cursor.fetchall()
                print(ads)
                return [{
                    'id': ad[0],
                    'campaign': ad[1],
                    'title': ad[2],
                    'description': ad[3],
                    'url':ad[4],
                    'budget': ad[5],
                    'repetitions': ad[6],
                    'image_url': ad[7],
                    'duration': ad[8],
                    'status': ad[9],
                    'created_at': ad[10],

                } for ad in ads]
        except Exception as e:
            print(f"Error fetching all advertisements: {e}")
            return []

    def delete_user(self, user_id):
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                # First delete related records in other tables
                cursor.execute("DELETE FROM subscriptions WHERE user_id = ?", (user_id,))
                cursor.execute("DELETE FROM advertisements WHERE user_id = ?", (user_id,))
                
                # Then delete the user
                cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
                conn.commit()
                return cursor.rowcount > 0
        except Exception as e:
            print(f"Error deleting user: {e}")
            return False


        # Service Management Methods
    def get_all_services(self):
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT id, title, type, description, duration, 
                           repetitions, price,image_url, status, created_at 
                    FROM services
                    ORDER BY created_at DESC
                """)
                services = cursor.fetchall()
                return [{
                    'id': service[0],
                    'title': service[1],
                    'type': service[2],
                    'description': service[3],
                    'duration': service[4],
                    'repetitions': service[5],
                    'price': service[6],
                    'image_url':service[7],
                    'status': service[8],
                    'created_at': service[9]
                } for service in services]
        except Exception as e:
            print(f"Error fetching all services: {e}")
            return []


    def update_service(self, service_id, data):
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    UPDATE services 
                    SET title = ?, type = ?, description = ?, 
                        duration = ?, repetitions = ?, price = ?,
                        status = ?,image_url = ?
                    WHERE id = ?
                """, (
                    data['title'], data['type'], data['description'],
                    data['duration'], data['repetitions'], data['price'],
                    data.get('status', 'active'),data.get("image_url"), service_id
                ))
                conn.commit()
                return cursor.rowcount > 0
        except Exception as e:
            print(f"Error updating service: {e}")
            return False



    def delete_service(self, service_id):
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                
                # Fetch the image_url before deleting the service
                cursor.execute("SELECT image_url FROM services WHERE id = ?", (service_id,))
                service = cursor.fetchone()
                
                if service:
                    image_url = service[0]
                    
                    # Delete the service from the database
                    cursor.execute("DELETE FROM services WHERE id = ?", (service_id,))
                    conn.commit()
                    
                    # If an image_url exists, delete the image file
                    if image_url and os.path.exists(image_url):
                        os.remove(image_url)
                        print(f"Deleted image file: {image_url}")
                    
                    return True
                else:
                    print("Service not found.")
                    return False
        except Exception as e:
            print(f"Error deleting service: {e}")
            return False



      # Subscription Management Methods
    def get_all_subscriptions(self):
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT 
                        s.id,
                        s.type,
                        s.tier,
                        s.payment_method,
                        s.start_date,
                        s.end_date,
                        s.status,
                        s.created_at,
                        u.email,
                        u.first_name,
                        u.phone,
                        u.country
                    FROM subscriptions s
                    JOIN users u ON s.user_id = u.id
                    ORDER BY s.created_at DESC
                """)
                
                subscriptions = cursor.fetchall()
                return [{
                    'id': sub[0],
                    'type': sub[1],
                    'tier': sub[2],
                    'payment_method': sub[3],
                    'start_date': sub[4],
                    'end_date': sub[5],
                    'status': sub[6],
                    'created_at': sub[7],
                    'email': sub[8],
                    'name': sub[9],
                    'phone': sub[10],
                    'country': sub[11]
                } for sub in subscriptions]
                
        except Exception as e:
            print(f"Error fetching subscriptions: {e}")
            return []
        
    def get_user_advertisements(self, user_id):
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT * FROM advertisements 
                    WHERE manager_id = ? 
                    ORDER BY created_at DESC
                """, (user_id,))
                # return cursor.fetchall()
                ads = cursor.fetchall()
                # print(ads)
                return [{
                    'id': ad[0],
                    'campaign': ad[1],
                    'title': ad[2],
                    'description': ad[3],
                    'url':ad[4],
                    'budget': ad[5],
                    'repetitions': ad[6],
                    'image_url': ad[7],
                    'duration': ad[8],
                    'status': ad[9],
                    'created_at': ad[10],

                } for ad in ads]
        except Exception as e:
            print(f"Error fetching advertisements: {e}")
            return []




        # Subscription Methods
    def create_subscription(self, user_id, data):
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                print(data)
                print(user_id)
                cursor.execute("""
                    INSERT INTO subscriptions (
                        user_id, type, tier, payment_method, 
                        start_date, end_date
                    ) VALUES (?, ?, ?, ?, ?, ?)
                """, (
                    user_id, data['type'], data['tier'],
                    data['payment_method'], data['start_date'],
                    data['end_date']
                ))
                conn.commit()
                return cursor.lastrowid
        except Exception as e:
            print(f"Error creating subscription: {e}")
            return False




     # Service Methods
    def delete_subscription(self, subscription_id):
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM subscriptions WHERE id = ?", (subscription_id,))
                conn.commit()
                return cursor.rowcount > 0
        except Exception as e:
            print(f"Error deleting subscription: {e}")
            return False
    
    

    def update_subscription(self, subscription_id, data):
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    UPDATE subscriptions 
                    SET type = ?, tier = ?, payment_method = ?, 
                        start_date = ?, end_date = ?, status = ?
                    WHERE id = ?
                """, (
                    data['type'],
                    data['tier'],
                    data['payment_method'],
                    data['start_date'],
                    data['end_date'],
                    data['status'],
                    subscription_id
                ))
                conn.commit()
                return cursor.rowcount > 0
        except Exception as e:
            print(f"Error updating subscription: {e}")
            return False



    def create_service(self, data):
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                print(data.get("image_url"))
                cursor.execute("""
                    INSERT INTO services (
                        title, type, description, duration,
                        repetitions, price,image_url
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    data['title'], data['type'], data['description'],
                    data['duration'], data['repetitions'], data['price'],
                    data.get("image_url")
                ))
                conn.commit()
                return cursor.lastrowid
        except Exception as e:
            print(f"Error creating service: {e}")
            return False


       # Dashboard Statistics Methods
    def get_dashboard_stats(self):
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                stats = {}
                
                # Total users
                cursor.execute("SELECT COUNT(*) FROM users")
                stats['total_users'] = cursor.fetchone()[0]
                
                # Active subscriptions
                cursor.execute("""
                    SELECT COUNT(*) FROM subscriptions 
                    WHERE status = 'active'
                """)
                stats['active_subscriptions'] = cursor.fetchone()[0]
                
                # Pending advertisements
                cursor.execute("""
                    SELECT COUNT(*) FROM advertisements 
                    WHERE status = 'pending'
                """)
                stats['pending_ads'] = cursor.fetchone()[0]
                
                return stats
        except Exception as e:
            print(f"Error fetching dashboard stats: {e}")
            return {}


    def get_user_by_id(self, user_id):
        try:
            conn = sqlite3.connect(self.db_name)
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT id, email, first_name, last_name,country,birth_date,gender, is_verified
                FROM users 
                WHERE id = ?
            """, (user_id,))
            
            user = cursor.fetchone()
            
            if user:
                return {
                    'id': user[0],
                    'email': user[1],
                    'first_name': user[2],
                    'last_name': user[3],
                    'country':user[4],
                    'birth_date':user[5],
                    'gender':user[6],
                    'is_verified': bool(user[7])
                }
                
            return None
            
        except Exception as e:
            print(f"Error getting user by ID: {str(e)}")
            return None
        finally:
            conn.close()


    @contextmanager
    def get_connection(self):
        """Get a thread-local database connection"""
        if not hasattr(self._local, 'connection'):
            self._local.connection = sqlite3.connect(self.db_name)
            self._local.connection.row_factory = sqlite3.Row
        
        try:
            yield self._local.connection
        except Exception as e:
            self._local.connection.rollback()
            raise
        finally:
            pass  # Keep connection open for reuse within same thread

    def execute(self, query, params=()):
        """Execute an SQL query and return the last row id"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, params)
                conn.commit()
                return cursor.lastrowid
        except Error as e:
            print(f"Error executing query: {e}")
            raise

    def query(self, query, params=()):
        """Execute a SELECT query and return all results"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, params)
                rows = cursor.fetchall()
                return [dict(row) for row in rows]  # Convert rows to dictionaries
        except Error as e:
            print(f"Error querying database: {e}")
            raise
    def get_user_by_email(self, email):
        try:
            conn = sqlite3.connect(self.db_name)
            cursor = conn.cursor()
            
            print(f"Attempting to get user with email: {email}")
            
            # First, verify the user exists
            cursor.execute("""
                SELECT COUNT(*) 
                FROM users 
                WHERE email = ?
            """, (email,))
            
            count = cursor.fetchone()[0]
            print(f"Found {count} users with email {email}")
            
            if count == 0:
                print(f"No user found with email {email}")
                return None
            
            # Get user data
            cursor.execute("""
                SELECT id, email, password, first_name, last_name, is_verified 
                FROM users 
                WHERE email = ?
            """, (email,))
            
            columns = ['id', 'email', 'password', 'first_name', 'last_name', 'is_verified']
            user = cursor.fetchone()
            
            print(f"Raw user data: {user}")
            
            if user:
                user_dict = dict(zip(columns, user))
                user_dict['is_verified'] = bool(user_dict['is_verified'])
                print(f"Processed user data: {user_dict}")
                return user_dict
                
            return None
            
        except Exception as e:
            print(f"Error in get_user_by_email: {str(e)}")
            print(f"Error type: {type(e)}")
            import traceback
            traceback.print_exc()
            return None
        finally:
            conn.close()
        
    def update_user_details(self, email, data):

        try:
            #conn = sqlite3.connect(self.db_name)
            with self.get_connection() as conn: 
                cursor = conn.cursor()
                
                
                
                # Build the update query dynamically based on provided fields
                update_fields = []
                params = []
                
                if "firstName" in data:
                    update_fields.append("first_name = ?")
                    params.append(data['firstName'])
                    
                if "lastName" in data:
                    update_fields.append("last_name = ?")
                    params.append(data['lastName'])
                    
                if 'email' in data:
                    update_fields.append('email = ?')
                    params.append(data['email'])
                    
                if "country" in data:
                    update_fields.append("country = ?")
                    params.append(data['country'])

                if 'gender' in data:
                    update_fields.append('gender = ?')
                    params.append(data['gender'])
                
                if 'phone' in data:
                    update_fields.append('phone = ?')
                    params.append(data['phone'])
                    
                if 'password' in data and data['password']:
                    update_fields.append('password = ?')
                    params.append(data['password'])

            

                if 'birthDate' in data:
                    update_fields.append('birth_date = ?')
                    params.append(data['birthDate'])  
                    
                
                    
                if not update_fields:
                    return True  # No fields to update
                    
                # Add email to params
                params.append(email)
                
                # Construct and execute the update query
                query = f"""
                    UPDATE users 
                    SET {', '.join(update_fields)}
                    WHERE email = ?
                """
                
                cursor.execute(query, params)
                conn.commit()
                print(cursor.rowcount);
                return cursor.rowcount > 0
                
        except Exception as e:
            print(f"Error updating user: {e}")
            return False
        finally:
            conn.close()
    def store_otp(self, email, otp, otp_type='verification'):
        conn = self.get_db()
        try:
            expires_at = datetime.now() + timedelta(minutes=15)
            conn.execute(
                'INSERT INTO otp (email, otp, type, expires_at) VALUES (?, ?, ?, ?)',
                (email, otp, otp_type, expires_at)
            )
            conn.commit()
            print("OTP stored successfully")
            return True
        except Exception as e:
            print(f"Error storing OTP: {e}")
            return False
        finally:
            conn.close()

    def verify_otp(self, email, otp, otp_type):
        try:
            conn = sqlite3.connect(self.db_name)
            cursor = conn.cursor()
            
            # Get the most recent OTP for this email and type
            cursor.execute("""
                SELECT otp, created_at 
                FROM otp
                WHERE email = ? AND type = ? 
                ORDER BY created_at DESC 
                LIMIT 1
            """, (email, otp_type))
            
            result = cursor.fetchone()
            print(f"Database result: {result}")
            
            if result:
                stored_otp, created_at = result
                # Verify OTP matches and hasn't expired
                otp_matches = stored_otp == otp
                print(f"OTP match result: {otp_matches}")
                
                if otp_matches:
                    # Delete used OTP
                    cursor.execute("""
                        DELETE FROM otp 
                        WHERE email = ? AND type = ?
                    """, (email, otp_type))
                    conn.commit()
                    return True
                    
            return False
        
        except Exception as e:
            print(f"Error verifying OTP: {e}")
            return False
        finally:
            conn.close()

    def update_user_verification(self, email, is_verified):
        try:
            conn = sqlite3.connect(self.db_name)
            cursor = conn.cursor()
            
            # Debug: Print current state
            cursor.execute("SELECT email, is_verified FROM users WHERE email = ?", (email,))
            before = cursor.fetchone()
            print(f"Before update - User {email}: {before}")
            
            # Update verification status
            cursor.execute("""
                UPDATE users 
                SET is_verified = 1
                WHERE email = ?
            """, (email,))
            
            # Commit the changes
            conn.commit()
            
            # Verify the update
            cursor.execute("SELECT email, is_verified FROM users WHERE email = ? AND is_verified = 1", (email,))
            after = cursor.fetchone()
            print(f"After update - User {email}: {after}")
            
            # Check if we found the updated row
            success = after is not None
            print(f"Update success: {success}")
            
            if success:
                return True
            else:
                print("Update failed - no matching row found")
                return False
            
        except Exception as e:
            print(f"Error updating user verification: {e}")
            conn.rollback()
            return False
        finally:
            conn.close()



    def get_downloads_by_website(self):
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                
                # استخراج اسم الموقع من URL وحساب عدد التحميلات
                cursor.execute("""
                    SELECT 
                        CASE
                            WHEN url LIKE '%youtube%' THEN 'YouTube'
                            WHEN url LIKE '%facebook%' THEN 'Facebook'
                            WHEN url LIKE '%instagram%' THEN 'Instagram'
                            WHEN url LIKE '%tiktok%' THEN 'TikTok'
                            WHEN url LIKE '%twitter%' THEN 'Twitter'
                            ELSE 'Other'
                        END as website,
                        COUNT(*) as count,
                        strftime('%Y-%m-%d', download_time) as date
                    FROM downloads
                    WHERE download_time >= datetime('now', '-30 days')
                    GROUP BY website, date
                    ORDER BY date ASC, count DESC
                """)
                
                results = cursor.fetchall()
                
                # تنظيم البيانات حسب التاريخ والموقع
                downloads_by_date = {}
                for row in results:
                    website, count, date = row
                    if date not in downloads_by_date:
                        downloads_by_date[date] = {}
                    downloads_by_date[date][website] = count

                # تحويل البيانات إلى التنسيق المطلوب
                chart_data = []
                for date in sorted(downloads_by_date.keys()):
                    data_point = {'date': date}
                    data_point.update(downloads_by_date[date])
                    chart_data.append(data_point)

                return chart_data
                
        except Exception as e:
            print(f"Error getting downloads by website: {e}")
            return []


    def clean_otp_entries(self, email):
        try:
            conn = sqlite3.connect(self.db_name)
            cursor = conn.cursor()
            
            print(f"Cleaning OTP entries for email: {email}")
            
            # Delete all OTP entries for this email
            cursor.execute("""
                DELETE FROM otp 
                WHERE email = ?
            """, (email,))
            
            conn.commit()
            deleted_count = cursor.rowcount
            print(f"Deleted {deleted_count} OTP entries")
            
            return True
        
        except Exception as e:
            print(f"Error cleaning OTP entries: {e}")
            return False
        finally:
            conn.close()
    def update_password(self, email, new_password):
        conn = self.get_db()
        try:
            conn.execute(
                'UPDATE users SET password = ? WHERE email = ?',
                (new_password, email)
            )
            conn.commit()
            
            # Clean up all OTP entries
            self.clean_otp_entries(email)
            
            return True
        except Exception as e:
            print(f"Error updating password: {e}")
            return False
        finally:
            conn.close()
    def create_social_user(self, email, name=None):
        try:
            # Use get_connection instead of self.conn
            with self.get_connection() as conn:
                cursor = conn.cursor()
                
                # Split the full name into firstName and lastName
                firstName = name.split()[0] if name else None
                lastName = ' '.join(name.split()[1:]) if name and len(name.split()) > 1 else None
                
                cursor.execute("""
                    INSERT INTO users (email, firstName, lastName, is_verified) 
                    VALUES (?, ?, ?, ?)
                """, (email, firstName, lastName, True))
                
                # Get the inserted user's data
                user_id = cursor.lastrowid
                cursor.execute("""
                    SELECT id, email, firstName, lastName, is_verified 
                    FROM users WHERE id = ?
                """, (user_id,))
                
                user = cursor.fetchone()
                conn.commit()
                
                return {
                    'id': user[0],
                    'email': user[1],
                    'firstName': user[2],
                    'lastName': user[3],
                    'is_verified': user[4]
                }
                
        except Exception as e:
            print(f"Error creating social user: {e}")
            return False



    def create_notification(self, data):
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                
                # Insert notification
                cursor.execute("""
                    INSERT INTO notifications (
                        title, description, target_audience, 
                        subscription_tier, sent_at
                    ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
                """, (
                    data['title'],
                    data['description'],
                    data['targetAudience'],
                    data.get('subscriptionTier')
                ))
                
                notification_id = cursor.lastrowid
                
                # Get target users based on audience and tier
                if data['targetAudience'] == 'المشتركين فقط':
                    cursor.execute("""
                        SELECT DISTINCT u.id 
                        FROM users u
                        JOIN subscriptions s ON u.id = s.user_id
                        WHERE s.status = 'active'
                        AND (? IS NULL OR s.tier = ?)
                    """, (data.get('subscriptionTier'), data.get('subscriptionTier')))
                else:
                    cursor.execute("SELECT id FROM users WHERE status = 'active'")
                
                user_ids = cursor.fetchall()
                
                # Create notification recipients
                for user_id in user_ids:
                    cursor.execute("""
                        INSERT INTO notification_recipients (
                            notification_id, user_id
                        ) VALUES (?, ?)
                    """, (notification_id, user_id[0]))
                
                conn.commit()
                return notification_id
                
        except Exception as e:
            print(f"Error creating notification: {e}")
            return False

    def get_all_notifications(self):
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT n.*, 
                        COUNT(nr.id) as recipient_count,
                        COUNT(nr.read_at) as read_count
                    FROM notifications n
                    LEFT JOIN notification_recipients nr ON n.id = nr.notification_id
                    GROUP BY n.id
                    ORDER BY n.created_at DESC
                """)
                
                notifications = cursor.fetchall()
                return [{
                    'id': n[0],
                    'title': n[1],
                    'description': n[2],
                    'targetAudience': n[3],
                    'subscriptionTier': n[4],
                    'created_at': n[5],
                    'sent_at': n[6],
                    'status': n[7],
                    'recipient_count': n[8],
                    'read_count': n[9]
                } for n in notifications]
                
        except Exception as e:
            print(f"Error fetching notifications: {e}")
            return []

    def delete_notification(self, notification_id):
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                # First delete recipients
                cursor.execute("DELETE FROM notification_recipients WHERE notification_id = ?", 
                            (notification_id,))
                # Then delete notification
                cursor.execute("DELETE FROM notifications WHERE id = ?", 
                            (notification_id,))
                conn.commit()
                return True
        except Exception as e:
            print(f"Error deleting notification: {e}")
            return False

    def get_user_notifications(self, user_id):
            try:
                with self.get_connection() as conn:
                    cursor = conn.cursor()
                    cursor.execute("""
                        SELECT n.*, nr.read_at
                        FROM notifications n
                        JOIN notification_recipients nr ON n.id = nr.notification_id
                        WHERE nr.user_id = ?
                        ORDER BY n.created_at DESC
                        LIMIT 50
                    """, (user_id,))
                    
                    notifications = cursor.fetchall()
                    return [{
                        'id': n[0],
                        'title': n[1],
                        'description': n[2],
                        'created_at': n[5],
                        'read_at': n[8]
                    } for n in notifications]
                    
            except Exception as e:
                print(f"Error fetching user notifications: {e}")
                return []

    def mark_notification_read(self, notification_id, user_id):
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    UPDATE notification_recipients
                    SET read_at = CURRENT_TIMESTAMP
                    WHERE notification_id = ? AND user_id = ? AND read_at IS NULL
                """, (notification_id, user_id))
                
                conn.commit()
                return cursor.rowcount > 0
                
        except Exception as e:
            print(f"Error marking notification as read: {e}")
            return False

    def get_completed_profiles(self):
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT first_name, last_name, email, country
                    FROM users
                    WHERE first_name IS NOT NULL AND first_name != ''
                    AND last_name IS NOT NULL AND last_name != ''
                    AND country IS NOT NULL AND country != ''
                """)
                completed_profiles = cursor.fetchall()
                return [{
                    'first_name': row[0],
                    'last_name': row[1],
                    'email': row[2],
                    'country': row[3]
                } for row in completed_profiles]
        except Exception as e:
            print(f"Error fetching completed profiles: {e}")
            return []

    def get_analytics_data(self):
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                
                # Get total users and previous period users
                cursor.execute("""
                    SELECT 
                        COUNT(*) as total,
                        SUM(CASE WHEN created_at >= datetime('now', '-30 days') THEN 1 ELSE 0 END) as recent
                    FROM users
                """)
                user_data = cursor.fetchone()
                total_users = user_data[0] or 0
                previous_users = total_users - (user_data[1] or 0)

                # Calculate average session duration
                cursor.execute("""
                SELECT 
                    COALESCE(AVG(CASE 
                        WHEN duration > 0 AND duration < 86400 -- استبعاد القيم الأكبر من 24 ساعة
                        THEN duration 
                        ELSE NULL 
                    END), 0) as current_avg,
                    COALESCE((
                        SELECT AVG(CASE 
                            WHEN duration > 0 AND duration < 86400
                            THEN duration 
                            ELSE NULL 
                        END)
                        FROM user_sessions 
                        WHERE start_time < datetime('now', '-30 days')
                    ), 0) as previous_avg
                FROM user_sessions 
                WHERE start_time >= datetime('now', '-30 days')
            """)
                session_data = cursor.fetchone()
                avg_session_duration = session_data[0] or 0
                previous_avg_session = session_data[1] or 0

                # Get user growth over time 
                cursor.execute("""
                    SELECT 
                        strftime('%Y-%m', created_at) as month,
                        COUNT(*) as count
                    FROM users
                    GROUP BY strftime('%Y-%m', created_at)
                    ORDER BY month DESC
                    LIMIT 12
                """)
                user_growth = [
                    {'month': row[0], 'count': row[1]}
                    for row in cursor.fetchall()
                ]

                # Get users by country
                cursor.execute("""
                    SELECT country, COUNT(*) as count
                    FROM users
                    WHERE country IS NOT NULL
                    GROUP BY country
                    ORDER BY count DESC
                    LIMIT 10
                """)
                users_by_country = [
                    {'country': row[0], 'count': row[1]}
                    for row in cursor.fetchall()
                ]


                 # Get visits by OS and user type
                cursor.execute("""
                    SELECT 
                        operating_system,
                        is_authenticated,
                        COUNT(*) as count
                    FROM user_sessions
                    WHERE start_time >= datetime('now', '-30 days')
                    GROUP BY operating_system, is_authenticated
                    ORDER BY count DESC
                """)
                
                visits_by_os = []
                for row in cursor.fetchall():
                    visits_by_os.append({
                        'os': row[0] or 'Unknown',
                        'type': 'مسجل' if row[1] else 'زائر',
                        'count': row[2]
                    })
                print("********************")
                print(visits_by_os)
                return {
                    'total_users': total_users,
                    'previous_users': previous_users,
                    'avg_session_duration': avg_session_duration,
                    'previous_avg_session': previous_avg_session,
                    'user_growth': user_growth,
                    'users_by_country': users_by_country,
                    'visits_by_os': visits_by_os
                }
                
        except Exception as e:
            print(f"Error getting analytics data: {e}")
            return {
                'total_users': 0,
                'previous_users': 0,
                'avg_session_duration': 0,
                'previous_avg_session': 0,
                'user_growth': [],
                'users_by_country': [],
                'visits_by_os': []
            }
    
    def record_session(self, user_id=None, start_time=None, end_time=None, is_authenticated=False, operating_system=None):
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                
                if start_time and end_time:
                    duration = (end_time - start_time).total_seconds()
                    print(duration)
                    cursor.execute("""
                        INSERT INTO user_sessions 
                        (user_id, start_time, end_time, duration, is_authenticated,operating_system)
                        VALUES (?, ?, ?, ?, ?,?)
                    """, (user_id, start_time, end_time, duration, is_authenticated,operating_system))
                else:
                    cursor.execute("""
                        INSERT INTO user_sessions (user_id, is_authenticated,operating_system)
                        VALUES (?, ?,?)
                    """, (user_id, is_authenticated,operating_system))
                    
                conn.commit()
                return True
        except Exception as e:
            print(f"Error recording session: {e}")
            return False
        
    def get_download_stats(self):
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                
                # Get total downloads (both authenticated and anonymous)
                cursor.execute("SELECT COUNT(*) FROM downloads")
                total_downloads = cursor.fetchone()[0]
                
                # Get authenticated downloads
                cursor.execute("SELECT COUNT(*) FROM downloads WHERE user_id IS NOT NULL")
                auth_downloads = cursor.fetchone()[0]
                
                # Get downloads by format type
                cursor.execute("""
                    SELECT format_type, COUNT(*) as count 
                    FROM downloads 
                    GROUP BY format_type
                """)
                downloads_by_format = [
                    {'format': row[0], 'count': row[1]} 
                    for row in cursor.fetchall()
                ]
                
                return {
                    'total_downloads': total_downloads,
                    'authenticated_downloads': auth_downloads,
                    'anonymous_downloads': total_downloads - auth_downloads,
                    'downloads_by_format': downloads_by_format
                }
                
        except Exception as e:
            print(f"Error getting download stats: {e}")
            return {
                'total_downloads': 0,
                'authenticated_downloads': 0,
                'anonymous_downloads': 0,
                'downloads_by_format': []
            }

    def record_download(self, url, format_type, user_id=None):
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO downloads (user_id, url, format_type, download_time)
                    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                """, (user_id, url, format_type))
                conn.commit()
                return True
        except Exception as e:
            print(f"Error recording download: {e}")
            return False

    # Add methods to create, update, and delete content in your Database class

    def get_content_by_type(self, content_type):
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM content WHERE type = ? ORDER BY created_at DESC", (content_type,))
                content = cursor.fetchall()
                return [{
                    'id': row[0],
                    'title': row[1],
                    'type': row[2],
                    'description': row[3],
                    'status': row[4],
                    'created_at': row[5]
                } for row in content]
        except Exception as e:
            print(f"Error fetching content by type: {e}")
            return []

    def get_all_content(self):
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM content ORDER BY created_at DESC")
                content = cursor.fetchall()
                return [{
                    'id': row[0],
                    'title': row[1],
                    'type': row[2],
                    'description': row[3],
                    'status': row[4],
                    'created_at': row[5]
                } for row in content]
        except Exception as e:
            print(f"Error fetching all content: {e}")
            return []
    def create_content(self, data):
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO content (title, type, description, status)
                    VALUES (?, ?, ?, ?)
                """, (data['title'], data['type'], data['description'], data.get('status', 'active')))
                conn.commit()
                return cursor.lastrowid
        except Exception as e:
            print(f"Error creating content: {e}")
            return False

    def update_content(self, content_id, data):
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    UPDATE content 
                    SET title = ?, type = ?, description = ?, status = ?
                    WHERE id = ?
                """, (data['title'], data['type'], data['description'], data.get('status', 'active'), content_id))
                conn.commit()
                return cursor.rowcount > 0
        except Exception as e:
            print(f"Error updating content: {e}")
            return False

    def delete_content(self, content_id):
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM content WHERE id = ?", (content_id,))
                conn.commit()
                return cursor.rowcount > 0
        except Exception as e:
            print(f"Error deleting content: {e}")
            return False
