import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError
from api.models import LineItem, Order, engine
from flask import current_app

def insert_line_item(line_item_data):
    order_id = line_item_data['order_id']
    
    Session = sessionmaker(bind=engine)
    session = Session()

    with current_app.app_context():
        with session.no_autoflush:
            # Verificar si el order_id existe en la tabla Order
            order_exists = session.query(Order).filter_by(id=order_id).first()
            if not order_exists:
                print(f"Error: El order_id {order_id} no existe en la tabla Order.")
                return
            
            line_item = LineItem(**line_item_data)
            session.add(line_item)
        
        try:
            session.commit()
        except IntegrityError as e:
            session.rollback()
            print(f"Error al insertar el artículo de línea: {e}")

# Ejemplo de datos de artículo de línea
line_item_data = {
    'id': 91319,
    'name': 'Pack bolsa Suede + copias',
    'product_id': 47692,
    'variation_id': 0,
    'quantity': 1,
    'tax_class': '',
    'subtotal': '34.60',
    'subtotal_tax': '7.27',
    'total': '34.60',
    'total_tax': '7.27',
    'order_id': 260576,
    'qr_code': 'iVBORw0KGgoAAAANSUhEUgAAASIAAAEiAQAAAAB1xeIbAAABg0lEQVR4nO2YQYrjMBBFX7UFs1QgB8hR5KPbR8kNrOWAwp+FLJH0LLoX3ZZjqxaFUzzwQ1RkqUx8HfPHNyDoVKc61alO7Z2yNRzMl...'
}

# Asegúrate de que este código se ejecute dentro del contexto de la aplicación
if __name__ == "__main__":
    from api.app import app
    with app.app_context():
        insert_line_item(line_item_data)