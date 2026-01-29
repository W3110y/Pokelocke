
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

document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURACIÓN URL (Usa localhost o Render según corresponda) ---
    // const API_BASE = 'https://tu-app.onrender.com/api/juego';
    const API_BASE = 'https://pokelocke-8kjm.onrender.com/api/juego';

    // ==========================================
    // 1. LÓGICA CREAR PARTIDA
    // ==========================================
    const createForm = document.getElementById('form-create-party');
    
    if (createForm) {
        createForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // <--- ESTO EVITA QUE LA PÁGINA SE RECARGUE SOLA

            // Capturamos datos usando los IDs corregidos del Paso A
            const formData = {
                hostName: document.getElementById('host-name').value.trim(),
                partyName: document.getElementById('party-name').value.trim(),
                partySize: document.getElementById('party-size').value,
                rules: document.getElementById('party-rules').value,
                description: document.getElementById('party-description').value
            };

            try {
                const res = await fetch(`${API_BASE}/crear`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const data = await res.json();

                if (res.ok) {
                    // Guardar datos y REDIRIGIR
                    localStorage.setItem('usuario_pokelocke', JSON.stringify(data.entrenador));
                    localStorage.setItem('sala_info', JSON.stringify(data.sala));
                    
                    console.log("Redirigiendo a stats.html...");
                    window.location.href = 'stats.html'; 
                } else {
                    alert("Error: " + data.mensaje);
                }
            } catch (error) { console.error(error); alert("Error de conexión"); }
        });
    }

    // ==========================================
    // 2. LÓGICA UNIRSE PARTIDA
    // ==========================================
    const joinForm = document.getElementById('form-join-party');

    if (joinForm) { // Ahora SÍ encontrará el formulario gracias al ID del Paso B
        joinForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                nombre: document.getElementById('playerName').value.trim(),
                sala: document.getElementById('partyName').value.trim()
            };

            try {
                const res = await fetch(`${API_BASE}/unirse`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem('usuario_pokelocke', JSON.stringify(data.entrenador));
                    // Si el backend devuelve info de sala, la guardamos
                    if(data.salaInfo) localStorage.setItem('sala_info', JSON.stringify(data.salaInfo));
                    
                    window.location.href = 'stats.html';
                } else {
                    alert("Error: " + data.mensaje);
                }
            } catch (error) { console.error(error); alert("Error de conexión"); }
        });
    }
});

/* ========================================================= */
/* LOGIC: DASHBOARD LOADER (MEJORADO)                        */
/* ========================================================= */

async function cargarDashboard() {
    // 1. Verificar si hay datos guardados en el navegador
    const usuarioRaw = localStorage.getItem('usuario_pokelocke');
    
    // Si no hay datos, redirigir inmediatamente a Unirse
    if (!usuarioRaw) {
        window.location.href = 'join.html'; 
        return;
    }

    const usuario = JSON.parse(usuarioRaw);
    const salaNombre = usuario.sala; 
    
    // Ajusta la URL según corresponda (Localhost o Render)
    const API_URL = `https://pokelocke-8kjm.onrender.com/juego/sala/${salaNombre}`; 

    try {
        const response = await fetch(API_URL);
        
        // --- AUTO-CORRECCIÓN DE ERRORES ---
        if (response.status === 404) {
            // Si el servidor dice "No existe", borramos los datos viejos
            console.warn("Sesión inválida: La sala no existe.");
            cerrarSesion(); // Función auxiliar que crearemos abajo
            return;
        }

        if (!response.ok) {
            throw new Error("Error del servidor");
        }

        const data = await response.json();
        const { sala, jugadores } = data;

        // PINTAR DATOS (Esto se mantiene igual que antes)
        if (document.getElementById('view-party-name')) {
            document.getElementById('view-party-name').innerText = sala.nombre;
            document.getElementById('view-host-name').innerText = sala.host;
            document.getElementById('view-player-count').innerText = `Jugadores: ${jugadores.length}/${sala.maxJugadores}`;
            document.getElementById('view-rules').innerText = sala.reglas || "Sin reglas.";
            document.getElementById('view-desc').innerText = sala.descripcion || "Sin descripción.";
        }

        const grid = document.getElementById('players-grid');
        if (grid) {
            grid.innerHTML = '';
            jugadores.forEach(jugador => {
                const esMio = jugador._id === usuario._id;
                const cardHTML = `
                    <div class="col-md-6 col-lg-4">
                        <div class="card h-100 shadow-sm ${esMio ? 'border-primary' : ''}">
                            <div class="card-body">
                                <h5 class="card-title fw-bold text-uppercase">
                                    <i class="bi bi-person-circle me-2"></i>${jugador.nombre} 
                                    ${esMio ? '<span class="badge bg-primary ms-2">TÚ</span>' : ''}
                                    ${jugador.nombre === sala.host ? '<span class="badge bg-warning text-dark ms-1">HOST</span>' : ''}
                                </h5>
                                <hr>
                                <div class="text-center py-3 bg-body-tertiary rounded">
                                    <small class="text-muted">Equipo vacío</small>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                grid.innerHTML += cardHTML;
            });
        }

    } catch (error) {
        console.error("Error crítico:", error);
        // Si hay error de conexión, no borramos sesión, solo avisamos
        // Pero si prefieres limpiar todo ante la duda, descomenta la siguiente línea:
        // cerrarSesion();
    }
}

// --- FUNCIÓN AUXILIAR PARA LIMPIAR ---
function cerrarSesion() {
    alert("Tu sesión ha caducado o la sala ya no existe.");
    localStorage.removeItem('usuario_pokelocke');
    localStorage.removeItem('sala_info');
    window.location.href = 'join.html';
}

// EJECUTAR SOLO EN STATS
if (window.location.pathname.includes('stats.html')) {
    document.addEventListener('DOMContentLoaded', cargarDashboard);
}
