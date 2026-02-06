const express = require('express');
const router = express.Router();
const Movimiento = require('../models/Movimiento');

/* ========================================================= */
/* 1. OBTENER DICCIONARIO (Frontend lo consume)              */
/* ========================================================= */
router.get('/movimientos', async (req, res) => {
    try {
        const movimientos = await Movimiento.find({}, 'nombreEsp nombreIng').sort({ nombreEsp: 1 });
        res.json(movimientos);
    } catch (error) {
        res.status(500).json({ mensaje: "Error obteniendo movimientos" });
    }
});

/* ========================================================= */
/* 2. REINICIAR Y CARGAR BASE DE DATOS COMPLETA              */
/* ========================================================= */
router.post('/semilla-movimientos', async (req, res) => {
    try {
        // 1. BORRADO PREVIO: Limpiamos la colección para evitar duplicados
        await Movimiento.deleteMany({});
        console.log("🧹 Base de datos de movimientos limpiada.");

        // 2. LISTA MAESTRA (Recopilación Competitiva + Aventura)
        const listaMaestra = [
            // --- FUEGO ---
            { nombreEsp: "Lanzallamas", nombreIng: "Flamethrower" },
            { nombreEsp: "Llamarada", nombreIng: "Fire Blast" },
            { nombreEsp: "Envite Igneo", nombreIng: "Flare Blitz" },
            { nombreEsp: "Fuego Fatuo", nombreIng: "Will-O-Wisp" },
            { nombreEsp: "Sofoco", nombreIng: "Overheat" },
            { nombreEsp: "Puño Fuego", nombreIng: "Fire Punch" },
            { nombreEsp: "Colmillo Igneo", nombreIng: "Fire Fang" },
            { nombreEsp: "Giro Fuego", nombreIng: "Fire Spin" },
            { nombreEsp: "Nitrocarga", nombreIng: "Flame Charge" },
            { nombreEsp: "Calcinación", nombreIng: "Incinerate" },
            { nombreEsp: "Estallido", nombreIng: "Eruption" },
            { nombreEsp: "Dia Soleado", nombreIng: "Sunny Day" },
            { nombreEsp: "Fuego Sagrado", nombreIng: "Sacred Fire" },
            { nombreEsp: "V de Fuego", nombreIng: "V-create" },
            { nombreEsp: "Llama Final", nombreIng: "Burn Up" },
            { nombreEsp: "Calor Estelar", nombreIng: "Mind Blown" },

            // --- AGUA ---
            { nombreEsp: "Surf", nombreIng: "Surf" },
            { nombreEsp: "Hidrobomba", nombreIng: "Hydro Pump" },
            { nombreEsp: "Escaldar", nombreIng: "Scald" },
            { nombreEsp: "Cascada", nombreIng: "Waterfall" },
            { nombreEsp: "Acua Jet", nombreIng: "Aqua Jet" },
            { nombreEsp: "Hidropulso", nombreIng: "Water Pulse" },
            { nombreEsp: "Rayo Burbuja", nombreIng: "Bubble Beam" },
            { nombreEsp: "Salpicar", nombreIng: "Water Spout" },
            { nombreEsp: "Acua Cola", nombreIng: "Aqua Tail" },
            { nombreEsp: "Danza Lluvia", nombreIng: "Rain Dance" },
            { nombreEsp: "Buceo", nombreIng: "Dive" },
            { nombreEsp: "Salmuera", nombreIng: "Brine" },
            { nombreEsp: "Agua Lodosa", nombreIng: "Muddy Water" },
            { nombreEsp: "Hidroariete", nombreIng: "Liquidation" },
            { nombreEsp: "Viraje", nombreIng: "Flip Turn" },

            // --- PLANTA ---
            { nombreEsp: "Rayo Solar", nombreIng: "Solar Beam" },
            { nombreEsp: "Gigadrenado", nombreIng: "Giga Drain" },
            { nombreEsp: "Drenadoras", nombreIng: "Leech Seed" },
            { nombreEsp: "Lluevehojas", nombreIng: "Leaf Storm" },
            { nombreEsp: "Latigo Cepa", nombreIng: "Vine Whip" },
            { nombreEsp: "Hoja Afilada", nombreIng: "Razor Leaf" },
            { nombreEsp: "Bomba Germen", nombreIng: "Seed Bomb" },
            { nombreEsp: "Energibola", nombreIng: "Energy Ball" },
            { nombreEsp: "Espora", nombreIng: "Spore" },
            { nombreEsp: "Paralizador", nombreIng: "Stun Spore" },
            { nombreEsp: "Somnifero", nombreIng: "Sleep Powder" },
            { nombreEsp: "Mazazo", nombreIng: "Wood Hammer" },
            { nombreEsp: "Hoja Aguda", nombreIng: "Leaf Blade" },
            { nombreEsp: "Sintesis", nombreIng: "Synthesis" },
            { nombreEsp: "Aromaterapia", nombreIng: "Aromatherapy" },
            { nombreEsp: "Fitoimpulso", nombreIng: "Solar Blade" },
            { nombreEsp: "Bala Semilla", nombreIng: "Bullet Seed" },
            { nombreEsp: "Fuerza G", nombreIng: "Grav Apple" },
            { nombreEsp: "Batería de Asalto", nombreIng: "Drum Beating" },

            // --- ELÉCTRICO ---
            { nombreEsp: "Rayo", nombreIng: "Thunderbolt" },
            { nombreEsp: "Voltiocambio", nombreIng: "Volt Switch" },
            { nombreEsp: "Trueno", nombreIng: "Thunder" },
            { nombreEsp: "Onda Trueno", nombreIng: "Thunder Wave" },
            { nombreEsp: "Puño Trueno", nombreIng: "Thunder Punch" },
            { nombreEsp: "Colmillo Rayo", nombreIng: "Thunder Fang" },
            { nombreEsp: "Chispa", nombreIng: "Spark" },
            { nombreEsp: "Voltio Cruel", nombreIng: "Wild Charge" },
            { nombreEsp: "Chispazo", nombreIng: "Discharge" },
            { nombreEsp: "Electrocañon", nombreIng: "Zap Cannon" },
            { nombreEsp: "Moflete Estatico", nombreIng: "Nuzzle" },
            { nombreEsp: "Electrotela", nombreIng: "Electroweb" },

            // --- HIELO ---
            { nombreEsp: "Rayo Hielo", nombreIng: "Ice Beam" },
            { nombreEsp: "Ventisca", nombreIng: "Blizzard" },
            { nombreEsp: "Puño Hielo", nombreIng: "Ice Punch" },
            { nombreEsp: "Colmillo Hielo", nombreIng: "Ice Fang" },
            { nombreEsp: "Canto Helado", nombreIng: "Ice Shard" },
            { nombreEsp: "Viento Hielo", nombreIng: "Icy Wind" },
            { nombreEsp: "Chuzos", nombreIng: "Icicle Crash" },
            { nombreEsp: "Carambano", nombreIng: "Icicle Spear" },
            { nombreEsp: "Liofilizacion", nombreIng: "Freeze-Dry" },
            { nombreEsp: "Granizo", nombreIng: "Hail" },
            { nombreEsp: "Paisaje Nevado", nombreIng: "Snowscape" },
            { nombreEsp: "Triple Axel", nombreIng: "Triple Axel" },

            // --- TIERRA ---
            { nombreEsp: "Terremoto", nombreIng: "Earthquake" },
            { nombreEsp: "Tierra Viva", nombreIng: "Earth Power" },
            { nombreEsp: "Excavar", nombreIng: "Dig" },
            { nombreEsp: "Disparo Lodo", nombreIng: "Mud Shot" },
            { nombreEsp: "Bofeton Lodo", nombreIng: "Mud-Slap" },
            { nombreEsp: "Taladradora", nombreIng: "Drill Run" },
            { nombreEsp: "Bomba Fango", nombreIng: "Mud Bomb" },
            { nombreEsp: "Huesomerang", nombreIng: "Bonemerang" },
            { nombreEsp: "Puas", nombreIng: "Spikes" },
            { nombreEsp: "Fuerza Equina", nombreIng: "High Horsepower" },

            // --- ROCA ---
            { nombreEsp: "Avalancha", nombreIng: "Rock Slide" },
            { nombreEsp: "Roca Afilada", nombreIng: "Stone Edge" },
            { nombreEsp: "Trampa Rocas", nombreIng: "Stealth Rock" },
            { nombreEsp: "Tumba Rocas", nombreIng: "Rock Tomb" },
            { nombreEsp: "Pedrada", nombreIng: "Rock Blast" },
            { nombreEsp: "Joya de Luz", nombreIng: "Power Gem" },
            { nombreEsp: "Poder Pasado", nombreIng: "Ancient Power" },
            { nombreEsp: "Desenrollar", nombreIng: "Rollout" },
            { nombreEsp: "Testarazo", nombreIng: "Head Smash" },

            // --- VOLADOR ---
            { nombreEsp: "Pájaro Osado", nombreIng: "Brave Bird" },
            { nombreEsp: "Respiro", nombreIng: "Roost" },
            { nombreEsp: "Acróbata", nombreIng: "Acrobatics" },
            { nombreEsp: "Despejar", nombreIng: "Defog" },
            { nombreEsp: "Vuelo", nombreIng: "Fly" },
            { nombreEsp: "Tajo Aéreo", nombreIng: "Air Slash" },
            { nombreEsp: "Vendaval", nombreIng: "Hurricane" },
            { nombreEsp: "Golpe Aéreo", nombreIng: "Aerial Ace" },
            { nombreEsp: "Ataque Ala", nombreIng: "Wing Attack" },
            { nombreEsp: "Danza Pluma", nombreIng: "Feather Dance" },
            { nombreEsp: "Viento Afin", nombreIng: "Tailwind" },
            { nombreEsp: "Ascenso Draco", nombreIng: "Dragon Ascent" },

            // --- LUCHA ---
            { nombreEsp: "A Bocajarro", nombreIng: "Close Combat" },
            { nombreEsp: "Onda Certera", nombreIng: "Focus Blast" },
            { nombreEsp: "Ultrapuño", nombreIng: "Mach Punch" },
            { nombreEsp: "Fuerza Bruta", nombreIng: "Superpower" },
            { nombreEsp: "Demolicion", nombreIng: "Brick Break" },
            { nombreEsp: "Patada Salto Alta", nombreIng: "High Jump Kick" },
            { nombreEsp: "Puño Drenaje", nombreIng: "Drain Punch" },
            { nombreEsp: "Corpulencia", nombreIng: "Bulk Up" },
            { nombreEsp: "Esfera Aural", nombreIng: "Aura Sphere" },
            { nombreEsp: "Patada Baja", nombreIng: "Low Kick" },
            { nombreEsp: "Movimiento Sísmico", nombreIng: "Seismic Toss" },
            { nombreEsp: "Contraataque", nombreIng: "Counter" },
            { nombreEsp: "Plancha Corporal", nombreIng: "Body Press" },

            // --- PSIQUICO ---
            { nombreEsp: "Psiquico", nombreIng: "Psychic" },
            { nombreEsp: "Psicocarga", nombreIng: "Psyshock" },
            { nombreEsp: "Paz Mental", nombreIng: "Calm Mind" },
            { nombreEsp: "Cabezazo Zen", nombreIng: "Zen Headbutt" },
            { nombreEsp: "Maquinacion", nombreIng: "Nasty Plot" },
            { nombreEsp: "Reflejo", nombreIng: "Reflect" },
            { nombreEsp: "Pantalla de Luz", nombreIng: "Light Screen" },
            { nombreEsp: "Espacio Raro", nombreIng: "Trick Room" },
            { nombreEsp: "Mofa", nombreIng: "Taunt" },
            { nombreEsp: "Descanso", nombreIng: "Rest" },
            { nombreEsp: "Agilidad", nombreIng: "Agility" },
            { nombreEsp: "Vasta Fuerza", nombreIng: "Expanding Force" },

            // --- FANTASMA ---
            { nombreEsp: "Bola Sombra", nombreIng: "Shadow Ball" },
            { nombreEsp: "Garra Umbria", nombreIng: "Shadow Claw" },
            { nombreEsp: "Sombra Vil", nombreIng: "Shadow Sneak" },
            { nombreEsp: "Infortunio", nombreIng: "Hex" },
            { nombreEsp: "Mismo Destino", nombreIng: "Destiny Bond" },
            { nombreEsp: "Rayo Confuso", nombreIng: "Confuse Ray" },
            { nombreEsp: "Tinieblas", nombreIng: "Night Shade" },
            { nombreEsp: "Poltergeist", nombreIng: "Poltergeist" },
            { nombreEsp: "Espectro", nombreIng: "Astral Barrage" },

            // --- SINIESTRO ---
            { nombreEsp: "Triturar", nombreIng: "Crunch" },
            { nombreEsp: "Pulso Umbrio", nombreIng: "Dark Pulse" },
            { nombreEsp: "Desarme", nombreIng: "Knock Off" },
            { nombreEsp: "Juego Sucio", nombreIng: "Foul Play" },
            { nombreEsp: "Golpe Bajo", nombreIng: "Sucker Punch" },
            { nombreEsp: "Persecución", nombreIng: "Pursuit" },
            { nombreEsp: "Mordisco", nombreIng: "Bite" },
            { nombreEsp: "Alarido", nombreIng: "Snarl" },
            { nombreEsp: "Lariat Oscuro", nombreIng: "Darkest Lariat" },

            // --- ACERO ---
            { nombreEsp: "Cabeza de Hierro", nombreIng: "Iron Head" },
            { nombreEsp: "Foco Resplandor", nombreIng: "Flash Cannon" },
            { nombreEsp: "Puño Bala", nombreIng: "Bullet Punch" },
            { nombreEsp: "Cuerpo Pesado", nombreIng: "Heavy Slam" },
            { nombreEsp: "Giro Bola", nombreIng: "Gyro Ball" },
            { nombreEsp: "Defensa Ferrea", nombreIng: "Iron Defense" },
            { nombreEsp: "Cola Ferrea", nombreIng: "Iron Tail" },
            { nombreEsp: "Garra Metal", nombreIng: "Metal Claw" },
            { nombreEsp: "Ferrochillido", nombreIng: "Metal Sound" },

            // --- VENENO ---
            { nombreEsp: "Bomba Lodo", nombreIng: "Sludge Bomb" },
            { nombreEsp: "Onda Toxica", nombreIng: "Sludge Wave" },
            { nombreEsp: "Lanza Mugre", nombreIng: "Gunk Shot" },
            { nombreEsp: "Toxico", nombreIng: "Toxic" },
            { nombreEsp: "Puya Nociva", nombreIng: "Poison Jab" },
            { nombreEsp: "Puas Toxicas", nombreIng: "Toxic Spikes" },
            { nombreEsp: "Carga Toxica", nombreIng: "Venoshock" },
            { nombreEsp: "Acido", nombreIng: "Acid" },
            { nombreEsp: "Niebla Clara", nombreIng: "Clear Smog" },

            // --- BICHO ---
            { nombreEsp: "Ida y Vuelta", nombreIng: "U-turn" },
            { nombreEsp: "Zumbido", nombreIng: "Bug Buzz" },
            { nombreEsp: "Tijera X", nombreIng: "X-Scissor" },
            { nombreEsp: "Danza Aleteo", nombreIng: "Quiver Dance" },
            { nombreEsp: "Picadura", nombreIng: "Bug Bite" },
            { nombreEsp: "Red Viscosa", nombreIng: "Sticky Web" },
            { nombreEsp: "Chupavidas", nombreIng: "Leech Life" },
            { nombreEsp: "Megacuerno", nombreIng: "Megahorn" },
            { nombreEsp: "Plancha", nombreIng: "First Impression" },

            // --- DRAGON ---
            { nombreEsp: "Garra Dragon", nombreIng: "Dragon Claw" },
            { nombreEsp: "Cometa Draco", nombreIng: "Draco Meteor" },
            { nombreEsp: "Danza Dragon", nombreIng: "Dragon Dance" },
            { nombreEsp: "Enfado", nombreIng: "Outrage" },
            { nombreEsp: "Pulso Dragon", nombreIng: "Dragon Pulse" },
            { nombreEsp: "Dragoaliento", nombreIng: "Dragon Breath" },
            { nombreEsp: "Cola Dragon", nombreIng: "Dragon Tail" },
            { nombreEsp: "Vasto Impacto", nombreIng: "Breaking Swipe" },

            // --- HADA ---
            { nombreEsp: "Fuerza Lunar", nombreIng: "Moonblast" },
            { nombreEsp: "Brillo Mágico", nombreIng: "Dazzling Gleam" },
            { nombreEsp: "Carantoña", nombreIng: "Play Rough" },
            { nombreEsp: "Beso Drenaje", nombreIng: "Draining Kiss" },
            { nombreEsp: "Viento Feerico", nombreIng: "Fairy Wind" },
            { nombreEsp: "Encanto", nombreIng: "Charm" },
            { nombreEsp: "Choque Anímico", nombreIng: "Spirit Break" },

            // --- NORMAL ---
            { nombreEsp: "Retribución", nombreIng: "Return" },
            { nombreEsp: "Doble Filo", nombreIng: "Double-Edge" },
            { nombreEsp: "Velocidad Extrema", nombreIng: "Extreme Speed" },
            { nombreEsp: "Vozarron", nombreIng: "Hyper Voice" },
            { nombreEsp: "Sorpresa", nombreIng: "Fake Out" },
            { nombreEsp: "Protección", nombreIng: "Protect" },
            { nombreEsp: "Recuperación", nombreIng: "Recover" },
            { nombreEsp: "Danza Espada", nombreIng: "Swords Dance" },
            { nombreEsp: "Sustituto", nombreIng: "Substitute" },
            { nombreEsp: "Placaje", nombreIng: "Tackle" },
            { nombreEsp: "Arañazo", nombreIng: "Scratch" },
            { nombreEsp: "Golpe Cuerpo", nombreIng: "Body Slam" },
            { nombreEsp: "Giro Rápido", nombreIng: "Rapid Spin" },
            { nombreEsp: "Autodestrucción", nombreIng: "Self-Destruct" },
            { nombreEsp: "Explosión", nombreIng: "Explosion" },
            { nombreEsp: "Deseo", nombreIng: "Wish" },
            { nombreEsp: "Bostezo", nombreIng: "Yawn" },
            { nombreEsp: "Otra Vez", nombreIng: "Encore" },
            { nombreEsp: "Relevo", nombreIng: "Baton Pass" },
            { nombreEsp: "Hiperrayo", nombreIng: "Hyper Beam" },
            { nombreEsp: "Triataque", nombreIng: "Tri Attack" },
            { nombreEsp: "Corte", nombreIng: "Cut" },
            { nombreEsp: "Fuerza", nombreIng: "Strength" },
            { nombreEsp: "Campana Cura", nombreIng: "Heal Bell" },
            { nombreEsp: "Amortiguador", nombreIng: "Soft-Boiled" }
        ];

        // 3. INSERCIÓN MASIVA
        await Movimiento.insertMany(listaMaestra);

        res.json({ 
            mensaje: `¡Base de datos actualizada! Se han registrado ${listaMaestra.length} movimientos.`,
            total: listaMaestra.length 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al poblar la base de datos" });
    }
});

module.exports = router;