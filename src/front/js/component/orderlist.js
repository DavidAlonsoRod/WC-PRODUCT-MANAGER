
import React, { useContext, useEffect } from "react";
import { Context } from "../store/appContext";
import "../../styles/orderlist.css";

export const OrderList = () => {
    const { store, actions } = useContext(Context);

    useEffect(() => {
        actions.loadOrders();
    }, []);

    const getCreationTime = (createdAt) => {
        const creationDate = new Date(createdAt);
        const now = new Date();
        const diffInMinutes = Math.floor((now - creationDate) / 60000);
        const diffInHours = diffInMinutes / 60;

        if (diffInHours < 2) {
            return `${diffInMinutes} minutos`;
        } else {
            return creationDate.toLocaleString();
        }
    };

    return (
        <div className="order-list">
            <h2>Lista de Órdenes</h2>
            <ul>
                {store.orders.map(order => (
                    <li key={order.id}>
                        <p>ID: {order.id}</p>
                        <p>Cliente: {order.customer_name}</p>
                        <p>Total: {order.total}</p>
                        <p>Fecha de Creación: {getCreationTime(order.created_at)}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};