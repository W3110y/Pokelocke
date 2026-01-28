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

// --- RUTA ACTUALIZADA: UNIRSE A UNA SALA EXISTENTE ---
router.post('/unirse', async (req, res) => {
    const { nombre, sala } = req.body; // Ojo: frontend envía "sala", no "partyName" aquí

    try {
        // VERIFICAR QUE LA SALA EXISTA
        const salaEncontrada = await Sala.findOne({ nombre: sala });
        if (!salaEncontrada) {
            return res.status(404).json({ mensaje: "La sala no existe. Pide al host que la cree." });
        }

        // Crear o Recuperar Jugador (Upsert)
        let entrenador = await Entrenador.findOne({ nombre: nombre, sala: sala });
        if (!entrenador) {
            entrenador = new Entrenador({ nombre: nombre, sala: sala, pokemons: [] });
            await entrenador.save();
        }

        // Devolver Jugador + Info de Sala (para stats.html)
        res.status(200).json({ 
            entrenador: entrenador, 
            salaInfo: salaEncontrada 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al unirse" });
    }
});

// --- 3. OBTENER JUGADORES DE UNA SALA ---
router.get('/sala/:codigoSala', async (req, res) => {
    try {
        const jugadores = await Entrenador.find({ sala: req.params.codigoSala });
        res.json(jugadores);
    } catch (error) {
        res.status(500).json({ error: "Error al cargar la sala" });
    }
});

module.exports = router;