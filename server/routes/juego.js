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

// --- 4. REGISTRAR CAPTURA (Con límite de 6 y Nivel 100) ---
router.put('/capturar', async (req, res) => {
    const { entrenadorId, pokemon } = req.body;
    if (!entrenadorId || !pokemon) return res.status(400).json({ mensaje: "Datos incompletos" });

    try {
        const entrenador = await Entrenador.findById(entrenadorId);
        if (!entrenador) return res.status(404).json({ mensaje: "Entrenador no encontrado" });

        // A. VALIDACIÓN DE NIVEL (Clamp)
        let nivelFinal = parseInt(pokemon.nivel) || 5;
        if (nivelFinal > 100) nivelFinal = 100;
        if (nivelFinal < 1) nivelFinal = 1;

        // B. VALIDACIÓN DE EQUIPO LLENO (Regla de los 6)
        let estadoFinal = pokemon.estado || "equipo";
        let mensajeExtra = "";

        if (estadoFinal === 'equipo') {
            const enEquipo = entrenador.pokemons.filter(p => p.estado === 'equipo').length;
            if (enEquipo >= 6) {
                estadoFinal = 'caja'; // Desvío automático al PC
                mensajeExtra = " (Equipo lleno: Enviado a la Caja)";
            }
        }

        // C. GUARDADO
        entrenador.pokemons.push({
            id: pokemon.id,
            especie: pokemon.especie.toLowerCase(),
            mote: pokemon.mote || pokemon.especie,
            nivel: nivelFinal,     // Usamos el nivel validado
            estado: estadoFinal,   // Usamos el estado validado
            imagen: pokemon.imagen,
            tipos: pokemon.tipos,
            fechaCaptura: new Date()
        });

        await entrenador.save();

        res.json({ 
            mensaje: "Captura registrada" + mensajeExtra, 
            entrenador,
            estadoAsignado: estadoFinal // Devolvemos esto para avisar al frontend
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al guardar" });
    }
});

// --- 5. EDITAR POKÉMON (Con validación de hueco en equipo) ---
router.put('/pokemon/editar', async (req, res) => {
    const { entrenadorId, pokemonId, nuevosDatos } = req.body;

    try {
        // 1. Buscamos el documento completo para poder validar lógicamente
        const entrenador = await Entrenador.findById(entrenadorId);
        if (!entrenador) return res.status(404).json({ mensaje: "Entrenador no encontrado" });

        // 2. Encontramos el sub-documento (el pokemon específico)
        const poke = entrenador.pokemons.id(pokemonId);
        if (!poke) return res.status(404).json({ mensaje: "Pokémon no encontrado" });

        // 3. VALIDACIÓN DE NIVEL
        let nuevoNivel = parseInt(nuevosDatos.nivel);
        if (nuevoNivel > 100) nuevoNivel = 100;
        if (nuevoNivel < 1) nuevoNivel = 1;

        // 4. VALIDACIÓN DE MOVIMIENTO A EQUIPO
        // Si intentamos moverlo al equipo (y no estaba ya ahí), verificamos hueco.
        if (nuevosDatos.estado === 'equipo' && poke.estado !== 'equipo') {
            const enEquipo = entrenador.pokemons.filter(p => p.estado === 'equipo').length;
            if (enEquipo >= 6) {
                return res.status(400).json({ mensaje: "¡Tu equipo está lleno (6/6)! Envía uno a la caja primero." });
            }
        }

        // 5. Aplicar cambios
        poke.mote = nuevosDatos.mote;
        poke.nivel = nuevoNivel;
        poke.estado = nuevosDatos.estado;

        await entrenador.save();
        res.json({ mensaje: "Pokémon actualizado correctamente" });

    } catch (error) {
        console.error("Error al editar:", error);
        res.status(500).json({ mensaje: "Error interno" });
    }
});

module.exports = router;