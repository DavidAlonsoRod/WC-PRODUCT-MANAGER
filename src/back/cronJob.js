const cron = require('node-cron');
const axios = require('axios');

cron.schedule('*/5 * * * *', async () => {
    try {
        await axios.get(`${process.env.BACKEND_URL}/api/importCustomers`);
        await axios.get(`${process.env.BACKEND_URL}/api/importOrders`);
        await axios.get(`${process.env.BACKEND_URL}/api/importLineItems`);
        console.log('Datos importados correctamente');
    } catch (error) {
        console.error('Error al importar datos:', error);
    }
});