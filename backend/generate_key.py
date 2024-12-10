import secrets

def generate_secret_key():
    # Generate a secure random secret key
    secret_key = secrets.token_hex(32)
    
    # Save it to a file
    with open('.env', 'w') as f:
        f.write(f'SECRET_KEY={secret_key}\n')
    
    print("Secret key generated and saved to .env file")
    print(f"SECRET_KEY={secret_key}")

if __name__ == "__main__":
    generate_secret_key()