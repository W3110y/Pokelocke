const mongoose = require('mongoose');

const SalaSchema = new mongoose.Schema({
    nombre: { type: String, required: true, unique: true }, // El "party-name"
    host: { type: String, required: true },                 // El "host-name"
    maxJugadores: { type: Number, default: 4 },             // El "party-size"
    // --- NUEVO CAMPO ---
    vidasIniciales: { type: Number, default: 10 }, 
    // -------------------
    reglas: { type: String },                               // "party-rules"
    descripcion: { type: String },                          // "party-description"
    fechaCreacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Sala', SalaSchema);