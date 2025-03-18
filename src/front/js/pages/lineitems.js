import React, { useState, useEffect, useContext, useCallback } from 'react';
import "../../styles/customerlist.css";
import { useNavigate } from 'react-router-dom';
import { Context } from '../store/appContext';
import StatusMessage from '../component/StatusMessage';
import ReactPaginate from 'react-paginate';

const LineItems = () => {
    const { store, actions } = useContext(Context);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState("finalizado");
    const [statusMessage, setStatusMessage] = useState("");
    const [sortOrder, setSortOrder] = useState('desc');
    const [sortBy, setSortBy] = useState('date_created');
    const navigate = useNavigate();

    const fetchLineItems = useCallback(() => {
        actions.getLineItems(page, perPage, null, { sortBy, sortOrder });
    }, [actions, page, perPage, sortBy, sortOrder]);

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

    const handlePageClick = (selected) => {
        console.log('pageNumber:', selected);
        setPage(selected + 1);
    };
    const handlePerPageChange = (event) => {
        const newPerPage = parseInt(event.target.value, 10);
        if (newPerPage !== perPage) {
            setPerPage(newPerPage);
        }
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const handleAddNote = (itemId, note) => {
        if (note) {
            actions.updateInternalNoteToLineItem(itemId, note)
                .then(() => {
                    actions.getLineItems(page, perPage, null, { sortBy, sortOrder });
                    setStatusMessage("Nota agregada correctamente.");
                    setTimeout(() => setStatusMessage(""), 3000);
                })
                .catch(error => {
                    console.error("Error al agregar la nota:", error);
                    setStatusMessage("Error al agregar la nota.");
                    setTimeout(() => setStatusMessage(""), 3000);
                });
        }
    };

    const handleEditNote = (itemId, currentNote) => {
        const newNote = prompt("Edita la nota:", currentNote);
        if (newNote !== null && newNote !== currentNote) {
            actions.updateInternalNoteToLineItem(itemId, newNote)
                .then(() => {
                    actions.getLineItems(page, perPage, null, { sortBy, sortOrder });
                    setStatusMessage("Nota editada correctamente.");
                    setTimeout(() => setStatusMessage(""), 3000);
                })
                .catch(error => {
                    console.error("Error al editar la nota:", error);
                    setStatusMessage("Error al editar la nota.");
                    setTimeout(() => setStatusMessage(""), 3000);
                });
        }
    };

    const handleFinalizeItem = async (itemId) => {
        try {
            await actions.updateLineItemStatus(itemId, "finalizado");
            updateLineItemStatusInStore(itemId, "finalizado");
            setStatusMessage("Producto terminado");
            setTimeout(() => setStatusMessage(""), 3000);
            checkAndUpdateOrderStatus();
        } catch (error) {
            console.error("Error al finalizar el producto:", error);
            setStatusMessage("Error al finalizar el producto");
            setTimeout(() => setStatusMessage(""), 3000);
        }
    };

    const handlePendingItem = async (itemId) => {
        try {
            await actions.updateLineItemStatus(itemId, "pendiente");
            updateLineItemStatusInStore(itemId, "pendiente");
            setStatusMessage("Item cambiado a pendiente correctamente");
            setTimeout(() => setStatusMessage(""), 3000);
        } catch (error) {
            console.error("Error al cambiar el estado a pendiente:", error);
            setStatusMessage("Error al cambiar el estado a pendiente");
            setTimeout(() => setStatusMessage(""), 3000);
        }
    };

    const updateLineItemStatusInStore = (itemId, newStatus) => {
        const updatedLineItems = store.lineItems.map(item =>
            item.id === itemId ? { ...item, status: newStatus } : item
        );
        actions.setLineItems(updatedLineItems);
        // Forzar actualización del componente
        setSelectedItems(prevSelectedItems => [...prevSelectedItems]);
        setPage(page); // Forzar re-renderizado
    };

    const handleSelectItem = (itemId) => {
        setSelectedItems(prevSelected =>
            prevSelected.includes(itemId)
                ? prevSelected.filter(id => id !== itemId)
                : [...prevSelected, itemId]
        );
    };

    const handleFinalizeSelectedItems = async () => {
        try {
            await Promise.all(selectedItems.map(itemId =>
                actions.updateLineItemStatus(itemId, selectedStatus)
            ));
            updateSelectedItemsStatusInStore(selectedItems, selectedStatus);
            setSelectedItems([]);
            setStatusMessage("Estados modificados correctamente");
            setTimeout(() => setStatusMessage(""), 3000);
            checkAndUpdateOrderStatus();
        } catch (error) {
            console.error("Error al modificar los estados:", error);
            setStatusMessage("Error al modificar los estados");
            setTimeout(() => setStatusMessage(""), 3000);
        }
    };

    const updateSelectedItemsStatusInStore = (itemIds, newStatus) => {
        const updatedLineItems = store.lineItems.map(item =>
            itemIds.includes(item.id) ? { ...item, status: newStatus } : item
        );
        actions.setLineItems(updatedLineItems);
        // Forzar actualización del componente
        setSelectedItems(prevSelectedItems => [...prevSelectedItems]);
        setPage(page); // Forzar re-renderizado
    };

    const checkAndUpdateOrderStatus = () => {
        const allFinalized = store.lineItems.every(item => item.status === "finalizado");
        if (allFinalized) {
            actions.updateOrderStatus("completado")
                .then(() => {
                    setStatusMessage("Orden completada correctamente");
                    setTimeout(() => setStatusMessage(""), 3000);
                })
                .catch(error => {
                    console.error("Error al completar la orden:", error);
                    setStatusMessage("Error al completar la orden");
                    setTimeout(() => setStatusMessage(""), 3000);
                });
        }
    };

    const filteredLineItems = store.lineItems.filter(item => ["pendiente", "en_proceso", "finalizado"].includes(item.status));

    const getRowClass = (status) => {
        switch (status) {
            case 'pendiente':
                return 'bg-light-red';
            case 'finalizado':
                return 'bg-light-green';
            default:
                return '';
        }
    };
    const totalPages = Math.ceil(store.totaltotal_items / perPage) || 1;

    return (
        <div className='border rounded-3 m-5 justify-content-center'>
            {statusMessage && <StatusMessage message={statusMessage} onClose={() => setStatusMessage("")} />}
            <h3 className='m-4'>Control de Producción</h3>
            <div className="m-3">
                <label className='status-selector' htmlFor="statusSelector">Cambiar estado a:</label>
                <select
                    id="statusSelector"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="custom-select"
                >
                    <option value="finalizado">Finalizado</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="en_proceso">En Proceso</option>
                </select>
                <button className='btn btn-item-status ms-2' onClick={handleFinalizeSelectedItems} disabled={selectedItems.length === 0}>
                    Cambiar
                </button>
                <table className='table caption-top'>
                    <caption className='p-3'>Trabajos</caption>
                    <thead className="table-header">
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
                            <th onClick={() => handleSort('date_created')} style={{ cursor: 'pointer' }}>
                                Pedido {sortBy === 'date_created' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th>Empresa</th>
                            <th>Producto</th>
                            <th>Cliente</th>
                            <th>Cantidad</th>
                            <th>Estado</th>
                            <th>Fecha de Salida Estimada</th>
                            <th>Nota Interna</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLineItems.map(item => (
                            <tr key={item.id} className={getRowClass(item.status)}>
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
                                <td>{item.estimated_departure_date}</td>
                                <td>
                                    {item.internal_note ? (
                                        <button onClick={() => handleEditNote(item.id, item.internal_note)} className="btn btn-link">
                                            {item.internal_note}
                                        </button>
                                    ) : (
                                        <button onClick={() => handleAddNote(item.id, prompt("Agregar nota interna:"))} className="btn btn-add-note">
                                            Agregar nota
                                        </button>
                                    )}
                                </td>
                                <td>
                                    {item.status === "pendiente" && (
                                        <button onClick={() => handleFinalizeItem(item.id)} className="btn btn-item-status">Finalizar</button>
                                    )}
                                    {item.status === "finalizado" && (
                                        <button onClick={() => handlePendingItem(item.id)} className="btn btn-item-status">Pendiente</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="d-flex justify-content-end m-2 pagination">
                    <ReactPaginate className='pagination'
                        previousLabel={"← Anterior"}
                        nextLabel={"Siguiente →"}
                        breakLabel={"..."}
                        breakClassName={"break-me"}
                        pageCount={totalPages}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={5}
                        onPageChange={handlePageClick} // Pasar el índice de la página directamente
                        containerClassName={"pagination"}
                        subContainerClassName={"pages pagination"}
                        activeClassName={"active"}
                        previousClassName={"page-item"}
                        nextClassName={"page-item"}
                        pageClassName={"page-item"}
                        pageLinkClassName={"page-link"}
                        previousLinkClassName={"page-link"}
                        nextLinkClassName={"page-link"}
                    />
                </div>
            </div>
        </div>
    );
};

export default LineItems;