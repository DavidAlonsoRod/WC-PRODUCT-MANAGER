import React, { useState, useEffect, useContext } from 'react';
import "../../styles/customerlist.css";
import { useNavigate, Link } from 'react-router-dom';
import { Context } from '../store/appContext';

const LineItems = () => {
    const { store, actions } = useContext(Context);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found");
            navigate("/");
            return;
        }
        actions.getLineItems(page, perPage, null, search);
    }, [page, perPage, search, navigate]); // Eliminar 'actions' de las dependencias

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handlePerPageChange = (event) => {
        setPerPage(event.target.value);
    };

    const handleSearchChange = (event) => {
        setSearch(event.target.value);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Fecha no disponible';
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const getShippingDateClass = (shippingDate) => {
        if (!shippingDate) return 'btn-small';
        const date = new Date(shippingDate);
        const now = new Date();
        const diffMs = date - now;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays <= 0) {
            return 'btn btn-urgent btn-small';
        } else if (diffDays <= 3) {
            return 'btn btn-warning btn-small';
        } else {
            return 'btn btn-success btn-small';
        }
    };

    return (
        <div className='border rounded-3 m-5 justify-content-center'>
            <div className="m-3">
                <h4 className='m-3'>Flipa María. Ahora mismo tienes {store.totalLineItems} artículos en proceso</h4>
                <div className="d-flex justify-content-between mb-3">
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
                    </div>
                    <div>
                        <input
                            type="text"
                            placeholder="Buscar por producto"
                            value={search}
                            onChange={handleSearchChange}
                            className="form-control"
                        />
                    </div>
                </div>
                <table className='table caption-top'>
                    <caption className='p-3'>Items</caption>
                    <thead>
                        <tr>
                            <th>Nº Pedido</th>
                            <th>Nº trabajo</th>
                            <th>Cliente</th>
                            <th>Producto</th>
                            <th>Fecha del Pedido</th>
                            <th>Fecha Estimada de Salida</th>
                            <th>Quantity</th>
                            <th>Subtotal</th>
                            <th>Total</th>
                            <th>QR</th>
                        </tr>
                    </thead>
                    <tbody>
                        {store.lineItems.map(item => (
                            <tr key={item.id}>
                                <td>
                                    <Link to={`/orders/${item.order_id}`}>
                                        {item.order_id}
                                    </Link>
                                </td>
                                <td>{item.id}</td>
                                <td>
                                    {item.order && item.order.billing ? `${item.order.billing.first_name} ${item.order.billing.last_name}` : 'N/A'}
                                    <br />
                                    <small>{item.order && item.order.billing ? item.order.billing.company : 'N/A'}</small>
                                </td>
                                <td>{item.name}</td>
                                <td>{formatDate(item.order.date_created)}</td>
                                <td className={getShippingDateClass(item.order.shipping_date)}>{formatDate(item.order.shipping_date)}</td>
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
                    <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
                        Previous
                    </button>
                    <button onClick={() => handlePageChange(page + 1)} disabled={page * perPage >= store.totalLineItems}>
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LineItems;