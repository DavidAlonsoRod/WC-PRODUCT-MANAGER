import React, { useEffect } from 'react';

const StatusMessage = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div style={{
            color: 'green',
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            backgroundColor: '#d4edda',
            padding: '20px',
            border: '1px solid gray',
            borderRadius: '10px'
        }}>
            {message}
        </div>
    );
};

export default StatusMessage;
