

/* ========================================================= */
/* 2. EFECTOS VISUALES (Typing Animation)                    */
/* ========================================================= */
const typingElement = document.getElementById("typing");
if (typingElement) {
    const messages = [
        "Begin your Pokémon journey",
        "Group with friends",
        "Track your battles",
        "Analyze your stats",
        "Become a Pokémon Master!"
    ];
    let msgIdx = 0, charIdx = 0;

    function type() {
        if (charIdx <= messages[msgIdx].length) {
            typingElement.textContent = messages[msgIdx].substring(0, charIdx++);
            setTimeout(type, 80);
        } else {
            setTimeout(erase, 1500);
        }
    }

    function erase() {
        if (charIdx >= 0) {
            typingElement.textContent = messages[msgIdx].substring(0, charIdx--);
            setTimeout(erase, 50);
        } else {
            msgIdx = (msgIdx + 1) % messages.length;
            setTimeout(type, 300);
        }
    }
    type();
}

/* ========================================================= */
/* 3. GESTIÓN DE SALAS (Crear y Unirse)                      */
/* ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
    
    // --- CREAR SALA ---
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
                // Capturar las vidas del nuevo input
                vidas: document.getElementById('party-lives').value 
            };

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
                    localStorage.setItem('usuario_pokelocke', JSON.stringify(data.entrenador));
                    localStorage.setItem('sala_info', JSON.stringify(data.sala)); 
                    guardarPartidaEnHistorial(data.entrenador, data.sala);
                    window.location.href = 'sala_grupo.html';
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

    // --- UNIRSE A SALA ---
    const joinForm = document.getElementById('form-join-party');
    if (joinForm) {
        joinForm.addEventListener('submit', async (e) => {
            e.preventDefault();
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
});

/* ========================================================= */
/* 4. DASHBOARD PRINCIPAL (sala_grupo.html)                       */
/* ========================================================= */
async function cargarDashboard() {
    const usuarioRaw = localStorage.getItem('usuario_pokelocke');
    if (!usuarioRaw) { window.location.href = 'join.html'; return; }
    
    const usuario = JSON.parse(usuarioRaw);
    const salaNombre = usuario.sala; 

    // Info estática rápida
    const salaInfoRaw = localStorage.getItem('sala_info');
    if (salaInfoRaw) renderizarInfoSala(JSON.parse(salaInfoRaw));

    // Feedback de carga
    ponerCargador('members-list', 'Buscando entrenadores...');
    ponerCargador('my-dashboard-panel', 'Abriendo Pokéball...');
    ponerCargador('leaderboard-container', 'Calculando ranking...');
    ponerCargador('recent-battles-list', 'Sincronizando arena...');

    const API_URL = `https://pokelocke-8kjm.onrender.com/api/juego/sala/${salaNombre}`;

    try {
        const response = await fetch(API_URL);
        
        if (response.ok) {
            const data = await response.json(); 
            const infoSala = data.sala;
            const listaJugadores = data.jugadores;
            
            // Actualizar cabecera principal
            renderizarInfoSala(infoSala);

            // A. Modales Info y Reglas
            const rulesContent = document.getElementById('modal-rules-content');
            if (rulesContent) rulesContent.innerHTML = `<p class="lh-lg">${infoSala.reglas || "No hay reglas definidas para esta sala."}</p>`;
            
            const descContent = document.getElementById('modal-desc-content');
            if (descContent) descContent.innerHTML = `<p class="lh-lg">${infoSala.descripcion || "Sin descripción."}</p>`;

            // B. Lista Miembros (Sidebar Izquierdo)
            const membersList = document.getElementById('members-list');
            if (membersList) {
                membersList.innerHTML = listaJugadores.map(jugador => {
                    const isHost = jugador.nombre === infoSala.host;
                    const isMe = jugador.nombre === usuario.nombre;
                    // Estilo: Usamos un fondo muy sutil en lugar de glass completo para no saturar
                    return `
                    <div class="d-flex align-items-center gap-2 p-2 mb-2 rounded" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.05);">
                        <div class="rounded-circle bg-gradient bg-primary d-flex align-items-center justify-content-center text-white fw-bold shadow-sm" style="width:32px; height:32px; font-size: 0.8rem;">
                            ${jugador.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div class="flex-grow-1 text-truncate">
                            <span class="d-block lh-1 small fw-bold text-white ${isMe ? 'text-warning' : ''}">${jugador.nombre} ${isMe ? '(Tú)' : ''}</span>
                            <div class="mt-1">
                                ${isHost ? '<span class="badge bg-warning text-dark border border-warning" style="font-size:0.6em; padding: 2px 6px;">HOST</span>' : '<span class="badge bg-secondary opacity-50" style="font-size:0.6em; padding: 2px 6px;">ENTRENADOR</span>'}
                            </div>
                        </div>
                    </div>`;
                }).join('');
            }

            // C. Panel Central (Barra Pixel Art - ESTO ES EL BOTÓN)
            const miUsuario = listaJugadores.find(u => u._id === usuario._id);
            const dashboardPanel = document.getElementById('my-dashboard-panel');

            if (miUsuario && dashboardPanel) {
                const equipo = miUsuario.pokemons.filter(p => p.estado === 'equipo');
                let slotsHTML = '';
                
                // Generar los 6 slots
                for (let i = 0; i < 6; i++) {
                    const poke = equipo[i];
                    if (poke) {
                        slotsHTML += `
                        <div class="party-slot" title="${poke.mote} (${poke.especie})">
                            <img src="${poke.imagen}" class="party-icon" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'">
                        </div>`;
                    } else {
                        slotsHTML += `<div class="party-slot"><div class="empty-shadow"></div></div>`;
                    }
                }

                // Inyectamos el HTML. Nota que usamos la clase 'party-bar-btn' en el <a>
                dashboardPanel.innerHTML = `
                    <div class="d-flex justify-content-between align-items-end mb-2 px-1">
                        <h5 class="section-title m-0 text-white">Mi Equipo Activo</h5>
                    </div>
                    
                    <a href="equipo.html" class="party-bar-btn" title="Click para gestionar equipo">
                        ${slotsHTML}
                    </a>
                    
                    <div class="text-center mt-2">
                        <span class="manage-hint text-white-50" style="font-size: 0.7rem;">Haz clic en la barra para abrir el PC</span>
                    </div>
                `;
            }

            // D. Leaderboard (Tabla de Clasificación)
            const leaderboardContainer = document.getElementById('leaderboard-container');
            if (leaderboardContainer) {
                const ranking = [...listaJugadores].sort((a, b) => {
                    // Orden: Quien tenga más medallas va primero. Si empate, quien tenga más vidas.
                    if ((b.medallas || 0) !== (a.medallas || 0)) return (b.medallas || 0) - (a.medallas || 0);
                    return b.vidas - a.vidas;
                });
                
                const soyHost = infoSala.host === usuario.nombre;

                // Llenar selects del modal de combate
                const selects = ['select-p1', 'select-p2', 'select-winner'];
                selects.forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.innerHTML = listaJugadores.map(p => `<option value="${p.nombre}">${p.nombre}</option>`).join('');
                });
                
                // Pre-seleccionar mi nombre en Jugador 1
                const selectP1 = document.getElementById('select-p1');
                if (selectP1) selectP1.value = usuario.nombre;
                
                // Cargar Feed (Asumimos que esta función existe o la implementamos luego)
                if(typeof cargarFeedCombates === 'function') {
                    cargarFeedCombates(salaNombre); 
                } else {
                    document.getElementById('recent-battles-list').innerHTML = '<small class="text-muted">Feed no disponible</small>';
                }

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
                            
                            // IDENTIFICACIÓN: ¿Soy yo?
                            const soyYo = j.nombre === usuario.nombre;

                            // LÓGICA VISUAL DE MEDALLAS
                            // Si soy yo, muestro botones. Si no, solo el número.
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

                            // Botones de Host (Solo visibles si eres Host)
                            const controlesWins = soyHost ? `
                                <button class="btn btn-outline-warning btn-sm p-0 px-1 ms-1 border-0" onclick="sumarVictoria('${j._id}')">
                                    <i class="bi bi-caret-up-fill"></i>
                                </button>` : '';

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

            // E. Acciones Host (Botón Borrar)
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

        } else if (response.status === 404) {
            alert("⛔ LA SALA YA NO EXISTE");
            window.location.href = 'groups.html';
        }
    } catch (error) { 
        console.error("Error dashboard:", error); 
    }
}

// Función auxiliar para actualizar solo textos estáticos
function renderizarInfoSala(sala) {
    const titleEl = document.getElementById('view-party-name');
    if(titleEl) titleEl.innerText = sala.nombre;
    
    const hostEl = document.getElementById('view-host-name');
    if(hostEl) hostEl.innerText = sala.host;
}

// DETECTOR DE PÁGINA: Ejecutar solo si estamos en sala.html
if (window.location.pathname.includes('sala.html')) {
    document.addEventListener('DOMContentLoaded', cargarDashboard);
}

/* ========================================================= */
/* 5. GESTOR DE EQUIPO (equipo.html)                         */
/* ========================================================= */
async function cargarGestorEquipo() {
    const activeGrid = document.getElementById('active-team-grid');
    if (!activeGrid) return; 

    const usuarioRaw = localStorage.getItem('usuario_pokelocke');
    if (!usuarioRaw) return;
    const usuario = JSON.parse(usuarioRaw);

    // Carga Visual
    document.getElementById('active-team-grid').innerHTML = '<div class="col-12"><div class="loading-state"><div class="spinner-border text-warning"></div><p>Cargando Equipo...</p></div></div>';
    document.getElementById('pc-box-grid').innerHTML = '<div class="col-12"><div class="loading-state"><div class="spinner-border text-primary"></div><p>Accediendo al PC...</p></div></div>';
    document.getElementById('graveyard-grid').innerHTML = '<div class="col-12"><div class="loading-state"><div class="spinner-border text-secondary"></div><p>Visitando cementerio...</p></div></div>';
    
    try {
        const res = await fetch(`https://pokelocke-8kjm.onrender.com/api/juego/sala/${usuario.sala}`);
        if (!res.ok) throw new Error("Error servidor");
        const data = await res.json();
        
        const miPerfil = data.jugadores.find(j => j._id === usuario._id);
        if (!miPerfil) return;
        
        const pokemons = miPerfil.pokemons || [];
        const equipo = pokemons.filter(p => p.estado === 'equipo');
        const caja = pokemons.filter(p => p.estado === 'caja');
        const cementerio = pokemons.filter(p => p.estado === 'cementerio');

        const counterEl = document.getElementById('team-counter');
        if(counterEl) counterEl.innerText = `${equipo.length}/6`;

        // EQUIPO (Con Edición)
        let htmlEquipo = '';
        const naturalezas = ["Firme", "Alegre", "Modesta", "Miedosa", "Audaz", "Placida", "Serena", "Grosera", "Cauta", "Agitada", "Rara", "Fuerte", "Docil"];

        equipo.forEach((p) => {
            const atq = p.ataques && p.ataques.length === 4 ? p.ataques : ["", "", "", ""];
            const optionsNaturaleza = naturalezas.map(n => `<option value="${n}" ${p.naturaleza === n ? 'selected' : ''}>${n}</option>`).join('');
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
                    <button class="btn-toggle-edit" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}"><i class="bi bi-chevron-down"></i> Editar Datos</button>
                    <div class="collapse" id="${collapseId}">
                        <div class="edit-collapse-panel text-start">
                            <form onsubmit="guardarEdicionInline(event, '${p._id}', '${p.especie}')">
                                <div class="row g-1 mb-2">
                                    <div class="col-8"><label class="mini-form-label">Mote</label><input type="text" name="mote" class="mini-input" value="${p.mote}"></div>
                                    <div class="col-4"><label class="mini-form-label">Nivel</label><input type="number" name="nivel" class="mini-input" value="${p.nivel}" min="1" max="100"></div>
                                </div>
                                <div class="row g-1 mb-2">
                                    <div class="col-6">
                                        <label class="mini-form-label">Objeto</label>
                                        <input type="text" name="objeto" class="mini-input" value="${p.objeto || ''}" placeholder="Nada" list="datalist-items" autocomplete="off">
                                    </div>
                                    <div class="col-6">
                                        <label class="mini-form-label">Naturaleza</label>
                                        <select name="naturaleza" class="mini-input bg-dark">
                                            ${optionsNaturaleza}
                                        </select>
                                    </div>
                                </div>
                                <label class="mini-form-label text-warning">Movimientos</label>
                                <div class="d-grid gap-1 mb-3">
                                    <input type="text" name="atq0" class="mini-input" value="${atq[0]}" placeholder="-" list="datalist-moves" autocomplete="off">
                                    <input type="text" name="atq1" class="mini-input" value="${atq[1]}" placeholder="-" list="datalist-moves" autocomplete="off">
                                    <input type="text" name="atq2" class="mini-input" value="${atq[2]}" placeholder="-" list="datalist-moves" autocomplete="off">
                                    <input type="text" name="atq3" class="mini-input" value="${atq[3]}" placeholder="-" list="datalist-moves" autocomplete="off">
                                </div>
                                <div class="d-grid gap-2">
                                    <button type="submit" class="btn btn-sm btn-success py-1" style="font-size:0.8rem">💾 Guardar</button>
                                    <div class="d-flex gap-1 mt-2 pt-2 border-top border-white-10">
                                        <button type="button" onclick="moverPokemon('${p._id}', 'caja')" class="btn btn-sm btn-outline-primary flex-fill py-0" style="font-size:0.7rem">Al PC</button>
                                        <button type="button" onclick="moverPokemon('${p._id}', 'cementerio')" class="btn btn-sm btn-outline-danger flex-fill py-0" style="font-size:0.7rem">Falleció</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>`;
        });

        for(let i = equipo.length; i < 6; i++) {
            htmlEquipo += `<div class="col-12 col-md-6 col-lg-4"><div class="slot-empty"><div class="text-center opacity-50"><i class="bi bi-plus-circle display-6"></i><div class="mt-2 small">Vacío</div></div></div></div>`;
        }
        activeGrid.innerHTML = htmlEquipo;

        // PC (Solo movimiento)
        const pcGrid = document.getElementById('pc-box-grid');
        if(caja.length === 0) {
            pcGrid.innerHTML = '<div class="col-12 text-center text-muted py-4 small">La caja está vacía</div>';
        } else {
            pcGrid.innerHTML = caja.map(p => `
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
        }

        // CEMENTERIO
        const graveGrid = document.getElementById('graveyard-grid');
        if(cementerio.length > 0) {
            graveGrid.innerHTML = cementerio.map(p => `
            <div class="col-4 col-md-3 col-lg-2">
                <div class="manage-card bg-danger bg-opacity-10 border-danger">
                    <div class="text-center mb-1" style="filter: grayscale(100%);">
                        <img src="${p.imagen}" style="width:40px; height:40px; object-fit:contain;">
                        <div class="small mt-1 text-truncate text-danger text-decoration-line-through">${p.mote}</div>
                    </div>
                    <button onclick="moverPokemon('${p._id}', 'caja')" class="btn btn-sm btn-link text-muted py-0 w-100" style="font-size:0.6rem; text-decoration:none;">Revivir</button>
                </div>
            </div>`).join('');
        } else {
            graveGrid.innerHTML = '<div class="col-12 text-center text-muted py-2 small opacity-50">Nadie ha muerto... aún.</div>';
        }

    } catch(e) { 
        console.error("🔥 Error crítico:", e); 
        activeGrid.innerHTML = `<div class="col-12 text-center text-danger">Error de conexión</div>`;
    }
}

// LÓGICA DE CAPTURA (Gen 8 Priority)
const formCaptura = document.getElementById('form-captura');
if (formCaptura) {
    formCaptura.addEventListener('submit', async (e) => {
        e.preventDefault();
        const especieInput = document.getElementById('cap-especie').value.toLowerCase().trim();
        const mote = document.getElementById('cap-mote').value;
        const nivel = document.getElementById('cap-nivel').value;
        const usuario = JSON.parse(localStorage.getItem('usuario_pokelocke'));

        const btnSubmit = formCaptura.querySelector('button[type="submit"]');
        btnSubmit.innerText = "Buscando...";
        btnSubmit.disabled = true;

        try {
            const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${especieInput}`);
            if (!pokeRes.ok) throw new Error("Pokemon no encontrado");
            const pokeData = await pokeRes.json();
            
            const imagenUrl = pokeData.sprites.versions['generation-viii'].icons.front_default || 
                              pokeData.sprites.versions['generation-vii'].icons.front_default || 
                              pokeData.sprites.front_default;
            const tipos = pokeData.types.map(t => t.type.name);

            const res = await fetch('https://pokelocke-8kjm.onrender.com/api/juego/pokemon', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    entrenadorId: usuario._id,
                    especie: pokeData.name,
                    mote: mote,
                    nivel: parseInt(nivel),
                    imagen: imagenUrl,
                    tipos: tipos
                })
            });

            if (res.ok) {
                formCaptura.reset();
                bootstrap.Modal.getInstance(document.getElementById('captureModal')).hide();
                cargarGestorEquipo(); 
                alert(`✅ ¡${mote || pokeData.name} atrapado!`);
            } else {
                alert("Error al guardar");
            }
        } catch (error) {
            alert("Error: " + error.message);
        } finally {
            btnSubmit.innerText = "¡Atrapado!";
            btnSubmit.disabled = false;
        }
    });
}

// GUARDAR EDICIÓN INLINE
window.guardarEdicionInline = async function(event, id, especieOriginal) {
    event.preventDefault();
    const form = event.target;
    const usuario = JSON.parse(localStorage.getItem('usuario_pokelocke'));
    
    const btn = form.querySelector('button[type="submit"]');
    const txt = btn.innerText;
    btn.innerText = "Guardando...";
    btn.disabled = true;

    try {
        const res = await fetch('https://pokelocke-8kjm.onrender.com/api/juego/pokemon', {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                entrenadorId: usuario._id,
                pokemonId: id,
                nuevosDatos: {
                    mote: form.mote.value,
                    nivel: form.nivel.value,
                    objeto: form.objeto.value,
                    naturaleza: form.naturaleza.value,
                    ataques: [form.atq0.value, form.atq1.value, form.atq2.value, form.atq3.value]
                }
            })
        });
        if(res.ok) cargarGestorEquipo();
        else alert("Error al guardar");
    } catch(e) { console.error(e); }
    finally {
        btn.innerText = txt;
        btn.disabled = false;
    }
};

// MOVER POKEMON
window.moverPokemon = async function(pokeId, nuevoEstado) {
    const usuario = JSON.parse(localStorage.getItem('usuario_pokelocke'));
    try {
        const res = await fetch('https://pokelocke-8kjm.onrender.com/api/juego/pokemon/mover', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ entrenadorId: usuario._id, pokemonId: pokeId, nuevoEstado: nuevoEstado })
        });
        if (res.ok) cargarGestorEquipo();
        else { const d = await res.json(); alert("⚠️ " + d.mensaje); }
    } catch (e) { alert("Error de conexión."); }
};

/* ========================================================= */
/* 6. COMBATES Y FEED (combates.html / sala_grupo.html)           */
/* ========================================================= */
async function cargarHistorialCompleto() {
    const container = document.getElementById('timeline-content');
    if (!container) return;
    const usuario = JSON.parse(localStorage.getItem('usuario_pokelocke'));

    try {
        const res = await fetch(`https://pokelocke-8kjm.onrender.com/api/juego/combates/${usuario.sala}`);
        const combates = await res.json();

        if (combates.length === 0) {
            container.innerHTML = `<div class="glass-panel p-5 text-center"><h4 class="text-muted">Sin actividad</h4></div>`;
            return;
        }

        container.innerHTML = combates.map(c => {
            const fecha = new Date(c.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
            const esGanador1 = c.ganador === c.entrenador1;
            const esGanador2 = c.ganador === c.entrenador2;
            const generarIconos = (imgs) => (!imgs || imgs.length === 0) ? '<span class="small text-muted">Sin datos</span>' : imgs.map(url => `<img src="${url}" class="combat-poke-icon">`).join('');

            return `
            <div class="battle-item fade-up"><div class="battle-dot"></div>
                <div class="battle-card-full p-2">
                    <div class="d-flex justify-content-between border-bottom border-white-10 pb-1 mb-2">
                        <span class="badge bg-secondary bg-opacity-10 text-muted border border-white-10">${fecha}</span>
                        <span class="text-warning small fw-bold">🏆 ${c.ganador}</span>
                    </div>
                    <div class="combat-layout">
                        <div class="combat-side"><span class="fw-bold ${esGanador1 ? 'text-warning' : 'text-white'}">${c.entrenador1}</span><div class="combat-team-grid">${generarIconos(c.equipo1Snapshot)}</div></div>
                        <div class="vs-badge">VS</div>
                        <div class="combat-side"><span class="fw-bold ${esGanador2 ? 'text-warning' : 'text-white'}">${c.entrenador2}</span><div class="combat-team-grid">${generarIconos(c.equipo2Snapshot)}</div></div>
                    </div>
                </div>
            </div>`;
        }).join('');
    } catch (e) { container.innerHTML = '<p class="text-danger">Error cargando historial.</p>'; }
}

async function cargarFeedCombates(salaNombre) {
    const container = document.getElementById('recent-battles-list');
    if (!container) return;

    try {
        const res = await fetch(`https://pokelocke-8kjm.onrender.com/api/juego/combates/${salaNombre}?limite=3`);
        const combates = await res.json();

        if (combates.length === 0) {
            container.innerHTML = '<small class="text-muted d-block text-center py-2">Sin actividad reciente</small>';
            return;
        }

        container.innerHTML = combates.map(c => {
            const esGanador1 = c.ganador === c.entrenador1;
            const esGanador2 = c.ganador === c.entrenador2;
            
            // Datos seguros
            const equipo1 = c.equipo1Snapshot || [];
            const equipo2 = c.equipo2Snapshot || [];

            // Generador de iconos (Mostramos hasta 6)
            const generarIconosMini = (imgs) => {
                if (!imgs || imgs.length === 0) return '<span class="text-muted" style="font-size:0.6rem">- Sin equipo -</span>';
                return imgs.slice(0,6).map(url => `<img src="${url}" class="combat-poke-icon">`).join('');
            };

            return `
            <div class="glass-panel mb-3 p-2 border border-secondary border-opacity-25 fade-in">
                
                <div class="combat-layout vertical">
                    
                    <div class="combat-side">
                        <div class="d-flex align-items-center gap-2">
                            <span class="small fw-bold ${esGanador1 ? 'text-warning' : 'text-muted'}">${c.entrenador1}</span>
                            ${esGanador1 ? '<i class="bi bi-trophy-fill text-warning" style="font-size:0.7rem"></i>' : ''}
                        </div>
                        <div class="combat-team-grid">
                            ${generarIconosMini(equipo1)}
                        </div>
                    </div>

                    <div class="vs-badge-vertical">VS</div>

                    <div class="combat-side">
                        <div class="d-flex align-items-center gap-2">
                            <span class="small fw-bold ${esGanador2 ? 'text-warning' : 'text-muted'}">${c.entrenador2}</span>
                            ${esGanador2 ? '<i class="bi bi-trophy-fill text-warning" style="font-size:0.7rem"></i>' : ''}
                        </div>
                        <div class="combat-team-grid">
                            ${generarIconosMini(equipo2)}
                        </div>
                    </div>

                </div>
            </div>`;
        }).join('');

    } catch (e) { 
        console.error("Error cargando feed:", e);
        container.innerHTML = '<small class="text-danger">Error de conexión</small>';
    }
}

const formCombate = document.getElementById('form-combate');
if (formCombate) {
    const newForm = formCombate.cloneNode(true);
    formCombate.parentNode.replaceChild(newForm, formCombate);
    newForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const usuario = JSON.parse(localStorage.getItem('usuario_pokelocke'));
        const p1 = document.getElementById('select-p1').value;
        const p2 = document.getElementById('select-p2').value;
        const ganador = document.getElementById('select-winner').value;

        if (p1 === p2) return alert("¡Un jugador no puede luchar contra sí mismo!");

        const btn = newForm.querySelector('button[type="submit"]');
        btn.innerText = "Registrando..."; btn.disabled = true;

        try {
            const res = await fetch('https://pokelocke-8kjm.onrender.com/api/juego/combate', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ sala: usuario.sala, entrenador1: p1, entrenador2: p2, ganador: ganador })
            });
            if (res.ok) {
                bootstrap.Modal.getInstance(document.getElementById('combatModal')).hide();
                cargarDashboard();
                alert("✅ Combate registrado");
            } else {
                alert("Error al registrar");
            }
        } catch (error) { alert("Error de conexión"); }
        finally { btn.innerText = "Guardar Resultado"; btn.disabled = false; }
    });
}

/* ========================================================= */
/* 7. FUNCIONES AUXILIARES                                   */
/* ========================================================= */
async function cambiarVidas(id, c) {
    try { const res = await fetch('https://pokelocke-8kjm.onrender.com/api/juego/vidas', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ entrenadorId: id, cambio: c }) }); if (res.ok) cargarDashboard(); } catch (e) { console.error(e); }
}
async function sumarVictoria(id) {
    try { const res = await fetch('https://pokelocke-8kjm.onrender.com/api/juego/victoria', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ entrenadorId: id }) }); if (res.ok) cargarDashboard(); } catch (e) { console.error(e); }
}
async function borrarSala() {
    const u = JSON.parse(localStorage.getItem('usuario_pokelocke'));
    const s = JSON.parse(localStorage.getItem('sala_info'));
    if (!confirm(`⚠️ ¿Borrar sala "${s.nombre}"?`)) return;
    try {
        const res = await fetch('https://pokelocke-8kjm.onrender.com/api/juego/sala', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombreSala: s.nombre, hostNombre: u.nombre }) });
        if (res.ok) {
            let h = JSON.parse(localStorage.getItem('pokelocke_history') || '[]');
            localStorage.setItem('pokelocke_history', JSON.stringify(h.filter(x => x.sala !== s.nombre)));
            localStorage.removeItem('usuario_pokelocke');
            window.location.href = 'index.html';
        }
    } catch (e) { alert("Error conexión"); }
}

function guardarPartidaEnHistorial(datosEntrenador, datosSala) {
    let historial = JSON.parse(localStorage.getItem('pokelocke_history') || '[]');
    const nuevaSesion = { sala: datosSala.nombre, host: datosSala.host, maxJugadores: datosSala.maxJugadores, reglas: datosSala.reglas, descripcion: datosSala.descripcion, miNombre: datosEntrenador.nombre, miId: datosEntrenador._id, fechaAcceso: new Date().toISOString() };
    historial = historial.filter(s => s.sala !== datosSala.nombre);
    historial.unshift(nuevaSesion);
    localStorage.setItem('pokelocke_history', JSON.stringify(historial));
}

function cargarMisGrupos() {
    const grid = document.getElementById('groups-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const historial = JSON.parse(localStorage.getItem('pokelocke_history') || '[]');
    if (historial.length === 0) { document.getElementById('empty-state').classList.remove('d-none'); return; }
    document.getElementById('empty-state').classList.add('d-none');

    historial.forEach((s, i) => {
        const color = ['primary', 'success', 'danger', 'warning', 'info', 'indigo'][s.sala.length % 6];
        grid.innerHTML += `<div class="col-md-6 col-lg-4 fade-up"><div class="card h-100 shadow-sm group-card border-0"><div class="card-body position-relative"><div class="d-flex justify-content-between align-items-center mb-3"><div class="rounded-circle bg-${color} bg-gradient d-flex align-items-center justify-content-center shadow-sm" style="width: 50px; height: 50px; font-size: 1.5rem; font-weight: bold;">${s.sala.charAt(0).toUpperCase()}</div><span class="badge text-dark border"><i class="bi bi-person"></i> ${s.miNombre}</span></div><h4 class="card-title fw-bold text-dark mb-1">${s.sala}</h4><p class="text-muted small mb-4">Host: ${s.host}</p><div class="d-grid"><button onclick="reanudarPartida(${i})" class="btn btn-outline-${color} fw-bold stretched-link">Entrar <i class="bi bi-box-arrow-in-right ms-2"></i></button></div></div><div class="card-footer bg-transparent border-0 text-muted" style="font-size: 0.75rem;">Último acceso: ${new Date(s.fechaAcceso).toLocaleDateString()}</div></div></div>`;
    });
}

window.reanudarPartida = function(index) {
    const s = JSON.parse(localStorage.getItem('pokelocke_history'))[index];
    if (s) {
        localStorage.setItem('usuario_pokelocke', JSON.stringify({ _id: s.miId, nombre: s.miNombre, sala: s.sala }));
        localStorage.setItem('sala_info', JSON.stringify({ nombre: s.sala, host: s.host, maxJugadores: s.maxJugadores, reglas: s.reglas, descripcion: s.descripcion }));
        window.location.href = 'sala_grupo.html';
    }
};

/* ========================================================= */
/* LOGIC: EXPORTAR A SHOWDOWN (Con Traductor)                */
/* ========================================================= */
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

const ponerCargador = (id, msg) => { const el = document.getElementById(id); if (el) el.innerHTML = `<div class="loading-state"><div class="spinner-border text-primary"></div><p>${msg}</p></div>`; };

// AUTO-INIT
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('my-dashboard-panel')) cargarDashboard();
    if (document.getElementById('active-team-grid')) cargarGestorEquipo();
    if (document.getElementById('timeline-content')) cargarHistorialCompleto();
    if (document.getElementById('groups-grid')) cargarMisGrupos();
});

/* ========================================================= */
/* CACHE LOCAL DE MOVIMIENTOS (Desde Base de Datos)          */
/* ========================================================= */
let DB_MOVIMIENTOS_CACHE = {}; // Se llenará al cargar la página

async function inicializarDiccionarioMovimientos() {
    // Si ya tenemos el datalist, no recargamos
    if(document.getElementById('datalist-moves')) return;

    try {
        console.log("📥 Descargando diccionario de movimientos...");
        const res = await fetch('https://pokelocke-8kjm.onrender.com/api/datos/movimientos');
        
        if (!res.ok) throw new Error("Error fetching moves");
        
        const movimientos = await res.json();
        
        // 1. Llenar el Caché (Objeto rápido para traducción)
        // Convertimos el array [{nombreEsp, nombreIng}] en objeto {"Lanzallamas": "Flamethrower"}
        movimientos.forEach(m => {
            DB_MOVIMIENTOS_CACHE[m.nombreEsp] = m.nombreIng;
        });

        // 2. Crear el <datalist> para Autocompletado
        const listMoves = document.createElement('datalist');
        listMoves.id = 'datalist-moves';
        
        // Ordenamos alfabéticamente para que salga bonito
        const nombresOrdenados = Object.keys(DB_MOVIMIENTOS_CACHE).sort();
        
        nombresOrdenados.forEach(nombreEsp => {
            const opt = document.createElement('option');
            opt.value = nombreEsp;
            listMoves.appendChild(opt);
        });
        
        document.body.appendChild(listMoves);
        console.log(`✅ Diccionario cargado: ${nombresOrdenados.length} movimientos.`);

    } catch (error) {
        console.error("Error cargando movimientos:", error);
    }
}

// Ejecutar lo antes posible
document.addEventListener('DOMContentLoaded', inicializarDiccionarioMovimientos);

const DB_OBJETOS = {
    "Restos": "Leftovers", "Vidasfera": "Life Orb", "Pañuelo Elección": "Choice Scarf", "Gafas Elección": "Choice Specs", "Cinta Elección": "Choice Band", "Chaleco Asalto": "Assault Vest", "Casco Dentado": "Rocky Helmet", "Baya Aranja": "Oran Berry", "Baya Zidra": "Sitrus Berry", "Baya Ziuela": "Lum Berry", "Hierba Mental": "Mental Herb", "Lodo Negro": "Black Sludge", "Mineral Evol": "Eviolite", "Banda Focus": "Focus Sash"
};

// Función auxiliar para inyectar las sugerencias en el HTML
function inicializarDatalists() {
    // Si ya existen, no hacemos nada
    if(document.getElementById('datalist-moves')) return;

    const body = document.body;

    // 1. Lista de Movimientos
    const listMoves = document.createElement('datalist');
    listMoves.id = 'datalist-moves';
    Object.keys(DB_MOVIMIENTOS).sort().forEach(mov => {
        const opt = document.createElement('option');
        opt.value = mov;
        listMoves.appendChild(opt);
    });
    body.appendChild(listMoves);

    // 2. Lista de Objetos
    const listItems = document.createElement('datalist');
    listItems.id = 'datalist-items';
    Object.keys(DB_OBJETOS).sort().forEach(obj => {
        const opt = document.createElement('option');
        opt.value = obj;
        listItems.appendChild(opt);
    });
    body.appendChild(listItems);
}

// Ejecutar al inicio
document.addEventListener('DOMContentLoaded', inicializarDatalists);

/* FUNCIÓN PARA CAMBIAR MEDALLAS */
async function cambiarMedallas(idJugador, accion) {
    try {
        // Bloqueo visual temporal (opcional)
        document.body.style.cursor = 'wait';

        const res = await fetch('https://pokelocke-8kjm.onrender.com/api/juego/jugador/medallas', {
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
