const cron = require('node-cron');
const axios = require('axios');

cron.schedule('*/5 * * * *', async () => {
    try {
        await axios.get(`${process.env.BACKEND_URL}/api/import_customers`);
        await axios.get(`${process.env.BACKEND_URL}/api/import_orders`);
        await axios.get(`${process.env.BACKEND_URL}/api/import_line_items`);
        console.log('Datos importados correctamente');
    } catch (error) {
        console.error('Error al importar datos:', error);
    }
});