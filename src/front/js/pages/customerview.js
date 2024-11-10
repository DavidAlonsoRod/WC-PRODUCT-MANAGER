import React, { useEffect, useState, useRef, useMemo } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Tab, Tabs } from 'react-bootstrap';
import { useReactToPrint } from 'react-to-print';
import "../../styles/customerview.css";

const CustomerView = () => {
    const { customerId } = useParams();
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const componentRef = useRef();

    useEffect(() => {
        const fetchCustomer = async () => {
            setLoading(true); // Mover esto aquí para asegurarse de que el indicador de carga se muestre inmediatamente
            try {
                const response = await axios.get(`${process.env.BACKEND_URL}/api/customers/${customerId}`);
                
                setCustomer(response.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomer();
    }, [customerId]);

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    if (loading) return <p className='m-5'>un poquito de paciencia, please...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="d-flex justify-content-center align-items-start vh-100 custom-container">
            <div className="container mt-0" ref={componentRef}>

                <Tabs defaultActiveKey="customer" id="customer-tabs" className="mb-1 custom-tabs">
                    <Tab eventKey="customer" title="Cliente">

                        <div className='m-3 p-2'>
                            <p>Cliente:<h3>{customer.id}</h3> </p>
                            <h4>{customer.first_name} {customer.last_name}</h4>
                            <p>Email: {customer.email}</p>
                            <p>Forma de pago: {customer.role}</p>
                            <p>Usuario: {customer.username}</p>
                            

                        </div>
                    </Tab>
                    <Tab eventKey="billing" title="Facturación">

                        {customer.billing ? (
                            <div className='m-3 p-2'>
                                <p>Company: {customer.billing.company}</p>
                                <p>Address 1: {customer.billing.address_1}</p>
                                <p>Address 2: {customer.billing.address_2}</p>
                                <p>City: {customer.billing.city}</p>
                                <p>State: {customer.billing.state}</p>
                                <p>Postcode: {customer.billing.postcode}</p>
                                <p>Country: {customer.billing.country}</p>
                                <p>Email: {customer.billing.email}</p>
                                <p>Phone: {customer.billing.phone}</p>
                            </div>
                        ) : (
                            <p>No billing information available.</p>
                        )}
                    </Tab>
                    <Tab eventKey="shipping" title="Envío">

                        {customer.shipping ? (
                            <div className='m-3 p-2'>
                                <p>Company: {customer.shipping.company}</p>
                                <p>Address 1: {customer.shipping.address_1}</p>
                                <p>Address 2: {customer.shipping.address_2}</p>
                                <p>City: {customer.shipping.city}</p>
                                <p>State: {customer.shipping.state}</p>
                                <p>Postcode: {customer.shipping.postcode}</p>
                                <p>Country: {customer.shipping.country}</p>
                            </div>
                        ) : (
                            <p>Sin datos de envío</p>
                        )}
                    </Tab>
                </Tabs>
                <button onClick={handlePrint} className="btn btn-custom mb-3">Imprimir</button>

                <h2>Pedidos</h2>
                {/* {customer.orders && customer.orders.length > 0 ? (
                    <ul>
                        {customer.orders.map(order => (
                            <li key={order.id}> {order.number} - Total: {order.total} Fecha:{order.date_created}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No hay pedidos de este cliente.</p>
                )} */}
            </div>
        </div>
    );
};

export default CustomerView;