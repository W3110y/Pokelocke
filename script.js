/* ========================================================================== */
/* 1. CONFIGURACIÓN Y UTILIDADES GLOBALES                                    */
/* ========================================================================== */

// DETECCIÓN AUTOMÁTICA DE ENTORNO (Local vs Producción)
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000' 
    : 'https://pokelocke-8kjm.onrender.com';

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
            const btn = createForm.querySelector('button[type="submit"]');
            
            const formData = {
                hostName: document.getElementById('host-name').value,
                partyName: document.getElementById('party-name').value,
                partySize: document.getElementById('party-size').value,
                rules: document.getElementById('party-rules').value,
                description: document.getElementById('party-description').value,
                vidas: document.getElementById('party-lives').value 
            };

            try {
                btn.disabled = true; btn.innerText = "Creando...";
                const response = await fetch(`${API_BASE}/api/juego/crear`, {
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
                    throw new Error(data.mensaje);
                }
            } catch (error) {
                alert("❌ Error: " + error.message);
                btn.disabled = false; btn.innerText = "Create Party";
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

            try {
                btn.disabled = true; btn.innerText = "Entrando...";
                const response = await fetch(`${API_BASE}/api/juego/unirse`, {
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
                    throw new Error(data.mensaje);
                }
            } catch (error) {
                alert("❌ Error: " + error.message);
                btn.disabled = false; btn.innerText = "Join Party";
            }
        });
    }
}

/* ========================================================================== */
/* 4. DASHBOARD (SALA.HTML)                                                  */
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

    try {
        const response = await fetch(`${API_BASE}/api/juego/sala/${salaNombre}`);
        if (!response.ok) throw new Error("Error al obtener datos de la sala");

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
                        miniSlots += `<div class="mini-slot" title="${p.mote} (${p.especie})"><img src="${p.imagen}" class="mini-poke-icon"></div>`;
                    } else {
                        miniSlots += `<div class="mini-slot opacity-25"></div>`;
                    }
                }

                return `
                <div class="mb-2">
                    <div class="d-flex align-items-center gap-2 p-2 rounded position-relative" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.05); z-index: 2;">
                        <div class="rounded-circle bg-gradient bg-primary d-flex align-items-center justify-content-center text-white fw-bold shadow-sm flex-shrink-0" style="width:32px; height:32px; font-size: 0.8rem; filter: ${esMuerto ? 'grayscale(1)' : 'none'}">${jugador.nombre.charAt(0).toUpperCase()}</div>
                        <div class="flex-grow-1 text-truncate">
                            <span class="d-block lh-1 small fw-bold text-white ${isMe ? 'text-warning' : ''} ${esMuerto ? 'text-decoration-line-through text-muted' : ''}">${jugador.nombre} ${isMe ? '(Tú)' : ''}</span>
                            <div class="mt-1 d-flex align-items-center gap-2">
                                ${isHost ? '<span class="badge bg-warning text-dark border border-warning" style="font-size:0.6em; padding: 2px 6px;">HOST</span>' : ''}
                                ${esMuerto ? '<span class="badge bg-danger" style="font-size:0.6em;">ELIMINADO</span>' : ''}
                            </div>
                        </div>
                        <button class="btn-toggle-team" onclick="toggleTeamView('${jugador._id}', this)" title="Ver equipo"><i class="bi bi-chevron-down"></i></button>
                    </div>
                    <div id="team-view-${jugador._id}" class="mini-team-container">
                        <div class="mini-team-grid">${miniSlots}</div>
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
                <thead><tr class="text-white-50 small border-bottom border-white-10 text-uppercase" style="font-size: 0.7rem;"><th class="ps-3">#</th><th>Entrenador</th><th class="text-center">Medallas</th><th class="text-center">Vidas</th><th class="text-center">Wins</th></tr></thead>
                <tbody>
                    ${ranking.map((j, i) => {
                        let lifeColor = j.vidas <= 1 ? 'text-danger' : 'text-success';
                        if(j.vidas === 0) lifeColor = 'text-muted text-decoration-line-through';
                        const soyYo = j.nombre === usuario.nombre;

                        // Botones Medallas (Solo para mí)
                        let colMedallas = soyYo ? 
                            `<div class="d-flex justify-content-center gap-2"><button class="btn btn-sm btn-link text-white-50 p-0" onclick="cambiarMedallas('${j._id}', -1)"><i class="bi bi-dash-circle"></i></button><span class="text-warning fw-bold fs-6">${j.medallas || 0}</span><button class="btn btn-sm btn-link text-warning p-0" onclick="cambiarMedallas('${j._id}', 1)"><i class="bi bi-plus-circle-fill"></i></button></div>` 
                            : `<span class="text-warning fw-bold opacity-75">${j.medallas || 0}</span>`;

                        // Botones Wins (Solo Host)
                        const controlesWins = soyHost ? `<div class="d-inline-flex ms-1 align-items-center bg-dark rounded border border-secondary" style="transform: scale(0.85);"><button class="btn btn-sm btn-link text-white-50 p-0 px-2" onclick="cambiarVictorias('${j._id}', -1)">-</button><span class="text-white border-start border-end border-secondary px-2" style="font-size: 0.9em;">W</span><button class="btn btn-sm btn-link text-warning p-0 px-2" onclick="cambiarVictorias('${j._id}', 1)">+</button></div>` : '';

                        return `<tr class="${j.vidas === 0 ? 'opacity-50' : ''} border-bottom border-white-10" style="background: transparent;"><td class="fw-bold text-white-50 small ps-3">${i + 1}</td><td><div class="d-flex align-items-center gap-2"><div class="rounded-circle bg-white-10 d-flex justify-content-center align-items-center text-white fw-bold small" style="width:24px;height:24px;">${j.nombre.charAt(0).toUpperCase()}</div><span class="small fw-bold ${j.vidas === 0 ? 'text-decoration-line-through' : 'text-white'}">${j.nombre} ${soyYo ? '(Tú)' : ''}</span></div></td><td class="text-center">${colMedallas}</td><td class="text-center small"><span class="${lifeColor} fw-bold">${j.vidas}</span></td><td class="text-center text-info small">${j.victorias || 0}${controlesWins}</td></tr>`;
                    }).join('')}
                </tbody>
            </table>`;
        }

        // E. Feed y Formulario
        cargarFeedCombates(salaNombre);
        initFormularioCombate(); // Inicializa el listener del modal de registro

        // F. Botón Borrar (Host)
        const contAcciones = document.getElementById('host-actions-container');
        if (contAcciones && infoSala.host === usuario.nombre) {
            contAcciones.innerHTML = `<button class="btn btn-outline-danger btn-sm w-100 mt-2" onclick="borrarSala()"><i class="bi bi-trash-fill me-2"></i> Eliminar Sala</button>`;
        }

    } catch (error) { 
        console.error("Error dashboard:", error); 
        const panel = document.getElementById('my-dashboard-panel');
        if(panel) panel.innerHTML = `<div class="text-center text-danger p-4">Error de conexión con la sala.</div>`;
    }
}

function renderizarInfoSala(sala) {
    const t = document.getElementById('view-party-name'); if(t) t.innerText = sala.nombre;
    const h = document.getElementById('view-host-name'); if(h) h.innerText = sala.host;
}

/* ========================================================================== */
/* 5. GESTIÓN DE EQUIPO (PC / CAPTURA / EVOLUCIÓN)                           */
/* ========================================================================== */
async function cargarGestorEquipo() {
    const activeGrid = document.getElementById('active-team-grid');
    if (!activeGrid) return; 

    const usuario = JSON.parse(localStorage.getItem('usuario_pokelocke'));
    
    // Estados de Carga
    activeGrid.innerHTML = '<div class="col-12"><div class="loading-state"><div class="spinner-border text-warning"></div><p>Cargando...</p></div></div>';
    
    try {
        const res = await fetch(`${API_BASE}/api/juego/sala/${usuario.sala}`);
        if (!res.ok) throw new Error("Error fetching data");
        const data = await res.json();
        
        const miPerfil = data.jugadores.find(j => j._id === usuario._id);
        if (!miPerfil) return;
        
        const equipo = miPerfil.pokemons.filter(p => p.estado === 'equipo');
        const caja = miPerfil.pokemons.filter(p => p.estado === 'caja');
        const cementerio = miPerfil.pokemons.filter(p => p.estado === 'cementerio');

        document.getElementById('team-counter').innerText = `${equipo.length}/6`;

        // --- EQUIPO ACTIVO ---
        let htmlEquipo = '';
        const naturalezas = ["Firme", "Alegre", "Modesta", "Miedosa", "Audaz", "Placida", "Serena", "Grosera", "Cauta", "Agitada", "Rara", "Fuerte", "Docil"];

        equipo.forEach((p) => {
            const atq = p.ataques && p.ataques.length === 4 ? p.ataques : ["", "", "", ""];
            const optNat = naturalezas.map(n => `<option value="${n}" ${p.naturaleza === n ? 'selected' : ''}>${n}</option>`).join('');
            const collapseId = `collapseEdit-${p._id}`;

            htmlEquipo += `
            <div class="col-12 col-md-6 col-lg-4 fade-in">
                <div class="manage-card border-warning p-0 overflow-hidden">
                    <div class="p-3 text-center position-relative">
                        <img src="${p.imagen}" style="width:70px; height:70px; object-fit:contain;" class="mb-2">
                        <h6 class="fw-bold text-white mb-0">${p.mote}</h6>
                        <small class="text-muted">${p.especie} - Lvl.${p.nivel}</small>
                        <div class="mt-2 d-flex gap-2 justify-content-center">
                            <span class="badge bg-dark border border-secondary text-secondary">${p.naturaleza || 'Neutro'}</span>
                            ${p.objeto ? `<span class="badge bg-dark border border-secondary text-info">📦 ${p.objeto}</span>` : ''}
                        </div>
                    </div>
                    <button class="btn-toggle-edit" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}"><i class="bi bi-chevron-down"></i> Editar</button>
                    <div class="collapse" id="${collapseId}">
                        <div class="edit-collapse-panel text-start">
                            <form onsubmit="guardarEdicionInline(event, '${p._id}', '${p.especie}')">
                                <div class="row g-1 mb-2">
                                    <div class="col-8"><label class="mini-form-label">Mote</label><input type="text" name="mote" class="mini-input" value="${p.mote}"></div>
                                    <div class="col-4"><label class="mini-form-label">Nivel</label><input type="number" name="nivel" class="mini-input" value="${p.nivel}" min="1" max="100"></div>
                                </div>
                                <div class="row g-1 mb-2">
                                    <div class="col-6"><label class="mini-form-label">Objeto</label><input type="text" name="objeto" class="mini-input" value="${p.objeto || ''}" list="datalist-items" autocomplete="off"></div>
                                    <div class="col-6"><label class="mini-form-label">Naturaleza</label><select name="naturaleza" class="mini-input bg-dark">${optNat}</select></div>
                                </div>
                                <label class="mini-form-label text-warning">Movimientos</label>
                                <div class="d-grid gap-1 mb-3">
                                    <input type="text" name="atq0" class="mini-input" value="${atq[0]}" placeholder="-" list="datalist-moves">
                                    <input type="text" name="atq1" class="mini-input" value="${atq[1]}" placeholder="-" list="datalist-moves">
                                    <input type="text" name="atq2" class="mini-input" value="${atq[2]}" placeholder="-" list="datalist-moves">
                                    <input type="text" name="atq3" class="mini-input" value="${atq[3]}" placeholder="-" list="datalist-moves">
                                </div>
                                <div class="d-grid gap-2">
                                    <button type="submit" class="btn btn-sm btn-success py-1">💾 Guardar</button>
                                    <div class="d-flex gap-1 mt-2 pt-2 border-top border-white-10">
                                        <button type="button" onclick="evolucionarPokemon('${p._id}', '${p.especie}')" class="btn btn-sm btn-outline-warning flex-fill py-0" title="Evolucionar"><i class="bi bi-stars"></i> Evo</button>
                                        <button type="button" onclick="moverPokemon('${p._id}', 'caja')" class="btn btn-sm btn-outline-primary flex-fill py-0">Al PC</button>
                                        <button type="button" onclick="moverPokemon('${p._id}', 'cementerio')" class="btn btn-sm btn-outline-danger flex-fill py-0">Falleció</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>`;
        });
        
        // Rellenar huecos vacíos
        for(let i = equipo.length; i < 6; i++) {
            htmlEquipo += `<div class="col-12 col-md-6 col-lg-4"><div class="slot-empty"><div class="text-center opacity-50"><i class="bi bi-plus-circle display-6"></i><div class="mt-2 small">Vacío</div></div></div></div>`;
        }
        activeGrid.innerHTML = htmlEquipo;

        // --- CAJA PC ---
        const pcGrid = document.getElementById('pc-box-grid');
        pcGrid.innerHTML = caja.length === 0 ? '<div class="col-12 text-center text-muted py-4 small">La caja está vacía</div>' : caja.map(p => `
            <div class="col-6 col-md-3 col-lg-2 fade-in">
                <div class="manage-card">
                    <div class="text-center mb-2">
                        <img src="${p.imagen}" style="width:50px; height:50px; object-fit:contain; opacity:0.8;">
                        <div class="fw-bold small mt-1 text-truncate text-muted">${p.mote}</div>
                        <small class="d-block text-secondary" style="font-size:0.6rem">Lvl. ${p.nivel}</small>
                    </div>
                    <div class="w-100 d-grid gap-1">
                        <button onclick="moverPokemon('${p._id}', 'equipo')" class="btn btn-sm btn-success py-0" style="font-size:0.75rem"><i class="bi bi-arrow-up-circle"></i> Equipo</button>
                        <button onclick="moverPokemon('${p._id}', 'cementerio')" class="btn btn-sm btn-outline-secondary py-0 border-0" style="font-size:0.75rem"><i class="bi bi-trash"></i></button>
                    </div>
                </div>
            </div>`).join('');

        // --- CEMENTERIO ---
        const graveGrid = document.getElementById('graveyard-grid');
        graveGrid.innerHTML = cementerio.length === 0 ? '<div class="col-12 text-center text-muted py-2 small opacity-50">Nadie ha muerto... aún.</div>' : cementerio.map(p => `
            <div class="col-4 col-md-3 col-lg-2">
                <div class="manage-card bg-danger bg-opacity-10 border-danger">
                    <div class="text-center mb-1" style="filter: grayscale(100%);">
                        <img src="${p.imagen}" style="width:40px; height:40px; object-fit:contain;">
                        <div class="small mt-1 text-truncate text-danger text-decoration-line-through">${p.mote}</div>
                    </div>
                    <button onclick="moverPokemon('${p._id}', 'caja')" class="btn btn-sm btn-link text-muted py-0 w-100" style="font-size:0.6rem; text-decoration:none;">Revivir</button>
                </div>
            </div>`).join('');

    } catch(e) { 
        console.error(e); 
        activeGrid.innerHTML = `<div class="col-12 text-center text-danger">Error de conexión</div>`;
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

            btnSubmit.innerText = "💾 Guardando...";
            const serverRes = await fetch(`${API_BASE}/api/juego/pokemon`, {
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

        // 2. Enviar actualización parcial (Solo especie, imagen y tipos)
        // El resto (mote, nivel, objeto) se mantiene en el servidor si la ruta es PUT parcial.
        const res = await fetch(`${API_BASE}/api/juego/pokemon`, {
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

    try {
        const res = await fetch(`${API_BASE}/api/juego/pokemon`, {
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
    try {
        const res = await fetch(`${API_BASE}/api/juego/pokemon/mover`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ entrenadorId: usuario._id, pokemonId: pokeId, nuevoEstado: nuevoEstado })
        });
        if (res.ok) cargarGestorEquipo();
        else alert("Error movimiento");
    } catch (e) { alert("Error de conexión"); }
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
        if (p1 === p2) return alert("¡Un jugador no puede luchar contra sí mismo!");

        const btn = newForm.querySelector('button[type="submit"]');
        const txt = btn.innerText; btn.innerText = "Registrando..."; btn.disabled = true;
        const usuario = JSON.parse(localStorage.getItem('usuario_pokelocke'));

        try {
            const res = await fetch(`${API_BASE}/api/juego/combate`, {
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

async function cargarFeedCombates(salaNombre) {
    const container = document.getElementById('recent-battles-list');
    if (!container) return;

    try {
        const res = await fetch(`${API_BASE}/api/juego/combates/${salaNombre}?limite=3`);
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

            const genIconos = (imgs) => (!imgs || imgs.length === 0) ? '<span class="text-white-50" style="font-size:0.6rem">-</span>' : imgs.slice(0,3).map(url => `<img src="${url}" style="width:18px;height:18px;object-fit:contain;" onerror="this.style.display='none'">`).join('');

            return `
            <div class="mb-3 pb-3 border-bottom border-white-10 fade-in-up">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="badge bg-white-10 text-white-50" style="font-size: 0.6rem;">${hora}</span>
                    <button class="btn btn-link p-0 text-info" style="font-size: 0.8rem;" onclick="window.verDetallesCombate('${c.entrenador1}', '${c.entrenador2}')"><i class="bi bi-eye-fill"></i></button>
                </div>
                <div class="d-flex justify-content-between align-items-center bg-black bg-opacity-25 rounded p-2">
                    <div class="text-center" style="width: 45%;"><div class="small fw-bold text-truncate ${esGanador1 ? 'text-warning' : 'text-white-50'}">${c.entrenador1}</div><div class="d-flex justify-content-center mt-1">${genIconos(equipo1)}</div></div>
                    <div class="text-muted small fw-bold">VS</div>
                    <div class="text-center" style="width: 45%;"><div class="small fw-bold text-truncate ${esGanador2 ? 'text-warning' : 'text-white-50'}">${c.entrenador2}</div><div class="d-flex justify-content-center mt-1">${genIconos(equipo2)}</div></div>
                </div>
            </div>`;
        }).join('');
    } catch(e) { console.error(e); }
}

window.verDetallesCombate = function(p1Name, p2Name) {
    // Usamos caché de jugadores (o la de sala si venimos del dashboard)
    const lista = window.CACHE_JUGADORES_COMBAT || window.CACHE_JUGADORES_SALA || [];
    const p1 = lista.find(j => j.nombre === p1Name);
    const p2 = lista.find(j => j.nombre === p2Name);

    const genHTML = (jugador) => {
        if (!jugador) return '<div class="text-white-50 small py-4">Datos no disponibles</div>';
        const eq = jugador.pokemons.filter(p => p.estado === 'equipo');
        let html = '';
        for(let i=0; i<6; i++) {
            const p = eq[i];
            if(p) {
                const urlBackup = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${normalizarNombrePokemon(p.especie)}.png`;
                html += `<div class="poke-vs-card"><img src="${p.imagen}" class="poke-vs-sprite" onerror="this.onerror=null; this.src='${urlBackup}';"><span class="poke-vs-name text-truncate" style="max-width:100%">${p.mote || p.especie}</span></div>`;
            } else {
                html += `<div class="poke-vs-card opacity-25" style="border-style: dashed; border-color: rgba(255,255,255,0.2);"><div style="width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,0.1);"></div></div>`;
            }
        }
        return html;
    };

    const modalEl = document.getElementById('battleDetailsModal');
    if(modalEl) {
        document.getElementById('modal-p1-name').innerText = p1Name;
        document.getElementById('modal-p1-team').innerHTML = genHTML(p1);
        document.getElementById('modal-p2-name').innerText = p2Name;
        document.getElementById('modal-p2-team').innerHTML = genHTML(p2);
        (bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl)).show();
    }
};

/* ========================================================================== */
/* 7. EXPORTAR Y CACHÉS                                                      */
/* ========================================================================== */
let DB_MOVIMIENTOS_CACHE = {};
async function inicializarDiccionarioMovimientos() {
    if(document.getElementById('datalist-moves')) return;
    try {
        const res = await fetch(`${API_BASE}/api/datos/movimientos`);
        if(!res.ok) return;
        const movs = await res.json();
        movs.forEach(m => DB_MOVIMIENTOS_CACHE[m.nombreEsp] = m.nombreIng);
        
        const dl = document.createElement('datalist'); dl.id = 'datalist-moves';
        Object.keys(DB_MOVIMIENTOS_CACHE).sort().forEach(m => {
            const op = document.createElement('option'); op.value = m; dl.appendChild(op);
        });
        document.body.appendChild(dl);
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

// Helpers Vidas/Medallas/Wins
async function cambiarMedallas(id, c) { callUpdate(id, c, 'medallas'); }
async function cambiarVictorias(id, c) { callUpdate(id, c, 'victorias'); } // Nota: La ruta en backend debe ser /jugador/victorias
async function cambiarVidas(id, c) { callUpdate(id, c, 'vidas'); } // Esta es calculada auto, pero por si acaso

async function callUpdate(id, accion, tipo) {
    try {
        const ruta = tipo === 'medallas' ? 'medallas' : (tipo === 'victorias' ? 'victorias' : 'vidas'); // Ajustar según rutas backend
        // Como estandarizamos a /api/juego/jugador/medallas o /jugador/victorias
        const res = await fetch(`${API_BASE}/api/juego/jugador/${ruta}`, {
            method: 'PUT', headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ id, accion })
        });
        if(res.ok) cargarDashboard();
    } catch(e) { console.error(e); }
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
    if(!grid) return;
    const h = JSON.parse(localStorage.getItem('pokelocke_history')||'[]');
    if(h.length===0) { document.getElementById('empty-state').classList.remove('d-none'); return; }
    document.getElementById('empty-state').classList.add('d-none');
    grid.innerHTML = h.map((s,i) => {
        const c = ['primary','success','danger','warning','info','indigo'][s.sala.length%6];
        return `<div class="col-md-6 col-lg-4 fade-up"><div class="card h-100 shadow-sm group-card border-0"><div class="card-body position-relative"><div class="d-flex justify-content-between align-items-center mb-3"><div class="rounded-circle bg-${c} bg-gradient d-flex align-items-center justify-content-center shadow-sm" style="width:50px;height:50px;font-size:1.5rem;font-weight:bold;">${s.sala.charAt(0).toUpperCase()}</div><span class="badge text-dark border"><i class="bi bi-person"></i> ${s.miNombre}</span></div><h4 class="card-title fw-bold text-dark mb-1">${s.sala}</h4><p class="text-muted small mb-4">Host: ${s.host}</p><div class="d-grid"><button onclick="reanudarPartida(${i})" class="btn btn-outline-${c} fw-bold stretched-link">Entrar <i class="bi bi-box-arrow-in-right ms-2"></i></button></div></div></div></div>`;
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