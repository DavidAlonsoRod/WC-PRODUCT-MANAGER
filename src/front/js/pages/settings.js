import React, { useState } from "react";
import { useContext } from "react";
import { Context } from "../store/appContext";

export const Settings = () => {
	const { actions } = useContext(Context);
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");

	const handleImport = () => {
		fetch('/api/import-data', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
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
			<h1 className="m-5
        ">Configuración</h1>
			<div className="form-group">
            <h3 className="m-1">Importar datos</h3>
				<label htmlFor="startDate">Fecha de inicio:</label>
				<input type="date" id="startDate" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
			</div>
			<div className="form-group">
				<label htmlFor="endDate">Fecha de fin:</label>
				<input type="date" id="endDate" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
			</div>
			<button className="btn btn-primary mt-3" onClick={handleImport}>Importar Datos</button>
		</div>
	);
};

export default Settings;