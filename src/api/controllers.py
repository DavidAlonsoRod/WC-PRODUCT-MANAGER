from api.models import Order

def get_order_by_id(order_id):
    try:
        order = Order.query.get(order_id)
        if order:
            return order.serialize()  # Asegúrate de que el modelo Order tenga un método serialize
        else:
            return None
    except Exception as e:
        print(f"Error al obtener la orden: {str(e)}")
        return None