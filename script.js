
/* ========================================================= */
/* THEME TOGGLER                                             */
/* ========================================================= */

const getPreferredTheme = () => {
    const stored = localStorage.getItem("theme");
    if (stored) return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const setTheme = theme => {
    document.documentElement.setAttribute("data-bs-theme", theme);
    localStorage.setItem("theme", theme);
    updateIcon(theme);
};

const updateIcon = theme => {
    const icon = document.getElementById("theme-icon");
    if (!icon) return;

    icon.classList.remove("bi-sun-fill", "bi-moon-stars-fill");
    icon.classList.add(theme === "dark" ? "bi-moon-stars-fill" : "bi-sun-fill");
};

setTheme(getPreferredTheme());

document.addEventListener("DOMContentLoaded", () => {
    const themeBtn = document.getElementById("theme-toggle");
    themeBtn.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-bs-theme");
        setTheme(current === "dark" ? "light" : "dark");
    });
});

/* ========================================================= */
/* TYPING ANIMATION                                          */
/* ========================================================= */

const typingElement = document.getElementById("typing");
const messages = [
    "Begin your Pokémon journey",
    "Group with friends",
    "Track your battles",
    "Analyze your stats",
    "Become a Pokémon Master!"
];

let msgIdx = 0, charIdx = 0;

function type() {
    if (!typingElement) return;

    if (charIdx <= messages[msgIdx].length) {
        typingElement.textContent = messages[msgIdx].substring(0, charIdx++);
        setTimeout(type, 80);
    } else {
        setTimeout(erase, 1500);
    }
}

function erase() {
    if (!typingElement) return;

    if (charIdx >= 0) {
        typingElement.textContent = messages[msgIdx].substring(0, charIdx--);
        setTimeout(erase, 50);
    } else {
        msgIdx = (msgIdx + 1) % messages.length;
        setTimeout(type, 300);
    }
}

type();

/* ========================================================= */
/* LOGIC: CREATE PARTY FORM (ACTUALIZADO)                    */
/* ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
    const createForm = document.getElementById('form-create-party');

    if (createForm) {
        createForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // 1. Capturar los 5 datos usando los IDs nuevos
            const formData = {
                hostName: document.getElementById('host-name').value,
                partyName: document.getElementById('party-name').value,
                partySize: document.getElementById('party-size').value,
                rules: document.getElementById('party-rules').value,
                description: document.getElementById('party-description').value
            };

            console.log("📤 Creando sala:", formData);

            // IMPORTANTE: Cambiamos la ruta a /crear
            // Recuerda poner tu URL de Render si ya desplegaste, o localhost si estás probando
            const API_URL = 'https://pokelocke-8kjm.onrender.com/api/juego/crear'; 

            try {
                const btn = createForm.querySelector('button[type="submit"]');
                btn.disabled = true;
                btn.innerText = "Creando...";

                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (response.ok) {
                    alert("✅ ¡Sala creada! Reglas guardadas.");
                    
                    // Guardamos la info completa (Usuario + Info de Sala)
                    localStorage.setItem('usuario_pokelocke', JSON.stringify(data.entrenador));
                    localStorage.setItem('sala_info', JSON.stringify(data.sala)); // Nuevo: Guardamos reglas localmente
                    
                    window.location.href = 'stats.html';
                } else {
                    alert("❌ Error: " + (data.mensaje || "Error desconocido"));
                    btn.disabled = false;
                    btn.innerText = "Create Party";
                }
            } catch (error) {
                console.error(error);
                alert("❌ Error de conexión");
                createForm.querySelector('button').disabled = false;
            }
        });
    }
});


/* ========================================================= */
/* CLIENTE PARA EL JUEGO Nuzlocke                               */
/* ========================================================= */
const API_URL = 'https://pokelocke-8kjm.onrender.com/api/juego';

// Variables de estado
let usuarioActual = null;
let intervaloActualizacion = null;

// 1. FUNCIÓN PARA UNIRSE (LOGIN)
async function unirsePartida() {
    const nombre = document.getElementById('input-nombre').value;
    const sala = document.getElementById('input-sala').value.toUpperCase();

    if (!nombre || !sala) return alert("Rellena todos los campos");

    try {
        const res = await fetch(`${API_URL}/unirse`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, sala })
        });

        const datos = await res.json();
        
        if (res.ok) {
            // Guardamos sesión en memoria del navegador
            usuarioActual = datos;
            mostrarDashboard(sala);
        } else {
            alert("Error al entrar: " + datos.error);
        }
    } catch (error) {
        console.error(error);
        alert("Error de conexión con el servidor");
    }
}

// 2. MOSTRAR EL DASHBOARD Y OCULTAR LOGIN
function mostrarDashboard(sala) {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('dashboard-screen').classList.remove('hidden');
    document.getElementById('titulo-sala').innerText = `Sala: ${sala}`;

    // Cargar datos inmediatamente y luego cada 5 segundos
    cargarDatosSala(sala);
    intervaloActualizacion = setInterval(() => cargarDatosSala(sala), 5000);
}

// 3. DESCARGAR DATOS DE LA SALA (GET)
async function cargarDatosSala(sala) {
    try {
        const res = await fetch(`${API_URL}/sala/${sala}`);
        const jugadores = await res.json();
        renderizarJugadores(jugadores);
    } catch (error) {
        console.error("Error actualizando sala", error);
    }
}

// 4. PINTAR EL HTML (RENDER)
function renderizarJugadores(jugadores) {
    const grid = document.getElementById('grid-jugadores');
    grid.innerHTML = ''; // Limpiar grid

    jugadores.forEach(jugador => {
        // Crear tarjeta HTML para cada jugador
        const card = document.createElement('div');
        card.className = 'jugador-card';
        
        // Generar lista de pokemons
        let listaPokemonHTML = '';
        jugador.pokemons.forEach(poke => {
            listaPokemonHTML += `
                <li class="pokemon-item estado-${poke.estado}">
                    <span>${poke.mote || poke.especie} (Lv.${poke.nivel})</span>
                    <small>${poke.especie}</small>
                </li>
            `;
        });

        card.innerHTML = `
            <h3>${jugador.nombre} ${jugador._id === usuarioActual._id ? '(Tú)' : ''}</h3>
            <p>🏅 Medallas: ${jugador.medallas}</p>
            <hr>
            <ul class="pokemon-list">
                ${listaPokemonHTML || '<p>Sin equipo...</p>'}
            </ul>
        `;
        
        grid.appendChild(card);
    });
}


