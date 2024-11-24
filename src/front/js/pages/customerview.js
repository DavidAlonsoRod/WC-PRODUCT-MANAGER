import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Tab, Tabs } from 'react-bootstrap';
import "../../styles/customerview.css";
import EditBillingModal from '../component/EditBillingModal';
import EditShippingModal from '../component/EditShippingModal';

const CustomerView = () => {
    const { customerId } = useParams();
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const componentRef = useRef();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBillingModalOpen, setIsBillingModalOpen] = useState(false); // Estado para el modal de facturación
    const [isShippingModalOpen, setIsShippingModalOpen] = useState(false); // Estado para el modal de envío
    const isMounted = useRef(true);

    const [orders, setOrders] = useState([]);
    const [ordersPage, setOrdersPage] = useState(1);
    const [ordersPerPage, setOrdersPerPage] = useState(20);
    const [totalOrders, setTotalOrders] = useState(0);

    const handleEditClick = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleBillingEditClick = () => {
        setIsBillingModalOpen(true); // Abrir el modal de facturación
    };

    const handleCloseBillingModal = () => {
        setIsBillingModalOpen(false); // Cerrar el modal de facturación
    };

    const handleShippingEditClick = () => {
        setIsShippingModalOpen(true); // Abrir el modal de envío
    };

    const handleCloseShippingModal = () => {
        setIsShippingModalOpen(false); // Cerrar el modal de envío
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
                setIsBillingModalOpen(false); // Cerrar el modal de facturación después de actualizar
                setIsShippingModalOpen(false); // Cerrar el modal de envío después de actualizar
            }
        } catch (err) {
            if (isMounted.current) {
                setError(err.message);
            }
        }
    };

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const response = await axios.get(`${process.env.BACKEND_URL}/api/customers/${customerId}`);
                if (isMounted.current) {
                    setCustomer(response.data);
                }
            } catch (err) {
                if (isMounted.current) {
                    setError(err.message);
                }
            } finally {
                if (isMounted.current) {
                    setLoading(false);
                }
            }
        };

        fetchCustomer();

        return () => {
            isMounted.current = false;
        };
    }, [customerId]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
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
            } catch (err) {
                if (isMounted.current) {
                    setError(err.message);
                }
            }
        };

        fetchOrders();
    }, [customerId, ordersPage, ordersPerPage]);

    const totalPages = Math.ceil(totalOrders / ordersPerPage);

    const handleOrdersPageClick = (pageNumber) => {
        setOrdersPage(pageNumber);
    };

    if (loading) return <p className='p-3'>Loading...</p>;
    if (error) return <p className='p-3'>Error: {error}</p>;

    return (
        <div className="d-flex justify-content-center align-items-start vh-100 custom-container">
            <div className="container mt-0" ref={componentRef}>
                <Tabs defaultActiveKey="customer" id="customer-tabs" className="mb-1 custom-tabs">
                    <Tab className='p-2' eventKey="customer" title="Datos de envio">
                        <div className='d-flex'>
                            <div className='m-5 p-3 border rounded-3'>
                                <h4 className='p-2'>{customer.id}</h4>
                                <h4>{customer.shipping.company}</h4>
                                <h5>{customer.first_name} {customer.last_name}</h5>

                                <p>Forma de pago: {customer.role}</p>
                                <p>Usuario: {customer.username}</p>

                            </div>
                            <div className='m-5 p-3 border rounded-3 customerboxes'>
                                <h4>Información de envio</h4>
                                <p>Nombre: <strong>{customer.shipping.first_name}</strong></p>
                                <p>Apellidos:  <strong>{customer.shipping.last_name}</strong></p>
                                <p>Dirección:  <strong>{customer.shipping.address_1} {customer.shipping.address_2}</strong></p>
                                <p>Ciudad:  <strong>{customer.shipping.city}</strong> </p>
                                <p>Provincia:  <strong>{customer.shipping.state}</strong></p>
                                <p>C.P.:  <strong>{customer.shipping.postcode}</strong></p>
                                {/* <p>Email:  <strong>{customer.email}</strong></p> */}
                                <p>Teléfono:  <strong>{customer.billing.phone}</strong></p>
                                <button className='btn btn-custom mb-3' onClick={handleShippingEditClick}>Editar Envío</button>
                                {isShippingModalOpen && customer && (
                                    <EditShippingModal
                                        show={isShippingModalOpen}
                                        handleClose={handleCloseShippingModal}
                                        customer={customer}
                                        updateCustomer={handleUpdateCustomer}
                                    />
                                )}
                            </div>
                            <div className='m-5 p-3 border rounded-3'>
                                <h4>Detalles de facturación</h4>
                                <p>Nombre comercial: <strong>{customer.billing ? customer.billing.company : 'N/A'}</strong> </p>
                                <p>Nombre:  <strong>{customer.billing ? customer.billing.first_name : 'N/A'}</strong></p>
                                <p>Apellidos:  <strong>{customer.billing ? customer.billing.last_name : 'N/A'}</strong></p>
                                <p>Dirección:  <strong>{customer.billing ? `${customer.billing.address_1} ${customer.billing.address_2}` : 'N/A'}</strong></p>
                                <p>Ciudad:  <strong>{customer.billing ? customer.billing.city : 'N/A'}</strong></p>
                                <p>Provincia:  <strong>{customer.billing ? customer.billing.state : 'N/A'}</strong></p>
                                <p>C. Postal:  <strong>{customer.billing ? customer.billing.postcode : 'N/A'}</strong></p>
                                <p>Nif:  <strong>{customer.billing ? customer.billing.nif : 'N/A'}</strong></p>
                                <p>Email:  <strong>{customer.billing ? customer.billing.email : 'N/A'}</strong></p>
                                <p>Teléfono:  <strong>{customer.billing ? customer.billing.phone : 'N/A'}</strong></p>
                                <p>Iban:  <strong>{customer.billing ? customer.billing.iban : 'N/A'}</strong></p>
                                <button className='btn btn-custom mb-3' onClick={handleBillingEditClick}>Editar Facturación</button>
                                {isBillingModalOpen && customer && (
                                    <EditBillingModal
                                        show={isBillingModalOpen}
                                        handleClose={handleCloseBillingModal}
                                        customer={customer}
                                        updateCustomer={handleUpdateCustomer}
                                    />
                                )}
                            </div>
                        </div>
                    </Tab>

                    <Tab eventKey="shipping" title="Pedidos">
                        {customer.shipping ? (
                            <div className='m-5 p-3 border rounded-3'>
                                <h4>Pedidos de {customer.billing.company}</h4>
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
                                                    <tr key={order.id}>
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
                        ) : (
                            <p>Sin datos de envío</p>
                        )}
                    </Tab>
                </Tabs>

            </div>
        </div>
    );
};

export default CustomerView;