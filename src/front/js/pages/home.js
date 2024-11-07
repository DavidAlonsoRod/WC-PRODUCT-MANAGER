import React, { useContext } from "react";
import { Context } from "../store/appContext";
import "../../styles/home.css";
import Form from "../component/form";



export const Home = () => {
	const { store, actions } = useContext(Context);

	return (
		<div className="text-center mt-5">
			
			<h2 className="mt-5">{store.customer ? store.customer.username : "Bienvenido"} </h2>
			<Form />
		</div>
	);
};
