
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

                /* DENTRO DE cargarDashboard (script.js) -> listaJugadores.forEach */

                listaJugadores.forEach(jugador => {
                    const esMio = jugador._id === usuario._id;
                    const esHost = jugador.nombre === infoSala.host;

                    // 1. CLASIFICAR: Dividimos los pokemons en 3 arrays según su estado
                    const equipo = jugador.pokemons.filter(p => p.estado === 'equipo');
                    const caja = jugador.pokemons.filter(p => p.estado === 'caja');
                    const cementerio = jugador.pokemons.filter(p => p.estado === 'cementerio');

                    // 2. HELPER: Función para generar la cuadrícula de imágenes
                    // Esto evita repetir código 3 veces. Maneja clicks, imágenes y estilos.
                    const generarGrid = (lista, esGris = false) => {
                        if (lista.length === 0) return '<div class="text-center py-3 text-muted small fst-italic">Vacío</div>';
                        
                        return `<div class="d-flex justify-content-center flex-wrap gap-2">` + 
                        lista.map(poke => {
                            // Lógica de interacción: Solo si es mío permitimos click
                            const accionClick = esMio ? `onclick='abrirDetalles(${JSON.stringify(poke)})'` : '';
                            const estiloCursor = esMio ? 'cursor: pointer;' : 'cursor: default;';
                            const filtroGris = esGris ? 'filter: grayscale(100%); opacity: 0.7;' : ''; // Estilo para muertos
                            
                            // Usamos la imagen guardada o la pokeball de error
                            const imgUrl = poke.imagen || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';

                            return `
                            <div class="text-center position-relative p-1" title="${poke.mote}">
                                <img src="${imgUrl}" 
                                    class="poke-sprite"
                                    style="width: 50px; height: 50px; image-rendering: pixelated; transition: transform 0.2s; ${estiloCursor} ${filtroGris}"
                                    ${accionClick}
                                    onmouseover="this.style.transform='scale(1.2)'"
                                    onmouseout="this.style.transform='scale(1)'"
                                    onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'">
                                
                                <span class="position-absolute bottom-0 start-50 translate-middle-x badge bg-dark bg-opacity-75 rounded-pill border border-secondary" 
                                    style="font-size: 0.55em; padding: 1px 4px;">L.${poke.nivel}</span>
                            </div>`;
                        }).join('') + `</div>`;
                    };

                    // 3. GENERAR IDs ÚNICOS (Vital para que las pestañas funcionen independientemente)
                    const tabIdEquipo = `pills-equipo-${jugador._id}`;
                    const tabIdCaja = `pills-caja-${jugador._id}`;
                    const tabIdCementerio = `pills-dead-${jugador._id}`;

                    // 4. CONSTRUIR LA TARJETA CON PESTAÑAS (HTML Complejo)
                    const cardHTML = `
                    <div class="col-md-6 col-lg-4">
                        <div class="card h-100 shadow-sm ${esMio ? 'border-primary' : ''}">
                            
                            <div class="card-header bg-transparent d-flex justify-content-between align-items-center py-2">
                                <h5 class="card-title fw-bold mb-0 text-truncate" style="max-width: 70%;">
                                    <i class="bi bi-person-circle"></i> ${jugador.nombre}
                                    ${esMio ? '<span class="badge bg-primary ms-1" style="font-size:0.5em">TÚ</span>' : ''}
                                    ${esHost ? '<span class="badge bg-warning text-dark ms-1" style="font-size:0.5em">HOST</span>' : ''}
                                </h5>
                                <span class="badge bg-secondary" title="Pokémon vivos">${equipo.length + caja.length} Vivos</span>
                            </div>

                            <div class="card-body p-2">
                                <ul class="nav nav-pills nav-fill mb-2 small" role="tablist" style="font-size: 0.85rem;">
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link active py-1" data-bs-toggle="pill" data-bs-target="#${tabIdEquipo}" type="button">
                                            Equipo
                                        </button>
                                    </li>
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link py-1 position-relative" data-bs-toggle="pill" data-bs-target="#${tabIdCaja}" type="button">
                                            PC
                                            ${caja.length > 0 ? `<span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="font-size:0.5em">${caja.length}</span>` : ''}
                                        </button>
                                    </li>
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link py-1" data-bs-toggle="pill" data-bs-target="#${tabIdCementerio}" type="button">
                                            ☠️
                                            ${cementerio.length > 0 ? `<span class="badge bg-secondary ms-1" style="font-size:0.6em">${cementerio.length}</span>` : ''}
                                        </button>
                                    </li>
                                </ul>

                                <div class="tab-content">
                                    
                                    <div class="tab-pane fade show active" id="${tabIdEquipo}" role="tabpanel">
                                        <div class="bg-light border rounded p-2" style="min-height: 100px;">
                                            ${generarGrid(equipo, false)}
                                        </div>
                                    </div>

                                    <div class="tab-pane fade" id="${tabIdCaja}" role="tabpanel">
                                        <div class="bg-body-secondary border rounded p-2" style="min-height: 100px;">
                                            ${generarGrid(caja, false)}
                                        </div>
                                    </div>

                                    <div class="tab-pane fade" id="${tabIdCementerio}" role="tabpanel">
                                        <div class="bg-dark bg-opacity-10 border rounded p-2" style="min-height: 100px;">
                                            ${generarGrid(cementerio, true)}
                                        </div>
                                    </div>

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

