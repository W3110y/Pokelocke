const mongoose = require('mongoose');

// Esquema del Pokémon individual (Embebido)
const PokemonSchema = new mongoose.Schema({
    especie: { type: String, required: true }, // "bulbasaur"
    mote: String,
    nivel: { type: Number, default: 1 }, // Lo bajamos a 1 por defecto, ya que ahora no influye
    estado: { 
        type: String, 
        enum: ['equipo', 'caja', 'cementerio'], 
        default: 'equipo' 
    },
    imagen: String, // URL de la imagen (necesaria para el Dashboard)
    fechaCaptura: { type: Date, default: Date.now },
    
    // --- NUEVO CAMPO PREPARADO PARA EL FUTURO ---
    tipos: { type: [String], default: [] } // Ej: ["fire", "flying"] - Clave para la calculadora de sinergias
});

// Esquema del Entrenador (Jugador)
const EntrenadorSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    sala: { type: String, required: true }, // Código "Lobby"
    medallas: { type: Number, default: 0 },
    vidas: { type: Number, default: 3 }, // Por defecto 3 vidas (clásico Nuzlocke)
    victorias: { type: Number, default: 0 }, // Contador de combates ganados
    pokemons: [PokemonSchema], // Array de pokemons
    ultimaConexion: { type: Date, default: Date.now }
});

// Evita que un mismo usuario se registre dos veces en la misma sala
EntrenadorSchema.index({ nombre: 1, sala: 1 }, { unique: true });

module.exports = mongoose.model('Entrenador', EntrenadorSchema);