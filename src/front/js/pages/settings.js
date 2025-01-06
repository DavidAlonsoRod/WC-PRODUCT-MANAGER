import React, { useState, useEffect } from "react";
import { useContext } from "react";
import { Context } from "../store/appContext";

export const Settings = () => {
	const { store, actions } = useContext(Context);
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [token, setToken] = useState("");

	useEffect(() => {
		setToken(store.token);  // Obtener el token JWT del contexto
	}, [store.token]);

	const handleImport = (endpoint) => {
		const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";  // Asegúrate de que esta URL sea correcta

		fetch(`${backendUrl}${endpoint}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`  // Añadir el token JWT en el encabezado
			},
			body: JSON.stringify({ start_date: startDate, end_date: endDate })
		})
		.then(response => {
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return response.json();
		})
		.then(data => {
			console.log(data.message);
		})
		.catch(error => {
			console.error('Error:', error);
		});
	};

	return (
		<div className="container">
			<h1 className="m-5">Configuración</h1>
			<div className="form-group">
				<h3 className="m-1">Importar datos</h3>
				<label htmlFor="startDate">Fecha de inicio:</label>
				<input type="date" id="startDate" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
			</div>
			<div className="form-group">
				<label htmlFor="endDate">Fecha de fin:</label>
				<input type="date" id="endDate" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
			</div>
			<button className="btn btn-primary mt-3" onClick={() => handleImport('/api/import_customers')}>Importar Clientes</button>
			<button className="btn btn-primary mt-3" onClick={() => handleImport('/api/import_orders')}>Importar Pedidos</button>
			<button className="btn btn-primary mt-3" onClick={() => handleImport('/api/import_line_items')}>Importar Artículos de Línea</button>
		</div>
	);
};

export default Settings;