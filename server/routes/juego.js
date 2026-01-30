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

// --- 3. OBTENER INFORME COMPLETO (Sala + Jugadores) ---
router.get('/sala/:codigoSala', async (req, res) => {
    try {
        const { codigoSala } = req.params;

        // A. BUSCAR LA FICHA DE LA SALA (Aquí está el tamaño maxJugadores y el Host)
        // Esto es lo que te faltaba:
        const infoSala = await Sala.findOne({ nombre: codigoSala });
        
        if (!infoSala) {
            return res.status(404).json({ mensaje: "Sala no encontrada" });
        }

        // B. BUSCAR LA LISTA DE PERSONAS
        const jugadores = await Entrenador.find({ sala: codigoSala });

        // C. ENVIAR EL PAQUETE COMPLETO
        // Antes enviabas solo 'jugadores', ahora enviamos un objeto con dos cosas:
        res.json({
            sala: infoSala,      // Datos de la casa (reglas, tamaño, host)
            jugadores: jugadores // La gente que hay dentro
        });

    } catch (error) {
        console.error("Error cargando sala:", error);
        res.status(500).json({ error: "Error al cargar la sala" });
    }
});

module.exports = router;