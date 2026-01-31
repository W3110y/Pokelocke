
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
    // ==========================================
    // 1. LÓGICA CREAR PARTIDA
    // ==========================================
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
                sala: document.getElementById('partyName').value.trim() // Nombre de la sala
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
                    localStorage.setItem('usuario_pokelocke', JSON.stringify(data.entrenador));
                    if (data.salaInfo) {
                        console.log("📥 Guardando información de la sala en local...");
                        localStorage.setItem('sala_info', JSON.stringify(data.salaInfo));
                    } else {
                        console.warn("⚠️ OJO: El servidor no envió 'salaInfo'.");
                }
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
/* LOGIC: DASHBOARD / STATS LOADER                           */
/* ========================================================= */
async function cargarDashboard() {
    // 1. Verificar seguridad (Usuario logueado)
    const usuarioRaw = localStorage.getItem('usuario_pokelocke');
    if (!usuarioRaw) {
        window.location.href = 'join.html'; 
        return;
    }
    const usuario = JSON.parse(usuarioRaw);
    // DEBUG: Verificar que ahora sí leemos bien el nombre
    console.log("👤 Usuario cargado:", usuario);
    
    const salaNombre = usuario.sala; 
    if (!salaNombre) {
        console.error("❌ ERROR CRÍTICO: El nombre de la sala es undefined. Revisa el localStorage.");
        return;
    }
    
    // 2. Pintar Info Estática rápida (mientras carga internet)
    const salaInfoRaw = localStorage.getItem('sala_info');
    if (salaInfoRaw) {
        renderizarInfoSala(JSON.parse(salaInfoRaw));
    }

    // 3. PEDIR DATOS EN TIEMPO REAL AL SERVIDOR
    // Asegúrate de usar tu URL correcta (localhost o Render)
    const API_URL = `https://pokelocke-8kjm.onrender.com/api/juego/sala/${salaNombre}`;
    console.log("🌍 Pidiendo datos a:", API_URL);

    try {
        const response = await fetch(API_URL);
        
        if (response.ok) {
            // AQUI ESTÁ LA SOLUCIÓN: Recibimos el paquete completo
            const data = await response.json(); 
            
            const infoSala = data.sala;            // Datos de la sala (capacidad, host)
            const listaJugadores = data.jugadores; // Lista de personas
            
            // --- A. ACTUALIZAR EL CONTADOR DE JUGADORES ---
            // Ahora sí tenemos ambos números para mostrar "2 / 4"
            const contador = document.getElementById('view-player-count');
            if (contador) {
                contador.innerText = `Jugadores: ${listaJugadores.length} / ${infoSala.maxJugadores}`;
            }

            // --- B. PINTAR LAS TARJETAS DE LOS JUGADORES ---
            const grid = document.getElementById('players-grid');
            if (grid) {
                grid.innerHTML = ''; // Limpiar grid previo

                listaJugadores.forEach(jugador => {
                    const esMio = jugador._id === usuario._id;
                    // Comparamos nombres para saber quién es el Host real
                    const esHost = jugador.nombre === infoSala.host; 

                    // Crear tarjeta HTML
                    const cardHTML = `
                        <div class="col-md-6 col-lg-4">
                            <div class="card h-100 shadow-sm ${esMio ? 'border-primary' : ''}">
                                <div class="card-body">
                                    <h5 class="card-title fw-bold">
                                        <i class="bi bi-person-circle"></i> ${jugador.nombre}
                                        ${esMio ? '<span class="badge bg-primary ms-1">TÚ</span>' : ''}
                                        ${esHost ? '<span class="badge bg-warning text-dark ms-1">HOST</span>' : ''}
                                    </h5>
                                    <hr>
                                    <div class="text-center py-2 bg-light rounded">
                                        <small class="text-muted">Equipo Vacío</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    grid.innerHTML += cardHTML;
                });
            }
        } else {
            console.error("Error del servidor:", response.status);
        }

    } catch (error) {
        console.error("Error de conexión cargando dashboard:", error);
    }
}

// Helper para pintar textos
function renderizarInfoSala(sala) {
    if(document.getElementById('view-party-name')) {
        document.getElementById('view-party-name').innerText = sala.nombre;
        document.getElementById('view-host-name').innerText = sala.host;
        document.getElementById('view-rules').innerText = sala.reglas || "Sin reglas definidas.";
        document.getElementById('view-desc').innerText = sala.descripcion || "";
    }
}

// Ejecutar solo si estamos en stats.html
if (window.location.pathname.includes('stats.html')) {
    document.addEventListener('DOMContentLoaded', cargarDashboard);
}

