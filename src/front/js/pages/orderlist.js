import React, { useEffect, useState, useContext } from 'react';
import { Context } from '../store/appContext';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import "../../styles/orderlist.css";
import { Tab, Tabs } from 'react-bootstrap';
import ReactPaginate from 'react-paginate';
import { formatDate, getShippingDateClass } from '../utils/dateUtils';

function Orders() {
    const { store, actions } = useContext(Context);
    const [page, setPage] = useState(0);
    const [perPage, setPerPage] = useState(20);
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
    const [sortBy, setSortBy] = useState('id');
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('completed');
    const [selectedShippingStatus, setSelectedShippingStatus] = useState('pte-envio');
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
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found");
            navigate("/");
            return;
        }

        actions.startOrderUpdateInterval();

        return () => {
            actions.stopOrderUpdateInterval();
        };
    }, []);



    const paymentMethods = [
        "PayPal",
        "Credit Card",
        "Bank Transfer",

    ];

    const orderStatuses = [
        "on-hold",
        "processing",
        "completed",
        "pending",
        "cancelled",

    ];

    const shippingStatuses = [
        "pte-envio",
        "enviado",
        "envio parcial"
    ];

    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No token found");
                navigate("/");
                return;
            }
            try {
                await actions.getOrders(page, perPage, customerId, filters);
            }
            catch (error) {
                console.error("Error fetching orders:", error.response ? error.response.data : error.message);
            }
        };
        fetchOrders();
    }, [page, perPage, customerId, filters]);

    const filteredOrders = store.orders.filter(order => {
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

    const sortedOrders = filteredOrders ? [...filteredOrders].sort((a, b) => b.id - a.id) : []; // Ordenar por ID de mayor a menor

    const handleRowClick = (orderId) => {
        navigate(`/orders/${orderId}`);
    };

    const handlePageClick = ({ selected }) => {
        console.log('pageNumber:', selected);
        setPage(selected + 1); // Incrementar el número de página en 1
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
        setSelectedOrders(prevSelectedOrders => prevSelectedOrders.includes(orderId)
            ? prevSelectedOrders.filter(id => id !== orderId)
            : [...prevSelectedOrders, orderId]
        );
    };

    const handleBatchAction = () => {

        console.log('Pedidos seleccionados:', selectedOrders);

    };

    const handleDeleteOrders = async () => {
        if (window.confirm("¿Seguro que quieres borrar estos pedidos?? Pues tú mismo, pero esto no se puede deshacer.")) {
            try {
                await actions.deleteOrders(selectedOrders);
                alert("Pedidos borrados correctamente.");
            } catch (error) {
                console.error("Error borrando pedidos:", error.response ? error.response.data : error.message);
            }
        }
    };

    const handleForceUpdateOrders = async () => {
        try {
            await actions.importOrders();
            await actions.getOrders(page, perPage, customerId, filters); º
        } catch (error) {
            console.error("Error updating orders:", error.response ? error.response.data : error.message);
        }
    };

    const handleBatchUpdateStatus = async () => {
        try {
            await Promise.all(selectedOrders.map(orderId =>
                actions.updateOrderStatus(orderId, selectedStatus)
            ));
            setSelectedOrders([]);
            alert("Estados de las órdenes actualizados correctamente.");
        } catch (error) {
            console.error("Error al actualizar los estados de las órdenes:", error);
            alert("Error al actualizar los estados de las órdenes.");
        }
    };

    const handleBatchUpdateShippingStatus = async () => {
        try {
            await Promise.all(selectedOrders.map(orderId =>
                actions.updateOrderShippingStatus(orderId, selectedShippingStatus)
            ));
            setSelectedOrders([]);
            alert("Estados de envío actualizados correctamente.");
        } catch (error) {
            console.error("Error al actualizar los estados de envío:", error);
            alert("Error al actualizar los estados de envío.");
        }
    };

    const handleShippingStatusChange = async (orderId, newStatus) => {
        try {
            const currentDate = new Date().toISOString();
            await actions.updateOrderShippingStatus(orderId, newStatus, currentDate);
            await actions.getOrders(page, perPage, customerId, filters);
        } catch (error) {
            console.error("Error updating shipping status:", error.response ? error.response.data : error.message);
        }
    };

    const totalPages = Math.ceil(store.totalOrders / perPage) || 1;

    return (
        <div>
            <Tabs
                activeKey="allOrders"
                onSelect={(k) => navigate(k === "allOrders" ? "/orders" : "/orders-in-progress")}
                id="order-tabs"
                className="m-5 mb-0 custom-tabs custom-tabs-margin"
            >
                <Tab className='m-3 ms-0 mt-0 pb-3' eventKey="allOrders" title="Todos los Pedidos">
                    <div className='border rounded-3 m-5 mt-0 pt-5 justify-content-center no-border-top no-rounded-top'>
                        <button onClick={handleDeleteOrders} className="btn btn-alert  m-3">Borrar pedidos seleccionados</button>
                        <button onClick={handleForceUpdateOrders} className="btn btn-primary m-3">Actualizar órdenes</button>
                        <div className='d-flex ms-1 gap-5'>
                            <div className="d-flex align-items-center ms-1 ">
                                <label htmlFor="statusSelector" className="status-selector">Cambiar estado a:</label>
                                <select
                                    id="statusSelector"
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="custom-select"
                                >
                                    <option value="completed">Completado</option>
                                    <option value="processing">Procesando</option>
                                    <option value="on-hold">En espera</option>
                                    <option value="pending">Pendiente de pago</option>
                                    <option value="cancelled">Cancelado</option>
                                </select>
                                <button onClick={handleBatchUpdateStatus} className="btn btn-success ms-2">Actualizar estado</button>
                            </div>
                            <div className="d-flex align-items-center ms-1">
                                <label htmlFor="shippingStatusSelector" className="status-selector">Cambiar estado de envío a:</label>
                                <select
                                    id="shippingStatusSelector"
                                    value={selectedShippingStatus}
                                    onChange={(e) => setSelectedShippingStatus(e.target.value)}
                                    className="custom-select"
                                >
                                    <option value="pte-envio">Pte Envío</option>
                                    <option value="enviado">Enviado</option>
                                    <option value="envio parcial">Envío Parcial</option>
                                </select>
                                <button onClick={handleBatchUpdateShippingStatus} className="btn btn-success ms-2">Actualizar estado de envío</button>
                            </div>
                        </div>
                        <table className="table caption-top mt-3">

                            <thead className='table-header'>
                                <tr>
                                    <th className='table-header'>
                                        <input
                                            type="checkbox"
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedOrders(store.orders.map(order => order.id));
                                                } else {
                                                    setSelectedOrders([]);
                                                }
                                            }}
                                            checked={selectedOrders.length === store.orders.length} />
                                    </th>
                                    <th className='table-header'>
                                        ID
                                        <button onClick={() => handleSort('id')} className="btn btn-link">
                                            ID {sortBy === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
                                        </button>
                                        <input
                                            type="text"
                                            name="id"
                                            value={filters.id}
                                            onChange={handleFilterChange}
                                            className="form-control" />
                                    </th>
                                    <th className='table-header'>
                                        Cliente
                                        <input
                                            type="text"
                                            name="customer"
                                            value={filters.customer}
                                            onChange={handleFilterChange}
                                            className="form-control" />
                                    </th>
                                    <th className='table-header'>
                                        Fecha creación
                                        <input
                                            type="date"
                                            name="date_created"
                                            value={filters.date_created}
                                            onChange={(e) => handleDateChange('date_created', e.target.value)}
                                            className="form-control" />
                                    </th>
                                    <th className='table-header'>
                                        Salida estimada
                                        <input
                                            type="date"
                                            name="shipping_date"
                                            value={filters.shipping_date}
                                            onChange={(e) => handleDateChange('shipping_date', e.target.value)}
                                            className="form-control" />
                                    </th>
                                    <th className='table-header'>
                                        Ciudad
                                        <input
                                            type="text"
                                            name="city"
                                            value={filters.city}
                                            onChange={handleFilterChange}
                                            className="form-control" />
                                    </th>
                                    <th className='table-header'>
                                        Total
                                        <button onClick={() => handleSort('total')} className="btn btn-link">
                                            Total {sortBy === 'total' && (sortOrder === 'asc' ? '↑' : '↓')}
                                        </button>
                                    </th >
                                    <th className='table-header'>
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
                                    <th className='table-header'>
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
                                    <th className='table-header'>
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
                                                onClick={(e) => e.stopPropagation()} />
                                        </td>
                                        <td className='fw-light'>{order.id}</td>
                                        <td>
                                            {order.billing ? `${order.billing.first_name} ${order.billing.last_name}` : 'N/A'}
                                            <br />
                                            <small>{order.billing && order.billing.company ? order.billing.company : 'N/A'}</small>
                                        </td>
                                        <td>{formatDate(order.date_created)}</td>
                                        <td className={getShippingDateClass(order.shipping_date)}>{formatDate(order.shipping_date)}</td>
                                        <td>{order.billing ? order.billing.city : 'N/A'}</td>
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
                            <ReactPaginate className='pagination'
                                previousLabel={"← Anterior"}
                                nextLabel={"Siguiente →"}
                                breakLabel={"..."}
                                breakClassName={"break-me"}
                                pageCount={totalPages}
                                marginPagesDisplayed={2}
                                pageRangeDisplayed={5}
                                onPageChange={handlePageClick} // Pasar el índice de la página directamente
                                containerClassName={"pagination"}
                                subContainerClassName={"pages pagination"}
                                activeClassName={"active"}
                                previousClassName={"page-item"}
                                nextClassName={"page-item"}
                                pageClassName={"page-item"}
                                pageLinkClassName={"page-link"}
                                previousLinkClassName={"page-link"}
                                nextLinkClassName={"page-link"}
                            />
                        </div>

                    </div >
                </Tab >
                <Tab eventKey="inProgressOrders" title="Pedidos en Proceso">
                    <div className='border rounded-3 m-5 justify-content-center'>
                        <p>Redirigiendo a Pedidos en Proceso...</p>
                    </div>
                </Tab>
            </Tabs >
        </div >
    );
}

export default Orders;
