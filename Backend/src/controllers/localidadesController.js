const axios = require('axios');

// --- Caché en memoria ---
// Guardamos las localidades para no consultar la API externa en cada petición
let cacheLocalidades = null;

/**
 * Obtiene todas las localidades de Argentina desde la API del gobierno
 * Usa caché en memoria: la primera vez consulta la API externa,
 * las siguientes devuelve los datos guardados instantáneamente.
 * @returns {Promise<Array>} Array de localidades con formato: {id, nombre, provincia, disponibilidad}
 */
const obtenerLocalidades = async () => {
  try {
    // Si ya tenemos las localidades en caché, las devolvemos sin consultar la API
    if (cacheLocalidades) {
      console.log('📦 Localidades servidas desde caché');
      return cacheLocalidades;
    }

    console.log('🌐 Consultando API externa de localidades...');

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

    // Ordenamos alfabéticamente por nombre para facilitar la búsqueda
    localidadesMapeadas.sort((a, b) => a.nombre.localeCompare(b.nombre));
    
    // Guardamos en caché para las próximas peticiones
    cacheLocalidades = localidadesMapeadas;
    console.log(`✅ ${localidadesMapeadas.length} localidades cargadas y cacheadas`);
    
    return localidadesMapeadas;
    
  } catch (error) {
    // Si hay error en la petición, lanzamos un error descriptivo
    throw new Error(`Error al obtener localidades: ${error.message}`);
  }
};

module.exports = {
  obtenerLocalidades
};
