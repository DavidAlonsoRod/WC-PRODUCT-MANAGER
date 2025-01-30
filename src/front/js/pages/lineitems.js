import React, { useState, useEffect, useContext, useCallback } from 'react';
import "../../styles/customerlist.css";
import { useNavigate } from 'react-router-dom';
import { Context } from '../store/appContext';
import StatusMessage from '../component/StatusMessage';

const LineItems = () => {
    const { store, actions } = useContext(Context);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState("finalizado");
    const [statusMessage, setStatusMessage] = useState("");
    const navigate = useNavigate();

    const fetchLineItems = useCallback(() => {
        actions.getLineItems(page, perPage);
    }, [actions, page, perPage]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found");
            navigate("/");
            return;
        }
        fetchLineItems();
    }, [navigate, fetchLineItems]);

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
                    fetchLineItems();
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
                    fetchLineItems();
                })
                .catch(error => {
                    console.error("Error al editar la nota:", error);
                });
        }
    };

    const handleFinalizeItem = (itemId) => {
        actions.updateLineItemStatus(itemId, "finalizado")
            .then(() => {
                fetchLineItems();
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
        Promise.all(selectedItems.map(itemId => 
            actions.updateLineItemStatus(itemId, selectedStatus)
        ))
        .then(() => {
            setSelectedItems([]);
            fetchLineItems();
            setStatusMessage("Estados modificados correctamente");
            setTimeout(() => setStatusMessage(""), 3000);
        })
        .catch(error => {
            console.error("Error al modificar los estados:", error);
            setStatusMessage("Error al modificar los estados");
            setTimeout(() => setStatusMessage(""), 3000);
        });
    };

    const filteredLineItems = store.lineItems.filter(item => ["pendiente", "en_proceso", "finalizado"].includes(item.status));

    return (
        <div className='border rounded-3 m-5 justify-content-center'>
            {statusMessage && <StatusMessage message={statusMessage} onClose={() => setStatusMessage("")} />}
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
                                    checked={selectedItems.length === filteredLineItems.length}
                                />
                            </th>
                            <th>ID</th>
                            <th>Pedido</th>
                            <th>Empresa</th>
                            <th>Producto</th>
                            <th>Cliente</th>
                            <th>Cantidad</th>
                            <th>Estado</th>
                            <th>Nota Interna</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLineItems.map(item => (
                            <tr key={item.id}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.includes(item.id)}
                                        onChange={() => handleSelectItem(item.id)}
                                    />
                                </td>
                                <td>{item.id}</td>
                                <td>{item.order_number}</td>
                                <td>{item.billing_company}</td>
                                <td>{item.name}</td>
                                <td>{item.customer_firstname} {item.customer_lastname}</td>
                                <td>{item.quantity}</td>
                                <td>{item.status}</td>
                                <td>
                                    {item.internal_note ? (
                                        <span onClick={() => handleEditNote(item.id, item.internal_note)}>
                                            {item.internal_note}
                                        </span>
                                    ) : (
                                        <button onClick={() => handleAddNote(item.id, prompt("Agregar nota interna:"))}>
                                            Agregar nota
                                        </button>
                                    )}
                                </td>
                                <td>
                                    {item.status !== "finalizado" && (
                                        <button onClick={() => handleFinalizeItem(item.id)}>Finalizar</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div>
                    <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
                        Anterior
                    </button>
                    <span>Página {page}</span>
                    <button onClick={() => handlePageChange(page + 1)}>
                        Siguiente
                    </button>
                    <select value={perPage} onChange={handlePerPageChange}>
                        <option value={10}>10 por página</option>
                        <option value={20}>20 por página</option>
                        <option value={50}>50 por página</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default LineItems;