from api.models import db, User
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

def create_admin():
    admin_email = "admin@example.com"
    admin_password = "admin_password"
    hashed_password = bcrypt.generate_password_hash(admin_password).decode('utf-8')

    admin = User(email=admin_email, password=hashed_password, is_active=True)
    db.session.add(admin)
    db.session.commit()

if __name__ == "__main__":
    from api import app
    with app.app_context():
        create_admin()