import React, { useContext } from "react";
import { Context } from "../store/appContext";
import "../../styles/home.css";
import Form from "../component/form";

export const Home = () => {
	const { store, actions } = useContext(Context);

	return (
		<div className="text-center mt-5">
			<h2 className="mt-5" style={{ marginTop: '300px' }}>{store.customer ? store.customer.username : "Bienvenido"} </h2>
			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
				<Form className="form" />
			</div>
			<h2>Cosas para arreglar</h2>
			<ul>
				
					
						<li>Crear una vista PDF de una orden</li>
						<li>Mostrar salida estimada en product list</li>
						<li>Arreglar la vista superior mostrando los datos del customerView</li>
						<li>Editar la ventana modal de cusotmerbillin y customer shipping según la captura de pantalla enviada a discord.</li>
						<li>Configurar las rutas para que cuando cargue la página principal si estamos logueados me lleve directamnete a https://laughing-happiness-66q5pvp9wjr25xv5-3000.app.github.dev/orders</li>
					
				</ul>
		</div>
	);
};
