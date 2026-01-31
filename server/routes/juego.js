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
    const { nombre, sala } = req.body;

    // 1. Validaciones básicas
    if (!nombre || !sala) {
        return res.status(400).json({ mensaje: "Faltan datos (nombre o sala)" });
    }

    try {
        // 2. VERIFICACIÓN CRÍTICA: ¿Existe la sala?
        // Buscamos en la colección de 'Sala' que creamos en el paso anterior
        const salaEncontrada = await Sala.findOne({ nombre: sala });

        if (!salaEncontrada) {
            return res.status(404).json({ mensaje: "La sala no existe. Pídele al Host que la cree primero." });
        }

        // 3. (Opcional) Verificar si la sala está llena
        const jugadoresActuales = await Entrenador.countDocuments({ sala: sala });
        if (jugadoresActuales >= salaEncontrada.maxJugadores) {
            return res.status(403).json({ mensaje: "La sala está llena." });
        }

        // 4. Lógica de "Upsert" del Jugador (Crear o Recuperar)
        let entrenador = await Entrenador.findOne({ nombre: nombre, sala: sala });
        
        if (!entrenador) {
            entrenador = new Entrenador({ 
                nombre: nombre, 
                sala: sala, 
                pokemons: [] 
            });
            await entrenador.save();
        }

        // 5. RESPUESTA EXITOSA
        // Devolvemos tanto el usuario como la info de la sala para el frontend
        res.status(200).json({ 
            entrenador: entrenador, 
            salaInfo: salaEncontrada 
        });

    } catch (error) {
        console.error("Error en /unirse:", error);
        res.status(500).json({ mensaje: "Error interno del servidor al unirse." });
    }
});

// --- 3. OBTENER JUGADORES DE UNA SALA ---
// --- 3. OBTENER INFORME COMPLETO DE SALA (DASHBOARD) ---
router.get('/sala/:codigoSala', async (req, res) => {
    try {
        const { codigoSala } = req.params;

        // A. Buscar la FICHA de la sala (Para saber el Host y el Máximo de jugadores)
        const infoSala = await Sala.findOne({ nombre: codigoSala });
        
        if (!infoSala) {
            return res.status(404).json({ mensaje: "Sala no encontrada" });
        }

        // B. Buscar la LISTA de jugadores
        const jugadores = await Entrenador.find({ sala: codigoSala });

        // C. Enviar AMBOS datos en un solo paquete
        res.json({
            sala: infoSala,      // Aquí viaja maxJugadores, host, reglas...
            jugadores: jugadores // Aquí viaja el array de entrenadores
        });

    } catch (error) {
        console.error("Error al cargar sala:", error);
        res.status(500).json({ error: "Error interno al cargar la sala" });
    }
});

// --- 4. REGISTRAR CAPTURA (Añadir Pokémon al equipo) ---
router.put('/capturar', async (req, res) => {
    // Recibimos: ID del entrenador y los datos del bicho
    const { entrenadorId, pokemon } = req.body;

    // 1. Validaciones de seguridad
    if (!entrenadorId || !pokemon || !pokemon.especie) {
        return res.status(400).json({ mensaje: "Faltan datos de la captura" });
    }

    try {
        // 2. Buscar al entrenador en la Base de Datos
        const entrenador = await Entrenador.findById(entrenadorId);
        
        if (!entrenador) {
            return res.status(404).json({ mensaje: "Entrenador no encontrado" });
        }

        // 3. Añadir el Pokémon al Array 'pokemons'
        // Usamos push para meterlo al final de la lista
        entrenador.pokemons.push({
            especie: pokemon.especie.toLowerCase(), // Estandarizamos a minúsculas
            mote: pokemon.mote || pokemon.especie,  // Si no hay mote, usa la especie
            nivel: pokemon.nivel || 5,
            estado: pokemon.estado || "equipo",     // 'equipo', 'caja', 'cementerio'
            tipo: pokemon.tipo || "normal",         // Lo usaremos para colores
            fechaCaptura: new Date()
        });

        // 4. Guardar cambios en MongoDB
        await entrenador.save();

        console.log(`✅ Captura registrada: ${pokemon.especie} para ${entrenador.nombre}`);

        // 5. Devolver el entrenador actualizado
        res.json({ 
            mensaje: "Captura exitosa", 
            entrenador: entrenador 
        });

    } catch (error) {
        console.error("Error al capturar:", error);
        res.status(500).json({ mensaje: "Error interno al guardar el Pokémon" });
    }
});

module.exports = router;