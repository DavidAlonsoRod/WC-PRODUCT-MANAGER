import React, { useEffect, useState, useContext } from 'react';
import { Context } from '../store/appContext';
import { useNavigate } from 'react-router-dom';
import "../../styles/customerlist.css";

const Customers = () => {
    const { store, actions } = useContext(Context);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);  
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;
        actions.getCustomers(page, perPage).then(() => {
            if (!isMounted) return;
        });
        return () => {
            isMounted = false;
        };
    }, [page, perPage]);

    const handleRowClick = (customerId) => {
        navigate(`/customer/${customerId}`);
    };

    const handlePageClick = (pageNumber) => {
        setPage(pageNumber);
    };

    const totalPages = Math.ceil(store.totalCustomers / perPage);

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
                            <th>Rol</th> {/* Nueva columna para el rol */}
                        </tr>
                    </thead>
                    <tbody>
                        {store.customers.map(customer => (
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
                                <td>{customer.role}</td>
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