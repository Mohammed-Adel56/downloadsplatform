import sqlite3

def check_database_content():
    try:
        conn = sqlite3.connect('users.db')
        cursor = conn.cursor()
        
        # Check users table
        print("\nChecking users table:")
        cursor.execute("SELECT * FROM users")
        users = cursor.fetchall()
        print(f"Number of users: {len(users)}")
        for user in users:
            print(user)
            
        # Check OTP table
        print("\nChecking OTP table:")
        cursor.execute("SELECT * FROM otp")
        otps = cursor.fetchall()
        print(f"Number of OTPs: {len(otps)}")
        for otp in otps:
            print(otp)
            
    except Exception as e:
        print(f"Error checking database: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    check_database_content()