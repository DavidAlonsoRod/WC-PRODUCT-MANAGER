import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../../styles/customerlist.css";

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [totalOrders, setTotalOrders] = useState(0);
    const [sortOrder, setSortOrder] = useState('desc');
    const [sortBy, setSortBy] = useState('id');
    const [customerName, setCustomerName] = useState('');
    const [customers, setCustomers] = useState([]);
    const navigate = useNavigate();

    // Definir orderStatuses y orderCountByStatus
    const orderStatuses = ['on-hold', 'processing', 'completed', 'pending', 'cancelled'];
    const orderCountByStatus = orderStatuses.reduce((acc, status) => {
        acc[status] = orders.filter(order => order.status === status).length;
        return acc;
    }, {});

    useEffect(() => {
        fetchOrders();
    }, [page, perPage, sortBy, sortOrder]);

    const fetchOrders = async () => {
        try {
            const params = {
                page: page,
                per_page: perPage,
                sort_by: sortBy,
                sort_order: sortOrder
            };
            const response = await axios.get(`${process.env.BACKEND_URL}/api/orders`, { params });

            setOrders(response.data.orders || []);
            setTotalOrders(response.data.total_orders || 0);
        } catch (error) {
            setOrders([]);
        }
    };

    const fetchCustomers = async (name) => {
        try {
            const response = await axios.get(`${process.env.BACKEND_URL}/api/customers`, {
                params: { name }
            });
            setCustomers(response.data);
        } catch (error) {
            setCustomers([]);
        }
    };

    const handleRowClick = (orderId) => {
        navigate(`/orders/${orderId}`);
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handlePerPageChange = (event) => {
        setPerPage(event.target.value);
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const handleCustomerNameChange = (event) => {
        const name = event.target.value;
        setCustomerName(name);
        fetchCustomers(name);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Fecha no disponible';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 0) {
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMinutes = Math.floor(diffMs / (1000 * 60)) % 60;
            if (diffHours > 1) {
                return `${diffHours} horas`;
            } else {
                return `${diffMinutes} minutos`;
            }
        }
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return date.toLocaleDateString(undefined, options);
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
                return 'btn btn-warning btn-small';
            case 'processing':
                return 'btn btn-success btn-small';
            case 'completed':
                return 'btn btn-primary btn-small';
            case 'pending':
                return 'btn btn-secondary btn-small';
            case 'cancelled':
                return 'btn btn-light btn-small'; 
            default:
                return 'btn-small';
        }
    };

    const handleDownloadPDF = async (orderId) => {
        try {
            const response = await axios.get(`${process.env.BACKEND_URL}/api/orders/${orderId}/pdf`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `order_${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error('Error downloading PDF:', error);
        }
    };

    return (
        <div>
            <div className='border rounded-3 m-5 justify-content-center'>
                <div className="m-3">
                    <input
                        type="text"
                        placeholder="Buscar cliente por nombre"
                        value={customerName}
                        onChange={handleCustomerNameChange}
                    />
                    <ul>
                        {customers.map(customer => (
                            <li key={customer.id}>{customer.name}</li>
                        ))}
                    </ul>
                    {/* ...existing code... */}
                </div>
                <table className='table caption-top'>
                    <caption className='p-3'>Pedidos</caption>
                    <thead className='bg-light'>
                        <tr>
                            <th>
                                Nº PEDIDO
                                <button onClick={() => handleSort('id')} className="btn btn-link">
                                    Ordenar{sortBy === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </button>
                            </th>
                            <th>Cliente</th>
                            <th>Fecha creación</th>
                            <th>Salida estimada</th>
                            <th>Ciudad</th>
                            <th>Subtotal</th>
                            <th>
                                Total
                                <button onClick={() => handleSort('total')} className="btn btn-link">
                                    Total {sortBy === 'total' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </button>
                            </th>
                            <th>Forma de pago</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan="8">
                                <strong>Resumen de Estados:</strong>
                                {orderStatuses.map(status => (
                                    <span key={status} className="badge bg-secondary m-1">
                                        {translateStatus(status)}: {orderCountByStatus[status] || 0}
                                    </span>
                                ))}
                            </td>
                        </tr>
                        {orders.map(order => (
                            <tr
                                key={order.id}
                                className='fw-light'
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleRowClick(order.id)}
                            >
                                <td className='fw-light'>{order.id}</td>
                                <td>
                                    {order.billing ? `${order.billing.first_name} ${order.billing.last_name}` : 'N/A'}
                                    <br />
                                    <small>{order.billing.company}</small>
                                </td>
                                <td>{formatDate(order.date_created)}</td>
                                <td>{formatDate(order.shipping_date)}</td>
                                <td>{order.billing.city}</td>
                                <td>{order.sub_total}</td>
                                <td>{order.total}</td>
                                <td>{order.payment_method_title}</td>
                                <td>
                                    <button className={getStatusClass(order.status)}>
                                        {translateStatus(order.status)}
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDownloadPDF(order.id); }} className="btn btn-link">
                                        Descargar PDF
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div>
                    <label>
                        Pedidos por página:
                        <select value={perPage} onChange={handlePerPageChange}>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value={200}>200</option>
                        </select>
                    </label>
                    <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
                        Atrás
                    </button>
                    <button onClick={() => handlePageChange(page + 1)} disabled={page * perPage >= totalOrders}>
                        Siguiente
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Orders;