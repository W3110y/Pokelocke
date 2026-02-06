require('dotenv').config(); // Carga variables de entorno
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const rutasJuego = require('./routes/juego');
const rutasDatos = require('./routes/datos'); // <--- NUEVA LÍNEA

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Diagnóstico de Conexión (Para evitar el error 'undefined')
if (!process.env.MONGO_URI) {
    console.error("FATAL ERROR: No se ha definido MONGO_URI en el archivo .env");
    process.exit(1);
}

// Conexión a Base de Datos
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Base de Datos Conectada: Modo Nuzlocke'))
    .catch((err) => console.error('❌ Error de Mongo:', err));

// Rutas
app.use('/api/juego', rutasJuego);
app.use('/api/datos', rutasDatos); // <--- NUEVA LÍNEA

// Arranque
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor listo en puerto ${PORT}`);
});