import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../../styles/customerlist.css";

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [totalCustomers, setTotalCustomers] = useState(0);
    const [error, setError] = useState(null);
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
        const fetchCustomers = async () => {
            try {
                console.log("Fetching customers from:", `${process.env.BACKEND_URL}/api/customers`);
                const response = await axios.get(`${process.env.BACKEND_URL}/api/customers`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "application/json",
                    },
                    params: {
                        page: page,
                        per_page: perPage,
                    },
                });
                console.log("Response data:", response.data);
                setCustomers(response.data.customers);
                setTotalCustomers(response.data.total_customers);
            } catch (error) {
                console.error("Error fetching customers", error);
                setError(error);
            }
        };

        fetchCustomers();
    }, [page, perPage]);

    const handleRowClick = (customerId) => {
        navigate(`/customer/${customerId}`);
    };

    const handlePageClick = (pageNumber) => {
        setPage(pageNumber);
    };

    const totalPages = Math.ceil(totalCustomers / perPage);

    if (error) {
        return <div>Error fetching customers: {error.message}</div>;
    }

    return (
        <div>
            <div className='border rounded-3 m-5 justify-content-center'>
                <table className='table caption-top'>
                    <caption className='p-3'>Clientes</caption>
                    <thead className='bg-light'>
                        <tr>
                            <th>#</th>
                            <th>Company</th>
                            <th>Nombre</th>
                            <th>Apellidos</th>
                            <th>Ciudad</th>
                            <th>Provincia</th>
                            <th>Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map((customer, index) => (
                            <tr
                                key={index}
                                className='fw-light'
                                onClick={() => handleRowClick(customer.id)}
                                style={{ cursor: 'pointer' }}
                            >
                                <td className='fw-light'>{customer?.id || 'N/A'}</td>
                                <td>{customer?.billing?.company || 'N/A'}</td>
                                <td>{customer?.first_name || 'N/A'}</td>
                                <td>{customer?.last_name || 'N/A'}</td>
                                <td>{customer?.city || 'N/A'}</td>
                                <td>{customer?.state || 'N/A'}</td>
                                <td>{customer?.email || 'N/A'}</td>
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

export default Customers;