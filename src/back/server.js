const express = require('express');
const app = express();
const routes = require('../api/routes'); // Asegúrate de que la ruta sea correcta
require('./cronJob');

// ...existing code...

app.use('/api', routes); // Asegúrate de que las rutas estén configuradas correctamente

// ...existing code...

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});