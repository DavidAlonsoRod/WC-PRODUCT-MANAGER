import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Tab, Tabs } from 'react-bootstrap';
import "../../styles/orderlist.css";

const OrdersInProgress = () => {
    const [orders, setOrders] = useState([]);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [totalOrders, setTotalOrders] = useState(0);
    const [customerId, setCustomerId] = useState(null);
    const [filters, setFilters] = useState({
        id: '',
        customer: '',
        date_created: '',
        shipping_date: '',
        city: '',
        total: '',
        payment_method: '',
        status: ''
    });
    const [sortOrder, setSortOrder] = useState('desc');
    const [sortBy, setSortBy] = useState('date_created');
    const [selectedOrders, setSelectedOrders] = useState([]);
    const navigate = useNavigate();

    const formatDate = (dateString) => {
        if (!dateString) return 'Fecha no disponible';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 0) {
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMinutes = Math.floor(diffMs / (1000 * 60)) % 60;
            if (diffHours > 0) {
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

    const getShippingDateClass = (shippingDate) => {
        if (!shippingDate) return 'btn-small';
        const date = new Date(shippingDate);
        const now = new Date();
        const diffMs = date - now;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays <= 0) {
            return 'btn btn-urgent btn-small';
        } else if (diffDays <= 3) {
            return 'btn btn-warning btn-small';
        } else {
            return 'btn btn-success btn-small';
        }
    };

    const paymentMethods = [
        "PayPal",
        "Credit Card",
        "Bank Transfer",
        // A��adir más métodos de pago según sea necesario
    ];

    const orderStatuses = [
        "on-hold",
        "processing",
        "completed",
        "pending",
        "cancelled",
        // Añadir más estados según sea necesario
    ];

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
                const endpoint = `${process.env.BACKEND_URL}/api/orders/in-progress`;
                const response = await axios.get(endpoint, { params });

                setOrders(response.data.orders || []);
                setTotalOrders(response.data.total_orders || 0);
            } catch (error) {
                setOrders([]);
            }
        };

        fetchOrders();
        const intervalId = setInterval(fetchOrders, 300000); // Actualizar cada 5 minutos

        return () => clearInterval(intervalId); // Limpiar el intervalo al desmontar el componente
    }, [page, perPage, customerId]);

    const handleRowClick = (orderId) => {
        navigate(`/orders/${orderId}`);
    };

    const handlePageClick = (pageNumber) => {
        setPage(pageNumber);
    };

    const handleCustomerChange = (event) => {
        setCustomerId(event.target.value);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({
            ...filters,
            [name]: value
        });
    };

    const handleDateChange = (name, value) => {
        setFilters({
            ...filters,
            [name]: value
        });
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const handleSelectOrder = (orderId) => {
        setSelectedOrders(prevSelectedOrders =>
            prevSelectedOrders.includes(orderId)
                ? prevSelectedOrders.filter(id => id !== orderId)
                : [...prevSelectedOrders, orderId]
        );
    };

    const handleBatchAction = () => {
        // Realizar la acción deseada con los pedidos seleccionados
        console.log('Pedidos seleccionados:', selectedOrders);
        // Ejemplo: cambiar el estado de los pedidos seleccionados
        // axios.post('/api/orders/batch-update', { orderIds: selectedOrders, newStatus: 'completed' });
    };

    const filteredOrders = orders.filter(order => {
        return (
            (filters.id === '' || order.id.toString().includes(filters.id)) &&
            (filters.customer === '' || (order.billing && `${order.billing.first_name} ${order.billing.last_name}`.toLowerCase().includes(filters.customer.toLowerCase()))) &&
            (filters.date_created === '' || formatDate(order.date_created).includes(filters.date_created)) &&
            (filters.shipping_date === '' || formatDate(order.shipping_date).includes(filters.shipping_date)) &&
            (filters.city === '' || (order.billing && order.billing.city.toLowerCase().includes(filters.city.toLowerCase()))) &&
            (filters.total === '' || order.total.toString().includes(filters.total)) &&
            (filters.payment_method === '' || order.payment_method.toLowerCase().includes(filters.payment_method.toLowerCase())) &&
            (filters.status === '' || order.status.toLowerCase().includes(filters.status.toLowerCase()))
        );
    });

    const sortedOrders = [...filteredOrders].sort((a, b) => {
        const fieldA = sortBy === 'total' ? parseFloat(a[sortBy]) : a[sortBy];
        const fieldB = sortBy === 'total' ? parseFloat(b[sortBy]) : b[sortBy];
        return sortOrder === 'asc' ? (fieldA > fieldB ? 1 : -1) : (fieldA < fieldB ? 1 : -1);
    });

    const totalPages = Math.ceil(totalOrders / perPage);

    return (
        <div>
            <Tabs
                activeKey="inProgressOrders"
                onSelect={(k) => navigate(k === "inProgressOrders" ? "/orders-in-progress" : "/orders")}
                id="order-tabs"
                className="m-3 custom-tabs"
            >
                <Tab eventKey="allOrders" title="Todos los Pedidos">
                    <div className='border rounded-3 m-5 justify-content-center'>
                        <p>Redirigiendo a Todos los Pedidos...</p>
                    </div>
                </Tab>
                <Tab eventKey="inProgressOrders" title="Pedidos en Proceso">
                    <div className='border rounded-3 m-5 justify-content-center'>

                        <button onClick={handleBatchAction} className="btn btn-primary m-3">Realizar acción en pedidos seleccionados</button>
                        <table className='table caption-top'>
                            <caption className='p-3'>Pedidos en Proceso</caption>
                            <thead className='bg-light'>
                                <tr>
                                    <th>
                                        <input
                                            type="checkbox"
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedOrders(orders.map(order => order.id));
                                                } else {
                                                    setSelectedOrders([]);
                                                }
                                            }}
                                            checked={selectedOrders.length === orders.length}
                                        />
                                    </th>
                                    <th>
                                        ID
                                        <button onClick={() => handleSort('id')} className="btn btn-link">
                                            ID {sortBy === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
                                        </button>
                                        <input
                                            type="text"
                                            name="id"
                                            value={filters.id}
                                            onChange={handleFilterChange}
                                            className="form-control"
                                        />
                                    </th>
                                    <th>
                                        Cliente
                                        <input
                                            type="text"
                                            name="customer"
                                            value={filters.customer}
                                            onChange={handleFilterChange}
                                            className="form-control"
                                        />
                                    </th>
                                    <th>
                                        Fecha creación
                                        <input
                                            type="date"
                                            name="date_created"
                                            value={filters.date_created}
                                            onChange={(e) => handleDateChange('date_created', e.target.value)}
                                            className="form-control"
                                        />
                                    </th>
                                    <th>
                                        Salida estimada
                                        <input
                                            type="date"
                                            name="shipping_date"
                                            value={filters.shipping_date}
                                            onChange={(e) => handleDateChange('shipping_date', e.target.value)}
                                            className="form-control"
                                        />
                                    </th>
                                    <th>
                                        Ciudad
                                        <input
                                            type="text"
                                            name="city"
                                            value={filters.city}
                                            onChange={handleFilterChange}
                                            className="form-control"
                                        />
                                    </th>
                                    <th>
                                        Total
                                        <button onClick={() => handleSort('total')} className="btn btn-link">
                                            Total {sortBy === 'total' && (sortOrder === 'asc' ? '↑' : '↓')}
                                        </button>
                                    </th>
                                    <th>
                                        Forma de pago
                                        <select
                                            name="payment_method"
                                            value={filters.payment_method}
                                            onChange={handleFilterChange}
                                            className="form-control"
                                        >
                                            <option value="">Todas</option>
                                            {paymentMethods.map(method => (
                                                <option key={method} value={method}>
                                                    {method}
                                                </option>
                                            ))}
                                        </select>
                                    </th>
                                    <th>
                                        Estado
                                        <select
                                            name="status"
                                            value={filters.status}
                                            onChange={handleFilterChange}
                                            className="form-control"
                                        >
                                            <option value="">Todos</option>
                                            {orderStatuses.map(status => (
                                                <option key={status} value={status}>
                                                    {translateStatus(status)}
                                                </option>
                                            ))}
                                        </select>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedOrders.map(order => (
                                    <tr
                                        key={order.id}
                                        className='fw-light'
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleRowClick(order.id)}
                                    >
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedOrders.includes(order.id)}
                                                onChange={() => handleSelectOrder(order.id)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </td>
                                        <td className='fw-light'>{order.id}</td>
                                        <td>
                                            {order.billing ? `${order.billing.first_name} ${order.billing.last_name}` : 'N/A'}
                                            <br />
                                            <small>{order.billing.company}</small>
                                        </td>
                                        <td>{formatDate(order.date_created)}</td>
                                        <td className={getShippingDateClass(order.shipping_date)}>{formatDate(order.shipping_date)}</td>
                                        <td>{order.billing.city}</td>
                                        <td>{order.total}</td>
                                        <td>{order.payment_method_title}</td>
                                        <td>
                                            <button className={getStatusClass(order.status)}>
                                                {translateStatus(order.status)}
                                            </button>
                                        </td>
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
                </Tab>
            </Tabs>
        </div>
    );
};

export default OrdersInProgress;