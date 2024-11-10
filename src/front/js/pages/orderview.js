import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import "../../styles/orderview.css";

const OrderView = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [error, setError] = useState(null); // Estado para manejar errores
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await axios.get(`${process.env.BACKEND_URL}/api/orders/${orderId}`);
                setOrder(response.data);
            } catch (error) {
                setError('Error al cargar la orden.'); // Establecer mensaje de error
                setOrder(null);
            }
        };

        fetchOrder();
    }, [orderId]);

    if (error) {
        return <div>{error}</div>; // Mostrar mensaje de error
    }

    if (!order) {
        return <div>un poquillo de paciencia...🥰</div>;
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'Fecha no disponible';
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const translateStatus = (status) => {
        switch (status) {
            case 'on-hold':
                return 'En espera';
            case 'processing':
                return 'Procesando';
            case 'completed':
                return 'Completado';
            case 'pending':
                return 'Pendiente de pago';
            case 'cancelled':
                return 'Cancelado';
            default:
                return status;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'on-hold':
                return 'btn btn-warning';
            case 'processing':
                return 'btn btn-success';
            case 'completed':
                return 'btn btn-primary';
            case 'pending':
                return 'btn btn-secondary';
            case 'cancelled':
                return 'btn btn-light';
            default:
                return '';
        }
    };

    return (
        <div className='order-view m-5'>
            <h1>{order.id}</h1>
            <div className='d-flex justify-content-start'>

            
            <div className='order-details m-2'>
              
                <p><strong>{order.billing ? `${order.billing.first_name} ${order.billing.last_name}` : 'N/A'}</strong></p>
                <p>Fecha pedido: {formatDate(order.date_created)}</p>
                <p>Envío estimado: {formatDate(order.shipping_date)}</p>
                
            </div>
            <div className='order-details  justify-content-end m-2'>
              
             
                <p> {order.billing.city}</p>
                
                <p><strong>Método de Pago:</strong> {order.payment_method_title}</p>
                <p>
                    <button className={getStatusClass(order.status)}>
                        {translateStatus(order.status)}
                    </button>
                </p>
            </div>
            </div>
            <h2>Artículos de Línea</h2>
            <table className='table'>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Cantidad</th>
                        <th>Precio</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {order.line_items.map(item => (
                        <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>{item.name}</td>
                            <td>{item.quantity}</td>
                            <td>{item.subtotal}</td>
                            <td>{item.total}</td>
                        </tr>
                    ))}
                    <tr>
                        <td colSpan="4">Total:</td>
                        <td colSpan="3"><strong>{order.total}</strong></td>
                    </tr>
                </tbody>
            </table>
            <button onClick={() => navigate(-1)} className='btn btn-secondary'>Volver</button>
        </div>
    );
};

export default OrderView;