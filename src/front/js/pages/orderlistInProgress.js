import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Tab, Tabs } from 'react-bootstrap';
import "../../styles/orderlist.css";
import { formatDate, getShippingDateClass } from '../utils/dateUtils';

const OrdersInProgress = () => {
    const [orders, setOrders] = useState([]);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(25);
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
    const [sortOrder, setSortOrder] = useState('asc');
    const [sortBy, setSortBy] = useState('date_created');
    const [selectedOrders, setSelectedOrders] = useState([]);
    const navigate = useNavigate();

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
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found");
            navigate("/");
            return;
        }

    }, []);


    const getStatusClass = (status) => {
        switch (status) {
            case 'on-hold':
                return 'btn btn-warning btn-small';
            case 'processing':
                return 'btn btn-success btn-small';
            case 'completed':
                return 'btn btn-completed btn-small';
            case 'pending':
                return 'btn btn-secondary btn-small';
            case 'cancelled':
                return 'btn btn-light btn-small';
            default:
                return 'btn-small';
        }
    };

    const getShippingStatusClass = (status) => {
        switch (status) {
            case 'pte-envio':
                return 'btn btn-warning btn-small';
            case 'enviado':
                return 'btn btn-completed btn-small';
            case 'envio parcial':
                return 'btn btn-secondary btn-small';
            default:
                return 'btn-small';
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

    const shippingStatuses = [
        "pte-envio",
        "enviado",
        "envio parcial"
    ];

    useEffect(() => {
        let isMounted = true; // Variable para controlar si el componente está montado
        const token = localStorage.getItem("token"); // Definir la variable token

        const fetchOrders = async () => {
            if (!isMounted) return; // Evitar múltiples solicitudes
            try {
                const params = new URLSearchParams({
                    page: String(page),
                    per_page: String(perPage),
                    ...Object.fromEntries(Object.entries(filters).map(([key, value]) => [key, value ? String(value) : '']))
                });
                if (customerId) {
                    params.append('customer_id', String(customerId));
                }
                const headers = {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }

                const endpoint = `${process.env.BACKEND_URL}/api/orders/in-progress?${params.toString()}`;
                const response = await axios.get(endpoint, { headers });

                if (isMounted) { // Solo actualizar el estado si el componente está montado
                    setOrders(response.data.orders || []);
                    setTotalOrders(response.data.total_orders || 0);
                }
            } catch (error) {
                if (isMounted) { // Solo actualizar el estado si el componente está montado
                    console.error("Error fetching orders:", error.response ? error.response.data : error.message);
                    setOrders([]);
                }
            }
        };

        fetchOrders();
        const intervalId = setInterval(fetchOrders, 300000); // Actualizar cada 5 minutos

        return () => {
            isMounted = false; // Marcar el componente como desmontado
            clearInterval(intervalId); // Limpiar el intervalo al desmontar el componente
        };
    }, [page, perPage, customerId, filters]); // Añadir filtros a las dependencias

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

    const handleDeleteOrders = async () => {
        try {
            for (const orderId of selectedOrders) {
                await axios.delete(`${process.env.BACKEND_URL}/api/orders/${orderId}`);
            }
            setSelectedOrders([]);
            fetchOrders(); // Refrescar la lista de pedidos
        } catch (error) {
            console.error("Error deleting orders:", error.response ? error.response.data : error.message);
        }
    };

    const handlePerPageChange = (event) => {
        setPerPage(parseInt(event.target.value));
        setPage(1); // Reiniciar a la primera página al cambiar el número de elementos por p��gina
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
                className="m-5 custom-tabs custom-tabs-margin"
            >
                <Tab eventKey="allOrders" title="Todos los Pedidos">
                    <div className='border rounded-3 m-5 justify-content-center'>
                        <p>Redirigiendo a Todos los Pedidos...</p>
                    </div>
                </Tab>
                <Tab eventKey="inProgressOrders" title="Pedidos en Proceso">
                    <div className='border rounded-3 m-5 justify-content-center'>

                        <button onClick={handleBatchAction} className="btn btn-primary m-3">Realizar acción en pedidos seleccionados</button>
                        <button onClick={handleDeleteOrders} className="btn btn-danger m-3">Borrar pedidos seleccionados</button>
                        <div className="d-flex justify-content-between align-items-center m-3">
                            <div>

                                <label htmlFor="perPageSelect">Mostrar:</label>
                                <select id="perPageSelect" value={perPage} onChange={handlePerPageChange} className="form-select d-inline-block w-auto ms-2">
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                            <div className="pagination">
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
                                        <span className="ms-2">({selectedOrders.length})</span>
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
                                    <th>
                                        Estado de Envío
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
                                        <td>
                                            <button className={getShippingStatusClass(order.shipping_status)}>
                                                {order.shipping_status === 'enviado' || order.shipping_status === 'envio parcial'
                                                    ? formatDate(order.shipping_date)
                                                    : order.shipping_status}
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