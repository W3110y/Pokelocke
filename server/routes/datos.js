const express = require('express');
const router = express.Router();
const Movimiento = require('../models/Movimiento');

/* ========================================================= */
/* 1. RUTA PÚBLICA: OBTENER DICCIONARIO                      */
/* ========================================================= */
router.get('/movimientos', async (req, res) => {
    try {
        // Obtenemos solo los campos necesarios para aligerar la carga
        const movimientos = await Movimiento.find({}, 'nombreEsp nombreIng');
        res.json(movimientos);
    } catch (error) {
        res.status(500).json({ mensaje: "Error obteniendo movimientos" });
    }
});

/* ========================================================= */
/* 2. RUTA DE ADMINISTRACIÓN: LLENAR BASE DE DATOS (SEED)    */
/* ========================================================= */
// Esta ruta se llama una vez para inicializar los datos.
// Nota: En un entorno real, esto se haría con un script separado, no una ruta web.
router.post('/semilla-movimientos', async (req, res) => {
    try {
        // Verificamos si ya hay datos para no duplicar
        const count = await Movimiento.countDocuments();
        if (count > 0) {
            return res.status(400).json({ mensaje: `Ya existen ${count} movimientos. Borra la colección si quieres reiniciar.` });
        }

        // LISTA INICIAL (Top Competitivo + Comunes)
        // Puedes ampliar esta lista tanto como quieras o crear un script que lea de PokeAPI.
        const listaInicial = [
            // Fuego
            { nombreEsp: "Lanzallamas", nombreIng: "Flamethrower" },
            { nombreEsp: "Llamarada", nombreIng: "Fire Blast" },
            { nombreEsp: "Envite Igneo", nombreIng: "Flare Blitz" },
            { nombreEsp: "Fuego Fatuo", nombreIng: "Will-O-Wisp" },
            { nombreEsp: "Sofoco", nombreIng: "Overheat" },
            // Agua
            { nombreEsp: "Surf", nombreIng: "Surf" },
            { nombreEsp: "Hidrobomba", nombreIng: "Hydro Pump" },
            { nombreEsp: "Escaldar", nombreIng: "Scald" },
            { nombreEsp: "Cascada", nombreIng: "Waterfall" },
            { nombreEsp: "Acua Jet", nombreIng: "Aqua Jet" },
            // Planta
            { nombreEsp: "Rayo Solar", nombreIng: "Solar Beam" },
            { nombreEsp: "Gigadrenado", nombreIng: "Giga Drain" },
            { nombreEsp: "Drenadoras", nombreIng: "Leech Seed" },
            { nombreEsp: "Lluevehojas", nombreIng: "Leaf Storm" },
            // Eléctrico
            { nombreEsp: "Rayo", nombreIng: "Thunderbolt" },
            { nombreEsp: "Voltiocambio", nombreIng: "Volt Switch" },
            { nombreEsp: "Trueno", nombreIng: "Thunder" },
            // Tierra/Roca
            { nombreEsp: "Terremoto", nombreIng: "Earthquake" },
            { nombreEsp: "Trampa Rocas", nombreIng: "Stealth Rock" },
            { nombreEsp: "Avalancha", nombreIng: "Rock Slide" },
            { nombreEsp: "Roca Afilada", nombreIng: "Stone Edge" },
            { nombreEsp: "Tierra Viva", nombreIng: "Earth Power" },
            // Volador
            { nombreEsp: "Pájaro Osado", nombreIng: "Brave Bird" },
            { nombreEsp: "Respiro", nombreIng: "Roost" },
            { nombreEsp: "Acróbata", nombreIng: "Acrobatics" },
            { nombreEsp: "Despejar", nombreIng: "Defog" },
            // Lucha
            { nombreEsp: "A Bocajarro", nombreIng: "Close Combat" },
            { nombreEsp: "Onda Certera", nombreIng: "Focus Blast" },
            { nombreEsp: "Ultrapuño", nombreIng: "Mach Punch" },
            // Psíquico/Fantasma/Siniestro
            { nombreEsp: "Psiquico", nombreIng: "Psychic" },
            { nombreEsp: "Bola Sombra", nombreIng: "Shadow Ball" },
            { nombreEsp: "Triturar", nombreIng: "Crunch" },
            { nombreEsp: "Pulso Umbrio", nombreIng: "Dark Pulse" },
            { nombreEsp: "Desarme", nombreIng: "Knock Off" },
            // Estados/Otros
            { nombreEsp: "Protección", nombreIng: "Protect" },
            { nombreEsp: "Recuperación", nombreIng: "Recover" },
            { nombreEsp: "Danza Espada", nombreIng: "Swords Dance" },
            { nombreEsp: "Sustituto", nombreIng: "Substitute" },
            { nombreEsp: "Ida y Vuelta", nombreIng: "U-turn" }
        ];

        await Movimiento.insertMany(listaInicial);

        res.json({ mensaje: `¡Éxito! Se han insertado ${listaInicial.length} movimientos en la base de datos.` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al poblar la base de datos" });
    }
});

module.exports = router;