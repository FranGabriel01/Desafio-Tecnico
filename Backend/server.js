require('dotenv').config();

const app = require('./src/app');
const { obtenerLocalidades } = require('./src/controllers/localidadesController');

const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
    console.log(`Server corriendo en el puerto ${PORT}`);

    // Pre-carga: descarga las localidades de la API externa al iniciar el servidor
    // Así cuando el usuario abra la página, ya están en caché y responde al instante
    console.log('🔄 Pre-cargando localidades...');
    try {
        await obtenerLocalidades();
        console.log('✅ Localidades pre-cargadas correctamente');
    } catch (error) {
        // Si falla la pre-carga, el servidor sigue funcionando normalmente
        // Las localidades se cargarán en la primera petición del usuario
        console.error('⚠️ No se pudieron pre-cargar las localidades:', error.message);
        console.log('ℹ️ Se cargarán cuando el usuario las solicite por primera vez');
    }
});

process.on('unhandledRejection', (error) => {
    console.error('Error no manejado:', error);
    process.exit(1);
});