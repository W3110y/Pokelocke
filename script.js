
/* ========================================================= */
/* LOGIC: THEME SWITCHER (Light/Dark)                        */
/* ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
    // NOTA: La carga inicial del tema ya se hizo en el <head> del HTML
    // para evitar el flash. Aquí solo gestionamos el botón.

    const themeBtn = document.getElementById('theme-toggle');
    const themeIcon = themeBtn ? themeBtn.querySelector('i') : null;

    const updateIcon = (theme) => {
        if (!themeIcon) return;
        // Icono simple: Luna llena vs Sol
        if (theme === 'dark') {
            themeIcon.className = 'bi bi-moon-stars-fill';
        } else {
            themeIcon.className = 'bi bi-sun-fill text-warning';
        }
    };

    // 1. Sincronizar icono al cargar (según lo que puso el script del head)
    const currentTheme = document.documentElement.getAttribute('data-bs-theme');
    updateIcon(currentTheme);

    // 2. Evento Click
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            // Leer estado actual
            const current = document.documentElement.getAttribute('data-bs-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            
            // Aplicar cambio
            document.documentElement.setAttribute('data-bs-theme', next);
            localStorage.setItem('theme', next);
            
            // Actualizar icono
            updateIcon(next);
        });
    }
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
/* LOGIC: DASHBOARD / STATS LOADER (CORREGIDO)               */
/* ========================================================= */
async function cargarDashboard() {
    // LÓGICA DE CARGA DE DATOS
    const usuarioRaw = localStorage.getItem('usuario_pokelocke');
    if (!usuarioRaw) { window.location.href = 'join.html'; return; }
    
    const usuario = JSON.parse(usuarioRaw);
    const salaNombre = usuario.sala; 

    // Info estática rápida
    const salaInfoRaw = localStorage.getItem('sala_info');
    if (salaInfoRaw) renderizarInfoSala(JSON.parse(salaInfoRaw));

    // FETCH AL SERVIDOR
    const API_URL = `https://pokelocke-8kjm.onrender.com/api/juego/sala/${salaNombre}`;

    try {
        const response = await fetch(API_URL);
        
        if (response.ok) {
            const data = await response.json(); 
            const infoSala = data.sala;
            const listaJugadores = data.jugadores;
            
            // 1. RELLENAR MODALES (Derecha)
            const rulesContent = document.getElementById('modal-rules-content');
            if (rulesContent) rulesContent.innerHTML = `<h5>📜 Reglas</h5><p>${infoSala.reglas || "Sin reglas"}</p>`;
            
            const descContent = document.getElementById('modal-desc-content');
            if (descContent) descContent.innerHTML = `<h5>ℹ️ Descripción</h5><p>${infoSala.descripcion || "Sin descripción"}</p>`;

            // 2. RELLENAR LISTA DE MIEMBROS (Izquierda)
            const membersList = document.getElementById('members-list');
            if (membersList) {
                membersList.innerHTML = listaJugadores.map(jugador => {
                    const isHost = jugador.nombre === infoSala.host;
                    return `
                    <div class="d-flex align-items-center gap-2 p-2 mb-2 glass-panel">
                        <div class="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold" style="width:35px; height:35px;">
                            ${jugador.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div class="flex-grow-1 text-truncate">
                            <span class="d-block lh-1 small fw-bold">${jugador.nombre}</span>
                            ${isHost ? '<span class="badge bg-warning text-dark" style="font-size:0.5em">HOST</span>' : '<span class="badge bg-secondary" style="font-size:0.5em">PLAYER</span>'}
                        </div>
                    </div>`;
                }).join('');
            }

            // 3. RELLENAR PANEL CENTRAL (Barra de Equipo Pixel Art Interactiva)
            const miUsuario = listaJugadores.find(u => u._id === usuario._id);
            const dashboardPanel = document.getElementById('my-dashboard-panel');

            if (miUsuario && dashboardPanel) {
                const equipo = miUsuario.pokemons.filter(p => p.estado === 'equipo');
                
                // Generamos los 6 huecos (slots)
                let slotsHTML = '';
                for (let i = 0; i < 6; i++) {
                    const poke = equipo[i];
                    
                    if (poke) {
                        // SI HAY POKEMON: Mostramos el icono pixel art
                        // Nota: Usamos poke.imagen. Si la URL es de un sprite grande, 
                        // el CSS '.party-icon' se encargará de pixelarlo y ajustarlo.
                        slotsHTML += `
                        <div class="party-slot" title="${poke.mote} (${poke.especie})">
                            <img src="${poke.imagen}" class="party-icon" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'">
                        </div>`;
                    } else {
                        // SI ESTÁ VACÍO: Mostramos la sombra
                        slotsHTML += `
                        <div class="party-slot">
                            <div class="empty-shadow"></div>
                        </div>`;
                    }
                }

                // Renderizamos EL BOTÓN ÚNICO que lleva a equipo.html
                dashboardPanel.innerHTML = `
                    <h5 class="section-title text-center mb-3">Mi Equipo Activo</h5>
                    
                    <a href="equipo.html" class="party-bar-btn" title="Click para abrir PC y Gestionar">
                        ${slotsHTML}
                    </a>
                    
                    <span class="manage-hint mt-2">Click en la barra para abrir PC y organizar</span>
                `;
            }

            // 4. CLASIFICACIÓN (Leaderboard con Controles de Host)
            const leaderboardContainer = document.getElementById('leaderboard-container');
            
            if (leaderboardContainer) {
                const ranking = [...listaJugadores].sort((a, b) => {
                    if (b.vidas !== a.vidas) return b.vidas - a.vidas;
                    return (b.medallas || 0) - (a.medallas || 0);
                });

                const soyHost = infoSala.host === usuario.nombre;

                // A. CONFIGURACIÓN DEL FORMULARIO DE COMBATE (PÚBLICO)
                // Ya no verificamos 'soyHost', lo hacemos para todos.
                const selects = ['select-p1', 'select-p2', 'select-winner'];
                selects.forEach(id => {
                    const el = document.getElementById(id);
                    if (el) {
                        // Rellenamos los selectores con todos los jugadores de la sala
                        el.innerHTML = listaJugadores.map(p => `<option value="${p.nombre}">${p.nombre}</option>`).join('');
                    }
                });
                
                // Opcional: Pre-seleccionar al usuario actual como "Jugador 1" para facilitar
                const selectP1 = document.getElementById('select-p1');
                if (selectP1) selectP1.value = usuario.nombre;
            
                // B. CARGAR FEED DE COMBATES (Llamada a función nueva)
                cargarFeedCombates(salaNombre);


                leaderboardContainer.innerHTML = `
                <table class="table table-borderless bg-transparent m-0 align-middle">
                    <thead>
                        <tr class="text-muted small border-bottom border-white-10 text-uppercase">
                            <th>Rk</th>
                            <th>Entrenador</th>
                            <th class="text-center">Medallas</th>
                            <th class="text-center">Vidas</th>
                            <th class="text-center">Wins</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ranking.map((j, i) => {
                            let lifeColor = 'text-success';
                            if(j.vidas === 1) lifeColor = 'text-danger';
                            if(j.vidas === 0) lifeColor = 'text-muted text-decoration-line-through';

                            const controlesVidas = soyHost ? `
                                <div class="btn-group btn-group-sm ms-2" role="group">
                                    <button class="btn btn-outline-danger p-0 px-1" style="line-height:1" onclick="cambiarVidas('${j._id}', -1)">-</button>
                                    <button class="btn btn-outline-success p-0 px-1" style="line-height:1" onclick="cambiarVidas('${j._id}', 1)">+</button>
                                </div>
                            ` : '';

                            const controlesWins = soyHost ? `
                                <button class="btn btn-outline-warning btn-sm p-0 px-1 ms-1" style="line-height:1" title="+1 Victoria" onclick="sumarVictoria('${j._id}')">
                                    <i class="bi bi-caret-up-fill"></i>
                                </button>
                            ` : '';

                            return `
                            <tr class="${j.vidas === 0 ? 'opacity-50' : ''}">
                                <td class="fw-bold text-muted small">#${i + 1}</td>
                                <td>
                                    <div class="d-flex align-items-center gap-2">
                                        <div class="rounded-circle bg-gradient bg-primary d-flex justify-content-center align-items-center text-white fw-bold small" style="width:24px;height:24px;">
                                            ${j.nombre.charAt(0).toUpperCase()}
                                        </div>
                                        <span class="${j.vidas === 0 ? 'text-decoration-line-through' : ''}">${j.nombre}</span>
                                    </div>
                                </td>
                                <td class="text-center text-warning fw-bold">${j.medallas || 0}</td>
                                <td class="text-center">
                                    <span class="${lifeColor} fw-bold">${j.vidas}</span>
                                    ${controlesVidas}
                                </td>
                                <td class="text-center text-info">
                                    ${j.victorias || 0}
                                    ${controlesWins}
                                </td>
                            </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
                `;
            }

            // 5. INYECCIÓN BOTÓN DE BORRAR SALA (Si soy Host)
            const contenedorAcciones = document.getElementById('host-actions-container');
            if (contenedorAcciones) contenedorAcciones.innerHTML = ''; // Limpiar

            if (contenedorAcciones && infoSala.host === usuario.nombre) {
                const btnBorrar = document.createElement('button');
                btnBorrar.className = 'btn btn-danger btn-sm d-flex align-items-center gap-2';
                btnBorrar.innerHTML = '<i class="bi bi-trash-fill"></i> Borrar Sala';
                btnBorrar.onclick = borrarSala;
                contenedorAcciones.appendChild(btnBorrar);
            }

        } else {
            // ERROR 404 - Sala Eliminada
            if (response.status === 404) {
                alert("⛔ LA SALA YA NO EXISTE\n\nEl Host ha eliminado este grupo permanentemente.\nSe eliminará de tu historial.");
                let historial = JSON.parse(localStorage.getItem('pokelocke_history') || '[]');
                historial = historial.filter(s => s.sala !== salaNombre);
                localStorage.setItem('pokelocke_history', JSON.stringify(historial));
                localStorage.removeItem('usuario_pokelocke');
                localStorage.removeItem('sala_info');
                window.location.href = 'groups.html';
            }
        }
    } catch (error) { 
        console.error("Error dashboard:", error); 
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

// Enviar cambios al servidor
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
    let historial = JSON.parse(localStorage.getItem('pokelocke_history') || '[]');

    const nuevaSesion = {
        sala: datosSala.nombre,
        host: datosSala.host,
        maxJugadores: datosSala.maxJugadores,
        // --- AÑADIMOS ESTOS DOS CAMPOS ---
        reglas: datosSala.reglas || "Sin reglas definidas",
        descripcion: datosSala.descripcion || "",
        // ---------------------------------
        miNombre: datosEntrenador.nombre,
        miId: datosEntrenador._id,
        fechaAcceso: new Date().toISOString()
    };

    // Filtramos para evitar duplicados y ponemos el más reciente primero
    historial = historial.filter(s => s.sala !== datosSala.nombre);
    historial.unshift(nuevaSesion);
    
    localStorage.setItem('pokelocke_history', JSON.stringify(historial));
}

/* ========================================================= */
/* LOGIC: PÁGINA MIS GRUPOS (groups.html) - VERSIÓN CORREGIDA */
/* ========================================================= */
function cargarMisGrupos() {
    const grid = document.getElementById('groups-grid');
    const emptyState = document.getElementById('empty-state');
    
    // VALIDACIÓN CRÍTICA: Si no existe el grid, no estamos en groups.html. Salimos.
    if (!grid) return;

    console.log("📂 Cargando historial de grupos...");

    // 1. LIMPIEZA INICIAL
    // Esto borra el spinner de "Cargando..." inmediatamente.
    grid.innerHTML = ''; 

    // 2. RECUPERAR DATOS
    let historial = [];
    try {
        const raw = localStorage.getItem('pokelocke_history');
        historial = raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.error("Error leyendo historial", e);
        historial = [];
    }

    // 3. CASO: HISTORIAL VACÍO
    if (historial.length === 0) {
        if (emptyState) emptyState.classList.remove('d-none'); // Mostrar mensaje "No hay grupos"
        return; // Terminamos aquí
    }

    // 4. CASO: HAY DATOS -> RENDERIZAR TARJETAS
    // Aseguramos que el mensaje de vacío esté oculto
    if (emptyState) emptyState.classList.add('d-none');

    historial.forEach((sesion, index) => {
        // Validación de datos corruptos
        if (!sesion.sala) return;

        const colores = ['primary', 'success', 'danger', 'warning', 'info', 'indigo'];
        const color = colores[sesion.sala.length % colores.length]; 
        
        // Fecha formateada
        const fecha = sesion.fechaAcceso ? new Date(sesion.fechaAcceso).toLocaleDateString() : 'Desconocida';

        const cardHTML = `
        <div class="col-md-6 col-lg-4 fade-up"> <div class="card h-100 shadow-sm group-card border-0">
                <div class="card-body position-relative">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div class="rounded-circle bg-${color} bg-gradient d-flex align-items-center justify-content-center shadow-sm" 
                             style="width: 50px; height: 50px; font-size: 1.5rem; font-weight: bold;">
                            ${sesion.sala.charAt(0).toUpperCase()}
                        </div>
                        <span class="badge text-dark border">
                            <i class="bi bi-person"></i> ${sesion.miNombre}
                        </span>
                    </div>
                    
                    <h4 class="card-title fw-bold text-dark mb-1">${sesion.sala}</h4>
                    <p class="text-muted small mb-4">Host: ${sesion.host || 'Desconocido'}</p>
                    
                    <div class="d-grid">
                        <button onclick="reanudarPartida(${index})" class="btn btn-outline-${color} fw-bold stretched-link">
                            Entrar <i class="bi bi-box-arrow-in-right ms-2"></i>
                        </button>
                    </div>
                </div>
                <div class="card-footer bg-transparent border-0 text-muted" style="font-size: 0.75rem;">
                    Último acceso: ${fecha}
                </div>
            </div>
        </div>
        `;
        grid.innerHTML += cardHTML;
    });
}

// LÓGICA DE REANUDAR (Igual que antes)
window.reanudarPartida = function(index) {
    const historial = JSON.parse(localStorage.getItem('pokelocke_history') || '[]');
    const sesion = historial[index];

    if (sesion) {
        // 1. Reconstruir Usuario
        const usuarioReconstruido = {
            _id: sesion.miId,
            nombre: sesion.miNombre,
            sala: sesion.sala
        };

        // 2. Reconstruir Sala (AHORA CON REGLAS)
        const salaInfoReconstruida = {
            nombre: sesion.sala,
            host: sesion.host,
            maxJugadores: sesion.maxJugadores,
            // --- RECUPERAMOS LOS DATOS ---
            reglas: sesion.reglas,
            descripcion: sesion.descripcion
            // -----------------------------
        };

        // 3. Guardar en Sesión Activa (Esto es lo que lee stats.html al inicio)
        localStorage.setItem('usuario_pokelocke', JSON.stringify(usuarioReconstruido));
        localStorage.setItem('sala_info', JSON.stringify(salaInfoReconstruida));

        // 4. Actualizar fecha y redirigir
        sesion.fechaAcceso = new Date().toISOString();
        historial[index] = sesion;
        localStorage.setItem('pokelocke_history', JSON.stringify(historial));

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

/* ========================================================= */
/* LOGIC: BORRAR SALA (HOST ONLY)                            */
/* ========================================================= */
async function borrarSala() {
    const usuario = JSON.parse(localStorage.getItem('usuario_pokelocke'));
    const salaInfo = JSON.parse(localStorage.getItem('sala_info'));

    if (!usuario || !salaInfo) return;

    // 1. Confirmación de seguridad (Doble confirmación es mejor)
    const confirmacion = confirm(`⚠️ ¿PELIGRO: Estás a punto de borrar la sala "${salaInfo.nombre}"?\n\n- Se borrarán todos los datos.\n- Se expulsará a los jugadores.\n- El nombre quedará libre.\n\n¿Estás seguro?`);
    
    if (!confirmacion) return;

    try {
        // 2. Llamada al Backend
        const response = await fetch('https://pokelocke-8kjm.onrender.com/api/juego/sala', { // Ajusta tu URL si es Render
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombreSala: salaInfo.nombre,
                hostNombre: usuario.nombre
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert("✅ " + data.mensaje);

            // 3. Limpieza Local (Borrar del Historial)
            let historial = JSON.parse(localStorage.getItem('pokelocke_history') || '[]');
            // Filtramos para quitar la sala que acabamos de borrar
            historial = historial.filter(s => s.sala !== salaInfo.nombre);
            localStorage.setItem('pokelocke_history', JSON.stringify(historial));

            // 4. Limpiar sesión activa
            localStorage.removeItem('usuario_pokelocke');
            localStorage.removeItem('sala_info');

            // 5. Redirigir al inicio
            window.location.href = 'index.html';
        } else {
            alert("❌ Error: " + data.mensaje);
        }

    } catch (error) {
        console.error(error);
        alert("Error de conexión al intentar borrar.");
    }
}


/* ========================================================= */
function togglePCView() {
    const pcSection = document.getElementById('pc-section');
    if (pcSection) pcSection.classList.toggle('d-none');
}

/* ========================================================= */
/* LOGIC: GESTIÓN DE ÁRBITRO (HOST)                          */
/* ========================================================= */

// Modificar Vidas
async function cambiarVidas(idJugador, cambio) {
    try {
        const res = await fetch('https://pokelocke-8kjm.onrender.com/api/juego/vidas', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ entrenadorId: idJugador, cambio: cambio })
        });
        if (res.ok) cargarDashboard(); // Recargar para ver el cambio
    } catch (e) { console.error(e); }
}

// Sumar Victoria
async function sumarVictoria(idJugador) {
    try {
        const res = await fetch('https://pokelocke-8kjm.onrender.com/api/juego/victoria', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ entrenadorId: idJugador })
        });
        if (res.ok) cargarDashboard();
    } catch (e) { console.error(e); }
}

/* ========================================================= */
/* LOGIC: SISTEMA DE COMBATES                                */
/* ========================================================= */

// 1. CARGAR FEED (Para el sidebar de stats.html)
async function cargarFeedCombates(salaNombre) {
    const container = document.getElementById('recent-battles-list');
    if (!container) return;

    try {
        // Pedimos solo los últimos 5
        const res = await fetch(`https://pokelocke-8kjm.onrender.com/api/juego/combates/${salaNombre}?limite=3`);
        const combates = await res.json();

        if (combates.length === 0) {
            container.innerHTML = '<small class="text-muted d-block text-center">Sin combates recientes</small>';
            return;
        }

        container.innerHTML = combates.map(c => `
            <div class="mb-2 p-2 rounded border border-secondary bg-dark bg-opacity-25 small">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="text-info">${c.entrenador1}</span>
                    <span class="text-muted" style="font-size:0.7em">VS</span>
                    <span class="text-info">${c.entrenador2}</span>
                </div>
                <div class="text-center">
                    <span class="badge bg-success bg-opacity-25 text-success border border-success">
                        🏆 ${c.ganador}
                    </span>
                </div>
            </div>
        `).join('');
    } catch (e) { console.error(e); }
}

// 2. ENVIAR COMBATE (Evento del Formulario)
const formCombate = document.getElementById('form-combate');
if (formCombate) {
    formCombate.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const p1 = document.getElementById('select-p1').value;
        const p2 = document.getElementById('select-p2').value;
        const ganador = document.getElementById('select-winner').value;
        
        const usuario = JSON.parse(localStorage.getItem('usuario_pokelocke'));

        if (p1 === p2) { alert("¡Un jugador no puede luchar contra sí mismo!"); return; }

        try {
            // A. Guardar Combate
            await fetch('https://pokelocke-8kjm.onrender.com/api/juego/combate', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    sala: usuario.sala,
                    entrenador1: p1,
                    entrenador2: p2,
                    ganador: ganador
                })
            });

            // B. Actualizar contador de victorias del ganador (Reutilizamos la ruta existente)
            // Necesitamos el ID del ganador, lo buscamos en el DOM o recargamos
            // Para simplificar, recargamos la página y el backend ya tiene la victoria si la implementamos antes
            // (Opcional: llamar a /api/juego/victoria aquí también si queremos autoincrementar)
            
            // Cerrar modal y recargar
            const modal = bootstrap.Modal.getInstance(document.getElementById('combatModal'));
            modal.hide();
            cargarDashboard(); 

        } catch (error) { console.error(error); }
    });
}

/* ========================================================= */
/* LOGIC: GESTOR DE EQUIPO (equipo.html)                     */
/* ========================================================= */
async function cargarGestorEquipo() {
    const activeGrid = document.getElementById('active-team-grid');
    if (!activeGrid) return; 

    const usuarioRaw = localStorage.getItem('usuario_pokelocke');
    if (!usuarioRaw) return;
    const usuario = JSON.parse(usuarioRaw);

    try {
        // 1. Obtener datos frescos del servidor
        const res = await fetch(`https://pokelocke-8kjm.onrender.com/api/juego/sala/${usuario.sala}`);
        const data = await res.json();
        const miPerfil = data.jugadores.find(j => j._id === usuario._id);
        const pokemons = miPerfil.pokemons;

        // Filtramos por zonas
        const equipo = pokemons.filter(p => p.estado === 'equipo');
        const caja = pokemons.filter(p => p.estado === 'caja');
        const cementerio = pokemons.filter(p => p.estado === 'cementerio');

        // 2. Actualizar Contador Visual
        const counterEl = document.getElementById('team-counter');
        if(counterEl) counterEl.innerText = `${equipo.length}/6`;

        // -------------------------------------------------
        // RENDERIZADO: EQUIPO ACTIVO (Siempre 6 Huecos)
        // -------------------------------------------------
        let htmlEquipo = '';
        
        // A. Los Pokémon que existen
        equipo.forEach(p => {
            htmlEquipo += `
            <div class="col-6 col-md-4 col-lg-2 fade-in">
                <div class="manage-card border-warning"> <div class="text-center mb-2">
                        <img src="${p.imagen}" style="width:60px; height:60px; object-fit:contain;">
                        <div class="fw-bold small mt-1 text-truncate">${p.mote}</div>
                        <span class="badge bg-dark border border-secondary text-secondary" style="font-size:0.6em">Nvl ${p.nivel}</span>
                    </div>
                    <div class="w-100 d-grid gap-1">
                        <button onclick="moverPokemon('${p._id}', 'caja')" class="btn btn-sm btn-outline-primary py-0" style="font-size:0.75rem">
                            <i class="bi bi-box-arrow-in-down"></i> PC
                        </button>
                        <button onclick="moverPokemon('${p._id}', 'cementerio')" class="btn btn-sm btn-outline-danger py-0" style="font-size:0.75rem">
                            <i class="bi bi-skull"></i> F
                        </button>
                    </div>
                </div>
            </div>`;
        });

        // B. Rellenar huecos vacíos hasta 6
        for(let i = equipo.length; i < 6; i++) {
            htmlEquipo += `
            <div class="col-6 col-md-4 col-lg-2">
                <div class="slot-empty">
                    <div class="text-center opacity-50">
                        <i class="bi bi-plus-circle display-6"></i>
                        <div class="mt-2 small">Vacío</div>
                    </div>
                </div>
            </div>`;
        }
        activeGrid.innerHTML = htmlEquipo;

        // -------------------------------------------------
        // RENDERIZADO: CAJA PC
        // -------------------------------------------------
        const pcGrid = document.getElementById('pc-box-grid');
        if(caja.length === 0) {
            pcGrid.innerHTML = '<div class="col-12 text-center text-muted py-4 small">La caja está vacía</div>';
        } else {
            pcGrid.innerHTML = caja.map(p => `
            <div class="col-4 col-md-3 col-lg-2 fade-in">
                <div class="manage-card">
                    <div class="text-center mb-2">
                        <img src="${p.imagen}" style="width:50px; height:50px; object-fit:contain; opacity:0.8;">
                        <div class="fw-bold small mt-1 text-truncate text-muted">${p.mote}</div>
                    </div>
                    <div class="w-100 d-grid gap-1">
                        <button onclick="moverPokemon('${p._id}', 'equipo')" class="btn btn-sm btn-success py-0" style="font-size:0.75rem">
                            <i class="bi bi-arrow-up-circle"></i> Equipo
                        </button>
                        <button onclick="moverPokemon('${p._id}', 'cementerio')" class="btn btn-sm btn-outline-secondary py-0 border-0" style="font-size:0.75rem">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>`).join('');
        }

        // -------------------------------------------------
        // RENDERIZADO: CEMENTERIO
        // -------------------------------------------------
        const graveGrid = document.getElementById('graveyard-grid');
        if(cementerio.length > 0) {
            graveGrid.innerHTML = cementerio.map(p => `
            <div class="col-4 col-md-3 col-lg-2">
                <div class="manage-card bg-danger bg-opacity-10 border-danger">
                    <div class="text-center mb-1" style="filter: grayscale(100%);">
                        <img src="${p.imagen}" style="width:40px; height:40px; object-fit:contain;">
                        <div class="small mt-1 text-truncate text-danger text-decoration-line-through">${p.mote}</div>
                    </div>
                    <button onclick="moverPokemon('${p._id}', 'caja')" class="btn btn-sm btn-link text-muted py-0 w-100" style="font-size:0.6rem; text-decoration:none;">
                        Revivir
                    </button>
                </div>
            </div>`).join('');
        } else {
            graveGrid.innerHTML = '<div class="col-12 text-center text-muted py-2 small opacity-50">Nadie ha muerto... aún.</div>';
        }

    } catch(e) { console.error("Error cargando equipo:", e); }
}

/* ========================================================= */
/* LOGIC: MOVER POKÉMON (Conecta con Backend)                */
/* ========================================================= */
window.moverPokemon = async function(pokeId, nuevoEstado) {
    const usuarioRaw = localStorage.getItem('usuario_pokelocke');
    if (!usuarioRaw) return;
    const usuario = JSON.parse(usuarioRaw);

    // Definir URL (Ajusta si usas localhost o Render)
    // Si estás probando en local: 'http://localhost:3000/api/juego/pokemon/mover'
    const API_URL = 'https://pokelocke-8kjm.onrender.com/api/juego/pokemon/mover'; 

    try {
        const res = await fetch(API_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                entrenadorId: usuario._id,
                pokemonId: pokeId,
                nuevoEstado: nuevoEstado
            })
        });

        const data = await res.json();

        if (res.ok) {
            // Si salió bien, recargamos la pantalla del gestor para ver los cambios
            cargarGestorEquipo(); 
        } else {
            // Si hubo error (ej: Equipo lleno), mostramos alerta
            alert("⚠️ " + data.mensaje);
        }

    } catch (error) {
        console.error("Error de conexión:", error);
        alert("No se pudo conectar con el servidor.");
    }
};

/* ========================================================= */
/* LOGIC: HISTORIAL COMPLETO (combates.html)                 */
/* ========================================================= */
async function cargarHistorialCompleto() {
    const container = document.getElementById('timeline-content');
    if (!container) return; // No estamos en la página correcta

    const usuarioRaw = localStorage.getItem('usuario_pokelocke');
    if (!usuarioRaw) return;
    const usuario = JSON.parse(usuarioRaw);

    try {
        // Fetch sin límite (trae todos)
        // NOTA: Asegúrate de que la URL es correcta
        const res = await fetch(`https://pokelocke-8kjm.onrender.com/api/juego/combates/${usuario.sala}`);
        const combates = await res.json();

        if (combates.length === 0) {
            container.innerHTML = `
                <div class="glass-panel p-5 text-center">
                    <i class="bi bi-wind text-muted" style="font-size: 3rem;"></i>
                    <h4 class="text-muted mt-3">Todo está tranquilo...</h4>
                    <p class="small text-secondary">Aún no se han registrado batallas en esta sala.</p>
                </div>`;
            return;
        }

        // Renderizar Timeline
        container.innerHTML = combates.map(c => {
            // Formatear fecha
            const fecha = new Date(c.fecha).toLocaleDateString('es-ES', { 
                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
            });

            // Determinar avatar/color del ganador (simple por inicial)
            const inicialGanador = c.ganador.charAt(0).toUpperCase();

            return `
            <div class="battle-item fade-up">
                <div class="battle-dot"></div>
                
                <div class="battle-card-full">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <span class="badge bg-secondary bg-opacity-25 text-muted border border-secondary border-opacity-25" style="font-size:0.65em">
                            ${fecha}
                        </span>
                        
                        <div class="text-end">
                            <span class="text-warning small fw-bold">GANADOR</span>
                            <div class="d-flex align-items-center justify-content-end gap-2 mt-1">
                                <span class="fw-bold text-white">${c.ganador}</span>
                                <div class="rounded-circle bg-warning text-dark d-flex align-items-center justify-content-center fw-bold" style="width:25px; height:25px; font-size:0.8em">
                                    ${inicialGanador}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="d-flex align-items-center gap-3 py-2 border-top border-white-10 mt-2">
                        <div class="flex-grow-1 text-center">
                            <span class="d-block text-info fw-bold">${c.entrenador1}</span>
                            ${c.ganador === c.entrenador1 ? '<i class="bi bi-trophy-fill text-warning"></i>' : '<small class="text-muted">Derrota</small>'}
                        </div>
                        
                        <div class="text-muted fw-light">VS</div>
                        
                        <div class="flex-grow-1 text-center">
                            <span class="d-block text-danger fw-bold">${c.entrenador2}</span>
                            ${c.ganador === c.entrenador2 ? '<i class="bi bi-trophy-fill text-warning"></i>' : '<small class="text-muted">Derrota</small>'}
                        </div>
                    </div>
                </div>
            </div>`;
        }).join('');

    } catch (e) {
        console.error(e);
        container.innerHTML = '<p class="text-danger text-center">Error cargando el historial.</p>';
    }
}

// AUTO-INIT
if (window.location.pathname.includes('combates.html')) {
    document.addEventListener('DOMContentLoaded', cargarHistorialCompleto);
}


