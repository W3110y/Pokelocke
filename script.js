
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

                    // A. Generar HTML de los Pokémon
                    let equipoHTML = '';
                    if (jugador.pokemons && jugador.pokemons.length > 0) {
                        equipoHTML = '<div class="d-flex justify-content-center flex-wrap gap-2">';
                        
                        jugador.pokemons.forEach(poke => {
                            // Solo mostramos los del equipo vivo
                            if (poke.estado === 'equipo') {
                                const nombreSprite = poke.especie.toLowerCase(); // Convertir a minúsculas para la URL
                                const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${nombreSprite}.png`;

                                equipoHTML += `
                                    <div class="text-center position-relative" title="${poke.mote}">
                                        <img src="${spriteUrl}" 
                                            alt="${poke.especie}" 
                                            style="width: 50px; height: 50px; image-rendering: pixelated;"
                                            onerror="this.onerror=null; this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';">
                                        
                                        <span class="badge bg-dark rounded-pill" style="font-size: 0.6em">L.${poke.nivel}</span>
                                    </div>
                                `;
                            }
                        });
                        equipoHTML += '</div>';
                    } else {
                        equipoHTML = '<div class="text-center py-2 bg-light rounded"><small class="text-secondary">Equipo Vacío</small></div>';
                    }

                    // B. Insertar en la tarjeta (Sustituimos el bloque "Equipo Vacío" estático por la variable equipoHTML)
                    const cardHTML = `
                        <div class="col-md-6 col-lg-4">
                            <div class="card h-100 shadow-sm ${esMio ? 'border-primary' : ''}">
                                <div class="card-body">
                                    <h5 class="card-title fw-bold">
                                        <i class="bi bi-person-circle"></i> ${jugador.nombre} 
                                        ${esMio ? '<span class="badge bg-primary ms-2">TÚ</span>' : ''}
                                        ${esHost ? '<span class="badge bg-warning text-dark ms-1">HOST</span>' : ''}
                                    </h5>
                                    <hr>
                                    
                                    ${equipoHTML}
                                    
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

/* ========================================================= */
/* LOGIC: CAPTURAR POKÉMON (VERSIÓN ESTRICTA)                */
/* ========================================================= */
async function guardarCaptura() {
    console.log("🔵 Iniciando proceso de captura...");

    // 1. RECUPERAR DATOS DEL FORMULARIO
    const usuarioRaw = localStorage.getItem('usuario_pokelocke');
    if (!usuarioRaw) return alert("Error: No hay sesión activa");
    const usuario = JSON.parse(usuarioRaw);

    const inputNombre = document.getElementById('poke-especie').value.trim().toLowerCase(); // Forzamos minúsculas
    const mote = document.getElementById('poke-mote').value.trim();
    const nivel = document.getElementById('poke-nivel').value;
    const estado = document.getElementById('poke-estado').value;

    if (!inputNombre) {
        alert("❌ Por favor, escribe el nombre del Pokémon.");
        return;
    }

    // UI: Bloquear botón para evitar doble click
    const btn = document.querySelector('#captureModal .btn-primary');
    const textoOriginal = btn.innerText;
    btn.innerText = "🔍 Verificando en PokeAPI...";
    btn.disabled = true;

    let datosPokeApi = null;

    try {
        // ======================================================
        // FASE 1: VALIDACIÓN CON POKEAPI (EXTERNO)
        // ======================================================
        console.log(`🌍 Consultando PokeAPI por: ${inputNombre}`);
        const responseApi = await fetch(`https://pokeapi.co/api/v2/pokemon/${inputNombre}`);

        if (!responseApi.ok) {
            // SI ENTRA AQUÍ, ES QUE EL NOMBRE ESTÁ MAL ESCRITO
            throw new Error(`El Pokémon "${inputNombre}" no existe. Revisa la ortografía (inglés).`);
        }

        // Si llegamos aquí, el Pokémon existe. Guardamos sus datos oficiales.
        datosPokeApi = await responseApi.json();
        console.log("✅ Pokémon validado:", datosPokeApi.name);

    } catch (errorValidacion) {
        // ERROR DE VALIDACIÓN: PARAMOS TODO AQUÍ
        console.error("❌ Fallo validación:", errorValidacion);
        alert(errorValidacion.message);
        
        // Restauramos el botón y SALIMOS de la función
        btn.innerText = textoOriginal;
        btn.disabled = false;
        return; // <--- ESTO ES VITAL: NO SIGUE EJECUTANDO
    }

    try {
        // ======================================================
        // FASE 2: GUARDAR EN TU SERVIDOR (INTERNO)
        // Solo llegamos aquí si la Fase 1 fue exitosa
        // ======================================================
        console.log("💾 Guardando en base de datos...");
        btn.innerText = "💾 Guardando...";

        const payload = {
            entrenadorId: usuario._id,
            pokemon: {
                especie: datosPokeApi.name, // Usamos el nombre REAL de la API (ej: 'mr-mime')
                mote: mote || datosPokeApi.name, 
                nivel: parseInt(nivel),
                estado: estado,
                tipo: datosPokeApi.types[0].type.name // Guardamos el tipo (fire, water...)
            }
        };

        const API_URL = 'https://pokelocke-8kjm.onrender.com/api/juego/capturar'; // Ajusta si usas Render

        const responseServer = await fetch(API_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const dataServer = await responseServer.json();

        if (responseServer.ok) {
            // ÉXITO TOTAL
            alert(`✨ ¡${mote || datosPokeApi.name} registrado con éxito!`);
            
            // Cerrar modal
            const modalEl = document.getElementById('captureModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();
            
            // Limpiar formulario
            document.getElementById('form-captura').reset();
            
            // Recargar Dashboard para ver la imagen
            cargarDashboard();
        } else {
            throw new Error(dataServer.mensaje || "Error al guardar en el servidor");
        }

    } catch (errorServidor) {
        console.error("❌ Error del servidor:", errorServidor);
        alert("Error de conexión: " + errorServidor.message);
    } finally {
        // Restaurar botón siempre al final
        btn.innerText = textoOriginal;
        btn.disabled = false;
    }
}



