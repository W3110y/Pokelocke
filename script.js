/* ========================================================================== */
/* 1. CONFIGURACIÓN Y UTILIDADES GLOBALES                                    */
/* ========================================================================== */

// DICCIONARIO MAESTRO DE NOMBRES (API SLUGS)
const EXCEPCIONES_API = {
    // Kanto/Johto
    'nidoran♀': 'nidoran-f', 'nidoran f': 'nidoran-f',
    'nidoran♂': 'nidoran-m', 'nidoran m': 'nidoran-m',
    'farfetch\'d': 'farfetchd', 'mr. mime': 'mr-mime', 'ho-oh': 'ho-oh',
    // Hoenn/Sinnoh
    'deoxys': 'deoxys-normal', 'wormadam': 'wormadam-plant',
    'mime jr.': 'mime-jr', 'porygon-z': 'porygon-z',
    'giratina': 'giratina-altered', 'shaymin': 'shaymin-land',
    // Unova
    'basculin': 'basculin-red-striped', 'darmanitan': 'darmanitan-standard',
    'darmanitan zen': 'darmanitan-zen', 'tornadus': 'tornadus-incarnate',
    'thundurus': 'thundurus-incarnate', 'landorus': 'landorus-incarnate',
    'keldeo': 'keldeo-ordinary', 'meloetta': 'meloetta-aria',
    // Kalos
    'flabébé': 'flabebe', 'flabebe': 'flabebe', 'meowstic': 'meowstic-male',
    'aegislash': 'aegislash-shield', 'pumpkaboo': 'pumpkaboo-average',
    'gourgeist': 'gourgeist-average', 'zygarde': 'zygarde-50',
    // Alola
    'type: null': 'type-null', 'oricorio': 'oricorio-baile',
    'lycanroc': 'lycanroc-midday', 'wishiwashi': 'wishiwashi-solo',
    'minior': 'minior-red-meteor', 'mimikyu': 'mimikyu-disguised',
    'tapu koko': 'tapu-koko', 'tapu lele': 'tapu-lele',
    'tapu bulu': 'tapu-bulu', 'tapu fini': 'tapu-fini',
    'jangmo-o': 'jangmo-o', 'hakamo-o': 'hakamo-o', 'kommo-o': 'kommo-o',
    // Galar
    'toxtricity': 'toxtricity-amped', 'mr. rime': 'mr-rime',
    'sirfetch\'d': 'sirfetchd', 'eiscue': 'eiscue-ice',
    'indeedee': 'indeedee-male', 'morpeko': 'morpeko-full-belly',
    'urshifu': 'urshifu-single-strike', 'zacian': 'zacian',
    'zamazenta': 'zamazenta', 'eternatus': 'eternatus',
    'calyrex ice': 'calyrex-ice', 'calyrex shadow': 'calyrex-shadow',
    'darmanitan galar': 'darmanitan-galar-standard',
    'darmanitan galar zen': 'darmanitan-galar-zen',
    // Hisui
    'basculegion': 'basculegion-male', 'enamorus': 'enamorus-incarnate',
    'dialga origin': 'dialga-origin', 'palkia origin': 'palkia-origin',
    // Paldea
    'oinkologne': 'oinkologne-male', 'maushold': 'maushold-family-of-four',
    'squawkabilly': 'squawkabilly-green-plumage', 'palafin': 'palafin-zero',
    'tatsugiri': 'tatsugiri-curly', 'dudunsparce': 'dudunsparce-two-segment',
    'gimmighoul': 'gimmighoul-chest', 'wo-chien': 'wo-chien',
    'chien-pao': 'chien-pao', 'ting-lu': 'ting-lu', 'chi-yu': 'chi-yu',
    'tauros paldea': 'tauros-paldea-combat-breed',
    'tauros paldea fuego': 'tauros-paldea-blaze-breed',
    'tauros paldea agua': 'tauros-paldea-aqua-breed',
    // Paradox
    'great tusk': 'great-tusk', 'scream tail': 'scream-tail',
    'brute bonnet': 'brute-bonnet', 'flutter mane': 'flutter-mane',
    'slither wing': 'slither-wing', 'sandy shocks': 'sandy-shocks',
    'iron treads': 'iron-treads', 'iron bundle': 'iron-bundle',
    'iron hands': 'iron-hands', 'iron jugulis': 'iron-jugulis',
    'iron moth': 'iron-moth', 'iron thorns': 'iron-thorns',
    'roaring moon': 'roaring-moon', 'iron valiant': 'iron-valiant',
    'walking wake': 'walking-wake', 'iron leaves': 'iron-leaves',
    'gouging fire': 'gouging-fire', 'raging bolt': 'raging-bolt',
    'iron boulder': 'iron-boulder', 'iron crown': 'iron-crown',
    'hydrapple': 'hydrapple', 'archaludon': 'archaludon',
    'terapagos': 'terapagos-normal'
};

function normalizarNombrePokemon(nombre) {
    if (!nombre) return 'unknown';
    let limpio = nombre.toLowerCase().trim();

    if (EXCEPCIONES_API[limpio]) return EXCEPCIONES_API[limpio];

    // Reglas Regex Genéricas
    let procesado = limpio
        .replace(/\./g, '')       // Mr. Mime -> mr mime
        .replace(/'/g, '')        // Farfetch'd -> farfetchd
        .replace(/:/g, '')        // Type: Null -> type null
        .replace(/♀/g, '-f')      // Símbolos
        .replace(/♂/g, '-m')
        .replace(/é/g, 'e')       // Tildes
        .replace(/\s+/g, '-');    // Espacios -> Guiones

    return procesado;
}

const ponerCargador = (id, msg) => { 
    const el = document.getElementById(id); 
    if (el) el.innerHTML = `<div class="loading-state"><div class="spinner-border text-primary"></div><p>${msg}</p></div>`; 
};

/* ========================================================================== */
/* 2. INICIALIZADOR PRINCIPAL (CEREBRO)                                      */
/* ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    
    // A. Pantalla de Inicio (Typing Effect)
    const typingElement = document.getElementById("typing");
    if (typingElement) initTypingEffect(typingElement);

    // B. Crear/Unirse Sala
    initFormulariosAcceso();

    // C. Dashboard (Sala)
    if (window.location.pathname.includes('sala_grupo.html')) {
        cargarDashboard();
    }

    // D. Gestor de Equipo (PC/Captura/Evo)
    if (document.getElementById('active-team-grid')) {
        cargarGestorEquipo();
        iniciarCaptura(); // Activa el botón del modal
    }

    // E. Historial de Combates
    if (window.location.pathname.includes('combates.html')) {
        cargarHistorialCompleto();
    }

    // F. Mis Grupos
    if (document.getElementById('groups-grid')) {
        cargarMisGrupos();
    }

    // G. Carga de Diccionarios (Segundo plano)
    inicializarDiccionarioMovimientos();
    inicializarDatalists();
});

/* ========================================================================== */
/* 3. LÓGICA DE SALAS (CREAR / UNIRSE)                                       */
/* ========================================================================== */
function initFormulariosAcceso() {
    // Crear Sala
    const createForm = document.getElementById('form-create-party');
    if (createForm) {
        createForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                hostName: document.getElementById('host-name').value,
                partyName: document.getElementById('party-name').value,
                partySize: document.getElementById('party-size').value,
                rules: document.getElementById('party-rules').value,
                description: document.getElementById('party-description').value,
                vidas: document.getElementById('party-lives').value 
            };

            const API_URL = 'https://pokelocke-8kjm.onrender.com/api/juego/crear';

            try {
                const btn = createForm.querySelector('button[type="submit"]');
                btn.disabled = true; btn.innerText = "Creando...";
                const response = await fetch(`${API_URL}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const data = await response.json();

                if (response.ok) {
                    alert("✅ ¡Sala creada!");
                    localStorage.setItem('usuario_pokelocke', JSON.stringify(data.entrenador));
                    localStorage.setItem('sala_info', JSON.stringify(data.sala)); 
                    guardarPartidaEnHistorial(data.entrenador, data.sala);
                    window.location.href = 'sala.html';
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

    // Unirse Sala
    const joinForm = document.getElementById('form-join-party');
    if (joinForm) {
        joinForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = joinForm.querySelector('button');
            const formData = {
                nombre: document.getElementById('playerName').value.trim(),
                sala: document.getElementById('partyName').value.trim()
            };

            if (!formData.nombre || !formData.sala) return alert("Por favor rellena ambos campos");

            const API_URL = 'https://pokelocke-8kjm.onrender.com/api/juego/unirse'; 

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
                    localStorage.setItem('usuario_pokelocke', JSON.stringify(data.entrenador));
                    if (data.salaInfo) {
                        localStorage.setItem('sala_info', JSON.stringify(data.salaInfo));
                        guardarPartidaEnHistorial(data.entrenador, data.salaInfo);
                    }
                    window.location.href = 'sala_grupo.html';
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
}

/* ========================================================================== */
/* 4. DASHBOARD (SALA_GRUPO.HTML)                                                  */
/* ========================================================================== */
async function cargarDashboard() {
    const usuarioRaw = localStorage.getItem('usuario_pokelocke');
    if (!usuarioRaw) { window.location.href = 'join.html'; return; }
    
    const usuario = JSON.parse(usuarioRaw);
    const salaNombre = usuario.sala; 

    // Renderizado rápido desde cache
    const salaInfoRaw = localStorage.getItem('sala_info');
    if (salaInfoRaw) renderizarInfoSala(JSON.parse(salaInfoRaw));

    // Spinners de carga
    ponerCargador('members-list', 'Buscando entrenadores...');
    ponerCargador('my-dashboard-panel', 'Sincronizando equipo...');
    ponerCargador('leaderboard-container', 'Calculando ranking...');
    ponerCargador('recent-battles-list', 'Obteniendo historial...');

    const API_URL = `https://pokelocke-8kjm.onrender.com/api/juego/sala/${salaNombre}`;

    try {
        const response = await fetch(API_URL);
        if (response.status === 404) {
            alert("⛔ LA SALA YA NO EXISTE");
            window.location.href = 'groups.html';
        }

        const data = await response.json(); 
        const infoSala = data.sala;
        const listaJugadores = data.jugadores;
        
        // Cache global para el modal de combates
        window.CACHE_JUGADORES_SALA = listaJugadores;

        renderizarInfoSala(infoSala);

        // A. Modales Info/Reglas
        const rulesContent = document.getElementById('modal-rules-content');
        if (rulesContent) rulesContent.innerHTML = `<p class="lh-lg">${infoSala.reglas || "Sin reglas definidas."}</p>`;
        
        const descContent = document.getElementById('modal-desc-content');
        if (descContent) descContent.innerHTML = `<p class="lh-lg">${infoSala.descripcion || "Sin descripción."}</p>`;

        // B. Lista Miembros (Sidebar Izquierdo)
        const membersList = document.getElementById('members-list');
        if (membersList) {
            membersList.innerHTML = listaJugadores.map(jugador => {
                const isHost = jugador.nombre === infoSala.host;
                const isMe = jugador.nombre === usuario.nombre;
                const esMuerto = jugador.vidas === 0;
                
                // Mini-Slots para el desplegable
                const equipoRival = jugador.pokemons.filter(p => p.estado === 'equipo');
                let miniSlots = '';
                for(let i=0; i<6; i++) {
                        const p = equipoRival[i];
                        if(p) {
                            miniSlots += `
                            <div class="mini-slot" title="${p.mote} (${p.especie})">
                                <img src="${p.imagen}" class="mini-poke-icon">
                            </div>`;
                        } else {
                            miniSlots += `<div class="mini-slot opacity-25"></div>`;
                        }
                    }

                // Renderizamos la tarjeta + el panel oculto
                return `
                    <div class="mb-2">
                        <div class="d-flex align-items-center gap-2 p-2 rounded position-relative" 
                             style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.05); z-index: 2;">
                            
                            <div class="rounded-circle bg-gradient bg-primary d-flex align-items-center justify-content-center text-white fw-bold shadow-sm flex-shrink-0" 
                                 style="width:32px; height:32px; font-size: 0.8rem; filter: ${esMuerto ? 'grayscale(1)' : 'none'}">
                                ${jugador.nombre.charAt(0).toUpperCase()}
                            </div>
                            
                            <div class="flex-grow-1 text-truncate">
                                <span class="d-block lh-1 small fw-bold text-white ${isMe ? 'text-warning' : ''} ${esMuerto ? 'text-decoration-line-through text-muted' : ''}">
                                    ${jugador.nombre} ${isMe ? '(Tú)' : ''}
                                </span>
                                <div class="mt-1 d-flex align-items-center gap-2">
                                    ${isHost ? '<span class="badge bg-warning text-dark border border-warning" style="font-size:0.6em; padding: 2px 6px;">HOST</span>' : ''}
                                    ${esMuerto ? '<span class="badge bg-danger" style="font-size:0.6em;">ELIMINADO</span>' : ''}
                                </div>
                            </div>

                            <button class="btn-toggle-team" onclick="toggleTeamView('${jugador._id}', this)" title="Ver equipo">
                                <i class="bi bi-chevron-down"></i>
                            </button>
                        </div>

                        <div id="team-view-${jugador._id}" class="mini-team-container">
                            <div class="mini-team-grid">
                                ${miniSlots}
                            </div>
                        </div>
                    </div>`;
                }).join('');
            }

        // C. Panel Central (Botón Equipo)
        const miUsuario = listaJugadores.find(u => u._id === usuario._id);
        const dashboardPanel = document.getElementById('my-dashboard-panel');

        if (miUsuario && dashboardPanel) {
            const equipo = miUsuario.pokemons.filter(p => p.estado === 'equipo');
            let slotsHTML = '';
            for (let i = 0; i < 6; i++) {
                const poke = equipo[i];
                slotsHTML += poke 
                    ? `<div class="party-slot" title="${poke.mote}"><img src="${poke.imagen}" class="party-icon" onerror="this.style.display='none'"></div>`
                    : `<div class="party-slot"><div class="empty-shadow"></div></div>`;
            }

            dashboardPanel.innerHTML = `
                <div class="d-flex justify-content-between align-items-end mb-2 px-1"><h5 class="section-title m-0 text-white">Mi Equipo Activo</h5></div>
                <a href="equipo.html" class="party-bar-btn" title="Gestionar equipo">${slotsHTML}</a>
                <div class="text-center mt-2"><span class="manage-hint text-white-50" style="font-size: 0.7rem;">Haz clic para abrir el PC</span></div>`;
        }

        // D. Leaderboard (Ranking)
        const leaderboardContainer = document.getElementById('leaderboard-container');
        if (leaderboardContainer) {
            const ranking = [...listaJugadores].sort((a, b) => {
                if ((b.medallas || 0) !== (a.medallas || 0)) return (b.medallas || 0) - (a.medallas || 0);
                return b.vidas - a.vidas;
            });
            const soyHost = infoSala.host === usuario.nombre;

            // Rellenar selects del modal de Combate
            ['select-p1', 'select-p2', 'select-winner'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.innerHTML = listaJugadores.map(p => `<option value="${p.nombre}">${p.nombre}</option>`).join('');
            });
            const selP1 = document.getElementById('select-p1');
            if (selP1) selP1.value = usuario.nombre;

            leaderboardContainer.innerHTML = `
            <table class="table table-borderless m-0 align-middle" style="color: var(--text-main);">
                    <thead>
                        <tr class="text-white-50 small border-bottom border-white-10 text-uppercase" style="font-size: 0.7rem;">
                            <th class="ps-3">#</th>
                            <th>Entrenador</th>
                            <th class="text-center">Medallas</th>
                            <th class="text-center">Vidas</th>
                            <th class="text-center">Wins</th>
                        </tr>
                    </thead>
                    <tbody>
                    ${ranking.map((j, i) => {
                        let lifeColor = j.vidas <= 1 ? 'text-danger' : 'text-success';
                        if(j.vidas === 0) lifeColor = 'text-muted text-decoration-line-through';
                        const soyYo = j.nombre === usuario.nombre;

                        // Botones Medallas (Solo para mí)
                        let columnaMedallas = '';
                            
                            if (soyYo) {
                                columnaMedallas = `
                                <div class="d-flex align-items-center justify-content-center gap-2">
                                    <button class="btn btn-sm btn-link text-white-50 p-0 text-decoration-none" onclick="cambiarMedallas('${j._id}', -1)">
                                        <i class="bi bi-dash-circle"></i>
                                    </button>
                                    <span class="text-warning fw-bold fs-6">${j.medallas || 0}</span>
                                    <button class="btn btn-sm btn-link text-warning p-0 text-decoration-none" onclick="cambiarMedallas('${j._id}', 1)">
                                        <i class="bi bi-plus-circle-fill"></i>
                                    </button>
                                </div>`;
                            } else {
                                // Vista para otros jugadores (solo número)
                                columnaMedallas = `<span class="text-warning fw-bold opacity-75">${j.medallas || 0}</span>`;
                            }
                        // Botones Wins (Solo Host)
                        const controlesWins = soyHost ? `
                                <div class="d-inline-flex ms-1 align-items-center bg-dark rounded border border-secondary" style="transform: scale(0.85);">
                                    <button class="btn btn-sm btn-link text-white-50 p-0 px-2 text-decoration-none" onclick="cambiarVictorias('${j._id}', -1)">-</button>
                                    <span class="text-white border-start border-end border-secondary px-2" style="font-size: 0.9em;">W</span>
                                    <button class="btn btn-sm btn-link text-warning p-0 px-2 text-decoration-none" onclick="cambiarVictorias('${j._id}', 1)">+</button>
                                </div>` : '';

                            return `
                            <tr class="${j.vidas === 0 ? 'opacity-50' : ''} border-bottom border-white-10" style="background: transparent;">
                                <td class="fw-bold text-white-50 small ps-3">${i + 1}</td>
                                <td>
                                    <div class="d-flex align-items-center gap-2">
                                        <div class="rounded-circle bg-white-10 d-flex justify-content-center align-items-center text-white fw-bold small" style="width:24px;height:24px;">${j.nombre.charAt(0).toUpperCase()}</div>
                                        <span class="small fw-bold ${j.vidas === 0 ? 'text-decoration-line-through' : 'text-white'}">
                                            ${j.nombre} ${soyYo ? '(Tú)' : ''}
                                        </span>
                                    </div>
                                </td>
                                
                                <td class="text-center">${columnaMedallas}</td>
                                
                                <td class="text-center small"><span class="${lifeColor} fw-bold">${j.vidas}</span></td>
                                <td class="text-center text-info small">${j.victorias || 0}${controlesWins}</td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>`;
            }

        // E. Feed y Formulario
        cargarFeedCombates(salaNombre);
        initFormularioCombate(); // Inicializa el listener del modal de registro

        // F. Botón Borrar (Host)
        const contenedorAcciones = document.getElementById('host-actions-container');
            if (contenedorAcciones) {
                contenedorAcciones.innerHTML = ''; 
                if (infoSala.host === usuario.nombre) {
                    const btnBorrar = document.createElement('button');
                    btnBorrar.className = 'btn btn-outline-danger btn-sm w-100 mt-2 opacity-75 hover-opacity-100';
                    btnBorrar.innerHTML = '<i class="bi bi-trash-fill me-2"></i> Eliminar Sala Permanentemente';
                    btnBorrar.onclick = borrarSala;
                    contenedorAcciones.appendChild(btnBorrar);
                }
            }
    } catch (error) { 
        console.error("Error dashboard:", error); 
    }
}

function renderizarInfoSala(sala) {
    const t = document.getElementById('view-party-name'); if(t) t.innerText = sala.nombre;
    const h = document.getElementById('view-host-name'); if(h) h.innerText = sala.host;
}

/* ========================================================================== */
/* 5. GESTIÓN DE EQUIPO (PC / CAPTURA / EVOLUCIÓN)                           */
/* ========================================================================== */
// 1. FUNCIÓN PRINCIPAL PARA PINTAR LAS TARJETAS
function renderizarTracker(pokemons) {
    const contEquipo = document.getElementById('tracker-equipo');
    const contCaja = document.getElementById('tracker-caja');
    const contCementerio = document.getElementById('tracker-cementerio');

    if (!contEquipo || !contCaja || !contCementerio) return;

    // Limpiamos los contenedores
    contEquipo.innerHTML = '';
    contCaja.innerHTML = '';
    contCementerio.innerHTML = '';

    if (!pokemons || pokemons.length === 0) {
        contEquipo.innerHTML = '<div class="col-12 text-center text-white-50 py-4">No has registrado ningún Pokémon aún.</div>';
        return;
    }

    // Dibujamos cada Pokémon como una tarjeta simple
    pokemons.forEach(poke => {
        const estado = poke.estado || 'caja'; // Por defecto a caja si hay error
        const urlBackup = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.especie.toLowerCase()}.png`;

        const cardHTML = `
        <div class="col-6 col-md-4 col-lg-2">
            <div class="glass-panel p-3 text-center position-relative h-100 d-flex flex-column justify-content-between" style="border: 1px solid rgba(255,255,255,0.05);">
                
                <!-- Botón de Eliminar (Papelera) -->
                <button onclick="eliminarPokemonTracker('${poke._id}')" class="btn btn-link text-danger p-0 position-absolute top-0 end-0 m-2" title="Borrar registro">
                    <i class="bi bi-trash-fill"></i>
                </button>

                <!-- Sprite e Info -->
                <div class="mt-2 mb-2">
                    <img src="${poke.imagen}" onerror="this.onerror=null; this.src='${urlBackup}';" style="height: 70px; object-fit: contain; image-rendering: pixelated; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">
                </div>
                
                <div class="mb-2">
                    <div class="fw-bold text-truncate text-white" style="font-size: 0.9rem;">${poke.mote || poke.especie}</div>
                    <div class="small text-warning fw-bold" style="font-size: 0.75rem;">Nv. ${poke.nivel}</div>
                </div>

                <!-- Selector de Estado -->
                <select class="form-select form-select-sm bg-dark text-white border-secondary mt-auto" 
                        onchange="cambiarEstadoTracker('${poke._id}', this.value)" 
                        style="font-size: 0.75rem;">
                    <option value="equipo" ${estado === 'equipo' ? 'selected' : ''}>En Equipo</option>
                    <option value="caja" ${estado === 'caja' ? 'selected' : ''}>En PC</option>
                    <option value="cementerio" ${estado === 'cementerio' ? 'selected' : ''}>Muerto</option>
                </select>

            </div>
        </div>`;

        // Distribuir según el estado actual
        if (estado === 'equipo') contEquipo.innerHTML += cardHTML;
        else if (estado === 'caja') contCaja.innerHTML += cardHTML;
        else if (estado === 'cementerio') contCementerio.innerHTML += cardHTML;
    });

    // Mensajes de vacío si alguna sección no tiene nada
    if(contEquipo.innerHTML === '') contEquipo.innerHTML = '<div class="col-12 text-center text-white-50 small">Vacío</div>';
    if(contCaja.innerHTML === '') contCaja.innerHTML = '<div class="col-12 text-center text-white-50 small">Vacío</div>';
    if(contCementerio.innerHTML === '') contCementerio.innerHTML = '<div class="col-12 text-center text-white-50 small">Nadie ha caído aún</div>';
}

// 2. FUNCIÓN PARA CAMBIAR EL ESTADO EN LA NUBE
async function cambiarEstadoTracker(pokeId, nuevoEstado) {
    const usuario = JSON.parse(localStorage.getItem('usuario_pokelocke'));
    
    try {
        // Asumiendo que tu endpoint PUT permite actualizar el estado
        const res = await fetch(`https://pokelocke-8kjm.onrender.com/api/juego/pokemon/${pokeId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                sala: usuario.sala, 
                nombreJugador: usuario.nombre,
                estado: nuevoEstado 
            })
        });

        if (res.ok) {
            // Recargar la lista de la sala y volver a pintar
            const dataRes = await fetch(`https://pokelocke-8kjm.onrender.com/api/juego/sala/${usuario.sala}`);
            const salaData = await dataRes.json();
            const misDatos = salaData.jugadores.find(j => j.nombre === usuario.nombre);
            renderizarTracker(misDatos.pokemons);
        } else {
            alert("Error al actualizar el estado.");
        }
    } catch (e) {
        console.error(e);
        alert("Error de conexión.");
    }
}

// 3. FUNCIÓN PARA BORRAR SI TE EQUIVOCAS AL CAPTURAR
async function eliminarPokemonTracker(pokeId) {
    if(!confirm("¿Borrar este Pokémon definitivamente del registro?")) return;
    
    const usuario = JSON.parse(localStorage.getItem('usuario_pokelocke'));
    
    try {
        // Enviar la petición DELETE
        const res = await fetch(`https://pokelocke-8kjm.onrender.com/api/juego/pokemon/${pokeId}`, {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                sala: usuario.sala, 
                nombreJugador: usuario.nombre 
            })
        });

        if (res.ok) {
            const dataRes = await fetch(`https://pokelocke-8kjm.onrender.com/api/juego/sala/${usuario.sala}`);
            const salaData = await dataRes.json();
            const misDatos = salaData.jugadores.find(j => j.nombre === usuario.nombre);
            renderizarTracker(misDatos.pokemons);
        } else {
            alert("Error al borrar el Pokémon.");
        }
    } catch (e) {
        console.error(e);
    }
}

function iniciarCaptura() {
    const formCaptura = document.getElementById('form-captura');
    if (!formCaptura) return;

    // Clonar para limpiar listeners viejos
    const newForm = formCaptura.cloneNode(true);
    formCaptura.parentNode.replaceChild(newForm, formCaptura);

    newForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const inputEspecie = document.getElementById('cap-especie');
        const btnSubmit = newForm.querySelector('button[type="submit"]');
        const rawName = inputEspecie.value;
        const usuario = JSON.parse(localStorage.getItem('usuario_pokelocke'));

        const txtOriginal = btnSubmit.innerText;
        btnSubmit.innerText = "🔍 Buscando..."; btnSubmit.disabled = true;

        try {
            const nombreApi = normalizarNombrePokemon(rawName);
            const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${nombreApi}`);
            if (!pokeRes.ok) throw new Error(`Pokémon "${rawName}" no encontrado.`);
            
            const pokeData = await pokeRes.json();
            const imagenUrl = pokeData.sprites.versions['generation-viii'].icons.front_default || 
                              pokeData.sprites.versions['generation-vii'].icons.front_default || 
                              pokeData.sprites.front_default;

            const API_BACKEND = 'https://pokelocke-8kjm.onrender.com/api/juego/pokemon'; 

            btnSubmit.innerText = "💾 Guardando...";
            const serverRes = await fetch(`${API_BACKEND}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    entrenadorId: usuario._id,
                    especie: pokeData.name,
                    mote: document.getElementById('cap-mote').value || pokeData.name,
                    nivel: parseInt(document.getElementById('cap-nivel').value),
                    imagen: imagenUrl,
                    tipos: pokeData.types.map(t => t.type.name)
                })
            });

            if (serverRes.ok) {
                newForm.reset();
                const modal = bootstrap.Modal.getInstance(document.getElementById('captureModal'));
                if(modal) modal.hide();
                await cargarGestorEquipo(); 
                alert("✅ Capturado!");
            } else {
                throw new Error("Error al guardar");
            }
        } catch (error) {
            alert("❌ " + error.message);
        } finally {
            btnSubmit.innerText = txtOriginal; btnSubmit.disabled = false;
        }
    });
}

window.evolucionarPokemon = async function(idPokemon, especieActual) {
    const nuevoNombreInput = prompt(`¿A qué evoluciona tu ${especieActual}?`, "");
    if (!nuevoNombreInput || !nuevoNombreInput.trim()) return;

    const nombreApi = normalizarNombrePokemon(nuevoNombreInput);
    document.body.style.cursor = 'wait';

    try {
        // 1. Obtener datos de la evolución
        const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${nombreApi}`);
        if (!pokeRes.ok) throw new Error(`No encuentro a "${nuevoNombreInput}".`);
        
        const pokeData = await pokeRes.json();
        const nuevaImagen = pokeData.sprites.versions['generation-viii'].icons.front_default || 
                            pokeData.sprites.versions['generation-vii'].icons.front_default || 
                            pokeData.sprites.front_default;

        const usuario = JSON.parse(localStorage.getItem('usuario_pokelocke'));

        const API_BACKEND = 'https://pokelocke-8kjm.onrender.com/api/juego/pokemon'; 
        // 2. Enviar actualización parcial (Solo especie, imagen y tipos)
        // El resto (mote, nivel, objeto) se mantiene en el servidor si la ruta es PUT parcial.
        const res = await fetch(`${API_BACKEND}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                entrenadorId: usuario._id,
                pokemonId: idPokemon,
                nuevosDatos: {
                    especie: pokeData.name,
                    imagen: nuevaImagen,
                    tipos: pokeData.types.map(t => t.type.name)
                }
            })
        });

        if (res.ok) {
            await cargarGestorEquipo();
            alert(`✨ ¡Evolucionado a ${pokeData.name}!`);
        } else {
            throw new Error("Error guardando la evolución.");
        }
    } catch (error) {
        alert("❌ Error: " + error.message);
    } finally {
        document.body.style.cursor = 'default';
    }
};

window.guardarEdicionInline = async function(event, id, especieOriginal) {
    event.preventDefault();
    const form = event.target;
    const btn = form.querySelector('button[type="submit"]');
    const txt = btn.innerText; btn.innerText = "Guardando..."; btn.disabled = true;
    const usuario = JSON.parse(localStorage.getItem('usuario_pokelocke'));

    const API_BACKEND = 'https://pokelocke-8kjm.onrender.com/api/juego/pokemon';

    try {
        const res = await fetch(`${API_BACKEND}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                entrenadorId: usuario._id,
                pokemonId: id,
                nuevosDatos: {
                    mote: form.mote.value, nivel: form.nivel.value, objeto: form.objeto.value,
                    naturaleza: form.naturaleza.value,
                    ataques: [form.atq0.value, form.atq1.value, form.atq2.value, form.atq3.value]
                }
            })
        });
        if(res.ok) cargarGestorEquipo();
        else alert("Error al guardar");
    } catch(e) { console.error(e); }
    finally { btn.innerText = txt; btn.disabled = false; }
};

window.moverPokemon = async function(pokeId, nuevoEstado) {
    const usuario = JSON.parse(localStorage.getItem('usuario_pokelocke'));

    const API_BACKEND = 'https://pokelocke-8kjm.onrender.com/api/juego/pokemon';
    try {
        const res = await fetch(`${API_BACKEND}/mover`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ entrenadorId: usuario._id, pokemonId: pokeId, nuevoEstado: nuevoEstado })
        });
        if (res.ok) cargarGestorEquipo();
        else { const d = await res.json(); alert("⚠️ " + d.mensaje); }
    } catch (e) { alert("Error de conexión."); }
};

/* ========================================================================== */
/* 6. COMBATES Y MODALES                                                     */
/* ========================================================================== */
function initFormularioCombate() {
    const formCombate = document.getElementById('form-combate');
    if (!formCombate) return;

    const newForm = formCombate.cloneNode(true);
    formCombate.parentNode.replaceChild(newForm, formCombate);

    newForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const p1 = document.getElementById('select-p1').value;
        const p2 = document.getElementById('select-p2').value;
        const ganador = document.getElementById('select-winner').value;
        if (p1 === p2) return alert("¡Un jugador no puede luchar contra sí mismo!");

        if (ganador !== p1 && ganador !== p2) {
            return alert(`⛔ Error Lógico: El ganador (${ganador}) no participa en este combate entre ${p1} y ${p2}.`);
        }
        // VALIDACIÓN 3: Ambos jugadores deben tener equipo configurado
        // Usamos la caché que cargamos al abrir el dashboard
        const jugadoresCache = window.CACHE_JUGADORES_SALA || [];
        
        const dataP1 = jugadoresCache.find(j => j.nombre === p1);
        const dataP2 = jugadoresCache.find(j => j.nombre === p2);

        // Contamos cuántos Pokémon tienen en estado "equipo"
        const equipoP1 = dataP1 ? dataP1.pokemons.filter(p => p.estado === 'equipo').length : 0;
        const equipoP2 = dataP2 ? dataP2.pokemons.filter(p => p.estado === 'equipo').length : 0;

        if (equipoP1 === 0) {
            return alert(`⛔ Acción denegada: El entrenador ${p1} no tiene ningún Pokémon en su equipo activo. Debe configurar su equipo en el PC primero.`);
        }
        
        if (equipoP2 === 0) {
            return alert(`⛔ Acción denegada: El entrenador ${p2} no tiene ningún Pokémon en su equipo activo. Debe configurar su equipo en el PC primero.`);
        }
        
        const btn = newForm.querySelector('button[type="submit"]');
        const txt = btn.innerText; btn.innerText = "Registrando..."; btn.disabled = true;
        const usuario = JSON.parse(localStorage.getItem('usuario_pokelocke'));

        try {
            const res = await fetch(`https://pokelocke-8kjm.onrender.com/api/juego/combate`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ 
                    sala: usuario.sala, entrenador1: p1, entrenador2: p2, 
                    ganador: document.getElementById('select-winner').value 
                })
            });
            if (res.ok) {
                bootstrap.Modal.getInstance(document.getElementById('combatModal')).hide();
                cargarDashboard();
                alert("✅ Registrado");
            } else { alert("Error registro"); }
        } catch(e) { alert("Error conexión"); }
        finally { btn.innerText = txt; btn.disabled = false; }
    });
}

/* ========================================================================== */
/* HISTORIAL DE COMBATES COMPLETO (Vista Simple)                              */
/* ========================================================================== */
async function cargarHistorialCompleto() {
    const container = document.getElementById('timeline-content');
    if (!container) return;
    
    const usuarioRaw = localStorage.getItem('usuario_pokelocke');
    if (!usuarioRaw) return window.location.href = 'join.html';
    
    const usuario = JSON.parse(usuarioRaw);

    try {
        // Solo pedimos la lista de combates
        const resCombates = await fetch(`https://pokelocke-8kjm.onrender.com/api/juego/combates/${usuario.sala}`);

        if (!resCombates.ok) throw new Error("Error de conexión al obtener combates");

        const combates = await resCombates.json();

        if (combates.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5 text-white-50">
                    <i class="bi bi-wind display-1 opacity-25"></i>
                    <p class="mt-3">Aún no se ha derramado sangre en la arena.</p>
                </div>`;
            return;
        }

        container.innerHTML = combates.map((c, i) => {
            const fechaObj = new Date(c.fecha);
            const fechaStr = fechaObj.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });
            const horaStr = fechaObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            const esGanador1 = c.ganador === c.entrenador1;
            const esGanador2 = c.ganador === c.entrenador2;

            const colorP1 = esGanador1 ? 'text-warning' : 'text-white';
            const colorP2 = esGanador2 ? 'text-warning' : 'text-white';

            return `
            <div class="glass-panel p-3 mb-2 d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 fade-in-up" 
                 style="animation-delay: ${i * 0.05}s; border: 1px solid rgba(255,255,255,0.05);">
                
                <!-- FECHA -->
                <div class="d-flex flex-row flex-md-column align-items-center justify-content-center text-white-50 pe-md-3 border-end-md border-white-10" style="min-width: 80px;">
                    <span class="small fw-bold me-2 me-md-0">${fechaStr}</span>
                    <span class="small" style="font-size: 0.7rem;">${horaStr}</span>
                </div>
                
                <!-- ENFRENTAMIENTO SIMPLE -->
                <div class="flex-grow-1 w-100 d-flex align-items-center justify-content-center px-2 px-md-4">
                    <div class="fw-bold fs-5 ${colorP1} text-end text-truncate" style="width: 40%;">
                        ${esGanador1 ? '<i class="bi bi-trophy-fill me-1" style="font-size: 0.8rem;"></i>' : ''} ${c.entrenador1}
                    </div>
                    
                    <span class="badge bg-white-10 text-muted mx-3">VS</span>
                    
                    <div class="fw-bold fs-5 ${colorP2} text-start text-truncate" style="width: 40%;">
                        ${c.entrenador2} ${esGanador2 ? '<i class="bi bi-trophy-fill ms-1" style="font-size: 0.8rem;"></i>' : ''}
                    </div>
                </div>

                <!-- GANADOR BADGE -->
                <div class="text-end px-3 d-none d-md-block" style="min-width: 140px;">
                    <span class="d-block small text-muted text-uppercase" style="font-size: 0.65rem; letter-spacing: 1px;">Ganador</span>
                    <span class="text-warning fw-bold">${c.ganador}</span>
                </div>

            </div>`;
        }).join('');

    } catch (e) { 
        container.innerHTML = '<p class="text-danger text-center py-4">Error cargando historial.</p>'; 
        console.error("Error al cargar combates:", e);
    }
}

async function cargarFeedCombates(salaNombre) {
    const container = document.getElementById('recent-battles-list');
    if (!container) return;

    try {
        const res = await fetch(`https://pokelocke-8kjm.onrender.com/api/juego/combates/${salaNombre}?limite=3`);
        const combates = await res.json();

        if (combates.length === 0) {
            container.innerHTML = '<small class="text-white-50 d-block text-center py-4 fst-italic">Sin actividad reciente</small>';
            return;
        }

        container.innerHTML = combates.map(c => {
            const esGanador1 = c.ganador === c.entrenador1;
            const esGanador2 = c.ganador === c.entrenador2;
            const equipo1 = c.equipo1Snapshot || [];
            const equipo2 = c.equipo2Snapshot || [];
            const hora = new Date(c.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

            const genIconos = (imgs) => (!imgs || imgs.length === 0) ? '<span class="text-white-50" style="font-size:0.6rem">-</span>' : imgs.slice(0,6).map(url => `<img src="${url}" style="width:18px;height:18px;object-fit:contain;" onerror="this.style.display='none'">`).join('');

            return `
            <div class="mb-3 pb-3 border-bottom border-white-10 fade-in-up">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="badge bg-white-10 text-white-50" style="font-size: 0.6rem;">${hora}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center bg-black bg-opacity-25 rounded p-2">
                    <div class="text-center" style="width: 45%;"><div class="small fw-bold text-truncate ${esGanador1 ? 'text-warning' : 'text-white-50'}">${c.entrenador1}</div><div class="d-flex justify-content-center mt-1">${genIconos(equipo1)}</div></div>
                    <div class="text-muted small fw-bold">VS</div>
                    <div class="text-center" style="width: 45%;"><div class="small fw-bold text-truncate ${esGanador2 ? 'text-warning' : 'text-white-50'}">${c.entrenador2}</div><div class="d-flex justify-content-center mt-1">${genIconos(equipo2)}</div></div>
                </div>
            </div>`;
        }).join('');
    } catch (e) { 
        console.error("Error cargando feed:", e);
        container.innerHTML = '<small class="text-danger">Error de conexión</small>';
    }
}

// Funcion no usada actualmente
window.verDetallesCombate = function(p1Name, p2Name) {
    // Leemos la caché de jugadores cargada previamente
    const listaJugadores = window.CACHE_JUGADORES_COMBAT || window.CACHE_JUGADORES_SALA || [];
    
    const p1 = listaJugadores.find(j => j.nombre === p1Name);
    const p2 = listaJugadores.find(j => j.nombre === p2Name);

    // FUNCIÓN INTERNA QUE CONSTRUYE EL HTML CON TUS CLASES CSS
    const generarHTMLEquipoVS = (jugador) => {
        if (!jugador) return '<div class="text-white-50 small py-4 col-12 text-center">Datos no disponibles</div>';
        
        const equipo = jugador.pokemons.filter(p => p.estado === 'equipo');
        let html = '';
        
        // El team-vs-grid es de 6 huecos (3x2). Los llenamos todos.
        for(let i=0; i<6; i++) {
            const poke = equipo[i];
            if(poke) {
                // Preparamos URL de respaldo por si falla la DB
                const urlBackup = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${normalizarNombrePokemon(poke.especie)}.png`;
                
                // APLICANDO TUS CLASES: poke-vs-card, poke-vs-sprite, poke-vs-name
                html += `
                <div class="poke-vs-card">
                    <img src="${poke.imagen}" 
                         class="poke-vs-sprite" 
                         onerror="this.onerror=null; this.src='${urlBackup}';"
                         alt="${poke.especie}">
                    <span class="poke-vs-name text-truncate" style="max-width: 100%;">${poke.mote || poke.especie}</span>
                </div>`;
            } else {
                // Hueco vacío estilizado
                html += `
                <div class="poke-vs-card opacity-25" style="border-style: dashed; border-color: rgba(255,255,255,0.2);">
                    <div style="width:30px; height:30px; border-radius:50%; background:rgba(255,255,255,0.1);"></div>
                </div>`;
            }
        }
        return html;
    };

    // INYECTAR EN EL DOM DEL MODAL
    const modalEl = document.getElementById('battleDetailsModal');
    if(modalEl) {
        document.getElementById('modal-p1-name').innerText = p1Name;
        // Inyectamos en el div que tiene la clase "team-vs-grid"
        document.getElementById('modal-p1-team').innerHTML = generarHTMLEquipoVS(p1); 
        
        document.getElementById('modal-p2-name').innerText = p2Name;
        document.getElementById('modal-p2-team').innerHTML = generarHTMLEquipoVS(p2);
        
        // Abrir el modal con Bootstrap
        const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modal.show();
    } else {
        console.error("Falta el código HTML del modal 'battleDetailsModal' en la página.");
    }
};

/* ========================================================================== */
/* 7. EXPORTAR Y CACHÉS                                                      */
/* ========================================================================== */
let DB_MOVIMIENTOS_CACHE = {};
async function inicializarDiccionarioMovimientos() {
    if(document.getElementById('datalist-moves')) return;

    const API_BASE = 'https://pokelocke-8kjm.onrender.com';

    try {
        const res = await fetch(`${API_BASE}/api/datos/movimientos`);
        if(!res.ok) throw new Error("Error fetching moves");
        const movs = await res.json();
        movs.forEach(m => DB_MOVIMIENTOS_CACHE[m.nombreEsp] = m.nombreIng);
        
        const dl = document.createElement('datalist'); dl.id = 'datalist-moves';
        Object.keys(DB_MOVIMIENTOS_CACHE).sort().forEach(m => {
            const op = document.createElement('option'); op.value = m; dl.appendChild(op);
        });
        document.body.appendChild(dl);
        console.log(`✅ Diccionario cargado: ${Object.keys(DB_MOVIMIENTOS_CACHE).length} movimientos.`);
    } catch(e) { console.error("Error cache movimientos", e); }
}

function inicializarDatalists() {
    if(document.getElementById('datalist-items')) return;
    const DB_OBJETOS = { "Restos": "Leftovers", "Vidasfera": "Life Orb", "Pañuelo Elección": "Choice Scarf", "Gafas Elección": "Choice Specs", "Cinta Elección": "Choice Band", "Chaleco Asalto": "Assault Vest", "Casco Dentado": "Rocky Helmet", "Baya Aranja": "Oran Berry", "Baya Zidra": "Sitrus Berry", "Baya Ziuela": "Lum Berry", "Hierba Mental": "Mental Herb", "Lodo Negro": "Black Sludge", "Mineral Evol": "Eviolite", "Banda Focus": "Focus Sash" };
    const dl = document.createElement('datalist'); dl.id = 'datalist-items';
    Object.keys(DB_OBJETOS).sort().forEach(o => {
        const op = document.createElement('option'); op.value = o; dl.appendChild(op);
    });
    document.body.appendChild(dl);
}

async function exportarShowdown() {
    const usuarioRaw = localStorage.getItem('usuario_pokelocke');
    if (!usuarioRaw) return;
    const usuario = JSON.parse(usuarioRaw);

    try {
        const res = await fetch(`https://pokelocke-8kjm.onrender.com/api/juego/sala/${usuario.sala}`);
        const data = await res.json();
        const miPerfil = data.jugadores.find(j => j._id === usuario._id);
        const equipo = miPerfil.pokemons.filter(p => p.estado === 'equipo');

        if (equipo.length === 0) return alert("Equipo vacío");
        const DB_OBJETOS = { "Restos": "Leftovers", "Vidasfera": "Life Orb", "Pañuelo Elección": "Choice Scarf", "Gafas Elección": "Choice Specs", "Cinta Elección": "Choice Band", "Chaleco Asalto": "Assault Vest", "Casco Dentado": "Rocky Helmet", "Baya Aranja": "Oran Berry", "Baya Zidra": "Sitrus Berry", "Baya Ziuela": "Lum Berry", "Hierba Mental": "Mental Herb", "Lodo Negro": "Black Sludge", "Mineral Evol": "Eviolite", "Banda Focus": "Focus Sash" };
        // Diccionario Naturalezas (Ya lo tenías)
        const natMap = { "Firme": "Adamant", "Alegre": "Jolly", "Modesta": "Modest", "Miedosa": "Timid", "Audaz": "Brave", "Placida": "Relaxed", "Serena": "Calm", "Grosera": "Sassy", "Cauta": "Careful", "Agitada": "Impish", "Rara": "Quirky", "Fuerte": "Hardy", "Docil": "Docile", "Timida": "Bashful", "Ingenua": "Naive", "Picara": "Naughty", "Floja": "Lax", "Osada": "Bold" };

        let txt = "";

        equipo.forEach(p => {
            // 1. TRADUCCIÓN DE OBJETO
            // Buscamos en DB_OBJETOS. Si no está, usamos el texto original.
            // .trim() quita espacios accidentales.
            const objEspanol = (p.objeto || "").trim();
            const objIngles = DB_OBJETOS[objEspanol] || objEspanol; 

            // Construir línea 1: Mote (Especie) @ Objeto
            let linea1 = "";
            if (p.mote && p.mote !== p.especie) {
                linea1 = `${p.mote} (${p.especie})`; // Showdown asume que la especie está en inglés por defecto si viene de API, si no, habría que traducir especie también, pero la API suele dar nombres universales o ingleses en 'species.name'.
            } else {
                linea1 = p.especie;
            }
            if (objIngles) linea1 += ` @ ${objIngles}`;
            
            txt += `${linea1}\n`;
            txt += `Level: ${p.nivel}\n`;
            
            if (p.naturaleza && natMap[p.naturaleza]) {
                txt += `${natMap[p.naturaleza]} Nature\n`;
            }

            // 2. TRADUCCIÓN DE ATAQUES
            if (p.ataques) {
                p.ataques.forEach(move => {
                    if (move && move.trim() !== "") {
                        const moveEsp = move.trim();
                        // Buscamos traducción, si no existe, dejamos el original
                        // Antes: const moveEng = DB_MOVIMIENTOS[moveEsp] || moveEsp;
                        // Ahora:
                        const moveEng = DB_MOVIMIENTOS_CACHE[moveEsp] || moveEsp;
                        txt += `- ${moveEng}\n`;
                    }
                });
            }
            txt += "\n";
        });

        await navigator.clipboard.writeText(txt);
        alert("✅ Copiado al portapapeles (Traducido al Inglés)");

    } catch (e) { 
        console.error(e);
        alert("Error exportando: " + e.message); 
    }
}

// Helpers para Typing
function initTypingEffect(el) {
    const msgs = ["Begin your Pokémon journey", "Group with friends", "Track your battles", "Analyze your stats", "Become a Pokémon Master!"];
    let msgIdx = 0, charIdx = 0;
    function type() {
        if (charIdx <= msgs[msgIdx].length) { el.textContent = msgs[msgIdx].substring(0, charIdx++); setTimeout(type, 80); } 
        else { setTimeout(erase, 1500); }
    }
    function erase() {
        if (charIdx >= 0) { el.textContent = msgs[msgIdx].substring(0, charIdx--); setTimeout(erase, 50); } 
        else { msgIdx = (msgIdx + 1) % msgs.length; setTimeout(type, 300); }
    }
    type();
}

async function cambiarMedallas(idJugador, accion) {
    try {
        // Bloqueo visual temporal (opcional)
        document.body.style.cursor = 'wait';

        const res = await fetch('https://pokelocke-8kjm.onrender.com/api/juego/medallas', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: idJugador, accion: accion })
        });

        if (res.ok) {
            // Si sale bien, recargamos el dashboard para ver el cambio
            await cargarDashboard();
        } else {
            console.error("Error al actualizar medallas");
        }
    } catch (e) {
        console.error(e);
    } finally {
        document.body.style.cursor = 'default';
    }
}
async function cambiarVidas(id, c) {
    try { 
        const res = await fetch('https://pokelocke-8kjm.onrender.com/api/juego/vidas', { 
            method: 'PUT', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ entrenadorId: id, cambio: c })
         }); 
         if (res.ok) cargarDashboard(); 
        } catch (e) { console.error(e); }
}
/* FUNCIÓN PARA CAMBIAR VICTORIAS (WINS) */
async function cambiarVictorias(idJugador, accion) {
    try {
        const res = await fetch('https://pokelocke-8kjm.onrender.com/api/juego/victoria', { // Ajusta a tu URL si estás en prod
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: idJugador, accion: accion })
        });

        if (res.ok) {
            await cargarDashboard(); // Recargamos para ver el cambio
        } else {
            console.error("Error al actualizar victorias");
        }
    } catch (e) {
        console.error(e);
    }
}

function toggleTeamView(id, btn) {
    const el = document.getElementById(`team-view-${id}`);
    if(el) {
        const hidden = el.style.display === 'none' || !el.style.display;
        el.style.display = hidden ? 'block' : 'none';
        hidden ? btn.classList.add('active') : btn.classList.remove('active');
    }
}

async function borrarSala() {
    const u = JSON.parse(localStorage.getItem('usuario_pokelocke'));
    const s = JSON.parse(localStorage.getItem('sala_info'));
    if(!confirm(`¿Borrar sala ${s.nombre}?`)) return;

    const API_BASE = 'https://pokelocke-8kjm.onrender.com';

    try {
        const res = await fetch(`${API_BASE}/api/juego/sala`, {
            method: 'DELETE', headers: {'Content-Type':'application/json'},
            body: JSON.stringify({nombreSala: s.nombre, hostNombre: u.nombre})
        });
        if(res.ok) {
            let h = JSON.parse(localStorage.getItem('pokelocke_history')||'[]');
            localStorage.setItem('pokelocke_history', JSON.stringify(h.filter(x=>x.sala!==s.nombre)));
            localStorage.removeItem('usuario_pokelocke');
            window.location.href = 'index.html';
        }
    } catch(e) { console.error(e); }
}

function cargarMisGrupos() {
    const grid = document.getElementById('groups-grid');
    if (!grid) return;
    
    const h = JSON.parse(localStorage.getItem('pokelocke_history') || '[]');
    
    if (h.length === 0) { 
        document.getElementById('empty-state').classList.remove('d-none'); 
        return; 
    }
    
    document.getElementById('empty-state').classList.add('d-none');
    
    grid.innerHTML = h.map((s, i) => {
        // Seleccionamos un color cíclico basado en la longitud del nombre
        const c = ['primary', 'success', 'danger', 'warning', 'info', 'indigo'][s.sala.length % 6];
        
        return `
        <div class="col-md-6 col-lg-4 fade-up" style="animation-delay: ${i * 0.1}s">
            <div class="card h-100 shadow-sm group-card border-0">
                <div class="card-body position-relative p-4">
                    
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div class="rounded-circle bg-${c} bg-gradient d-flex align-items-center justify-content-center shadow-sm" 
                             style="width: 50px; height: 50px; font-size: 1.5rem; font-weight: bold; color: white;">
                            ${s.sala.charAt(0).toUpperCase()}
                        </div>
                        <span class="badge bg-black text-white border">
                            <i class="bi bi-person-fill"></i> ${s.miNombre}
                        </span>
                    </div>
                    
                    <h4 class="card-title fw-bold text-white mb-1">${s.sala}</h4>
                    <p class="text-white-50 small mb-4">Host: <span class="text-info">${s.host}</span></p>
                    
                    <div class="d-grid">
                        <button onclick="reanudarPartida(${i})" class="btn btn-outline-${c} fw-bold stretched-link">
                            Entrar <i class="bi bi-box-arrow-in-right ms-2"></i>
                        </button>
                    </div>
                    
                </div>
                <div class="card-footer bg-transparent border-top border-white-10 text-white-50 text-end" style="font-size: 0.7rem;">
                    Acceso: ${new Date(s.fechaAcceso).toLocaleDateString()}
                </div>
            </div>
        </div>`;
    }).join('');
}

window.reanudarPartida = function(i) {
    const s = JSON.parse(localStorage.getItem('pokelocke_history'))[i];
    if(s) {
        localStorage.setItem('usuario_pokelocke', JSON.stringify({_id:s.miId, nombre:s.miNombre, sala:s.sala}));
        localStorage.setItem('sala_info', JSON.stringify({nombre:s.sala, host:s.host}));
        window.location.href = 'sala_grupo.html';
    }
}

function guardarPartidaEnHistorial(ent, sala) {
    let h = JSON.parse(localStorage.getItem('pokelocke_history')||'[]');
    const sesion = { sala: sala.nombre, host: sala.host, miNombre: ent.nombre, miId: ent._id, fechaAcceso: new Date() };
    h = h.filter(s => s.sala !== sala.nombre);
    h.unshift(sesion);
    localStorage.setItem('pokelocke_history', JSON.stringify(h));
}

/* ========================================================================== */
/* LÓGICA DE LA RULETA (LIMITADA AL 100%)                                     */
/* ========================================================================== */

// Valores por defecto que suman exactamente 100
let opcionesRuleta = [
    { nombre: "Poción", peso: 40 },
    { nombre: "Nada", peso: 50 },
    { nombre: "Fallo Crítico", peso: 10 }
];
let rotacionActual = 0;

window.abrirRuleta = function() {
    const usuario = JSON.parse(localStorage.getItem('usuario_pokelocke'));
    const salaInfo = JSON.parse(localStorage.getItem('sala_info'));
    
    const esHost = (usuario.nombre === salaInfo.host);
    const panelConfig = document.getElementById('roulette-config-panel');

    // 1. SISTEMA ANTI-ERRORES: Cargar y validar la configuración guardada
    const configGuardada = localStorage.getItem(`ruleta_${salaInfo.nombre}`);
    if (configGuardada) {
        try {
            let parsed = JSON.parse(configGuardada);
            // Si detectamos el formato antiguo (solo texto), lo ignoramos para no romper la ruleta
            if (parsed.length > 0 && typeof parsed[0] === 'string') {
                console.warn("Se detectó formato antiguo de ruleta. Usando valores por defecto.");
            } else {
                opcionesRuleta = parsed;
            }
        } catch (e) {
            console.error("Error leyendo configuración de la ruleta.");
        }
    }

    if (esHost) {
        panelConfig.classList.remove('d-none');
        document.getElementById('roulette-items-input').value = opcionesRuleta.map(o => `${o.nombre}: ${o.peso}`).join(', ');
    } else {
        panelConfig.classList.add('d-none');
    }

    dibujarRuleta();
    document.getElementById('roulette-result').innerHTML = "¿Qué depara el destino?";
    
    const modalEl = document.getElementById('rouletteModal');
    const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modal.show();
};

window.guardarConfigRuleta = function() {
    const inputVal = document.getElementById('roulette-items-input').value;
    if (!inputVal.trim()) return alert("No puedes dejar la ruleta vacía.");

    let sumaTotal = 0;
    
    // Parsear el texto ingresado
    let nuevasOpciones = inputVal.split(',').map(item => {
        let partes = item.split(':');
        let nombreObj = partes[0].trim();
        let pesoObj = partes.length > 1 ? parseFloat(partes[1].trim()) : 0; 
        
        if (isNaN(pesoObj) || pesoObj <= 0) pesoObj = 0;
        
        sumaTotal += pesoObj;
        
        return { nombre: nombreObj, peso: pesoObj };
    }).filter(item => item.nombre.length > 0);
    
    // 2. VALIDACIÓN ESTRICTA DEL 100%
    if (sumaTotal !== 100) {
        return alert(`⛔ Error: La suma de los porcentajes debe ser exactamente 100%. \n\nActualmente suma: ${sumaTotal}%. \nPor favor, ajusta los valores.`);
    }

    // Si todo es correcto, guardamos
    opcionesRuleta = nuevasOpciones;
    const salaInfo = JSON.parse(localStorage.getItem('sala_info'));
    localStorage.setItem(`ruleta_${salaInfo.nombre}`, JSON.stringify(opcionesRuleta));
    
    dibujarRuleta();
    alert("✅ Probabilidades actualizadas correctamente.");
};

function dibujarRuleta() {
    const wheel = document.getElementById('roulette-wheel');
    const legendContainer = document.getElementById('roulette-legend');
    
    let gradientStr = '';
    let legendHTML = '';
    let porcentajeAcumulado = 0;

    const colores = ['#ec4899', '#6366f1', '#ffcb05', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6'];

    for (let i = 0; i < opcionesRuleta.length; i++) {
        const item = opcionesRuleta[i];
        const color = colores[i % colores.length];
        
        const inicio = porcentajeAcumulado;
        const fin = inicio + item.peso;
        
        // Creamos el dibujo CSS usando porcentajes directos (0% a 40%, etc)
        gradientStr += `${color} ${inicio}% ${fin}%${i < opcionesRuleta.length - 1 ? ', ' : ''}`;
        porcentajeAcumulado = fin;

        legendHTML += `
        <div class="d-flex align-items-center gap-1 bg-black bg-opacity-25 px-2 py-1 rounded-pill border border-white-10">
            <span style="width: 10px; height: 10px; background-color: ${color}; border-radius: 50%; display: inline-block; box-shadow: 0 0 5px ${color};"></span>
            <span class="text-white-50 text-truncate" style="font-size: 0.7rem; max-width: 120px;" title="${item.nombre}">
                ${item.nombre} <b class="text-white">(${item.peso}%)</b>
            </span>
        </div>`;
    }

    wheel.style.background = `conic-gradient(${gradientStr})`;
    if (legendContainer) legendContainer.innerHTML = legendHTML;
}

window.girarRuleta = function() {
    const btn = document.getElementById('btn-spin-roulette');
    const resultText = document.getElementById('roulette-result');
    
    btn.disabled = true;
    resultText.innerText = "Girando...";

    const wheel = document.getElementById('roulette-wheel');

    // Selección aleatoria basada en un total exacto de 100
    const rand = Math.random() * 100;
    let acumulado = 0;
    let indiceGanador = 0;
    let porcentajeAcumuladoAntes = 0;

    for (let i = 0; i < opcionesRuleta.length; i++) {
        acumulado += opcionesRuleta[i].peso;
        if (rand <= acumulado) {
            indiceGanador = i;
            break;
        }
        porcentajeAcumuladoAntes += opcionesRuleta[i].peso;
    }

    const ganador = opcionesRuleta[indiceGanador];

    // Calculamos el ángulo en el que se debe detener
    const gradosGanador = (ganador.peso / 100) * 360;
    const offsetCentro = gradosGanador / 2;
    const gradosAntes = (porcentajeAcumuladoAntes / 100) * 360;
    
    const anguloCentroGanador = gradosAntes + offsetCentro;
    const vueltasExtra = Math.floor(Math.random() * 5) + 5;
    const rotacionFinal = 360 - anguloCentroGanador;

    rotacionActual = rotacionActual + (vueltasExtra * 360) + rotacionFinal - (rotacionActual % 360);
    wheel.style.transform = `rotate(${rotacionActual}deg)`;

    setTimeout(() => {
        resultText.innerHTML = `🎉 <span class="text-warning">${ganador.nombre}</span> 🎉`;
        btn.disabled = false;
    }, 4000);
};