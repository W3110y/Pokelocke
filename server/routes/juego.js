const express = require('express');
const router = express.Router();

// Importación de Modelos
const Entrenador = require('../models/Entrenador');
const Sala = require('../models/Sala');
const Combate = require('../models/Combate');

/* ========================================================= */
/* 1. GESTIÓN DE SALAS (Crear, Unirse, Borrar, Info)         */
/* ========================================================= */

// CREAR SALA Y HOST
router.post('/crear', async (req, res) => {
    const { hostName, partyName, partySize, rules, description, vidas } = req.body;

    try {
        const salaExistente = await Sala.findOne({ nombre: partyName });
        if (salaExistente) {
            return res.status(400).json({ mensaje: "Este nombre de Party ya existe. Elige otro." });
        }

        const nuevaSala = new Sala({
            nombre: partyName,
            host: hostName,
            maxJugadores: partySize,
            reglas: rules,
            descripcion: description,
            vidasIniciales: parseInt(vidas) || 10 // Guardamos el valor o 10 por defecto
        });
        await nuevaSala.save();

        let entrenador = await Entrenador.findOne({ nombre: hostName, sala: partyName });
        if (!entrenador) {
            entrenador = new Entrenador({ 
                nombre: hostName, 
                sala: partyName, 
                pokemons: [],
                vidas: parseInt(vidas) || 10 // Vidas iniciales también para el jugador
            });
            await entrenador.save();
        }

        res.status(201).json({ sala: nuevaSala, entrenador: entrenador });

    } catch (error) {
        console.error("Error creando sala:", error);
        res.status(500).json({ mensaje: "Error al crear la partida" });
    }
});

// UNIRSE A SALA
router.post('/unirse', async (req, res) => {
    const { nombre, sala } = req.body;

    if (!nombre || !sala) return res.status(400).json({ mensaje: "Faltan datos" });

    try {
        const salaEncontrada = await Sala.findOne({ nombre: sala });
        if (!salaEncontrada) return res.status(404).json({ mensaje: "La sala no existe." });

        const jugadoresActuales = await Entrenador.countDocuments({ sala: sala });
        if (jugadoresActuales >= salaEncontrada.maxJugadores) return res.status(403).json({ mensaje: "La sala está llena." });

        let entrenador = await Entrenador.findOne({ nombre: nombre, sala: sala });
        if (!entrenador) {
            entrenador = new Entrenador({ nombre: nombre, sala: sala, pokemons: [] });
            await entrenador.save();
        }

        res.status(200).json({ entrenador: entrenador, salaInfo: salaEncontrada });

    } catch (error) {
        console.error("Error en /unirse:", error);
        res.status(500).json({ mensaje: "Error al unirse." });
    }
});

// OBTENER INFO SALA Y JUGADORES (Dashboard)
router.get('/sala/:codigoSala', async (req, res) => {
    try {
        const { codigoSala } = req.params;
        const infoSala = await Sala.findOne({ nombre: codigoSala });
        
        if (!infoSala) return res.status(404).json({ mensaje: "Sala no encontrada" });

        const jugadores = await Entrenador.find({ sala: codigoSala });
        // --- LÓGICA DE CÁLCULO DE VIDAS ---
        // Recorremos cada jugador antes de enviarlo al frontend
        const jugadoresCalculados = jugadores.map(Entrenador => {
            // 1. Contamos cuántos pokemons tienen estado 'muerto' o 'cementerio'
            const muertos = Entrenador.pokemons.filter(p => p.estado === 'muerto' || p.estado === 'cementerio').length;
            
            // 2. Calculamos vidas restantes
            let vidasRestantes = infoSala.vidasIniciales - muertos;
            if (vidasRestantes < 0) vidasRestantes = 0; // No permitir negativos

            // 3. Actualizamos el objeto jugador (solo en memoria para la respuesta, o guardamos si prefieres)
            // Para ser seguros, lo devolvemos calculado:
            return {
                ...Entrenador.toObject(), // Convertimos documento Mongoose a objeto JS
                vidas: vidasRestantes  // Sobrescribimos con el cálculo real
            };
        });
        res.json({ sala: infoSala, jugadores: jugadoresCalculados });

    } catch (error) {
        console.error("Error al cargar sala:", error);
        res.status(500).json({ error: "Error interno" });
    }
});

// BORRAR SALA (Solo Host)
router.delete('/sala', async (req, res) => {
    const { nombreSala, hostNombre } = req.body;

    try {
        const sala = await Sala.findOne({ nombre: nombreSala });
        if (!sala) return res.status(404).json({ mensaje: "Sala no encontrada" });
        if (sala.host !== hostNombre) return res.status(403).json({ mensaje: "Solo el Host puede borrar la sala" });

        await Entrenador.deleteMany({ sala: nombreSala });
        await Sala.deleteOne({ nombre: nombreSala });

        console.log(`🗑️ Sala '${nombreSala}' eliminada.`);
        res.json({ mensaje: "Sala eliminada con éxito" });

    } catch (error) {
        console.error("Error al borrar sala:", error);
        res.status(500).json({ mensaje: "Error interno" });
    }
});

/* ========================================================= */
/* 2. GESTIÓN DE JUGADOR (Vidas, Medallas, Victorias)        */
/* ========================================================= */

router.put('/vidas', async (req, res) => {
    const { entrenadorId, cambio } = req.body;
    try {
        const entrenador = await Entrenador.findById(entrenadorId);
        if (!entrenador) return res.status(404).json({ mensaje: "Entrenador no encontrado" });

        let nuevasVidas = entrenador.vidas + cambio;
        if (nuevasVidas < 0) nuevasVidas = 0;

        entrenador.vidas = nuevasVidas;
        await entrenador.save();
        res.json({ mensaje: "Vidas actualizadas", vidas: nuevasVidas });
    } catch (error) { res.status(500).json({ mensaje: "Error al actualizar vidas" }); }
});

router.put('/medallas', async (req, res) => {
    const { entrenadorId, cantidad } = req.body;
    try {
        const entrenador = await Entrenador.findByIdAndUpdate(entrenadorId, { medallas: cantidad }, { new: true });
        if (!entrenador) return res.status(404).json({ mensaje: "Entrenador no encontrado" });
        res.json({ mensaje: "Medallas actualizadas", medallas: entrenador.medallas });
    } catch (error) { res.status(500).json({ mensaje: "Error medallas" }); }
});

router.put('/victoria', async (req, res) => {
    const { entrenadorId } = req.body;
    try {
        const entrenador = await Entrenador.findByIdAndUpdate(entrenadorId, { $inc: { victorias: 1 } }, { new: true });
        res.json({ mensaje: "Victoria registrada", victorias: entrenador.victorias });
    } catch (error) { res.status(500).json({ mensaje: "Error victoria" }); }
});

/* ========================================================= */
/* 3. GESTIÓN DE POKÉMON (Captura, Edición, Movimiento)      */
/* ========================================================= */

// CAPTURAR (Crear nuevo)
router.post('/pokemon', async (req, res) => {
    const { entrenadorId, especie, mote, nivel, imagen, tipos } = req.body;

    try {
        const entrenador = await Entrenador.findById(entrenadorId);
        if (!entrenador) return res.status(404).json({ mensaje: "Entrenador no encontrado" });

        let nivelFinal = parseInt(nivel);
        if (nivelFinal > 100) nivelFinal = 100;
        if (nivelFinal < 1) nivelFinal = 1;

        const enEquipo = entrenador.pokemons.filter(p => p.estado === 'equipo').length;
        const estadoInicial = enEquipo < 6 ? 'equipo' : 'caja';
        let mensajeExtra = estadoInicial === 'caja' ? "\n📦 Equipo lleno: Enviado al PC." : "";

        const nuevoPokemon = {
            especie, 
            mote: mote || especie, 
            nivel: nivelFinal, 
            imagen,
            tipo: tipos,
            estado: estadoInicial,
            fechaCaptura: new Date()
        };

        entrenador.pokemons.push(nuevoPokemon);
        await entrenador.save();

        res.json({ mensaje: "¡Pokémon capturado!" + mensajeExtra, pokemon: nuevoPokemon });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al capturar" });
    }
});

// EDITAR (Modificar datos internos)
router.put('/pokemon', async (req, res) => {
    const { entrenadorId, pokemonId, nuevosDatos } = req.body;

    try {
        const entrenador = await Entrenador.findById(entrenadorId);
        const pokemon = entrenador.pokemons.id(pokemonId);
        
        if (!pokemon) return res.status(404).json({ mensaje: "Pokémon no encontrado" });

        if (nuevosDatos.nivel) {
            let nvl = parseInt(nuevosDatos.nivel);
            if (nvl > 100) nvl = 100; if (nvl < 1) nvl = 1;
            pokemon.nivel = nvl;
        }
        if (nuevosDatos.mote) pokemon.mote = nuevosDatos.mote;
        if (nuevosDatos.especie) pokemon.especie = nuevosDatos.especie;
        if (nuevosDatos.imagen) pokemon.imagen = nuevosDatos.imagen;
        if (nuevosDatos.tipo) pokemon.tipo = nuevosDatos.tipo;
        
        // Campos avanzados
        if (nuevosDatos.naturaleza) pokemon.naturaleza = nuevosDatos.naturaleza;
        if (nuevosDatos.objeto !== undefined) pokemon.objeto = nuevosDatos.objeto;
        if (nuevosDatos.ataques) pokemon.ataques = nuevosDatos.ataques;

        await entrenador.save();
        res.json({ mensaje: "Datos actualizados correctamente" });
    } catch (error) { res.status(500).json({ mensaje: "Error al editar Pokémon" }); }
});

// MOVER (Cambiar de caja/estado)
router.put('/pokemon/mover', async (req, res) => {
    const { entrenadorId, pokemonId, nuevoEstado } = req.body; 

    try {
        const entrenador = await Entrenador.findById(entrenadorId);
        if (!entrenador) return res.status(404).json({ mensaje: "Entrenador no encontrado" });

        if (nuevoEstado === 'equipo') {
            const equipoActual = entrenador.pokemons.filter(p => p.estado === 'equipo');
            const yaEstaEnEquipo = equipoActual.find(p => p._id.toString() === pokemonId);
            
            if (!yaEstaEnEquipo && equipoActual.length >= 6) {
                return res.status(400).json({ mensaje: "¡Tu equipo está lleno! Deja uno en el PC primero." });
            }
        }

        const pokemon = entrenador.pokemons.id(pokemonId);
        if (!pokemon) return res.status(404).json({ mensaje: "Pokémon no encontrado" });

        pokemon.estado = nuevoEstado;
        await entrenador.save();

        res.json({ mensaje: "Movimiento realizado con éxito" });
    } catch (error) { res.status(500).json({ mensaje: "Error interno" }); }
});

/* ========================================================= */
/* 4. SISTEMA DE COMBATES                                    */
/* ========================================================= */

// REGISTRAR COMBATE (Con Snapshots y validación robusta)
router.post('/combate', async (req, res) => {
    console.log("⚔️ Petición de combate recibida:", req.body);
    const { sala, entrenador1, entrenador2, ganador } = req.body;

    if (!sala || !entrenador1 || !entrenador2 || !ganador) {
        return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
    }

    try {
        // Búsqueda de entrenadores (trim para seguridad)
        const p1 = await Entrenador.findOne({ sala, nombre: entrenador1.trim() });
        const p2 = await Entrenador.findOne({ sala, nombre: entrenador2.trim() });

        if (!p1 || !p2) {
            console.error("❌ Entrenadores no encontrados en BD");
            return res.status(404).json({ mensaje: "Error: Entrenadores no encontrados." });
        }

        // Generar Snapshots de Equipos
        const getFotos = (entrenador) => {
            if (!entrenador.pokemons) return [];
            return entrenador.pokemons.filter(p => p.estado === 'equipo').map(p => p.imagen);
        };

        const nuevoCombate = new Combate({ 
            sala, 
            entrenador1: p1.nombre, 
            entrenador2: p2.nombre, 
            ganador,
            equipo1Snapshot: getFotos(p1),
            equipo2Snapshot: getFotos(p2),
            fecha: new Date()
        });

        await nuevoCombate.save();
        console.log("💾 Combate registrado.");
        
        // Sumar victoria
        const ganadorObj = (ganador === p1.nombre) ? p1 : p2;
        if (ganadorObj) {
            ganadorObj.victorias = (ganadorObj.victorias || 0) + 1;
            await ganadorObj.save();
        }

        res.json({ mensaje: "Combate registrado", combate: nuevoCombate });

    } catch (error) {
        console.error("🔥 Error backend combate:", error);
        res.status(500).json({ mensaje: "Error interno: " + error.message });
    }
});

// OBTENER HISTORIAL
router.get('/combates/:sala', async (req, res) => {
    const { sala } = req.params;
    const { limite } = req.query;

    try {
        let query = Combate.find({ sala }).sort({ fecha: -1 });
        if (limite) query = query.limit(parseInt(limite));
        
        const combates = await query.exec();
        res.json(combates);
    } catch (error) {
        res.status(500).json({ mensaje: "Error obteniendo combates" });
    }
});

module.exports = router;