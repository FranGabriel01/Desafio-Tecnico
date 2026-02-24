const axios = require('axios');

/**
 * Obtiene todas las localidades de Argentina desde la API del gobierno
 * @returns {Promise<Array>} Array de localidades con formato: {id, nombre, provincia, disponibilidad}
 */
const obtenerLocalidades = async () => {
  try {
    // Hacemos la petición a la API del gobierno argentino
    const response = await axios.get('https://apis.datos.gob.ar/georef/api/localidades?max=5000');
    
    // Extraemos el array de localidades de la respuesta
    const localidades = response.data.localidades;
    
    // Mapeamos cada localidad a nuestro formato personalizado
    const localidadesMapeadas = localidades.map(localidad => {
      const nombreProvincia = localidad.provincia.nombre;
      
      // Determinamos la disponibilidad según la provincia
      // Si es CABA, disponibilidad = "CABA", sino "Resto Pais"
      const disponibilidad = nombreProvincia === 'Ciudad Autónoma de Buenos Aires' 
        ? 'CABA' 
        : 'Resto Pais';
      
      return {
        id: localidad.id,
        nombre: localidad.nombre,
        provincia: nombreProvincia,
        disponibilidad: disponibilidad
      };
    });
    
    return localidadesMapeadas;
    
  } catch (error) {
    // Si hay error en la petición, lanzamos un error descriptivo
    throw new Error(`Error al obtener localidades: ${error.message}`);
  }
};

module.exports = {
  obtenerLocalidades
};
