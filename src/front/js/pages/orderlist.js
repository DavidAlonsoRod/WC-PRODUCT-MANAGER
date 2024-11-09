import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../../styles/customerlist.css";

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [totalOrders, setTotalOrders] = useState(0);
    const [customerId, setCustomerId] = useState(null); // Nuevo estado para el filtro de cliente
    const navigate = useNavigate();

    const formatDate = (dateString) => {
        if (!dateString) return 'Fecha no disponible';
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const params = {
                    page: page,
                    per_page: perPage,
                };
                if (customerId) {
                    params.customer_id = customerId;
                }
                const response = await axios.get(`${process.env.BACKEND_URL}/api/orders`, { params });

                setOrders(response.data.orders || []);
                setTotalOrders(response.data.total_orders || 0);
            } catch (error) {
                setOrders([]);
            }
        };

        fetchOrders();
    }, [page, perPage, customerId]); // Añadir customerId a las dependencias

    const handleRowClick = (orderId) => {
        navigate(`/order/${orderId}`);
    };
    const handlePageClick = (pageNumber) => {
        setPage(pageNumber);
    };
    const handleCustomerChange = (event) => {
        setCustomerId(event.target.value);
    };

    const totalPages = Math.ceil(totalOrders / perPage);

    return (
        <div>
            <div className='border rounded-3 m-5 justify-content-center'>
                <div className="m-3">
                    <label htmlFor="customerFilter">Filtrar por Cliente ID:</label>
                    <input
                        type="number"
                        id="customerFilter"
                        value={customerId || ''}
                        onChange={handleCustomerChange}
                        className="form-control"
                    />
                </div>
                <table className='table caption-top'>
                    <caption className='p-3'>Pedidos</caption>
                    <thead className='bg-light'>
                        <tr>
                            <th>ID</th>
                            <th>Cliente</th>
                            <th>Nombre comercial</th>
                            <th>Fecha creación</th>
                            <th>Salida estimada</th>
                            <th>Ciudad</th>
                            <th>Total</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr
                                key={order.id}
                                className='fw-light'
                                onClick={() => handleRowClick(order.id)}
                                style={{ cursor: 'pointer' }}
                            >
                                <td className='fw-light'>{order.id}</td>
                                <td>{order.billing ? `${order.billing.first_name} ${order.billing.last_name}` : 'N/A'}</td>
                                <td>{order.billing.company}</td>
                                <td>{formatDate(order.date_created)}</td>
                                <td>{formatDate(order.shipping_date)}</td>
                                <td>{order.billing.city}</td>
                                <td>{order.total}</td>
                                <td>{order.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="d-flex justify-content-end m-2 pagination">
                    {Array.from({ length: totalPages }, (_, index) => (
                        <span
                            key={index + 1}
                            onClick={() => handlePageClick(index + 1)}
                            style={{
                                cursor: 'pointer',
                                fontWeight: page === index + 1 ? 'bold' : 'normal',
                                margin: '0 5px'
                            }}
                        >
                            {index + 1}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Orders;