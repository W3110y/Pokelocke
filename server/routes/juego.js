const express = require('express');
const router = express.Router();
const Entrenador = require('../models/Entrenador');

// 1. UNIRSE O CREAR PARTIDA (POST)
router.post('/unirse', async (req, res) => {
    const { nombre, sala } = req.body;
    try {
        // Busca si existe, si no, crea uno nuevo (Upsert logic)
        let entrenador = await Entrenador.findOne({ nombre, sala });
        
        if (!entrenador) {
            entrenador = new Entrenador({ nombre, sala, pokemons: [] });
            await entrenador.save();
            return res.status(201).json(entrenador);
        }
        res.status(200).json(entrenador);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al unirse a la sala" });
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