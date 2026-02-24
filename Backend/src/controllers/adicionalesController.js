const db = require('../config/db');

/**
 * Obtiene adicionales filtrados por tipo compatible
 * @param {string} tipoProducto - 'Tv', 'Internet' o 'Combo'
 * @returns {Promise<Array>} Array de adicionales compatibles
 */
const obtenerAdicionalesPorTipo = async (tipoProducto) => {
  try {
    // Validar que se recibió el parámetro
    if (!tipoProducto) {
      throw new Error('El parámetro tipoProducto es requerido');
    }

    // Validar que el valor sea válido
    const tiposValidos = ['Tv', 'Internet', 'Combo'];
    if (!tiposValidos.includes(tipoProducto)) {
      throw new Error('Tipo de producto debe ser "Tv", "Internet" o "Combo"');
    }

    let query;
    let params = [];

    // Lógica de negocio según los requerimientos:
    // - Si el producto es "Combo", muestra TODOS los adicionales (Tv e Internet)
    // - Si el producto es "Tv", muestra solo adicionales con tipo_compatible = 'Tv'
    // - Si el producto es "Internet", muestra solo adicionales con tipo_compatible = 'Internet'
    
    if (tipoProducto === 'Combo') {
      // Combo es compatible con todos los adicionales (Tv e Internet)
      query = 'SELECT * FROM adicionales';
      // No necesitamos parámetros porque traemos todo
    } else {
      // Para Tv o Internet, filtramos por tipo_compatible
      query = 'SELECT * FROM adicionales WHERE tipo_compatible = ?';
      params = [tipoProducto];
    }

    // Ejecutar la query
    const [rows] = await db.query(query, params);
    
    return rows;
    
  } catch (error) {
    // Si hay error, lanzamos un error descriptivo
    throw new Error(`Error al obtener adicionales: ${error.message}`);
  }
};

module.exports = {
  obtenerAdicionalesPorTipo
};
