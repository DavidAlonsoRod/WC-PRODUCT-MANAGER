import React from "react";
import PropTypes from "prop-types";



function PaginateController({ currentPage, totalPages, onPageChange, perPage, handlePerPageChange }) {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className='d-flex justify-content-between m-2'>
            <div className='ms-5'>
                <select value={perPage} onChange={handlePerPageChange} className="custom-select">
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                </select>
            </div>
            <div className='me-5'>
                <button className='btn-pages' onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
                    &lt;
                </button>
                <span>{currentPage}</span>
                <button className='btn-pages' onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                    &gt;
                </button>
            </div>
        </div>
    );
}

PaginateController.propTypes = {
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    perPage: PropTypes.number.isRequired,
    handlePerPageChange: PropTypes.func.isRequired,
};

export default PaginateController;