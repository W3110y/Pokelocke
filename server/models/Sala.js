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
    fechaCreacion: { type: Date, default: Date.now },           // "created-at"
    ruleta: {
        type: [{
            nombre: String,
            peso: Number
        }],
    // Le ponemos una ruleta por defecto para que las salas no estén vacías al crearse
    default: [
        { nombre: "Poción", peso: 40 },
        { nombre: "Nada", peso: 50 },
        { nombre: "Fallo Crítico", peso: 10 }
    ]
    }
});

module.exports = mongoose.model('Sala', SalaSchema);