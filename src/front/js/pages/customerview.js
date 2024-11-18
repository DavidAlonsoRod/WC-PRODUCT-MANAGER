import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Tab, Tabs } from 'react-bootstrap';
import "../../styles/customerview.css";
// import CustomerEditModal from '../component/CustomerEditModal';
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
                                <div>
                                    <button className='btn btn-custom mb-3' onClick={handleEditClick}>Editar Cliente</button>

                                    {isModalOpen && customer && (
                                        <CustomerEditModal
                                            customer={customer}
                                            onClose={handleCloseModal}
                                            onUpdate={handleUpdateCustomer}
                                        />
                                    )}
                                </div>
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
                                <p>Nombre comercial: <strong>{customer.billing.company}</strong> </p>
                                <p>Nombre:  <strong>{customer.billing.first_name}</strong></p>
                                <p>Apellidos:  <strong>{customer.billing.last_name}</strong></p>
                                <p>Dirección:  <strong>{customer.billing.address_1} {customer.billing.address_2}</strong></p>
                                <p>Ciudad:  <strong>{customer.billing.city}</strong></p>
                                <p>Provincia:  <strong></strong>{customer.billing.state}</p>
                                <p>C. Postal:  <strong>{customer.billing.postcode}</strong></p>
                                <p>Nif:  <strong>{customer.billing.nif}</strong></p>
                                <p>Email:  <strong>{customer.billing.email}</strong></p>
                                <p>Teléfono:  <strong>{customer.billing.phone}</strong></p>
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
                                {customer.orders && customer.orders.length > 0 ? (
                                    <ul>
                                        {customer.orders.map(order => (
                                            <li key={order.id}>Order Number: {order.number} - Total: {order.total}</li>
                                        ))}
                                    </ul>
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