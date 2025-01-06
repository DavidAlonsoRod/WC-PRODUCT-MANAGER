import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { Context } from '../store/appContext';
import { QrReader } from 'react-qr-reader';

const ScanQR = () => {
    const { actions } = useContext(Context);
    const [scannedData, setScannedData] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState("finalizado");
    const navigate = useNavigate();

    const handleScan = async (data) => {
        if (data && !scannedData.includes(data)) {
            setScannedData(prevData => [...prevData, data]);
            try {
                const itemId = parseInt(data, 10); // Asumiendo que el QR contiene el ID del line item
                await actions.updateLineItemStatus(itemId, selectedStatus);
                alert(`Line item ${itemId} ${selectedStatus} con éxito`);
            } catch (error) {
                console.error(`Error al cambiar el estado del line item a ${selectedStatus}:`, error);
                alert(`Error al cambiar el estado del line item a ${selectedStatus}`);
            }
        }
        // Reiniciar el escaneo después de procesar el resultado
        setTimeout(() => {
            setScannedData(prevData => [...prevData]);
        }, 500);
    };

    const handleError = (err) => {
        console.error(err);
    };

    const handleFinalizeBatch = () => {
        navigate("/lineitems");
    };

    return (
        <div>
            <h1>Escanear QR</h1>
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
            <QrReader
                delay={300}
                onError={handleError}
                onResult={(result, error) => {
                    if (!!result) {
                        handleScan(result?.text);
                    }
                    if (!!error) {
                        handleError(error);
                    }
                }}
                style={{ width: '100%', height: '100vh' }} // Aumentar el tamaño del lector de QR
                constraints={{ facingMode: 'environment' }}
                scanDelay={300}
            />
            {scannedData.length > 0 && (
                <div>
                    <h2>Data escaneada:</h2>
                    <ul>
                        {scannedData.map((data, index) => (
                            <li key={index}>{data}</li>
                        ))}
                    </ul>
                    <button onClick={handleFinalizeBatch}>Finalizar Lote</button>
                </div>
            )}
        </div>
    );
};

export default ScanQR;
