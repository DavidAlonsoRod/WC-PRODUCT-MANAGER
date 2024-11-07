"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Customer, Billing, Shipping, Order
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from woocommerce import API
from dotenv import load_dotenv
import os

load_dotenv()

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api, resources={r"/*": {"origins": "*"}}) 

database_url = os.getenv('DATABASE_URL')
consumer_key = os.getenv('WC_CONSUMER_KEY')
consumer_secret = os.getenv('WC_CONSUMER_SECRET')

wcapi = API(
    url="https://piedrapapelytijeras.es",  
    consumer_key=consumer_key,  
    consumer_secret=consumer_secret, 
    wp_api=True,
    version="wc/v3",
    timeout=100
    
)


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200

@api.route("/import_customers", methods=["GET"])
def import_customers():
    try:
        page = 1
        while True:
            response = wcapi.get("customers", params={"per_page": 100, "page": page, "timeout": 30})
            
            if response.status_code != 200:
                return jsonify({"msg": f"Error al importar clientes: {response.text}"}), 401
            
            wc_customers = response.json()

            if not isinstance(wc_customers, list) or not wc_customers:
                break  # Salir del bucle si no hay más clientes

            for wc_customer in wc_customers:
                existing_customer = Customer.query.filter_by(id=wc_customer["id"]).first()

                if existing_customer:
                    existing_customer.email = wc_customer["email"]
                    existing_customer.first_name = wc_customer["first_name"]
                    existing_customer.last_name = wc_customer["last_name"]
                    existing_customer.role = wc_customer["role"]
                    existing_customer.username = wc_customer["username"]
                    existing_customer.is_paying_customer = wc_customer["is_paying_customer"]
                else:
                    new_customer = Customer(
                        id=wc_customer["id"],
                        email=wc_customer["email"],
                        first_name=wc_customer["first_name"],
                        last_name=wc_customer["last_name"],
                        role=wc_customer["role"],
                        username=wc_customer["username"],
                        password="default_password",
                        is_paying_customer=wc_customer["is_paying_customer"]
                    )
                    db.session.add(new_customer)

                billing_info = wc_customer.get("billing", {})
                if billing_info:
                    billing = Billing.query.filter_by(id=existing_customer.billing_id).first() if existing_customer else None
                    if billing:
                        billing.first_name = billing_info["first_name"]
                        billing.last_name = billing_info["last_name"]
                        billing.company = billing_info.get("company")
                        billing.address_1 = billing_info.get("address_1", "")
                        billing.address_2 = billing_info.get("address_2", "")
                        billing.city = billing_info.get("city", "")
                        billing.state = billing_info.get("state", "")
                        billing.postcode = billing_info.get("postcode", "")
                        billing.country = billing_info.get("country", "")
                        billing.email = billing_info.get("email", "")
                        billing.phone = billing_info.get("phone", "")
                    else:
                        new_billing = Billing(
                            first_name=billing_info["first_name"],
                            last_name=billing_info["last_name"],
                            company=billing_info.get("company"),
                            address_1=billing_info.get("address_1", ""),
                            address_2=billing_info.get("address_2", ""),
                            city=billing_info.get("city", ""),
                            state=billing_info.get("state", ""),
                            postcode=billing_info.get("postcode", ""),
                            country=billing_info.get("country", ""),
                            email=billing_info.get("email", ""),
                            phone=billing_info.get("phone", "")
                        )
                        db.session.add(new_billing)
                        if existing_customer:
                            existing_customer.billing = new_billing
                        else:
                            new_customer.billing = new_billing

                shipping_info = wc_customer.get("shipping", {})
                if shipping_info:
                    shipping = Shipping.query.filter_by(id=existing_customer.shipping_id).first() if existing_customer else None
                    if shipping:
                        shipping.first_name = shipping_info["first_name"]
                        shipping.last_name = shipping_info["last_name"]
                        shipping.company = shipping_info.get("company")
                        shipping.address_1 = shipping_info.get("address_1", "")
                        shipping.address_2 = shipping_info.get("address_2", "")
                        shipping.city = shipping_info.get("city", "")
                        shipping.state = shipping_info.get("state", "")
                        shipping.postcode = shipping_info.get("postcode", "")
                        shipping.country = shipping_info.get("country", "")
                    else:
                        new_shipping = Shipping(
                            first_name=shipping_info["first_name"],
                            last_name=shipping_info["last_name"],
                            company=shipping_info.get("company"),
                            address_1=shipping_info.get("address_1", ""),
                            address_2=shipping_info.get("address_2", ""),
                            city=shipping_info.get("city", ""),
                            state=shipping_info.get("state", ""),
                            postcode=shipping_info.get("postcode", ""),
                            country=shipping_info.get("country", "")
                        )
                        db.session.add(new_shipping)
                        if existing_customer:
                            existing_customer.shipping = new_shipping
                        else:
                            new_customer.shipping = new_shipping

            db.session.commit()
            page += 1  # Pasar a la siguiente página

        return jsonify({"msg": "Clientes importados y actualizados correctamente"}), 200

    except Exception as e:
        return jsonify({"msg": f"Error al importar clientes: {str(e)}"}), 500
@api.route("/import_orders", methods=["GET"])
def import_orders():
    try:
        response = wcapi.get("orders", params={"per_page": 100, "page": 1})
        
        if response.status_code != 200:
            return jsonify({"msg": f"Error al importar órdenes: {response.text}"}), 401
        
        wc_orders = response.json()

        if not isinstance(wc_orders, list):
            return jsonify({"msg": "Error: formato de respuesta inesperado"}), 400

        for wc_order in wc_orders:
            billing_info = wc_order.get("billing", {})
            shipping_info = wc_order.get("shipping", {})

            billing = None
            if billing_info:
                billing = Billing(
                    first_name=billing_info["first_name"],
                    last_name=billing_info["last_name"],
                    company=billing_info.get("company"),
                    address_1=billing_info.get("address_1", ""),
                    address_2=billing_info.get("address_2", ""),
                    city=billing_info.get("city", ""),
                    state=billing_info.get("state", ""),
                    postcode=billing_info.get("postcode", ""),
                    country=billing_info.get("country", ""),
                    email=billing_info.get("email", ""),
                    phone=billing_info.get("phone", "")
                )
                db.session.add(billing)
                db.session.flush()  # Asegurarse de que el ID esté disponible

            shipping = None
            if shipping_info:
                shipping = Shipping(
                    first_name=shipping_info["first_name"],
                    last_name=shipping_info["last_name"],
                    company=shipping_info.get("company"),
                    address_1=shipping_info.get("address_1", ""),
                    address_2=shipping_info.get("address_2", ""),
                    city=shipping_info.get("city", ""),
                    state=shipping_info.get("state", ""),
                    postcode=shipping_info.get("postcode", ""),
                    country=shipping_info.get("country", "")
                )
                db.session.add(shipping)
                db.session.flush()  # Asegurarse de que el ID esté disponible

            existing_order = Order.query.filter_by(id=wc_order["id"]).first()

            if existing_order:
                existing_order.number = wc_order["number"]
                existing_order.status = wc_order["status"]
                existing_order.total = wc_order["total"]
                existing_order.customer_id = wc_order["customer_id"]
                existing_order.billing_id = billing.id if billing else None
                existing_order.shipping_id = shipping.id if shipping else None
            else:
                new_order = Order(
                    id=wc_order["id"],
                    number=wc_order["number"],
                    status=wc_order["status"],
                    total=wc_order["total"],
                    customer_id=wc_order["customer_id"],
                    billing_id=billing.id if billing else None,
                    shipping_id=shipping.id if shipping else None
                )
                db.session.add(new_order)

        db.session.commit()
        return jsonify({"msg": "Órdenes importadas y actualizadas correctamente"}), 200

    except Exception as e:
        return jsonify({"msg": f"Error al importar órdenes: {str(e)}"}), 500
    
# @api.route('/customers', methods=['GET'])
# def get_customers():
#     all_customer = Customer.query.all()
#     result = list(map(lambda customer: customer.serialize(),all_customer))
#     if not result:
#         return jsonify({"msg": "No existen datos"}), 200
#     return jsonify(result), 200

    
@api.route('/customers', methods=['GET'])
def get_customers():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        response = wcapi.get("customers", params={"per_page": per_page, "page": page})
        
        if response.status_code != 200:
            return jsonify({"error": "Error fetching customers from WooCommerce"}), response.status_code

        wc_customers = response.json()
        total_customers = response.headers.get('X-WP-Total', 0)
        customers = []

        for wc_customer in wc_customers:
            customer = {
                "id": wc_customer["id"],
                "email": wc_customer["email"],
                "first_name": wc_customer["first_name"],
                "last_name": wc_customer["last_name"],
                "company": wc_customer["billing"]["company"],
                "city": wc_customer["billing"]["city"],
                "state": wc_customer["billing"]["state"],
                "email": wc_customer["email"]
            }
            customers.append(customer)

        return jsonify({"customers": customers, "total_customers": int(total_customers), "page": page, "per_page": per_page}), 200
    except Exception as e:
        print(f"Error: {str(e)}")  # Imprimir el error
        return jsonify({"error": str(e)}), 500
    
@api.route('/orders', methods=['GET'])
def get_orders():
    try:
        orders = Order.query.all()
        return jsonify([order.serialize() for order in orders]), 200
    except Exception as e:
        print(f"Error: {str(e)}")  # Imprimir el error
        return jsonify({"error": str(e)}), 500
    
@api.route('/customers/<int:customer_id>', methods=['GET'])
def get_customer(customer_id):
    try:
        response = wcapi.get(f"customers/{customer_id}")
        
        if response.status_code != 200:
            return jsonify({"error": "Error fetching customer from WooCommerce"}), response.status_code

        wc_customer = response.json()
        customer = {
            "id": wc_customer["id"],
            "email": wc_customer["email"],
            "first_name": wc_customer["first_name"],
            "last_name": wc_customer["last_name"],
            "company": wc_customer["billing"]["company"],
            "city": wc_customer["billing"]["city"],
            "state": wc_customer["billing"]["state"],
            "email": wc_customer["email"],
            "role": wc_customer.get("role", ""),
            "username": wc_customer.get("username", ""),
            "billing": wc_customer.get("billing", {}),
            "shipping": wc_customer.get("shipping", {}),
            "orders": wc_customer.get("orders", [])
        }

        return jsonify(customer), 200
    except Exception as e:
        print(f"Error: {str(e)}")  # Imprimir el error
        return jsonify({"error": str(e)}), 500