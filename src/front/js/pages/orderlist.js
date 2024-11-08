import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../../styles/customerlist.css";


const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [totalOrders, setTotalOrders] = useState(0);
    const navigate = useNavigate();


    useEffect(() => {
        const fetchOrders = async () => {
            try {
                console.log("Fetching orders from:", `${process.env.BACKEND_URL}/api/orders`);
                const response = await axios.get(`${process.env.BACKEND_URL}/api/orders`, {
                    params: {
                        page: page,
                        per_page: perPage,
                    },

                });

                console.log("Response data:", response.data);
                setOrders(response.data.orders || []); // Asegurarse de que orders sea un array
                setTotalOrders(response.data.total_orders || 0);
            } catch (error) {
                console.error("Error fetching orders", error);
                setOrders([]); // Asegurarse de que orders sea un array en caso de error
            }
        };

        fetchOrders();
    }, [page, perPage]);

    const handleRowClick = (orderId) => {
        navigate(`/order/${orderId}`);
    };
    const handlePageClick = (pageNumber) => {
        setPage(pageNumber);
    };


    const totalPages = Math.ceil(totalOrders / perPage);

    return (
        <div>
            <div className='border rounded-3 m-5 justify-content-center'>
                <table className='table caption-top'>
                    <caption className='p-3'>Pedidos</caption>
                    <thead className='bg-light'>
                        <tr>
                            <th>ID</th>
                            <th>Cliente</th>
                            <th>Total</th>
                            <th>Estado</th>
                            
                            
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr
                                key={order.id}
                                className='fw-light'
                                onClick={() => handleRowClick(order.id)}
                                style={{ cursor: 'pointer' }}
                            >
                                <td className='fw-light'>{order.id}</td>
                                <td>{order.billing ? `${order.billing.first_name} ${order.billing.last_name}` : 'N/A'}</td>
                                <td>{order.total}</td>
                                <td>{order.status}</td>
                                
                                
                                
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
        </div>
    );
};

export default Orders;