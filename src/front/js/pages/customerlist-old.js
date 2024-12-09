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
		actions.initializeAuth();
		let isMounted = true;
		const fetchCustomers = async () => {
			if (!isMounted) return; // Evitar múltiples solicitudes
			try {
				await actions.getCustomers(page, perPage);
			} catch (error) {
				console.error("Error fetching customers:", error.response ? error.response.data : error.message);
			}
		};
		if (isMounted) {
			fetchCustomers();
		}
		return () => {
			isMounted = false;
		};
	}, [page, perPage, actions]);

	const handleRowClick = (customerId) => {
		navigate(`/customer/${customerId}`);
	};

	const handlePageClick = (pageNumber) => {
		setPage(pageNumber);
	};

	const totalPages = Math.ceil(store.totalCustomers / perPage);

	return (
		<div>
			{store.notification && (
				<div className="alert alert-info" role="alert">
					{store.notification}
				</div>
			)}
			{store.orderDeletionNotification && (
				<div className="alert alert-warning" role="alert">
					{store.orderDeletionNotification}
				</div>
			)}
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
							<th>Rol</th>
							<th>Seleccionar</th>
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