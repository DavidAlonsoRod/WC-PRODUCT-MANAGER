import React, { useEffect, useState, useRef } from 'react';
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

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="d-flex justify-content-center align-items-start vh-100 custom-container">
            <div className="container mt-0" ref={componentRef}>

                <Tabs defaultActiveKey="customer" id="customer-tabs" className="mb-1">
                    <Tab eventKey="customer" title="Cliente">

                        <div>
                            <p><strong>Número de cliente:</strong> {customer.id}</p>
                            <h4>{customer.first_name} {customer.last_name}</h4>
                            <p><strong>Email:</strong> {customer.email}</p>
                            <p><strong>Role:</strong> {customer.role}</p>
                            <p><strong>Username:</strong> {customer.username}</p>
                            

                        </div>
                    </Tab>
                    <Tab eventKey="billing" title="Facturación">

                        {customer.billing ? (
                            <div>
                                <p><strong>Company:</strong> {customer.billing.company}</p>
                                <p><strong>Address 1:</strong> {customer.billing.address_1}</p>
                                <p><strong>Address 2:</strong> {customer.billing.address_2}</p>
                                <p><strong>City:</strong> {customer.billing.city}</p>
                                <p><strong>State:</strong> {customer.billing.state}</p>
                                <p><strong>Postcode:</strong> {customer.billing.postcode}</p>
                                <p><strong>Country:</strong> {customer.billing.country}</p>
                                <p><strong>Email:</strong> {customer.billing.email}</p>
                                <p><strong>Phone:</strong> {customer.billing.phone}</p>
                            </div>
                        ) : (
                            <p>No billing information available.</p>
                        )}
                    </Tab>
                    <Tab eventKey="shipping" title="Envío">

                        {customer.shipping ? (
                            <div>
                                <p><strong>Company:</strong> {customer.shipping.company}</p>
                                <p><strong>Address 1:</strong> {customer.shipping.address_1}</p>
                                <p><strong>Address 2:</strong> {customer.shipping.address_2}</p>
                                <p><strong>City:</strong> {customer.shipping.city}</p>
                                <p><strong>State:</strong> {customer.shipping.state}</p>
                                <p><strong>Postcode:</strong> {customer.shipping.postcode}</p>
                                <p><strong>Country:</strong> {customer.shipping.country}</p>
                            </div>
                        ) : (
                            <p>Sin datos de envío</p>
                        )}
                    </Tab>
                </Tabs>
                <button onClick={handlePrint} className="btn btn-custom mb-3">Imprimir</button>

                <h2>Orders</h2>
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
        </div>
    );
};

export default CustomerView;