const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Rutas
const productosRoutes = require('./routes/productos');
const adicionalesRoutes = require('./routes/adicionales');
const localidadesRoutes = require('./routes/localidades');

app.use('/api/productos', productosRoutes);
app.use('/api/adicionales', adicionalesRoutes);
app.use('/api/localidades', localidadesRoutes);

app.use((err, req, res, next) =>{
    res.status(500).json({ error: err.message });
})

module.exports = app;
