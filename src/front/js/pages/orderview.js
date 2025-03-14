import React, { useEffect, useState, useContext } from 'react';
import { Context } from '../store/appContext';
import { useParams, useNavigate } from 'react-router-dom';
import "../../styles/orderview.css";

const OrderView = () => {
    const { orderId } = useParams();
    const { store, actions } = useContext(Context);
    const [error, setError] = useState(null); // Estado para manejar errores
    const navigate = useNavigate();
    const pdfPrintUrl = `https://www.almabooks.es/wp-admin/post.php?post=${orderId}&action=edit`;

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found");
            navigate("/");
            return;
        }
        actions.getOrder(orderId).catch(() => {
            setError('Error al cargar la orden.');
        });
    }, [orderId, actions, navigate]);

    if (error) {
        return <div>{error}</div>;
    }

    if (!store.order) {
        return <div className='m-3'>Cargando...</div>;
    }

    const order = store.order;

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
        <body className='mx-5 mt-1 h-80'>


            <div className='order-view'>
                <div className='flex justify-between'>
                    <div className=''>
                        <h4>Pedido</h4>
                        <h2 className='mt-0'> {order.id}</h2 >

                    </div>


                    <div className='customer-details'>
                        <div className='order-details'>
                            <p className='large-text'><strong>{order.billing ? `${order.billing.first_name} ${order.billing.last_name}` : 'N/A'}</strong></p>
                            <p className='small-text'>Fecha de Creación:</p>
                            <p className='large-text'>{formatDate(order.date_created)}</p>
                            <p><strong>Fecha de Envío:</strong></p>
                            <p> {formatDate(order.shipping_date)}</p>
                            <p><strong>Ciudad:</strong> {order.billing.city}</p>
                            <p><strong>Método de Pago:</strong> {order.payment_method_title}</p>
                            <p><strong>Estado:</strong>
                                <button className={getStatusClass(order.status)}>
                                    {translateStatus(order.status)}
                                </button>
                            </p>
                        </div>
                        <div className='order-actions'>
                            <button onClick={() => window.open(pdfPrintUrl, '_blank')} className='btn btn-primary'>Ver detalles del pedido</button>
                            <button className='btn btn-danger m-2'>Eliminar no funciona (aún)</button>
                        </div>
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
                                <td>{item.price}</td>
                                <td>{item.total}</td>
                            </tr>
                        ))}
                        <tr>
                            <td colSpan="4"><strong>Total</strong></td>
                            <td><strong>{order.total}</strong></td>
                        </tr>
                    </tbody>
                </table>
                <button onClick={() => navigate(-1)} className='btn btn-secondary'>Volver</button>
            </div >
        </body >
    );
};

export default OrderView;