import React from "react";
import PropTypes from "prop-types";



function PaginateController({ currentPage, totalPages, onPageChange, perPage, handlePerPageChange }) {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className='d-flex justify-content-between m-2'>
            <div className="d-flex justify-content-end m-2 pagination">
                {Array.from({ length: totalPages }, (_, index) => (
                    <span
                        key={index + 1}
                        onClick={() => handlePageClick(index + 1)}
                        style={{
                            cursor: 'pointer',
                            fontWeight: page === index + 1 ? 'bold' : 'normal',
                            margin: '0 5px'
                        }}
                    >
                        {index + 1}
                    </span>
                ))}
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