
// ...existing code...
const getCustomerOrders = async ({ store, actions }) => {
    try {
        const response = await fetch('/api/customer/orders'); // Ajusta la URL según tu API
        const data = await response.json();
        store.customerOrders = data;
    } catch (error) {
        console.error("Error fetching customer orders:", error);
    }
};
// ...existing code...
export const actions = {
    // ...existing actions...
    getCustomerOrders,
    // ...existing actions...
};