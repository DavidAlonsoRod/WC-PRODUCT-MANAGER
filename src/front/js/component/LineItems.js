import React, { useState } from "react";
import PaginateController from "./PaginateController";
// ...existing code...

function LineItems() {
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const totalPages = 10; // Ajusta esto según tus necesidades

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePerPageChange = (event) => {
        setPerPage(Number(event.target.value));
    };

    return (
        <div>
            {/* ...existing code... */}
            <PaginateController
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                perPage={perPage}
                handlePerPageChange={handlePerPageChange}
            />
            {/* ...existing code... */}
        </div>
    );
}

export default LineItems;