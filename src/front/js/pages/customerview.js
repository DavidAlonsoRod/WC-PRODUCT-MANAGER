import React, { useEffect, useState, useRef, useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import "../../styles/customerview.css";
import { useNavigate, Link } from 'react-router-dom';
import EditBillingModal from '../component/EditBillingModal';
import EditShippingModal from '../component/EditShippingModal';
import { Context } from '../store/appContext';

const CustomerView = () => {
    const { customerId } = useParams();
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const componentRef = useRef();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
    const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
    const isMounted = useRef(true);
    const navigate = useNavigate();
    const { actions } = useContext(Context);

    const [orders, setOrders] = useState([]);
    const [ordersPage, setOrdersPage] = useState(1);
    const [ordersPerPage, setOrdersPerPage] = useState(20);
    const [totalOrders, setTotalOrders] = useState(0);
    const [selectedOrders, setSelectedOrders] = useState([]);

    const handleEditClick = () => {
        setIsModalOpen(true);
    };
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found");
            navigate("/");
            return;
        }
        actions.getCustomer(customerId)
            .then((customer) => {
                setCustomer(customer);
                setLoading(false);
            })
            .catch(() => {
                setError('Error al cargar el cliente.');
                setLoading(false);
            });
    }, [customerId]);

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };
    const handleSelectOrder = (orderId) => {
        setSelectedOrders(prevSelectedOrders => prevSelectedOrders.includes(orderId)
            ? prevSelectedOrders.filter(id => id !== orderId)
            : [...prevSelectedOrders, orderId]
        );
    };
    const handleDeleteOrders = async () => {
        try {
            await actions.deleteOrders(selectedOrders);
        } catch (error) {
            console.error("Error deleting orders:", error.response ? error.response.data : error.message);
        }
    };
    const handleDeleteOrder = async (orderId) => {
        try {
            await actions.deleteOrder(orderId);
            // Actualizar la lista de pedidos después de eliminar
            const response = await axios.get(`${process.env.BACKEND_URL}/api/orders`, {
                params: {
                    customer_id: customerId,
                    page: ordersPage,
                    per_page: ordersPerPage,
                    order: 'desc',
                    orderby: 'date_created'
                }
            });
            if (isMounted.current) {
                setOrders(response.data.orders);
                setTotalOrders(response.data.total_orders);
            }
        } catch (error) {
            console.error("Error deleting order:", error.response ? error.response.data : error.message);
        }
    };
    const handleBillingEditClick = () => {
        setIsBillingModalOpen(true);
    };

    const handleCloseBillingModal = () => {
        setIsBillingModalOpen(false);
    };

    const handleShippingEditClick = () => {
        setIsShippingModalOpen(true);
    };

    const handleCloseShippingModal = () => {
        setIsShippingModalOpen(false);
    };

    const handleUpdateCustomer = async (updatedCustomer) => {
        try {
            await axios.put(`${process.env.BACKEND_URL}/api/customers/${customerId}`, updatedCustomer, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (isMounted.current) {
                setCustomer(updatedCustomer);
                setIsModalOpen(false);
                setIsBillingModalOpen(false);
                setIsShippingModalOpen(false);
            }
        } catch (err) {
            if (isMounted.current) {
                setError(err.message);
            }
        }
    };
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found");
            navigate("/");
            return;
        }
        actions.getCustomer(customerId).catch(() => {
            setError('Error al cargar el cliente.');
        });
    }, [customerId]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    console.error("No token found");
                    navigate("/");
                    return;
                }
                const response = await axios.get(`${process.env.BACKEND_URL}/api/orders`, {
                    params: {
                        customer_id: customerId,
                        page: ordersPage,
                        per_page: ordersPerPage,
                        order: 'desc',
                        orderby: 'date_created'
                    },
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                if (isMounted.current) {
                    setOrders(response.data.orders);
                    setTotalOrders(response.data.total_orders);
                }
            } catch (err) {
                if (isMounted.current) {
                    setError(err.message);
                }
            }
        };

        fetchOrders();
    }, [customerId, ordersPage, ordersPerPage]);

    const handleRowClick = (orderId) => {
        navigate(`/orders/${orderId}`);
    };


    const totalPages = Math.ceil(totalOrders / ordersPerPage);

    const handleOrdersPageClick = (pageNumber) => {
        setOrdersPage(pageNumber);
    };

    if (loading) return <p className='p-3'>Cargando...</p>;
    if (error) return <p className='p-3'>Error: {error}</p>;

    return (
        <div className="d-flex justify-content-center align-items-start vh-100 custom-container">
            <div className="container mt-0" ref={componentRef}>
                {customer && (
                    <div className='row'>
                        <div className='d-flex p-1 '>
                            <h5 className='p-1'>{customer.shipping?.company || 'N/A'}</h5>
                            <h5 className='p-1 px-3'>{customer.first_name} {customer.last_name}</h5>
                            <div className='mx-5'>
                                <p className=" small-text mt-2">Forma de pago: </p>
                                <p className="large-text">{customer.role}</p>
                            </div>
                        </div>
                        <div className='col-md-7 p-3 border'>
                            <h4>Facturación<button className='btn btn-custom' onClick={handleBillingEditClick}>Editar</button>
                                <div className='d-flex flex-column mt-1'>
                                    <div className='row'>
                                        <div className='col-md-6'>
                                            <p className="small-text">Nombre comercial</p>
                                            <p className="large-text">{customer.billing?.company || 'N/A'}</p>
                                        </div>
                                        <div className='col-md-6'>
                                            <p className="small-text mt-1">Nombre y apellidos</p>
                                            <p className="large-text">{customer.billing?.first_name || 'N/A'} {customer.billing?.last_name || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className='d-flex flex-column mt-3'>
                                        <div className='row'>
                                            <div className='col-md-5 p-1 m-1'>
                                                <p className="small-text mt-1">Dirección</p>
                                                <p className="large-text">{customer.billing?.address_1 || 'N/A'} {customer.billing?.address_2 || ''}</p>

                                            </div>
                                            <div className='col-md-2 p-1 m-1'>
                                                <p className="small-text mt-1">Ciudad</p>
                                                <p className="large-text">{customer.billing?.city || 'N/A'}</p>


                                            </div>



                                            <div className='col-md-2 p-1 m-12'>
                                                <p className="small-text mt-1">Provincia</p>
                                                <p className="large-text">{customer.billing?.state || 'N/A'}</p>



                                            </div>
                                            <div className='col-md-2 p-1 m-1'>
                                                <p className="small-text mt-1">C. Postal</p>
                                                <p className="large-text">{customer.billing?.postcode || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='d-flex flex-column mt-3 p-2'>
                                        <div className='row'>
                                            <div className='col-md-1 p-1 m-1'>
                                                <p className="small-text mt-2">Nif</p>
                                                <p className="large-text">{customer.billing?.nif || 'N/A'}</p>
                                            </div>
                                            <div className='col-md-4 p-1 m-1'>
                                                <p className="small-text mt-2">Email</p>
                                                <p className="large-text">{customer.billing?.email || 'N/A'}</p>
                                            </div>
                                            <div className='col-md-3 p-1 m-1'>
                                                <p className="small-text mt-2">Teléfono</p>
                                                <p className="large-text">{customer.billing?.phone || 'N/A'}</p>
                                            </div>
                                            <div className='col-md-3 p-1 m-1'>
                                                <p className="small-text mt-2">Iban</p>
                                                <p className="large-text">{customer.billing?.iban || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>





                                </div>
                                {isBillingModalOpen && customer && (
                                    <EditBillingModal
                                        show={isBillingModalOpen}
                                        handleClose={handleCloseBillingModal}
                                        customer={customer}
                                        updateCustomer={handleUpdateCustomer}
                                    />
                                )}</h4>
                        </div>
                        <div className='col-md-5 p-3 border'>
                            <h4>Envío<button className='btn btn-custom' onClick={handleShippingEditClick}>Editar</button>
                                {isShippingModalOpen && customer && (
                                    <EditShippingModal
                                        show={isShippingModalOpen}
                                        handleClose={handleCloseShippingModal}
                                        customer={customer}
                                        updateCustomer={handleUpdateCustomer}
                                    />
                                )}</h4>
                            <div className='d-flex flex-column mt-1'>
                                <div className='row'>
                                    <div className='col-md-3 p-1 m-1'>
                                        <p className="small-text">Nombre</p>
                                        <p className="large-text">{customer.shipping?.first_name || 'N/A'} {customer.shipping?.last_name || 'N/A'}</p>
                                    </div>
                                    <div className='col-md-3 p-1 m-1'>
                                        <p className="small-text mt-2">Dirección</p>
                                        <p className="large-text">{customer.shipping?.address_1 || 'N/A'} {customer.shipping?.address_2 || ''}</p>
                                    </div>
                                    <div className='col-md-3 p-1 m-1'>
                                        <p className="small-text mt-2">Ciudad</p>
                                        <p className="large-text">{customer.shipping?.city || 'N/A'}</p>
                                    </div>
                                    <div className='col-md-3 p-1 m-1'>
                                        <p className="small-text mt-2">Provincia</p>
                                        <p className="large-text">{customer.shipping?.state || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>







                            <p className="small-text mt-2">C.P.</p>
                            <p className="large-text">{customer.shipping?.postcode || 'N/A'}</p>
                            <p className="small-text mt-2">Teléfono</p>
                            <p className="large-text">{customer.billing?.phone || 'N/A'}</p>
                        </div>
                    </div>
                )
                }
                <div className='m-5 p-3 border rounded-3'>
                    <h4>Pedidos de {customer?.billing?.company || 'N/A'}</h4>

                    <button onClick={handleDeleteOrders} className="btn btn-danger m-3">Borrar pedidos seleccionados</button>
                    {orders && orders.length > 0 ? (
                        <>
                            <table className='table caption-top'>
                                <caption className='p-3'>Pedidos</caption>
                                <thead className='bg-light'>
                                    <tr>
                                        <th>#</th>
                                        <th>Total</th>
                                        <th>Fecha de Creación</th>
                                        <th>Fecha Prevista de Salida</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => (
                                        <tr
                                            key={order.id}
                                            className='fw-light'
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleRowClick(order.id)}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedOrders.includes(order.id)}
                                                    onChange={() => handleSelectOrder(order.id)}
                                                    onClick={(e) => e.stopPropagation()} />
                                            </td>
                                            <td>{order.id}</td>
                                            <td>{order.total}</td>
                                            <td>{new Date(order.date_created).toLocaleDateString()}</td>
                                            <td>{new Date(order.date_created).toLocaleDateString()}</td>
                                            <td>{order.status}</td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="d-flex justify-content-end m-2 pagination">
                                {Array.from({ length: totalPages }, (_, index) => (
                                    <span
                                        key={index + 1}
                                        onClick={() => handleOrdersPageClick(index + 1)}
                                        style={{
                                            cursor: 'pointer',
                                            fontWeight: ordersPage === index + 1 ? 'bold' : 'normal',
                                            margin: '0 5px'
                                        }}
                                    >
                                        {index + 1}
                                    </span>
                                ))}
                            </div>
                        </>
                    ) : (
                        <p>No hay pedidos de este cliente.</p>
                    )}
                </div>
            </div >
        </div >
    );
};

export default CustomerView;
