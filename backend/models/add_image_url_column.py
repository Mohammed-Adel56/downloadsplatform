import sqlite3

def add_image_url_column(db_name='users.db'):
    conn = sqlite3.connect(db_name)
    c = conn.cursor()
    
    # Check if the column already exists
    c.execute("PRAGMA table_info(services)")
    columns = [column[1] for column in c.fetchall()]
    
    if 'image_url' not in columns:
        try:
            c.execute('ALTER TABLE services ADD COLUMN image_url TEXT')
            print("Column 'image_url' added to 'services' table.")
        except Exception as e:
            print(f"Error adding column: {e}")
    else:
        print("Column 'image_url' already exists in 'services' table.")
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    add_image_url_column()