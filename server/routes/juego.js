const express = require('express');
const router = express.Router();
const Entrenador = require('../models/Entrenador');
const Sala = require('../models/Sala'); // Importa el nuevo modelo


// --- NUEVA RUTA: CREAR SALA Y HOST ---
router.post('/crear', async (req, res) => {
    // 1. Recibimos los 5 datos del formulario
    const { hostName, partyName, partySize, rules, description } = req.body;

    try {
        // A. Verificar si la sala ya existe
        const salaExistente = await Sala.findOne({ nombre: partyName });
        if (salaExistente) {
            return res.status(400).json({ mensaje: "Este nombre de Party ya existe. Elige otro." });
        }

        // B. Crear la Sala con los datos estáticos
        const nuevaSala = new Sala({
            nombre: partyName,
            host: hostName,
            maxJugadores: partySize,
            reglas: rules,
            descripcion: description
        });
        await nuevaSala.save();

        // C. Crear al Host como Entrenador (igual que hacíamos antes)
        // Usamos la lógica "upsert" por si el usuario ya existía de otra partida
        let entrenador = await Entrenador.findOne({ nombre: hostName, sala: partyName });
        if (!entrenador) {
            entrenador = new Entrenador({ nombre: hostName, sala: partyName, pokemons: [] });
            await entrenador.save();
        }

        // Devolvemos ambos objetos para que el frontend tenga toda la info
        res.status(201).json({ sala: nuevaSala, entrenador: entrenador });

    } catch (error) {
        console.error("Error creando sala:", error);
        res.status(500).json({ mensaje: "Error al crear la partida" });
    }
});

// 2. VER SALA COMPLETA (GET)
router.get('/sala/:codigo', async (req, res) => {
    try {
        const jugadores = await Entrenador.find({ sala: req.params.codigo });
        res.status(200).json(jugadores);
    } catch (error) {
        res.status(500).json({ error: "Error al cargar la sala" });
    }
});

// 3. ACTUALIZAR EQUIPO (PUT)
router.put('/actualizar', async (req, res) => {
    const { id, pokemons, medallas } = req.body;
    try {
        const actualizado = await Entrenador.findByIdAndUpdate(
            id,
            { pokemons, medallas, ultimaConexion: Date.now() },
            { new: true } // Devuelve el dato actualizado
        );
        res.status(200).json(actualizado);
    } catch (error) {
        res.status(500).json({ error: "No se pudo actualizar el equipo" });
    }
});

module.exports = router;