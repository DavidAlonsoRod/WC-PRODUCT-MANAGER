import React from 'react';

const DownloadButton = () => {
    const handleDownload = async () => {
        const response = await fetch('/download_pdf');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'file.pdf');
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
    };

    return (
        <button onClick={handleDownload}>
            Descargar PDF
        </button>
    );
};

export default DownloadButton;