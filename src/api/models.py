from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(80), unique=False, nullable=False)
    is_active = db.Column(db.Boolean(), unique=False, nullable=False)

    def __repr__(self):
        return f'<User {self.email}>'

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            # do not serialize the password, its a security breach
        }
class Customer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    first_name = db.Column(db.String(120), nullable=False)
    last_name = db.Column(db.String(120), nullable=False)
    company = db.Column(db.String(120), nullable=True)
    role = db.Column(db.String(120), default="customer")
    username = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(80), nullable=False)
    is_paying_customer = db.Column(db.Boolean, default=False)
    billing_id = db.Column(db.Integer, db.ForeignKey('billing.id'), nullable=True)
    shipping_id = db.Column(db.Integer, db.ForeignKey('shipping.id'), nullable=True)
    billing = db.relationship('Billing', backref='customer')
    shipping = db.relationship('Shipping', backref='customer')
    orders = db.relationship('Order', back_populates='customer', lazy='dynamic')

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "first_name": self.first_name,
            "company": self.company,
            "last_name": self.last_name,
            "role": self.role,
            "username": self.username,
            "is_paying_customer": self.is_paying_customer,
            "billing": self.billing.serialize() if self.billing else None,
            "shipping": self.shipping.serialize() if self.shipping else None,
            "orders": [order.serialize() for order in self.orders.all()]
        }
class Billing(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(120), nullable=False)
    last_name = db.Column(db.String(120), nullable=False)
    company = db.Column(db.String(120), nullable=True)
    address_1 = db.Column(db.String(120), nullable=False)
    address_2 = db.Column(db.String(120), nullable=True)
    city = db.Column(db.String(120), nullable=False)
    state = db.Column(db.String(120), nullable=False)
    postcode = db.Column(db.String(20), nullable=False)
    country = db.Column(db.String(3), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=False)

    def serialize(self):
        return {
            "first_name": self.first_name,
            "last_name": self.last_name,
            "company": self.company,
            "address_1": self.address_1,
            "address_2": self.address_2,
            "city": self.city,
            "state": self.state,
            "postcode": self.postcode,
            "country": self.country,
            "email": self.email,
            "phone": self.phone
        }
    
class Shipping(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(120), nullable=False)
    last_name = db.Column(db.String(120), nullable=False)
    company = db.Column(db.String(120), nullable=True)
    address_1 = db.Column(db.String(120), nullable=False)
    address_2 = db.Column(db.String(120), nullable=True)
    city = db.Column(db.String(120), nullable=False)
    state = db.Column(db.String(120), nullable=False)
    postcode = db.Column(db.String(20), nullable=False)
    country = db.Column(db.String(3), nullable=False)

    def serialize(self):
        return {
            "first_name": self.first_name,
            "last_name": self.last_name,
            "company": self.company,
            "address_1": self.address_1,
            "address_2": self.address_2,
            "city": self.city,
            "state": self.state,
            "postcode": self.postcode,
            "country": self.country
        }
class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    number = db.Column(db.String(80), nullable=False)
    status = db.Column(db.String(80), nullable=False, default='pending')
    total = db.Column(db.String(80), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    billing_id = db.Column(db.Integer, db.ForeignKey('billing.id'), nullable=True)
    shipping_id = db.Column(db.Integer, db.ForeignKey('shipping.id'), nullable=True)
    customer = db.relationship('Customer', back_populates='orders')
    billing = db.relationship('Billing', backref='order_billing', foreign_keys=[billing_id])
    shipping = db.relationship('Shipping', backref='order_shipping', foreign_keys=[shipping_id])

    def serialize(self):
        return {
            "id": self.id,
            "number": self.number,
            "status": self.status,
            "total": self.total,
            "customer_id": self.customer_id,
            "billing_id": self.billing_id,
            "shipping_id": self.shipping_id,
            "billing": self.billing.serialize() if self.billing else None,
            "shipping": self.shipping.serialize() if self.shipping else None
        }
    