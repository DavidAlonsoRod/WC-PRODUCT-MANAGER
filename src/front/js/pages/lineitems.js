import React, { useState, useEffect, useContext } from 'react';
import "../../styles/customerlist.css";
import { useNavigate } from 'react-router-dom';
import { Context } from '../store/appContext';
import StatusMessage from '../component/StatusMessage'; // Importa el nuevo componente

const LineItems = () => {
    const { store, actions } = useContext(Context);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState("finalizado");
    const [statusMessage, setStatusMessage] = useState(""); // Estado para el mensaje
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found");
            navigate("/");
            return;
        }
        actions.getLineItems(page, perPage); // Asegurarse de obtener los line items al cargar el componente
    }, [navigate, actions, page, perPage]);

    const handlePageChange = (newPage) => {
        if (newPage !== page) {
            setPage(newPage);
        }
    };

    const handlePerPageChange = (event) => {
        const newPerPage = parseInt(event.target.value, 10);
        if (newPerPage !== perPage) {
            setPerPage(newPerPage);
        }
    };

    const handleAddNote = (itemId, note) => {
        if (note) {
            actions.addInternalNoteToLineItem(itemId, note)
                .then(() => {
                    actions.getLineItems(page, perPage); // Refrescar la lista de line items después de agregar la nota
                })
                .catch(error => {
                    console.error("Error al agregar la nota:", error);
                });
        }
    };

    const handleEditNote = (itemId, currentNote) => {
        const newNote = prompt("Edita la nota:", currentNote);
        if (newNote !== null && newNote !== currentNote) {
            actions.updateInternalNoteToLineItem(itemId, newNote)
                .then(() => {
                    actions.getLineItems(page, perPage); // Refrescar la lista de line items después de editar la nota
                })
                .catch(error => {
                    console.error("Error al editar la nota:", error);
                });
        }
    };

    const handleFinalizeItem = (itemId) => {
        actions.updateLineItemStatus(itemId, "finalizado")
            .then(() => {
                actions.getLineItems(page, perPage); // Refrescar la lista de line items después de cambiar el estado
            })
            .catch(error => {
                console.error("Error al finalizar el item:", error);
            });
    };

    const handleSelectItem = (itemId) => {
        setSelectedItems(prevSelected =>
            prevSelected.includes(itemId)
                ? prevSelected.filter(id => id !== itemId)
                : [...prevSelected, itemId]
        );
    };

    const handleFinalizeSelectedItems = () => {
        selectedItems.forEach(itemId => {
            actions.updateLineItemStatus(itemId, selectedStatus)
                .catch(error => {
                    console.error(`Error al cambiar el estado del item ${itemId} a ${selectedStatus}:`, error);
                });
        });
        setSelectedItems([]);
        actions.getLineItems(page, perPage) // Refrescar la lista de line items después de cambiar el estado
            .then(() => {
                setStatusMessage("Estados modificados correctamente"); // Establecer el mensaje
                setTimeout(() => setStatusMessage(""), 3000); // Limpiar el mensaje después de 3 segundos
            })
            .catch(error => {
                console.error("Error al refrescar la lista de line items:", error);
            });
    };

    const filteredLineItems = store.lineItems.filter(item => ["pendiente", "en_proceso", "finalizado"].includes(item.status));

    return (
        <div className='border rounded-3 m-5 justify-content-center'>
            {statusMessage && <StatusMessage message={statusMessage} onClose={() => setStatusMessage("")} />} {/* Mostrar el mensaje */}
            <div className="m-3">
                <label htmlFor="statusSelector">Seleccionar estado:</label>
                <select
                    id="statusSelector"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                >
                    <option value="finalizado">Finalizado</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="en_proceso">En Proceso</option>
                    {/* Agregar más opciones según sea necesario */}
                </select>
                <button onClick={handleFinalizeSelectedItems} disabled={selectedItems.length === 0}>
                    Modificar estado
                </button>
                <table className='table caption-top'>
                    <caption className='p-3'>Items</caption>
                    <thead>
                        <tr>
                            <th>
                                <input
                                    type="checkbox"
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedItems(filteredLineItems.map(item => item.id));
                                        } else {
                                            setSelectedItems([]);
                                        }
                                    }}
                                    checked={selectedItems.length === filteredLineItems.length && filteredLineItems.length > 0}
                                />
                            </th>
                            <th>Nº Pedido</th>
                            <th>Nº trabajo</th>
                            <th>Cliente</th>
                            <th>Producto</th>
                            <th>Quantity</th>
                            <th>Subtotal</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th>Nota interna</th>
                            <th>QR</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLineItems.length > 0 ? (
                            filteredLineItems.map(item => (
                                <tr key={item.id} style={{ backgroundColor: item.status === "finalizado" ? "#d4edda" : item.status === "pendiente" ? "#fff3cd" : "transparent" }}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(item.id)}
                                            onChange={() => handleSelectItem(item.id)}
                                        />
                                    </td>
                                    <td>{item.order_id}</td>
                                    <td>{item.id}</td>
                                    <td>{item.customer_firstname} {item.customer_lastname}</td>
                                    <td>{item.name}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.subtotal}</td>
                                    <td>{item.total}</td>
                                    <td>
                                        {item.status}
                                    </td>
                                    <td>
                                        <span onClick={() => handleEditNote(item.id, item.internal_note)}>
                                            {item.internal_note || "Añadir Nota"}
                                        </span>
                                    </td>
                                    <td>
                                        {item.qr_code && (
                                            <img src={`data:image/png;base64,${item.qr_code}`} alt="QR Code" style={{ width: '50px', height: '50px' }} />
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="11" className="text-center">No hay line items disponibles</td>
                            </tr>
                        )}
                    </tbody>
                </table>
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