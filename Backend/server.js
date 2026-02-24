require('dotenv').config();

const app = require('./src/app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server corriendo en el puerto ${PORT}`);
});

process.on('unhandledRejection', (error) => {
    console.error('Error no manejado:', error);
    process.exit(1);
});