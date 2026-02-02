const mongoose = require('mongoose');

// Esquema del Pokémon individual (Embebido)
const PokemonSchema = new mongoose.Schema({
    especie: { type: String, required: true }, // "bulbasaur"
    mote: String,
    nivel: { type: Number, default: 5 },
    estado: { 
        type: String, 
        enum: ['equipo', 'caja', 'cementerio'], 
        default: 'equipo' 
    },
    imagen: String // Opcional: URL de la imagen si decides guardarla
});

// Esquema del Entrenador (Jugador)
const EntrenadorSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    sala: { type: String, required: true }, // Código "Lobby"
    medallas: { type: Number, default: 0 },
    // --- NUEVOS CAMPOS ---
    vidas: { type: Number, default: 3 }, // Por defecto 3 vidas (clásico Nuzlocke)
    victorias: { type: Number, default: 0 }, // Contador de combates ganados
    // ---------------------
    pokemons: [PokemonSchema], // Array de pokemons
    ultimaConexion: { type: Date, default: Date.now }
});

// Evita que un mismo usuario se registre dos veces en la misma sala
EntrenadorSchema.index({ nombre: 1, sala: 1 }, { unique: true });

module.exports = mongoose.model('Entrenador', EntrenadorSchema);