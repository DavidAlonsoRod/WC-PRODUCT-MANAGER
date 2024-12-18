import React, { useContext } from 'react';
import { Context } from '../store/flux';

const OrderActionsFooter = ({ selectedOrders }) => {
    const { actions } = useContext(Context);

    const handleUpdateStatus = (newStatus) => {
        actions.updateOrderStatus(selectedOrders, newStatus);
    };

    return (
        <div className="order-actions-footer">
            <button onClick={() => handleUpdateStatus('completed')} className="btn btn-primary">
                Marcar como Completado
            </button>
            {/* Añadir más botones de acción según sea necesario */}
        </div>
    );
};

export default OrderActionsFooter;