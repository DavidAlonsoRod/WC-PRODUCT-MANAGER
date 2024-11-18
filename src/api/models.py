from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import JSON
import qrcode
import io
import base64
from sqlalchemy import create_engine

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
    billing = db.relationship('Billing', backref='customer', foreign_keys=[billing_id])
    shipping = db.relationship('Shipping', backref='customer', foreign_keys=[shipping_id])
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
            "orders": [order.serialize_basic() for order in self.orders.all()]  # Evitar recursión infinita
        }

class Billing(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    # customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)  # Eliminar columna
    first_name = db.Column(db.String(120), nullable=False)
    last_name = db.Column(db.String(120), nullable=False)
    company = db.Column(db.String(120), nullable=True)
    address_1 = db.Column(db.String(120), nullable=False)
    address_2 = db.Column(db.String(120), nullable=True)
    city = db.Column(db.String(120), nullable=False)
    state = db.Column(db.String(120), nullable=False)
    postcode = db.Column(db.String(20), nullable=False)
    country = db.Column(db.String(100), nullable=False)  # Aumentar la longitud del campo country
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    iban = db.Column(db.String(34), nullable=True)  # Nuevo campo IBAN
    nif = db.Column(db.String(20), nullable=True)  # Nuevo campo NIF

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
    # customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)  # Eliminar columna
    first_name = db.Column(db.String(120), nullable=False)
    last_name = db.Column(db.String(120), nullable=False)
    company = db.Column(db.String(120), nullable=True)
    address_1 = db.Column(db.String(120), nullable=False)
    address_2 = db.Column(db.String(120), nullable=True)
    city = db.Column(db.String(120), nullable=False)
    state = db.Column(db.String(120), nullable=False)
    postcode = db.Column(db.String(20), nullable=False)
    country = db.Column(db.String(100), nullable=False)  # Aumentar la longitud del campo country
    phone = db.Column(db.String(20), nullable=True)

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
            "phone": self.phone
        }

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    number = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(255), nullable=False, default='pending')
    date_created = db.Column(db.DateTime, default=db.func.current_timestamp())
    discount_total = db.Column(db.String(80), nullable=True)
    discount_tax = db.Column(db.String(80), nullable=True)
    shipping_total = db.Column(db.String(80), nullable=True)
    shipping_tax = db.Column(db.String(80), nullable=True)
    cart_tax = db.Column(db.String(80), nullable=True)
    total_tax = db.Column(db.String(255), nullable=False)
    total = db.Column(db.String(255), nullable=False)
    payment_method = db.Column(db.String(80), nullable=True)
    payment_method_title = db.Column(db.String(150), nullable=True)
    customer_note = db.Column(db.String(500), nullable=True)
    date_completed = db.Column(db.DateTime, nullable=True)
    shipping_date = db.Column(db.DateTime, nullable=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    billing_id = db.Column(db.Integer, db.ForeignKey('billing.id'), nullable=True)
    shipping_id = db.Column(db.Integer, db.ForeignKey('shipping.id'), nullable=True)
    customer = db.relationship('Customer', back_populates='orders')
    billing = db.relationship('Billing', backref='order_billing', foreign_keys=[billing_id])
    shipping = db.relationship('Shipping', backref='order_shipping', foreign_keys=[shipping_id])
    line_items = db.relationship('LineItem', back_populates='order', lazy='dynamic', primaryjoin="Order.id == LineItem.order_id")

    def serialize(self):
        return {
            'id': self.id,
            "number": self.number,
            "status": self.status,
            "date_created": self.date_created.isoformat() if self.date_created else None,
            "discount_total": self.discount_total,
            "discount_tax": self.discount_tax,
            "shipping_total": self.shipping_total,
            "shipping_tax": self.shipping_tax,
            "cart_tax": self.cart_tax,
            "total_tax": self.total_tax,
            "total": self.total,
            "payment_method": self.payment_method,
            "payment_method_title": self.payment_method_title,
            "customer_note": self.customer_note,
            "date_completed": self.date_completed,
            "customer_id": self.customer_id,
            "billing_id": self.billing_id,
            "shipping_id": self.shipping_id,
            "customer": self.customer.serialize_basic() if self.customer else None,  # Evitar recursión infinita
            "billing": self.billing.serialize() if self.billing else None,
            "shipping": self.shipping.serialize() if self.shipping else None,
            "line_items": [item.serialize() for item in self.line_items.all()]
        }

    def serialize_basic(self):
        return {
            'id': self.id,
            "number": self.number,
            "status": self.status,
            "date_created": self.date_created.isoformat() if self.date_created else None,
            "total": self.total,
            "customer_id": self.customer_id
        }

class LineItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    product_id = db.Column(db.Integer, nullable=False)
    variation_id = db.Column(db.Integer, nullable=True)
    quantity = db.Column(db.Integer, nullable=False)
    tax_class = db.Column(db.String(255), nullable=True)
    subtotal = db.Column(db.String(255), nullable=False)
    subtotal_tax = db.Column(db.String(255), nullable=False)
    total = db.Column(db.String(255), nullable=False)
    total_tax = db.Column(db.String(255), nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    order = db.relationship('Order', back_populates='line_items')
    qr_code = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(50), nullable=False, default='pending')  # Nuevo campo status

    def generate_qr_code(self):
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(self.id)
        qr.make(fit=True)
        img = qr.make_image(fill='black', back_color='white')
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        self.qr_code = img_str

    def serialize(self):
        customer = self.order.customer
        return {
            "id": self.id,
            "name": self.name,
            "product_id": self.product_id,
            "variation_id": self.variation_id,
            "quantity": self.quantity,
            "tax_class": self.tax_class,
            "subtotal": self.subtotal,
            "subtotal_tax": self.subtotal_tax,
            "total": self.total,
            "total_tax": self.total_tax,
            "order_id": self.order_id,
            "qr_code": self.qr_code,
            "customer_name": f"{customer.first_name} {customer.last_name}" if customer else None,
            "company_name": customer.company if customer else None,
            "status": self.status  # Incluir el nuevo campo status
        }

    @staticmethod
    def before_insert(mapper, connection, target):
        target.generate_qr_code()

    @staticmethod
    def before_update(mapper, connection, target):
        if target.qr_code is None:
            target.generate_qr_code()

db.event.listen(LineItem, 'before_insert', LineItem.before_insert)
db.event.listen(LineItem, 'before_update', LineItem.before_update)

engine = None

def init_engine():
    global engine
    engine = create_engine(db.engine.url)
