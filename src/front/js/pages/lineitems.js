import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../../styles/customerlist.css";
import { useNavigate, Link } from 'react-router-dom';

const LineItems = () => {
    const [lineItems, setLineItems] = useState([]);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [totalLineItems, setTotalLineItems] = useState(0);
    const navigate = useNavigate();


    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found");
            navigate("/");
            return;
        }

    }, []);


    useEffect(() => {
        fetchLineItems();
    }, [page, perPage]);

    const fetchLineItems = async () => {
        try {
            const response = await axios.get(`${process.env.BACKEND_URL}/api/line_items?page=${page}&per_page=${perPage}`);
            setLineItems(response.data.line_items);
            setTotalLineItems(response.data.total_line_items);
        } catch (error) {
            console.error('Error fetching line items:', error);
        }
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handlePerPageChange = (event) => {
        setPerPage(event.target.value);
    };

    return (
        <div className='border rounded-3 m-5 justify-content-center'>
            <div className="m-3">

                <table className='table caption-top'>
                    <caption className='p-3'>Items</caption>
                    <thead>
                        <tr>
                            <th>Nº Pedido</th>
                            <th>Nº trabajo</th>
                            <th>Producto</th>
                            <th>Quantity</th>
                            <th>Subtotal</th>
                            <th>Total</th>
                            <th>QR</th>


                        </tr>
                    </thead>
                    <tbody>
                        {lineItems.map(item => (
                            <tr key={item.id}>
                                <td>{item.order_id}</td>
                                <td>{item.id}</td>
                                <td>{item.name}</td>
                                <td>{item.quantity}</td>
                                <td>{item.subtotal}</td>
                                <td>{item.total}</td>
                                <td>
                                    {item.qr_code && (
                                        <img src={`data:image/png;base64,${item.qr_code}`} alt="QR Code" style={{ height: '60px' }} />
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div>
                    <label>
                        Líneas por página:
                        <select value={perPage} onChange={handlePerPageChange}>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value={200}>200</option>
                        </select>
                    </label>
                    <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
                        Previous
                    </button>
                    <button onClick={() => handlePageChange(page + 1)} disabled={page * perPage >= totalLineItems}>
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LineItems;