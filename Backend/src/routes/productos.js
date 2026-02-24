const express = require('express');
const router = express.Router();
const { obtenerProductosPorDisponibilidad } = require('../controllers/productosController');

/**
 * GET /api/productos?disponibilidad=CABA
 * Obtiene productos filtrados por disponibilidad (CABA o Resto Pais)
 */
router.get('/', async (req, res) => {
  try {
    const { disponibilidad } = req.query;
    
    if (!disponibilidad) {
      return res.status(400).json({ error: 'El parámetro disponibilidad es requerido' });
    }
    
    const productos = await obtenerProductosPorDisponibilidad(disponibilidad);
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
