import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../../styles/customerlist.css";

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);  // Cambiar el valor predeterminado a 20
    const [totalCustomers, setTotalCustomers] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await axios.get(`${process.env.BACKEND_URL}/api/customers`, {
                    params: {
                        page: page,
                        per_page: perPage,
                    },
                });
                setCustomers(response.data.customers);
                setTotalCustomers(response.data.total_customers);
            } catch (error) {
                console.error("Error fetching customers", error);
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
                        {customers.map(customer => (
                            <tr 
                                key={customer.id} 
                                className='fw-light' 
                                onClick={() => handleRowClick(customer.id)}
                                style={{ cursor: 'pointer' }}
                            >
                                <td className='fw-light'>{customer.id}</td>
                                <td>{customer.company}</td>
                                <td>{customer.first_name}</td>
                                <td>{customer.last_name}</td>
                                <td>{customer.city}</td>
                                <td>{customer.state}</td>
                                <td>{customer.email}</td>
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