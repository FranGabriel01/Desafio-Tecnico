const express = require('express');
const router = express.Router();
const { obtenerAdicionalesPorTipo } = require('../controllers/adicionalesController');

/**
 * GET /api/adicionales?tipoProducto=Tv
 * Obtiene adicionales filtrados por tipo de producto (Tv, Internet o Combo)
 */
router.get('/', async (req, res) => {
  try {
    const { tipoProducto } = req.query;
    
    if (!tipoProducto) {
      return res.status(400).json({ error: 'El parámetro tipoProducto es requerido' });
    }
    
    const adicionales = await obtenerAdicionalesPorTipo(tipoProducto);
    res.json(adicionales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
