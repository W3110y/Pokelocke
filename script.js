
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
// LÓGICA CREAR PARTIDA
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

                    // --- NUEVO: GUARDAR EN HISTORIAL ---
                    guardarPartidaEnHistorial(data.entrenador, data.sala);
                    // -----------------------------------
                    
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
                        localStorage.setItem('sala_info', JSON.stringify(data.salaInfo));
                    } else {
                        console.warn("⚠️ OJO: El servidor no envió 'salaInfo'.");
                    }
                    // --- NUEVO: GUARDAR EN HISTORIAL ---
                    // Asegúrate de que data.salaInfo existe (el backend ya lo envía)
                    if (data.salaInfo) {
                        guardarPartidaEnHistorial(data.entrenador, data.salaInfo);
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
    // 1. INYECTAR ESTILOS CSS (Solución al problema de "desaparición")
    // Esto asegura que los estilos existan sin tocar el HTML
    if (!document.getElementById('dynamic-medal-styles')) {
        const styleSheet = document.createElement("style");
        styleSheet.id = "dynamic-medal-styles";
        styleSheet.innerText = `
            /* Estuche de Medallas */
            .medal-case {
                background: #1a1a1a;
                border: 1px solid #333;
                border-radius: 8px;
                padding: 8px;
                display: flex;
                justify-content: space-between;
                gap: 4px;
                margin-bottom: 12px;
                box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);
            }
            /* La Medalla (Hueco) */
            .gym-badge {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background-color: #2b2b2b;
                border: 2px solid #3d3d3d;
                transition: all 0.3s ease;
                position: relative;
            }
            /* Medalla Conseguida (Brillante) */
            .gym-badge.earned {
                background: var(--badge-color);
                border-color: white;
                box-shadow: 0 0 8px var(--badge-color);
                transform: scale(1.1);
            }
            /* Brillo */
            .gym-badge.earned::after {
                content: '';
                position: absolute;
                top: 3px; left: 3px;
                width: 6px; height: 3px;
                background: rgba(255,255,255,0.6);
                border-radius: 50%;
                transform: rotate(-45deg);
            }
            /* Interacción */
            .gym-badge.clickable { cursor: pointer; }
            .gym-badge.clickable:hover { transform: scale(1.2); }
        `;
        document.head.appendChild(styleSheet);
    }

    // 2. LÓGICA DE CARGA DE DATOS
    const usuarioRaw = localStorage.getItem('usuario_pokelocke');
    if (!usuarioRaw) { window.location.href = 'join.html'; return; }
    
    const usuario = JSON.parse(usuarioRaw);
    const salaNombre = usuario.sala; 

    // Info estática rápida
    const salaInfoRaw = localStorage.getItem('sala_info');
    if (salaInfoRaw) renderizarInfoSala(JSON.parse(salaInfoRaw));

    // FETCH AL SERVIDOR
    const API_URL = `https://pokelocke-8kjm.onrender.com/api/juego/sala/${salaNombre}`; // ¡Asegúrate que esta URL es la tuya!

    try {
        const response = await fetch(API_URL);
        
        if (response.ok) {
            const data = await response.json(); 
            const infoSala = data.sala;
            const listaJugadores = data.jugadores;

            // Actualizar contador
            const contador = document.getElementById('view-player-count');
            if (contador) contador.innerText = `Jugadores: ${listaJugadores.length} / ${infoSala.maxJugadores}`;

            // Renderizar Grid de Jugadores
            const grid = document.getElementById('players-grid');
            if (grid) {
                grid.innerHTML = ''; // Limpiar

                listaJugadores.forEach(jugador => {
                    const esMio = jugador._id === usuario._id;
                    const esHost = jugador.nombre === infoSala.host;

                    // A. CLASIFICAR POKÉMONS
                    const equipo = jugador.pokemons.filter(p => p.estado === 'equipo');
                    const caja = jugador.pokemons.filter(p => p.estado === 'caja');
                    const cementerio = jugador.pokemons.filter(p => p.estado === 'cementerio');

                    // B. GENERADOR DE IMÁGENES (GRID)
                    const generarGrid = (lista, esGris) => {
                        if (lista.length === 0) return '<div class="text-center py-3 text-muted small fst-italic opacity-50">Vacío</div>';
                        return `<div class="d-flex justify-content-center flex-wrap gap-2">` + 
                        lista.map(poke => {
                            const accionClick = esMio ? `onclick='abrirDetalles(${JSON.stringify(poke)})'` : '';
                            const estilo = esMio ? 'cursor:pointer;' : 'cursor:default;';
                            const gris = esGris ? 'filter:grayscale(100%); opacity:0.6;' : '';
                            const imgUrl = poke.imagen || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
                            
                            return `
                            <div class="text-center position-relative p-1" title="${poke.mote}">
                                <img src="${imgUrl}" class="poke-sprite" 
                                     style="width:50px; height:50px; image-rendering:pixelated; ${estilo} ${gris}"
                                     ${accionClick}
                                     onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'">
                                <span class="position-absolute bottom-0 start-50 translate-middle-x badge bg-dark rounded-pill border border-secondary" style="font-size:0.55em;">L.${poke.nivel}</span>
                            </div>`;
                        }).join('') + `</div>`;
                    };

                    // C. GENERADOR DE MEDALLAS (Colores Kanto)
                    const badgeColors = ['#9da5ae', '#358df5', '#f6b62d', '#5ac746', '#d64ecb', '#f5c949', '#e84535', '#2aa63d'];
                    let medallasHTML = '<div class="medal-case">';
                    badgeColors.forEach((color, idx) => {
                        const num = idx + 1;
                        const tiene = num <= (jugador.medallas || 0);
                        const evento = (esMio) ? `onclick="actualizarMedallas(${tiene && jugador.medallas === num ? num - 1 : num})"` : '';
                        
                        medallasHTML += `<div class="gym-badge ${tiene ? 'earned' : ''} ${esMio ? 'clickable' : ''}" 
                                              style="--badge-color: ${color};" title="Medalla ${num}" ${evento}></div>`;
                    });
                    medallasHTML += '</div>';

                    // D. CONSTRUIR TARJETA FINAL
                    const tabIdEq = `t-eq-${jugador._id}`;
                    const tabIdPc = `t-pc-${jugador._id}`;
                    const tabIdDead = `t-dd-${jugador._id}`;

                    grid.innerHTML += `
                    <div class="col-md-6 col-lg-4 fade-up">
                        <div class="card h-100 shadow-sm ${esMio ? 'border-primary' : ''}">
                            <div class="card-header bg-transparent d-flex justify-content-between align-items-center py-2">
                                <h5 class="card-title fw-bold mb-0 text-truncate" style="max-width:70%;">
                                    <i class="bi bi-person-circle"></i> ${jugador.nombre}
                                    ${esMio ? '<span class="badge bg-primary ms-1" style="font-size:0.6em">TÚ</span>' : ''}
                                    ${esHost ? '<span class="badge bg-warning text-dark ms-1" style="font-size:0.6em">HOST</span>' : ''}
                                </h5>
                                <span class="badge bg-secondary">${equipo.length + caja.length} Vivos</span>
                            </div>

                            <div class="card-body p-2">
                                ${medallasHTML}

                                <ul class="nav nav-pills nav-fill mb-2 small" role="tablist">
                                    <li class="nav-item"><button class="nav-link active py-1" data-bs-toggle="pill" data-bs-target="#${tabIdEq}">Equipo</button></li>
                                    <li class="nav-item"><button class="nav-link py-1 position-relative" data-bs-toggle="pill" data-bs-target="#${tabIdPc}">
                                        PC ${caja.length ? `<span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="font-size:0.5em">${caja.length}</span>` : ''}
                                    </button></li>
                                    <li class="nav-item"><button class="nav-link py-1" data-bs-toggle="pill" data-bs-target="#${tabIdDead}">☠️</button></li>
                                </ul>

                                <div class="tab-content">
                                    <div class="tab-pane fade show active" id="${tabIdEq}"><div class="bg-body-tertiary border rounded p-2" style="min-height:100px;">${generarGrid(equipo, false)}</div></div>
                                    <div class="tab-pane fade" id="${tabIdPc}"><div class="bg-body-secondary border rounded p-2" style="min-height:100px;">${generarGrid(caja, false)}</div></div>
                                    <div class="tab-pane fade" id="${tabIdDead}"><div class="bg-dark bg-opacity-10 border rounded p-2" style="min-height:100px;">${generarGrid(cementerio, true)}</div></div>
                                </div>
                            </div>
                        </div>
                    </div>`;
                });
            }
        }
    } catch (error) { console.error("Error dashboard:", error); }
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
/* LOGIC: CAPTURAR POKÉMON                                   */
/* ========================================================= */
async function guardarCaptura() {
    const usuarioRaw = localStorage.getItem('usuario_pokelocke');
    if (!usuarioRaw) return alert("Error: No hay sesión activa");
    const usuario = JSON.parse(usuarioRaw);

    const inputNombre = document.getElementById('poke-especie').value.trim().toLowerCase();
    const mote = document.getElementById('poke-mote').value.trim();
    const nivel = document.getElementById('poke-nivel').value;
    const estado = document.getElementById('poke-estado').value;

    if (!inputNombre) return alert("Escribe un nombre de Pokémon");

    const btn = document.querySelector('#captureModal .btn-primary');
    const txtOriginal = btn.innerText;
    btn.innerText = "Buscando en PokeAPI...";
    btn.disabled = true;

    try {
        // 1. CONSULTAR POKEAPI
        const responseApi = await fetch(`https://pokeapi.co/api/v2/pokemon/${inputNombre}`);
        if (!responseApi.ok) throw new Error("Pokémon no encontrado. Revisa el nombre.");
        
        const dataApi = await responseApi.json();

        // 2. EXTRAER DATOS VALIOSOS (Aquí está la magia)
        // Extraemos la imagen pixelart frontal
        const spriteOficial = dataApi.sprites.front_default; 
        // Extraemos los tipos (ej: ['fire', 'flying'])
        const tipos = dataApi.types.map(t => t.type.name);

        // 3. PREPARAR ENVÍO AL BACKEND
        const payload = {
            entrenadorId: usuario._id,
            pokemon: {
                id: dataApi.id,
                especie: dataApi.name,
                mote: mote || dataApi.name, // Capitalizar primera letra quedaría mejor, pero así vale
                nivel: parseInt(nivel),
                estado: estado,
                imagen: spriteOficial, // <--- ENVIAMOS LA URL EXACTA
                tipos: tipos           // <--- ENVIAMOS LOS TIPOS
            }
        };

        // 4. GUARDAR EN TU BASE DE DATOS
        const responseServer = await fetch('https://pokelocke-8kjm.onrender.com/api/juego/capturar', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (responseServer.ok) {
            const dataRespuesta = await responseServer.json(); // Leemos la respuesta del backend
    
            // Feedback inteligente
            let mensaje = `✅ ¡${mote || dataApi.name} capturado!`;
    
            // Si el servidor lo mandó a la caja forzosamente, avisamos
            if (dataRespuesta.estadoAsignado === 'caja' && estado === 'equipo') {
                mensaje += "\n📦 Tu equipo estaba lleno, así que se envió al PC.";
            }

            alert(mensaje);
            // Éxito
            const modalEl = document.getElementById('captureModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();
            document.getElementById('form-captura').reset();
            cargarDashboard();
            alert(`✅ ¡${mote || dataApi.name} capturado!`);
        } else {
            throw new Error("Error al guardar en servidor");
        }

    } catch (error) {
        alert("❌ Error: " + error.message);
    } finally {
        btn.innerText = txtOriginal;
        btn.disabled = false;
    }
}

/* ========================================================= */
/* LOGIC: EDICIÓN DE POKÉMON                                 */
/* ========================================================= */

// 1. Abrir el modal con los datos cargados
function abrirDetalles(poke) {
    // Solo permitimos editar si es MI pokemon (seguridad visual)
    const usuario = JSON.parse(localStorage.getItem('usuario_pokelocke'));
    
    // Rellenar modal
    document.getElementById('detail-title').innerText = poke.especie.toUpperCase();
    document.getElementById('detail-img').src = poke.imagen || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
    document.getElementById('edit-mote').value = poke.mote;
    document.getElementById('edit-nivel').value = poke.nivel;
    document.getElementById('edit-estado').value = poke.estado;
    document.getElementById('edit-poke-id').value = poke._id; // Guardamos el ID de mongo

    // Mostrar Modal
    const modal = new bootstrap.Modal(document.getElementById('detailsModal'));
    modal.show();
}

// 2. Enviar cambios al servidor
async function guardarCambiosPokemon() {
    const usuario = JSON.parse(localStorage.getItem('usuario_pokelocke'));
    const pokeId = document.getElementById('edit-poke-id').value;
    
    const nuevosDatos = {
        mote: document.getElementById('edit-mote').value,
        nivel: parseInt(document.getElementById('edit-nivel').value),
        estado: document.getElementById('edit-estado').value
    };
    let inputNivel = parseInt(document.getElementById('edit-nivel').value);
    
    // Validación Frontend Rápida
    if (inputNivel > 100) {
        alert("El nivel máximo es 100.");
        return; // Cortamos aquí
    }
    if (inputNivel < 1) {
        alert("El nivel mínimo es 1.");
        return;
    }

    try {
        const res = await fetch('https://pokelocke-8kjm.onrender.com/api/juego/pokemon/editar', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                entrenadorId: usuario._id,
                pokemonId: pokeId,
                nuevosDatos: nuevosDatos
            })
        });

        if (res.ok) {
            // Cerrar modal y recargar
            const modalEl = document.getElementById('detailsModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();
            cargarDashboard(); // Refrescar para ver cambios (ej: si murió, desaparecerá del equipo)
        } else {
            alert("Error al actualizar");
        }
    } catch (error) {
        console.error(error);
    }
}

// (Opcional) Función borrarPokemon() se puede implementar luego
function borrarPokemon() {
    alert("Funcionalidad de liberar pendiente de implementar");
}

/* ========================================================= */
/* LOGIC: MEDALLAS                                           */
/* ========================================================= */
async function actualizarMedallas(nuevaCantidad) {
    const usuarioRaw = localStorage.getItem('usuario_pokelocke');
    if (!usuarioRaw) return;
    const usuario = JSON.parse(usuarioRaw);

    // Lógica de "Toggle": Si hago clic en la medalla 3 y ya tengo 3, bajo a 2 (deshacer)
    // Pero si tengo 2 y hago clic en 3, subo a 3.
    // Para simplificar: Al hacer clic en la X, establecemos que tengo X medallas.
    
    try {
        const res = await fetch('https://pokelocke-8kjm.onrender.com/api/juego/medallas', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                entrenadorId: usuario._id,
                cantidad: nuevaCantidad
            })
        });

        if (res.ok) {
            cargarDashboard(); // Recargamos para ver el brillo
        }
    } catch (error) {
        console.error(error);
    }
}

/* ========================================================= */
/* LOGIC: GESTOR DE HISTORIAL (MIS GRUPOS)                   */
/* ========================================================= */
function guardarPartidaEnHistorial(datosEntrenador, datosSala) {
    // 1. Recuperar historial existente o crear array vacío
    let historial = JSON.parse(localStorage.getItem('pokelocke_history') || '[]');

    // 2. Crear el objeto de la nueva sesión
    const nuevaSesion = {
        sala: datosSala.nombre,
        host: datosSala.host,
        maxJugadores: datosSala.maxJugadores,
        miNombre: datosEntrenador.nombre,
        miId: datosEntrenador._id,
        fechaAcceso: new Date().toISOString()
    };

    // 3. Evitar duplicados: Si ya existe esta sala, la actualizamos/borramos para ponerla primera
    historial = historial.filter(s => s.sala !== datosSala.nombre);
    
    // 4. Añadir al principio (la más reciente)
    historial.unshift(nuevaSesion);

    // 5. Guardar en LocalStorage
    localStorage.setItem('pokelocke_history', JSON.stringify(historial));
}

/* ========================================================= */
/* LOGIC: PÁGINA MIS GRUPOS (groups.html)                    */
/* ========================================================= */
function cargarMisGrupos() {
    const grid = document.getElementById('groups-grid');
    const emptyState = document.getElementById('empty-state');
    
    // Solo ejecutamos si estamos en la página correcta
    if (!grid) return;

    // 1. Leer historial
    const historial = JSON.parse(localStorage.getItem('pokelocke_history') || '[]');

    if (historial.length === 0) {
        emptyState.classList.remove('d-none');
        return;
    }

    // 2. Generar tarjetas
    grid.innerHTML = '';
    historial.forEach((sesion, index) => {
        // Colores aleatorios para dar vida (basado en la primera letra)
        const colores = ['primary', 'success', 'danger', 'warning', 'info', 'indigo'];
        const color = colores[sesion.sala.length % colores.length]; 
        const bgClass = sesion.sala.length % 2 === 0 ? 'bg-gradient' : '';

        const cardHTML = `
        <div class="col-md-6 col-lg-4">
            <div class="card h-100 shadow-sm border-0 hover-scale" style="transition: transform 0.2s;">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div class="rounded-circle bg-${color} ${bgClass} text-white d-flex align-items-center justify-content-center" style="width: 50px; height: 50px; font-size: 1.5rem;">
                            ${sesion.sala.charAt(0).toUpperCase()}
                        </div>
                        <span class="badge bg-secondary opacity-50"><i class="bi bi-person"></i> ${sesion.miNombre}</span>
                    </div>
                    
                    <h4 class="card-title fw-bold mb-1">${sesion.sala}</h4>
                    <p class="text-muted small mb-3">Host: ${sesion.host}</p>
                    
                    <div class="d-grid">
                        <button onclick="reanudarPartida(${index})" class="btn btn-outline-${color} fw-bold">
                            Entrar <i class="bi bi-arrow-right"></i>
                        </button>
                    </div>
                </div>
                <div class="card-footer bg-transparent border-0 text-muted small">
                    Último acceso: ${new Date(sesion.fechaAcceso).toLocaleDateString()}
                </div>
            </div>
        </div>
        `;
        grid.innerHTML += cardHTML;
    });
}

// Función para entrar a una partida específica desde el historial
window.reanudarPartida = function(index) {
    const historial = JSON.parse(localStorage.getItem('pokelocke_history') || '[]');
    const sesion = historial[index];

    if (sesion) {
        // 1. "Simulamos" el login reconstruyendo el objeto usuario
        const usuarioReconstruido = {
            _id: sesion.miId,
            nombre: sesion.miNombre,
            sala: sesion.sala
        };

        const salaInfoReconstruida = {
            nombre: sesion.sala,
            host: sesion.host,
            maxJugadores: sesion.maxJugadores
        };

        // 2. Establecer como sesión activa
        localStorage.setItem('usuario_pokelocke', JSON.stringify(usuarioReconstruido));
        localStorage.setItem('sala_info', JSON.stringify(salaInfoReconstruida));

        // 3. Redirigir
        window.location.href = 'stats.html';
    }
};

function borrarHistorial() {
    if(confirm("¿Estás seguro de que quieres olvidar todas las salas guardadas? Tendrás que volver a unirte manualmente.")) {
        localStorage.removeItem('pokelocke_history');
        location.reload(); // Recargar página para verla vacía
    }
}

// Auto-ejecutar carga si estamos en groups.html
if (window.location.pathname.includes('groups.html')) {
    document.addEventListener('DOMContentLoaded', cargarMisGrupos);
}