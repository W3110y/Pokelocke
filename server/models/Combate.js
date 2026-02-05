const mongoose = require('mongoose');

const CombateSchema = new mongoose.Schema({
    sala: { type: String, required: true },
    entrenador1: { type: String, required: true }, // Nombre del Jugador 1
    entrenador2: { type: String, required: true }, // Nombre del Jugador 2
    ganador: { type: String, required: true },     // Nombre del Ganador
    fecha: { type: Date, default: Date.now },
    // --- NUEVOS CAMPOS: INSTANTÁNEAS DE EQUIPO ---
    // Guardaremos un array con las URLs de las imágenes de los pokémon
    equipo1Snapshot: { type: [String], default: [] }, 
    equipo2Snapshot: { type: [String], default: [] }
});

module.exports = mongoose.model('Combate', CombateSchema);
