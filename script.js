
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
const createForm = document.getElementById('form-create-party');

if (createForm) {
    createForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Capturar datos y limpiar espacios (trim)
        const formData = {
            hostName: document.getElementById('host-name').value.trim(),
            partyName: document.getElementById('party-name').value.trim(),
            partySize: document.getElementById('party-size').value,
            rules: document.getElementById('party-rules').value,
            description: document.getElementById('party-description').value
        };

        console.log("📤 Enviando:", formData);

        // REVISA QUE ESTA URL SEA CORRECTA (Render o Localhost)
        const API_URL = 'http://localhost:3000/api/juego/crear'; 

        try {
            const btn = createForm.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.innerText = "Creando...";

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            console.log("Estado respuesta:", response.status); // Ver si es 201

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.mensaje || "Error en el servidor");
            }

            const data = await response.json();
            console.log("✅ Datos recibidos del servidor:", data);

            // VERIFICACIÓN CRÍTICA ANTES DE GUARDAR
            if (!data.entrenador || !data.sala) {
                throw new Error("El servidor no devolvió los objetos 'entrenador' o 'sala'");
            }

            // Guardar en localStorage
            localStorage.setItem('usuario_pokelocke', JSON.stringify(data.entrenador));
            localStorage.setItem('sala_info', JSON.stringify(data.sala));
            
            console.log("💾 Datos guardados. Redirigiendo...");
            
            // REDIRECCIÓN MANUAL
            window.location.assign('stats.html'); // .assign es más robusto a veces que .href

        } catch (error) {
            console.error("❌ ERROR CRÍTICO:", error);
            alert("Hubo un error: " + error.message);
            // Reactivar botón
            const btn = createForm.querySelector('button[type="submit"]');
            if(btn) {
                btn.disabled = false;
                btn.innerText = "Create Party";
            }
        }
    });
}

/* ========================================================= */
/* LOGIC: JOIN PARTY FORM                                    */
/* ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
    const joinForm = document.getElementById('form-join-party');

    if (joinForm) {
        joinForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // 1. Capturar datos
            const formData = {
                nombre: document.getElementById('playerName').value.trim(), // Nombre del jugador
                sala: document.getElementById('partyCode').value.trim() // Nombre de la sala
            };

            // 2. Validar
            if (!formData.nombre || !formData.sala) {
                alert("Por favor rellena ambos campos");
                return;
            }

            console.log("🔗 Intentando unirse a:", formData);
            const API_URL = 'https://pokelocke-8kjm.onrender.com/api/juego/unirse'; // Usa tu URL de Render si ya está subido

            try {
                const btn = joinForm.querySelector('button');
                btn.disabled = true;
                btn.innerText = "Entrando...";

                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (response.ok) {
                    // Guardamos sesión
                    localStorage.setItem('usuario_pokelocke', JSON.stringify(data));
                    // Redirigir al Dashboard
                    window.location.href = 'stats.html';
                } else {
                    alert("❌ Error: " + (data.mensaje || "No se pudo unir"));
                    btn.disabled = false;
                    btn.innerText = "Join Party";
                }

            } catch (error) {
                console.error(error);
                alert("❌ Error de conexión");
                joinForm.querySelector('button').disabled = false;
            }
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
