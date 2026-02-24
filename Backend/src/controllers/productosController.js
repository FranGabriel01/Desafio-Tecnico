const db = require('../config/db');

/**
 * Obtiene productos filtrados por disponibilidad (CABA o Resto Pais)
 * @param {string} disponibilidad - 'CABA' o 'Resto Pais'
 * @returns {Promise<Array>} Array de productos
 */
const obtenerProductosPorDisponibilidad = async (disponibilidad) => {
  try {
    // Validar que se recibió el parámetro
    if (!disponibilidad) {
      throw new Error('El parámetro disponibilidad es requerido');
    }

    // Validar que el valor sea válido
    if (disponibilidad !== 'CABA' && disponibilidad !== 'Resto Pais') {
      throw new Error('Disponibilidad debe ser "CABA" o "Resto Pais"');
    }

    // Consulta SQL con parámetro para evitar SQL injection
    const query = 'SELECT * FROM productos WHERE disponibilidad = ?';
    
    // Ejecutar la query con el parámetro
    // db.query() devuelve [rows, fields], solo necesitamos rows[0]
    const [rows] = await db.query(query, [disponibilidad]);
    
    return rows;
    
  } catch (error) {
    // Si hay error, lanzamos un error descriptivo
    throw new Error(`Error al obtener productos: ${error.message}`);
  }
};

module.exports = {
  obtenerProductosPorDisponibilidad
};
