"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Customer, Billing, Shipping, Order, LineItem
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from woocommerce import API
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta
from api.insert_line_items import insert_line_item
from .controllers import get_order_by_id

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Asegúrate de que CORS esté configurado para la aplicación Flask

api = Blueprint('api', __name__)
CORS(api)  # Asegúrate de que CORS esté configurado para el Blueprint

database_url = os.getenv('DATABASE_URL')
consumer_key = os.getenv('WC_CONSUMER_KEY')
consumer_secret = os.getenv('WC_CONSUMER_SECRET')

wcapi = API(
    url="https://piedrapapelytijeras.es",  
    consumer_key=consumer_key,  
    consumer_secret=consumer_secret, 
    wp_api=True,
    version="wc/v3",
    timeout=30
    
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
        page = 1
        while True:
            response = wcapi.get("orders", params={"per_page": 100, "page": page})
            
            if response.status_code != 200:
                return jsonify({"msg": f"Error al importar órdenes: {response.text}"}), 401
            
            wc_orders = response.json()

            if not isinstance(wc_orders, list) or not wc_orders:
                break  # Salir del bucle si no hay más órdenes

            for wc_order in wc_orders:
                try:
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
                            address_2=billing_info.get("address_2", ""),
                            city=shipping_info.get("city", ""),
                            state=shipping_info.get("state", ""),
                            postcode=shipping_info.get("postcode", ""),
                            country=shipping_info.get("country", "")
                        )
                        db.session.add(shipping)
                        db.session.flush()  # Asegurarse de que el ID esté disponible

                    customer_id = wc_order["customer_id"]
                    if customer_id == 0 or not Customer.query.get(customer_id):
                        print(f"Skipping order {wc_order['id']} due to invalid customer_id {customer_id}")
                        continue

                    existing_order = Order.query.filter_by(id=wc_order["id"]).first()

                    if existing_order:
                        existing_order.number = wc_order["number"]
                        existing_order.status = wc_order["status"]
                        existing_order.date_create = wc_order.get("date_created")
                        existing_order.discount_total = wc_order.get("discount_total")
                        existing_order.discount_tax = wc_order.get("discount_tax")
                        existing_order.shipping_total = wc_order.get("shipping_total")
                        existing_order.shipping_tax = wc_order.get("shipping_tax")
                        existing_order.cart_tax = wc_order.get("cart_tax")
                        existing_order.total_tax = wc_order["total_tax"]
                        existing_order.total = wc_order["total"]
                        existing_order.payment_method = wc_order.get("payment_method")
                        existing_order.payment_method_title = wc_order.get("payment_method_title")
                        existing_order.customer_note = wc_order.get("customer_note")
                        existing_order.date_completed = wc_order.get("date_completed")
                        existing_order.customer_id = wc_order["customer_id"]
                        existing_order.billing_id = billing.id if billing else None
                        existing_order.shipping_id = shipping.id if shipping else None
                    else:
                        new_order = Order(
                            id=wc_order["id"],
                            number=wc_order["number"],
                            status=wc_order["status"],
                            total=wc_order["total"],
                            total_tax=wc_order["total_tax"],
                            discount_total=wc_order.get("discount_total"),
                            discount_tax=wc_order.get("discount_tax"),
                            shipping_total=wc_order.get("shipping_total"),
                            payment_method=wc_order.get("payment_method"),
                            payment_method_title=wc_order.get("payment_method_title"),
                            shipping_tax=wc_order.get("shipping_tax"),
                            cart_tax=wc_order.get("cart_tax"),
                            customer_note=wc_order.get("customer_note"),
                            date_create=wc_order.get("date_created"),
                            date_completed=wc_order.get("date_completed"),
                            customer_id=wc_order["customer_id"],
                            billing_id=billing.id if billing else None,
                            shipping_id=shipping.id if shipping else None
                        )
                        db.session.add(new_order)
                        db.session.flush()  # Asegurarse de que el ID esté disponible

                    # Importar artículos de línea
                    for item in wc_order.get("line_items", []):
                        line_item = LineItem(
                            id=item["id"],
                            name=item["name"],
                            product_id=item["product_id"],
                            variation_id=item["variation_id"],
                            quantity=item["quantity"],
                            tax_class=item["tax_class"],
                            subtotal=item["subtotal"],
                            subtotal_tax=item["subtotal_tax"],
                            total=item["total"],
                            total_tax=item["total_tax"],
                            order_id=new_order.id if not existing_order else existing_order.id
                        )
                        db.session.add(line_item)
                except Exception as e:
                    print(f"Error processing order {wc_order['id']}: {str(e)}")
                    continue

            db.session.commit()
            page += 1  # Pasar a la siguiente página

        return jsonify({"msg": "Órdenes importadas y actualizadas correctamente"}), 200

    except Exception as e:
        return jsonify({"msg": f"Error al importar órdenes: {str(e)}"}), 500

@api.route("/import_line_items", methods=["GET"])
def import_line_items():
    try:
        page = 1
        while True:
            response = wcapi.get("orders", params={"per_page": 100, "page": page})
            
            if response.status_code != 200:
                return jsonify({"msg": f"Error al importar artículos de línea: {response.text}"}), 401
            
            wc_orders = response.json()

            if not isinstance(wc_orders, list) or not wc_orders:
                break  # Salir del bucle si no hay más órdenes

            for wc_order in wc_orders:
                order_id = wc_order["id"]
                existing_order = Order.query.filter_by(id=order_id).first()
                if not existing_order:
                    print(f"Skipping line items for order {order_id} because the order does not exist.")
                    continue

                for item in wc_order.get("line_items", []):
                    existing_item = LineItem.query.filter_by(id=item["id"]).first()

                    if existing_item:
                        existing_item.name = item["name"]
                        existing_item.product_id = item["product_id"]
                        existing_item.variation_id = item["variation_id"]
                        existing_item.quantity = item["quantity"]
                        existing_item.tax_class = item["tax_class"]
                        existing_item.subtotal = item["subtotal"]
                        existing_item.subtotal_tax = item["subtotal_tax"]
                        existing_item.total = item["total"]
                        existing_item.total_tax = item["total_tax"]
                    else:
                        new_item = LineItem(
                            id=item["id"],
                            name=item["name"],
                            product_id=item["product_id"],
                            variation_id=item["variation_id"],
                            quantity=item["quantity"],
                            tax_class=item["tax_class"],
                            subtotal=item["subtotal"],
                            subtotal_tax=item["subtotal_tax"],
                            total=item["total"],
                            total_tax=item["total_tax"],
                            order_id=order_id
                        )
                        db.session.add(new_item)

            db.session.commit()
            page += 1  # Pasar a la siguiente página

        return jsonify({"msg": "Artículos de línea importados y actualizados correctamente"}), 200

    except Exception as e:
        return jsonify({"msg": f"Error al importar artículos de línea: {str(e)}"}), 500

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
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        customer_id = request.args.get('customer_id', type=int)
        
        params = {"per_page": per_page, "page": page}
        if customer_id:
            params["customer"] = customer_id
        
        response = wcapi.get("orders", params=params)
        
        if response.status_code != 200:
            return jsonify({"error": "Error fetching orders from WooCommerce"}), response.status_code

        wc_orders = response.json()
        total_orders = response.headers.get('X-WP-Total', 0)
        orders = []

        for wc_order in wc_orders:
            date_created = datetime.strptime(wc_order["date_created"], "%Y-%m-%dT%H:%M:%S")
            shipping_date = date_created + timedelta(days=9)
            order = {
                "id": wc_order["id"],
                "number": wc_order["number"],
                "status": wc_order["status"],  # Asegúrate de que el campo esté correctamente mapeado
                "date_created": wc_order["date_created"],  # Asegúrate de que el campo esté correctamente mapeado
                "shipping_date": shipping_date.isoformat(),
                "discount_total": wc_order["discount_total"],
                "discount_tax": wc_order["discount_tax"],
                "shipping_total": wc_order["shipping_total"],
                "shipping_tax": wc_order["shipping_tax"],
                "cart_tax": wc_order["cart_tax"],
                "total_tax": wc_order["total_tax"],
                "total": wc_order["total"],
                "payment_method": wc_order["payment_method"],
                "payment_method_title": wc_order["payment_method_title"],
                "customer_note": wc_order["customer_note"],
                "date_completed": wc_order["date_completed"],
                "customer_id": wc_order["customer_id"],
                "billing": wc_order.get("billing", {}),
                "shipping": wc_order.get("shipping", {})
            }
            orders.append(order)

        return jsonify({"orders": orders, "total_orders": int(total_orders), "page": page, "per_page": per_page}), 200
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
        
@api.route('/orders/<int:order_id>', methods=['GET'])
def get_order(order_id):
    try:
        response = wcapi.get(f"orders/{order_id}")
        if response.status_code != 200:
            return jsonify({"error": "Error fetching order from WooCommerce"}), response.status_code
        wc_order = response.json()
        date_created = datetime.strptime(wc_order["date_created"], "%Y-%m-%dT%H:%M:%S")
        shipping_date = date_created + timedelta(days=9)
        order = {
            "id": wc_order["id"],
            "number": wc_order["number"],
            "status": wc_order["status"],  # Asegúrate de que el campo esté correctamente mapeado
            "date_created": wc_order["date_created"],  # Asegúrate de que el campo esté correctamente mapeado
            "shipping_date": shipping_date.isoformat(),
            "discount_total": wc_order["discount_total"],
            "discount_tax": wc_order["discount_tax"],
            "shipping_total": wc_order["shipping_total"],
            "shipping_tax": wc_order["shipping_tax"],
            "cart_tax": wc_order["cart_tax"],
            "total_tax": wc_order["total_tax"],
            "total": wc_order["total"],
            "payment_method": wc_order["payment_method"],
            "payment_method_title": wc_order["payment_method_title"],
            "customer_note": wc_order["customer_note"],
            "date_completed": wc_order["date_completed"],
            "customer_id": wc_order["customer_id"],
            "billing": wc_order.get("billing", {}),
            "shipping": wc_order.get("shipping", {}),
            "line_items": wc_order.get("line_items", [])  # Asegúrate de incluir los line_items
        }
        return jsonify(order), 200
    except Exception as e:
        print(f"Error: {str(e)}") 
        return jsonify({"error": str(e)}), 500

@api.route('/line_items', methods=['GET'])
def get_line_items():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        order_id = request.args.get('order_id', type=int)

        query = LineItem.query
        if order_id:
            query = query.filter_by(order_id=order_id)

        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        line_items = pagination.items
        total_items = pagination.total

        serialized_items = [item.serialize() for item in line_items]

        return jsonify({"line_items": serialized_items, "total_items": total_items, "page": page, "per_page": per_page}), 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500
