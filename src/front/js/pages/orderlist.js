import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Orders = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get(`${process.env.BACKEND_URL}/orders`);
                setOrders(response.data);
            } catch (error) {
                console.error("Error fetching orders", error);
            }
        };

        fetchOrders();
    }, []);

    return (
        <div>
            <h1>Orders</h1>
            <table className='table'>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Number</th>
                        <th>Status</th>
                        <th>Total</th>
                        <th>Customer ID</th>
                        <th>Billing</th>
                        <th>Shipping</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>{order.number}</td>
                            <td>{order.status}</td>
                            <td>{order.total}</td>
                            <td>{order.customer_id}</td>
                            <td>{order.billing ? `${order.billing.first_name} ${order.billing.last_name}` : 'N/A'}</td>
                            <td>{order.shipping ? `${order.shipping.first_name} ${order.shipping.last_name}` : 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Orders;