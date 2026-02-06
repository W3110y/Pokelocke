const mongoose = require('mongoose');

const MovimientoSchema = new mongoose.Schema({
    nombreEsp: { type: String, required: true, unique: true }, // Ej: "Lanzallamas"
    nombreIng: { type: String, required: true },               // Ej: "Flamethrower"
    tipo: { type: String },                                    // Ej: "fire" (Opcional, para futuros filtros)
    categoria: { type: String }                                // Ej: "special" (Opcional)
});

// Índice para búsquedas rápidas
// MovimientoSchema.index({ nombreEsp: 1 });

module.exports = mongoose.model('Movimiento', MovimientoSchema);