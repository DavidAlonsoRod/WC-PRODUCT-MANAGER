export const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffMs / (1000 * 60)) % 60;
        if (diffHours > 0) {
            return `${diffHours} horas`;
        } else {
            return `${diffMinutes} minutos`;
        }
    }
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return date.toLocaleDateString(undefined, options);
};

export const getShippingDateClass = (shippingDate) => {
    if (!shippingDate) return 'btn-small';
    const date = new Date(shippingDate);
    const now = new Date();
    const diffMs = date - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) {
        return 'btn btn-urgent btn-small';
    } else if (diffDays <= 3) {
        return 'btn btn-warning btn-small';
    } else {
        return 'btn btn-success btn-small';
    }
};
