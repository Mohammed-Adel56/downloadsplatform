import sqlite3

def clear_database():
    try:
        conn = sqlite3.connect('users.db')
        cursor = conn.cursor()
        
        # Delete all records from users table
        cursor.execute("DROP TABLE IF EXISTS users")
        cursor.execute('DROP TABLE IF EXISTS advertisements')
        
        # Delete all records from otp table
        cursor.execute("DROP TABLE IF EXISTS otp")
        
        # Reset the auto-increment counters
        #cursor.execute("DELETE FROM sqlite_sequence WHERE name='users' OR name='otp'")
        
        # Commit the changes
        conn.commit()
        print("Database cleared successfully!")
        
    except Exception as e:
        print(f"Error clearing database: {e}")
        
    finally:
        conn.close()

if __name__ == "__main__":
    clear_database()