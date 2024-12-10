import sqlite3

def fix_otp_table():
    try:
        conn = sqlite3.connect('users.db')
        cursor = conn.cursor()
        
        # Drop existing OTP table
        cursor.execute("DROP TABLE IF EXISTS otp")
        
        # Create OTP table with correct schema
        cursor.execute("""
            CREATE TABLE otp (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL,
                otp TEXT NOT NULL,
                type TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP NOT NULL
            )
        """)
        
        conn.commit()
        print("OTP table recreated successfully")
        
    except Exception as e:
        print(f"Error fixing OTP table: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    fix_otp_table()