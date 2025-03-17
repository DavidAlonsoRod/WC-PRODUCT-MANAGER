"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Customer, Billing, Shipping, Order, LineItem
from api.utils import generate_sitemap, APIException
from flask_cors import CORS, cross_origin
from woocommerce import API
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta
from api.insert_line_items import insert_line_item
from .controllers import get_order_by_id
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

# load_dotenv()

# app = Flask(__name__)  # Añadir esta línea para crear la instancia de Flask
# CORS(app, resources={r"/*": {"origins": "*"}})  # Asegúrate de que CORS esté configurado para la aplicación Flask

# app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')  # Configura la clave secreta del JWT
# jwt = JWTManager(app)

api = Blueprint('api', __name__)
CORS(api)  

database_url = os.getenv('DATABASE_URL')
consumer_key = os.getenv('WC_CONSUMER_KEY')
consumer_secret = os.getenv('WC_CONSUMER_SECRET')
wc_api_url = os.getenv('WC_API_URL')

wcapi = API(
    url=wc_api_url.rstrip('/'),
    consumer_key=consumer_key,  
    consumer_secret=consumer_secret, 
    wp_api=True,
    version="wc/v3",
    timeout=30
)


# bcrypt = Bcrypt(app)

@api.route('/hello', methods=['POST', 'GET'])

def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200


# ############ CUSTOMERS ############

@api.route("/import_customers", methods=["GET"])
def import_customers():
    try:
        roles = ['all', 'administrator', 'subscriber', 'desactivados', 'customer', 'fotgrafo_profesional', 'pago_con_tarjeta', 'transferencia_bancaria', 'domiciliacin_bancaria', 'transferencia_o_bizum_fin_de_mes', 'contrareembolso', 'translator', 'shop_manager', 'blocked']  
        for role in roles:
            page = 1
            while True:
                response = wcapi.get("customers", params={"per_page": 100, "page": page, "role": role, "timeout": 30})
                print(f"Request URL: {response.url}")  # Añadir esta línea para depurar la URL
                if response.status_code == 401:
                    return jsonify({"msg": "Error de autenticación: Verifica tus credenciales de WooCommerce"}), 401
                if response.status_code != 200:
                    return jsonify({"msg": f"Error al importar clientes: {response.text}"}), response.status_code
                
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
                        billing = Billing.query.filter_by(
                            first_name=billing_info["first_name"],
                            last_name=billing_info["last_name"],
                            address_1=billing_info["address_1"]
                        ).first()  
                        if billing:
                            billing.first_name = billing_info["first_name"]
                            billing.last_name = billing_info["last_name"]
                            billing.company = billing_info.get("company")
                            billing.address_1 = billing_info.get("address_1", "")
                            billing.address_2 = billing_info.get("address_2", "")
                            billing.city = billing_info.get("city", "")
                            billing.state = billing_info.get("state", "")
                            billing.postcode = billing_info.get("postcode", "")
                            billing.country = billing_info.get("country", "")[:100] 
                            billing.email = billing_info.get("email", "")
                            billing.phone = billing_info.get("phone", "")[:20]  
                            billing.iban = billing_info.get("iban", "")  
                            billing.nif = billing_info.get("nif", "") 
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
                                country=billing_info.get("country", "")[:100],  
                                email=billing_info.get("email", ""),
                                phone=billing_info.get("phone", "")[:20], 
                                iban=billing_info.get("iban", ""), 
                                nif=billing_info.get("nif", "")  
                            )
                            db.session.add(new_billing)
                            if existing_customer:
                                existing_customer.billing = new_billing
                            else:
                                new_customer.billing = new_billing

                    shipping_info = wc_customer.get("shipping", {})
                    if shipping_info:
                        shipping = Shipping.query.filter_by(
                            first_name=shipping_info["first_name"],
                            last_name=shipping_info["last_name"],
                            address_1=shipping_info["address_1"]
                        ).first()  # Actualizar la consulta
                        if shipping:
                            shipping.first_name = shipping_info["first_name"]
                            shipping.last_name = shipping_info["last_name"]
                            shipping.company = shipping_info.get("company")
                            shipping.address_1 = shipping_info.get("address_1", "")
                            shipping.address_2 = shipping_info.get("address_2", "")
                            shipping.city = shipping_info.get("city", "")
                            shipping.state = shipping_info.get("state", "")
                            shipping.postcode = shipping_info.get("postcode", "")
                            shipping.country = shipping_info.get("country", "")[:100]  
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
                                country=shipping_info.get("country", "")[:100] 
                            )
                            db.session.add(new_shipping)
                            if existing_customer:
                                existing_customer.shipping = new_shipping
                            else:
                                new_customer.shipping = new_shipping

                db.session.commit()
                page += 1 

        return jsonify({"msg": "Clientes importados y actualizados correctamente"}), 200

    except Exception as e:
        return jsonify({"msg": f"Error al importar clientes: {str(e)}"}), 500

@api.route('/customers', methods=['GET'])
@jwt_required()
def get_customers():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        customers_query = Customer.query.paginate(page=page, per_page=per_page, error_out=False)
        customers = customers_query.items
        total_customers = customers_query.total

        serialized_customers = [customer.serialize() for customer in customers]

        return jsonify({"customers": serialized_customers, "total_customers": total_customers, "page": page, "per_page": per_page}), 200
    except Exception as e:
        print(f"Error: {str(e)}")  # Imprimir el error
        return jsonify({"error": str(e)}), 500

@api.route('/customers/<int:customer_id>', methods=['GET'])
@jwt_required()
def get_customer(customer_id):
    try:
        customer = Customer.query.get(customer_id)
        if not customer:
            return jsonify({"error": "Customer not found"}), 404

        serialized_customer = customer.serialize()
        return jsonify(serialized_customer), 200
    except Exception as e:
        print(f"Error: {str(e)}")  # Imprimir el error
        return jsonify({"error": str(e)}), 500
    
@api.route('/customers/<int:customer_id>', methods=['PUT'])
@jwt_required()
def update_customer(customer_id):
    try:
        data = request.json
        customer = Customer.query.get(customer_id)
        
        if not customer:
            return jsonify({"error": "Customer not found"}), 404
        
        customer.first_name = data.get('first_name', customer.first_name)
        customer.last_name = data.get('last_name', customer.last_name)
        customer.email = data.get('email', customer.email)
        
        billing_data = data.get('billing', {})
        if billing_data:
            billing = customer.billing
            if not billing:
                billing = Billing()
                customer.billing = billing
            billing.first_name = billing_data.get('first_name', billing.first_name or '')
            billing.last_name = billing_data.get('last_name', billing.last_name or '')
            billing.company = billing_data.get('company', billing.company or '')
            billing.address_1 = billing_data.get('address_1', billing.address_1 or '')
            billing.address_2 = billing_data.get('address_2', billing.address_2 or '')
            billing.city = billing_data.get('city', billing.city or '')
            billing.state = billing_data.get('state', billing.state or '')
            billing.postcode = billing_data.get('postcode', billing.postcode or '')
            billing.country = billing_data.get('country', billing.country or '')
            billing.email = billing_data.get('email', billing.email or '')
            billing.phone = billing_data.get('phone', billing.phone or '')
            billing.nif = billing_data.get('nif', billing.nif or '')
            billing.iban = billing_data.get('iban', billing.iban or '')
        
        shipping_data = data.get('shipping', {})
        if shipping_data:
            shipping = customer.shipping
            if not shipping:
                shipping = Shipping()
                customer.shipping = shipping
            shipping.first_name = shipping_data.get('first_name', shipping.first_name or '')
            shipping.last_name = shipping_data.get('last_name', shipping.last_name or '')
            shipping.company = shipping_data.get('company', shipping.company or '')
            shipping.address_1 = shipping_data.get('address_1', shipping.address_1 or '')
            shipping.address_2 = shipping_data.get('address_2', shipping.address_2 or '')
            shipping.city = shipping_data.get('city', shipping.city or '')
            shipping.state = shipping_data.get('state', shipping.state or '')
            shipping.postcode = shipping_data.get('postcode', shipping.postcode or '')
            shipping.country = shipping_data.get('country', shipping.country or '')
            shipping.phone = shipping_data.get('phone', shipping.phone or '')
        
        db.session.commit()

        # Actualizar datos en WooCommerce
        wc_data = {
            "billing": {
                "first_name": billing.first_name,
                "last_name": billing.last_name,
                "company": billing.company,
                "address_1": billing.address_1,
                "address_2": billing.address_2,
                "city": billing.city,
                "state": billing.state,
                "postcode": billing.postcode,
                "country": billing.country,
                "email": billing.email,
                "phone": billing.phone,
                "nif": billing.nif
            },
            "shipping": {
                "first_name": shipping.first_name,
                "last_name": shipping.last_name,
                "company": shipping.company,
                "address_1": shipping.address_1,
                "address_2": shipping.address_2,
                "city": shipping.city,
                "state": shipping.state,
                "postcode": shipping.postcode,
                "country": shipping.country,
                "phone": shipping.phone
            }
        }
        response = wcapi.put(f"customers/{customer_id}", wc_data)
        if response.status_code != 200:
            print(f"Error updating customer in WooCommerce: {response.text}")
            return jsonify({"error": "Error updating customer in WooCommerce"}), response.status_code

        return jsonify(customer.serialize()), 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

############ ORDERS ############

@api.route("/import_orders", methods=["GET"])
def import_orders():
    try:
        start_date = request.args.get('start_date')
        if not start_date:
            return jsonify({"msg": "introduce la fecha a partir de la cual quieres obtener las órdenes. Ejemplo: /import_orders?start_date=2023-01-01T00:00:00"}), 400

        page = 1
        while True:
            response = wcapi.get("orders", params={"per_page": 100, "page": page, "after": start_date})
            
            if response.status_code != 200:
                return jsonify({"msg": f"Error al importar órdenes: {response.text}"}), 401
            
            wc_orders = response.json()

            if not isinstance(wc_orders, list) or not wc_orders:
                break  

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
                            phone=billing_info.get("phone", ""),
                            iban=billing_info.get("iban", ""), 
                            nif=billing_info.get("nif", "") 
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

                    customer_id = wc_order["customer_id"]
                    if customer_id == 0 or not Customer.query.get(customer_id):
                        print(f"Skipping order {wc_order['id']} due to invalid customer_id {customer_id}")
                        continue

                    existing_order = Order.query.filter_by(id=wc_order["id"]).first()

                    if existing_order:
                        existing_order.number = wc_order["number"]
                        existing_order.status = wc_order["status"]
                        existing_order.date_created = wc_order.get("date_created")  # Corregir el nombre del campo
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
                            date_created=wc_order.get("date_created"),  # Corregir el nombre del campo
                            date_completed=wc_order.get("date_completed"),
                            customer_id=wc_order["customer_id"],
                            billing_id=billing.id if billing else None,
                            shipping_id=shipping.id if shipping else None
                        )
                        db.session.add(new_order)
                        db.session.flush()  # Asegurarse de que el ID esté disponible

                    # Importar artículos de línea
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
                    db.session.rollback()
                    continue

            db.session.commit()
            page += 1  # Pasar a la siguiente página

        return jsonify({"msg": "Órdenes importadas y actualizadas correctamente"}), 200

    except Exception as e:
        return jsonify({"msg": f"Error al importar órdenes: {str(e)}"}), 500

@api.route("/import_line_items", methods=["GET"])
def import_line_items():
    try:
        start_date = request.args.get('start_date')
        if not start_date:
            return jsonify({"msg": "introduce la fecha a partir de la cual quieres obtener los line_items. Ejemplo: /import_line_items?start_date=2023-01-01T00:00:00"}), 400

        page = 1
        while True:
            response = wcapi.get("orders", params={"per_page": 100, "page": page, "after": start_date})
            
            if response.status_code != 200:
                return jsonify({"msg": f"Error al importar los line_items: {response.text}"}), 401
            
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

        return jsonify({"msg": "LineItems importados y actualizados correctamente"}), 200

    except Exception as e:
        return jsonify({"msg": f"Error al importar LineItems: {str(e)}"}), 500


@api.route('/line_items', methods=['GET'])
@jwt_required()
def get_line_items():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        order_id = request.args.get('order_id', type=int)
        sort_by = request.args.get('sortBy', 'date_created')
        sort_order = request.args.get('sortOrder', 'desc')

        query = LineItem.query.join(Order)
        if order_id:
            query = query.filter(LineItem.order_id == order_id)

        if sort_by and sort_order:
            if sort_order == 'asc':
                query = query.order_by(getattr(Order, sort_by).asc())
            else:
                query = query.order_by(getattr(Order, sort_by).desc())

        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        line_items = pagination.items
        total_items = pagination.total

        serialized_items = [item.serialize() for item in line_items]

        return jsonify({"line_items": serialized_items, "total_items": total_items, "page": page, "per_page": per_page}), 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@api.route('/lineitems/<int:item_id>/note', methods=['PUT'])
@jwt_required()
@cross_origin()  # Agregar esta línea para permitir CORS en esta ruta
def update_line_item_note(item_id):
    try:
        data = request.json
        note = data.get('note')
        if note is None:
            return jsonify({"msg": "Note is required"}), 400

        line_item = LineItem.query.get(item_id)
        if not line_item:
            return jsonify({"msg": "Line item not found"}), 404

        line_item.internal_note = note
        db.session.commit()

        return jsonify(line_item.serialize()), 200
    except Exception as e:
        return jsonify({"msg": str(e)}), 500

@api.route('/lineitems/<int:item_id>/status', methods=['PUT'])
@jwt_required()
@cross_origin()  # Agregar esta línea para permitir CORS en esta ruta
def update_line_item_status(item_id):
    try:
        data = request.json
        status = data.get('status')
        if status is None:
            return jsonify({"msg": "Status is required"}), 400

        line_item = LineItem.query.get(item_id)
        if not line_item:
            return jsonify({"msg": "Line item not found"}), 404

        line_item.status = status
        db.session.commit()

        # Verificar si todos los line items de la orden están finalizados
        order = line_item.order
        all_finalized = all(item.status == "finalizado" for item in order.line_items)
        if all_finalized:
            order.status = "completed"
            db.session.commit()

            # Actualizar el estado en WooCommerce
            wc_data = {"status": "completed"}
            wc_response = wcapi.put(f"orders/{order.id}", wc_data)
            if wc_response.status_code != 200:
                print(f"Error updating order in WooCommerce: {wc_response.text}")
                return jsonify({"error": "Error updating order in WooCommerce"}), wc_response.status_code

        return jsonify(line_item.serialize()), 200
    except Exception as e:
        return jsonify({"msg": str(e)}), 500

@api.route('/orders', methods=['GET'])
@jwt_required()
def get_orders():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        customer_id = request.args.get('customer_id', type=int)
        query = Order.query
        if customer_id:
            query = query.filter_by(customer_id=customer_id)

        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        orders = pagination.items
        total_orders = pagination.total

        serialized_orders = [order.serialize() for order in orders]

        return jsonify({"orders": serialized_orders, "total_orders": total_orders, "page": page, "per_page": per_page}), 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@api.route('/orders/filter', methods=['GET'])
def filter_orders_by_status():
    try:
        status = request.args.get('status')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        if not status:
            return jsonify({"error": "Status parameter is required"}), 400

        orders_query = Order.query.filter_by(status=status).paginate(page=page, per_page=per_page, error_out=False)
        orders = orders_query.items
        total_orders = orders_query.total

        serialized_orders = [order.serialize() for order in orders]

        return jsonify({"orders": serialized_orders, "total_orders": total_orders, "page": page, "per_page": per_page}), 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500



@api.route('/orders/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    try:
        order = Order.query.get(order_id)
        if not order:
            return jsonify({"error": "Order not found"}), 404

        serialized_order = order.serialize()
        return jsonify(serialized_order), 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@api.route('/orders/update', methods=['PUT'])
@jwt_required()
def update_order():
    try:
        data = request.json
        order_id = data.get('order_id')
        new_status = data.get('status')
        new_total = data.get('total')
        new_payment_method = data.get('payment_method')

        if not order_id:
            return jsonify({"error": "Order ID is required"}), 400

        order = Order.query.get(order_id)
        if not order:
            return jsonify({"error": "Order not found"}), 404

        if new_status:
            order.status = new_status
        if new_total:
            order.total = new_total
        if new_payment_method:
            order.payment_method = new_payment_method

        db.session.commit()

        # Actualizar datos en WooCommerce
        wc_data = {
            "status": new_status,
            "total": new_total,
            "payment_method": new_payment_method
        }
        response = wcapi.put(f"orders/{order_id}", wc_data)
        if response.status_code != 200:
            print(f"Error updating order in WooCommerce: {response.text}")
            return jsonify({"error": "Error updating order in WooCommerce"}), response.status_code

        return jsonify(order.serialize()), 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@api.route('/orders/in-progress', methods=['GET'])
@jwt_required()
def get_orders_in_progress():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 25, type=int)  # Cambiar a 25 por defecto
        filters = {
            "id": request.args.get('id', ''),
            "customer": request.args.get('customer', ''),
            "date_created": request.args.get('date_created', ''),
            "shipping_date": request.args.get('shipping_date', ''),
            "city": request.args.get('city', ''),
            "total": request.args.get('total', ''),
            "payment_method": request.args.get('payment_method', ''),
            "status": request.args.get('status', '')
        }

        query = Order.query.filter(Order.status != 'completed')

        if filters["id"]:
            query = query.filter(Order.id.like(f"%{filters['id']}%"))
        if filters["customer"]:
            query = query.join(Customer).filter((Customer.first_name + " " + Customer.last_name).ilike(f"%{filters['customer']}%"))
        if filters["date_created"]:
            query = query.filter(Order.date_created.like(f"%{filters['date_created']}%"))
        if filters["shipping_date"]:
            query = query.filter(Order.shipping_date.like(f"%{filters['shipping_date']}%"))
        if filters["city"]:
            query = query.join(Billing).filter(Billing.city.ilike(f"%{filters['city']}%"))
        if filters["total"]:
            query = query.filter(Order.total.like(f"%{filters['total']}%"))
        if filters["payment_method"]:
            query = query.filter(Order.payment_method.ilike(f"%{filters['payment_method']}%"))
        if filters["status"]:

            query = query.filter(Order.status.ilike(f"%{filters['status']}%"))

        # Obtener todas las órdenes sin paginación
        orders = query.all()
        total_orders = len(orders)

        # Aplicar paginación manualmente
        start = (page - 1) * per_page
        end = start + per_page
        paginated_orders = orders[start:end]

        serialized_orders = []
        for order in paginated_orders:
            serialized_order = order.serialize()
            date_created = datetime.strptime(serialized_order["date_created"], "%Y-%m-%dT%H:%M:%S")
            shipping_date = date_created + timedelta(days=9)
            serialized_order["shipping_date"] = shipping_date.isoformat()
            serialized_orders.append(serialized_order)

        return jsonify({"orders": serialized_orders, "total_orders": total_orders, "page": page, "per_page": per_page}), 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@api.route('/import-data', methods=['POST'])
@jwt_required()
def import_data():
    try:
        data = request.json
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        # Aquí puedes agregar la lógica para importar datos usando las fechas proporcionadas
        # Por ejemplo, podrías llamar a las funciones import_customers() e import_orders() con las fechas

        return jsonify({"message": "Datos importados correctamente"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/orders/<int:order_id>', methods=['DELETE'])
@jwt_required()
def delete_order(order_id):
    try:
        order = Order.query.get(order_id)
        if not order:
            return jsonify({"error": "Order not found"}), 404

        # Eliminar los artículos de línea asociados al pedido
        LineItem.query.filter_by(order_id=order_id).delete()

        # Eliminar el pedido de la base de datos local
        db.session.delete(order)
        db.session.commit()

        # Eliminar el pedido de WooCommerce
        response = wcapi.delete(f"orders/{order_id}", params={"force": True})
        if response.status_code != 200:
            print(f"Error deleting order in WooCommerce: {response.text}")
            return jsonify({"error": response.json().get("message", "Error deleting order in WooCommerce")}), response.status_code

        return jsonify({"msg": "Order deleted successfully"}), 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@api.route('/orders/bulk-delete', methods=['DELETE'])
@jwt_required()
def bulk_delete_orders():
    try:
        order_ids = request.json.get('order_ids', [])
        if not order_ids:
            return jsonify({"error": "No order IDs provided"}), 400

        for order_id in order_ids:
            order = Order.query.get(order_id)
            if not order:
                continue

            # Eliminar los artículos de línea asociados al pedido
            LineItem.query.filter_by(order_id=order_id).delete()

            # Eliminar el pedido de la base de datos local
            db.session.delete(order)

            # Eliminar el pedido de WooCommerce
            response = wcapi.delete(f"orders/{order_id}", params={"force": True})
            if response.status_code != 200:
                print(f"Error deleting order {order_id} in WooCommerce: {response.text}")

        db.session.commit()
        return jsonify({"msg": "Orders deleted successfully"}), 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@api.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    print(f"Login attempt for email: {email}") 

    user = User.query.filter_by(email=email, password=password).first()
    if user:
        try:
            
            
            access_token = create_access_token(identity= user.email,expires_delta=timedelta(days=1))
            print(f"Login successful for email: {email}")  
            return jsonify(access_token=access_token), 200
            
        except ValueError as e:
            print(f"Invalid password hash: {e}") 
            return jsonify({"msg": "Invalid password hash"}), 500
    else:
        print("Invalid credentials")  
        return jsonify({"msg": "Invalid credentials"}), 401

          
@api.route('/protected', methods=['GET'])
@jwt_required()

def protected():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200

@api.route('/orders/<int:order_id>/status', methods=['PUT'])
@jwt_required()
@cross_origin()  # Agregar esta línea para permitir CORS en esta ruta
def update_order_status(order_id):
	try:
		data = request.json
		status = data.get('status')
		if status is None:
			return jsonify({"msg": "Status is required"}), 400

		order = Order.query.get(order_id)
		if not order:
			return jsonify({"msg": "Order not found"}), 404

		order.status = status
		db.session.commit()

		# Actualizar el estado en WooCommerce
		wc_data = {"status": status}
		wc_response = wcapi.put(f"orders/{order_id}", wc_data)
		if wc_response.status_code != 200:
			print(f"Error updating order in WooCommerce: {wc_response.text}")
			return jsonify({"error": "Error updating order in WooCommerce"}), wc_response.status_code

		return jsonify(order.serialize()), 200
	except Exception as e:
		return jsonify({"msg": str(e)}), 500

@api.route('/orders/<int:order_id>/shipping-status', methods=['PUT'])
@jwt_required()
@cross_origin()  # Agregar esta línea para permitir CORS en esta ruta
def update_order_shipping_status(order_id):
	try:
		data = request.json
		status = data.get('status')
		if status is None:
			return jsonify({"msg": "Status is required"}), 400

		order = Order.query.get(order_id)
		if not order:
			return jsonify({"msg": "Order not found"}), 404

		order.shipping_status = status
		order.shipping_date = data.get('date')
		db.session.commit()

		return jsonify(order.serialize()), 200
	except Exception as e:
		return jsonify({"msg": str(e)}), 500
# app.register_blueprint(api, url_prefix='/api')

# if __name__ == "__main__":
#     api.run()
