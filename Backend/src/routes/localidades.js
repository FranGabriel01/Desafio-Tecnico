const express = require('express');
const router = express.Router();
const { obtenerLocalidades } = require('../controllers/localidadesController');

/**
 * GET /api/localidades
 * Obtiene todas las localidades de Argentina
 */
router.get('/', async (req, res) => {
  try {
    const localidades = await obtenerLocalidades();
    res.json(localidades);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
