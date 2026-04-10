// 1. IMPORTACIÓN DE DATOS
// Carga el array 'canciones' desde el archivo de datos (canciones.js).
import { canciones } from './canciones.js'; 

// --- Tonos y transposición ---
const notas = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
let tonoBase = 0;

// DECLARACIÓN CORREGIDA
let cancionActual = null; 

// --- Variables de estado de navegación ---
let vinoDesdeRepertorio = false; // Nuevo: rastrea de dónde vino el usuario

// --- Elementos DOM ---
const lista = document.getElementById("listaCanciones");
const buscador = document.getElementById("buscador");
const btnBuscar = document.getElementById("btnBuscar");
const categorias = document.querySelectorAll("#categorias button"); // Selecciona todos los botones
const pantallaCategorias = document.getElementById("pantallaCategorias");
const pantallaListado = document.getElementById("pantallaListado");
const tituloListado = document.getElementById("tituloListado");
const pantallaLetra = document.getElementById("pantallaLetra");

// ¡NUEVOS ELEMENTOS DEL REPERTORIO!
const btnRepertorio = document.getElementById("btnRepertorio");
const pantallaRepertorio = document.getElementById("pantallaRepertorio");
const listaRepertorio = document.getElementById("listaRepertorio");
const btnVolverListado = document.getElementById("btnVolverListado");
const contadorRepertorio = document.getElementById("contadorRepertorio");

const tituloCancion = document.getElementById("tituloCancion");
const songContainer = document.getElementById("song-container");
const pantallaOffline = document.getElementById("pantallaOffline");
const btnReintentar = document.getElementById("btnReintentar");

// Controles de estilo
const selectTamanio = document.getElementById("selectTamanio");
const selectFuente = document.getElementById("selectFuente");
const selectColor = document.getElementById("selectColor");
const btnTuerca = document.getElementById("btnTuerca");
const controlesEstilo = document.getElementById("controles-estilo");
const btnAnadirRepertorioMenu = document.getElementById("btnAnadirRepertorioMenu");


// =========================================================
// == LÓGICA DEL REPERTORIO ==
// =========================================================

// Obtener el repertorio de LocalStorage o un array vacío si no existe
let repertorio = JSON.parse(localStorage.getItem('repertorioCoros')) || [];

function guardarRepertorio() {
    localStorage.setItem('repertorioCoros', JSON.stringify(repertorio));
    actualizarContadorRepertorio();
}

function actualizarContadorRepertorio() {
    contadorRepertorio.textContent = ` (${repertorio.length} Coros)`;
}

/** * Función para añadir al repertorio. */
function anadirAlRepertorio(idCancion) {
    if (!repertorio.includes(idCancion)) {
        repertorio.push(idCancion);
        guardarRepertorio();
        // Mantiene el filtro/búsqueda actual después de añadir
        const filtroActivo = document.querySelector('#categorias button.activo')?.dataset.cat || "";
        mostrarListado(buscador.value || filtroActivo); 
    }
}

/** * Función para eliminar del repertorio. */
function eliminarDelRepertorio(idCancion) {
    repertorio = repertorio.filter(id => id !== idCancion);
    guardarRepertorio();
    
    if (pantallaRepertorio.style.display === "block") {
        // Si estoy en la pantalla de repertorio, renderizo la lista actualizada
        renderizarRepertorio();
    } else {
        // Si estoy en el listado general, actualizo solo el listado
        const filtroActivo = document.querySelector('#categorias button.activo')?.dataset.cat || "";
        mostrarListado(buscador.value || filtroActivo); 
    }
}

/** * Función para renderizar la pantalla del repertorio. */
function renderizarRepertorio() {
    listaRepertorio.innerHTML = "";
    
    // Quitar 'activo' de cualquier botón de categoría
    categorias.forEach(b => b.classList.remove('activo'));
    if(btnRepertorio) btnRepertorio.classList.add('activo'); // Opcional: Marcar el botón Repertorio
    
    const cancionesRepertorio = repertorio
        .map(id => canciones.find(c => (c.id || c.titulo) === id))
        .filter(c => c); 
        
    if (cancionesRepertorio.length === 0) {
        listaRepertorio.innerHTML = "<li class='lista-vacia'>Aún no tienes coros en tu repertorio. Añádelos desde el listado general.</li>";
    }

    cancionesRepertorio.forEach(c => {
        const idCancion = c.id || c.titulo;
        const li = document.createElement("li");
        
        const tituloSpan = document.createElement("span");
        tituloSpan.textContent = c.titulo;
        tituloSpan.onclick = () => mostrarCancion(c, true); 
        
        const btnEliminar = document.createElement("button");
        btnEliminar.textContent = "🗑️";
        btnEliminar.className = "btn-eliminar-repertorio";
        btnEliminar.title = "Eliminar del repertorio";
        btnEliminar.onclick = (e) => {
            e.stopPropagation(); 
            eliminarDelRepertorio(idCancion);
        };

        li.appendChild(btnEliminar);
        li.appendChild(tituloSpan);
        listaRepertorio.appendChild(li);
    });
    
    pantallaListado.style.display = "none";
    pantallaLetra.style.display = "none";
    pantallaRepertorio.style.display = "block";
}


// =========================================================
// == FUNCIONES DE DISPLAY ==
// =========================================================

// --- Renderizar listado de canciones (MODIFICADA para añadir botón Repertorio) ---
// =========================================================
// == FUNCIONES PRINCIPALES ==
// =========================================================

function mostrarListado(filtro = "", titulo = "Listado de canciones") {
    lista.innerHTML = "";
    tituloListado.textContent = titulo;

    if (!filtro && buscador.value.trim() === "") {
        lista.innerHTML = `
            <li class="lista-vacia">
                <i class="fa-solid fa-music"></i>
                <span>Selecciona una categoría para ver los coros</span>
            </li>`;
    } else {
        canciones
            .filter(c => {
                if (buscador.value.trim() !== "") {
                    return c.titulo.toLowerCase().includes(buscador.value.toLowerCase());
                }
                return c.categoria === filtro;
            })
            .forEach(c => {
            const idCancion = c.id || c.titulo;
            const li = document.createElement("li");
            const tituloSpan = document.createElement("span");
            tituloSpan.textContent = c.titulo;

            li.onclick = () => mostrarCancion(c, false);

            li.appendChild(tituloSpan);
            lista.appendChild(li);
            });
    }
    pantallaCategorias.style.display = "none";
    pantallaListado.style.display = "block";

    if (btnRepertorio) btnRepertorio.classList.remove('activo');
}

function mostrarCancion(cancion, desdeRepertorio) {
    cancionActual = cancion;
    vinoDesdeRepertorio = desdeRepertorio;
    tonoBase = 0;
    tituloCancion.textContent = cancion.titulo;
    renderizarLetra();

    const headerAzul = document.querySelector('header');
    if (headerAzul) headerAzul.style.display = "none";

    pantallaListado.style.display = "none";
    pantallaRepertorio.style.display = "none";
    pantallaLetra.style.display = "block";
}

function renderizarLetra() {
    const textoCompleto = cancionActual.letra.trim();
    songContainer.innerHTML = "";
    const estrofas = textoCompleto.split(/\n\s*\n/);

    estrofas.forEach(estrofa => {
        const divEstrofa = document.createElement("div");
        divEstrofa.className = "estrofa";
        const lineas = estrofa.split("\n");

        lineas.forEach(linea => {
            const divLinea = document.createElement("div");
            divLinea.className = "linea";
            divLinea.style.position = "relative";

            const matchIntro = linea.match(/^(.*?):\s*(.+)$/);
            if (matchIntro) {
                const titulo = matchIntro[1];
                const acordesStr = matchIntro[2];
                const texto = document.createElement("span");
                texto.textContent = titulo + ": ";
                const divChords = document.createElement("span");

                acordesStr.split(/\s+/).forEach(acorde => {
                    const span = document.createElement("span");
                    span.textContent = transponer(acorde, tonoBase) + " ";
                    divChords.appendChild(span);
                });

                divLinea.appendChild(texto);
                divLinea.appendChild(divChords);
            } else {
                let pos = 0;
                let buffer = "";
                let chords = [];

                for (let i = 0; i < linea.length; i++) {
                    if (linea[i] === "[") {
                        let j = i + 1;
                        let chord = "";
                        while (linea[j] && linea[j] !== "]") {
                            chord += linea[j];
                            j++;
                        }
                        chords.push({ chord: transponer(chord, tonoBase), index: pos });
                        i = j;
                    } else {
                        buffer += linea[i];
                        pos++;
                    }
                }

                const divChords = document.createElement("div");
                divChords.className = "chords";
                divChords.style.position = "absolute";
                divChords.style.top = "0";
                divChords.style.left = "0";

                chords.forEach(c => {
                    const span = document.createElement("span");
                    span.textContent = c.chord;
                    span.style.position = "absolute";
                    span.style.left = `${c.index}ch`;
                    divChords.appendChild(span);
                });

                const divLetras = document.createElement("div");
                divLetras.className = "letras";
                divLetras.textContent = buffer;
                divLetras.style.paddingTop = "20px";

                divLinea.appendChild(divChords);
                divLinea.appendChild(divLetras);
            }
            divEstrofa.appendChild(divLinea);
        });
        songContainer.appendChild(divEstrofa);
    });
}

function transponer(chord, steps) {
    const match = chord.match(/^([A-G][b#]?)(.*)$/);
    if (!match) return chord;
    let [, nota, resto] = match;
    const bemolesMap = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' };
    let notaNormalizada = bemolesMap[nota] || nota;
    if (notaNormalizada === 'B#') notaNormalizada = 'C';
    if (notaNormalizada === 'E#') notaNormalizada = 'F';

    let i = notas.indexOf(notaNormalizada);
    if (i === -1) return chord;
    let nueva = notas[(i + steps + 12) % 12];
    return nueva + resto;
}

// =========================================================
// == EVENTOS ==
// =========================================================

document.getElementById("subir").onclick = () => {
    if (cancionActual) { tonoBase++; renderizarLetra(); }
};

document.getElementById("bajar").onclick = () => {
    if (cancionActual) { tonoBase--; renderizarLetra(); }
};

document.getElementById("btnVolver").onclick = () => {
    const headerAzul = document.querySelector('header');
    if (headerAzul) headerAzul.style.display = "block";

    if (vinoDesdeRepertorio) {
        renderizarRepertorio();
    } else {
        pantallaLetra.style.display = "none";
        pantallaListado.style.display = "block";
        pantallaRepertorio.style.display = "none";
    }
};

document.getElementById("btnImprimir").onclick = () => window.print();

btnBuscar.onclick = () => {
    categorias.forEach(b => b.classList.remove('activo'));
    mostrarListado(buscador.value, buscador.value ? `Búsqueda: ${buscador.value}` : 'Listado de canciones');
};

categorias.forEach(btn => {
    if (btn.hasAttribute('data-cat')) {
        btn.onclick = () => {
            const categoriaFiltro = btn.dataset.cat;
            categorias.forEach(b => b.classList.remove('activo'));
            btn.classList.add('activo');
            buscador.value = "";
            const titulo = btn.textContent + "";
            mostrarListado(categoriaFiltro, titulo);
        };
    }
});

if (btnRepertorio) {
    btnRepertorio.onclick = () => {
        categorias.forEach(b => b.classList.remove('activo'));
        btnRepertorio.classList.add('activo');

        // CAMBIO DE PANTALLA: Mostramos repertorio, ocultamos lo demás
        pantallaRepertorio.style.display = "block";
        pantallaListado.style.display = "none";
        pantallaCategorias.style.display = "none";
        pantallaLetra.style.display = "none";
        renderizarRepertorio();
    };
}

if (btnVolverListado) {
    btnVolverListado.onclick = () => {
        pantallaRepertorio.style.display = "none";
        pantallaListado.style.display = "none";
        pantallaLetra.style.display = "none";
        pantallaCategorias.style.display = "block";
        categorias.forEach(b => b.classList.remove('activo'));
        buscador.value = "";
    };
}

const btnVolverCategorias = document.getElementById("btnVolverCategorias");
if (btnVolverCategorias) {
    btnVolverCategorias.onclick = () => {
        pantallaRepertorio.style.display = "none";
        pantallaListado.style.display = "none";
        pantallaLetra.style.display = "none";
        pantallaCategorias.style.display = "block";
        categorias.forEach(b => b.classList.remove('activo'));
        buscador.value = "";
    };
}

btnTuerca.onclick = () => controlesEstilo.classList.toggle("mostrar");

function aplicarEstilos() {
    songContainer.style.fontSize = selectTamanio.value;
    songContainer.style.color = selectColor.value;
    songContainer.style.fontFamily = selectFuente.value;
}

selectTamanio.onchange = aplicarEstilos;
selectFuente.onchange = aplicarEstilos;
selectColor.onchange = aplicarEstilos;

// ================== INICIALIZAR Y PWA ==================
document.addEventListener("DOMContentLoaded", () => {
    canciones.forEach(c => { if (!c.id) c.id = c.titulo; });
    pantallaLetra.style.display = "none";
    if (pantallaRepertorio) pantallaRepertorio.style.display = "none";
    if (pantallaListado) pantallaListado.style.display = "none";
    if (pantallaCategorias) pantallaCategorias.style.display = "block";
    actualizarContadorRepertorio();

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js');
        });
    }

    if (!navigator.onLine) {
        mostrarOffline();
    }
});

function ocultarTodasLasPantallas() {
    if (pantallaCategorias) pantallaCategorias.style.display = 'none';
    if (pantallaListado) pantallaListado.style.display = 'none';
    if (pantallaRepertorio) pantallaRepertorio.style.display = 'none';
    if (pantallaLetra) pantallaLetra.style.display = 'none';
    if (pantallaOffline) pantallaOffline.style.display = 'none';
}

function mostrarOffline() {
    ocultarTodasLasPantallas();
    if (pantallaOffline) pantallaOffline.style.display = 'block';
}

function ocultarOffline() {
    if (pantallaOffline) pantallaOffline.style.display = 'none';
}

window.addEventListener('offline', () => {
    mostrarOffline();
});

window.addEventListener('online', () => {
    if (pantallaOffline) {
        ocultarOffline();
        if (pantallaCategorias) pantallaCategorias.style.display = 'block';
    }
});

if (btnReintentar) {
    btnReintentar.onclick = () => {
        if (navigator.onLine) {
            ocultarOffline();
            if (pantallaCategorias) pantallaCategorias.style.display = 'block';
        } else {
            window.location.reload();
        }
    };
}

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    let btnInstalar = document.getElementById('btnInstalarApp');
    if (!btnInstalar) {
        btnInstalar = document.createElement('button');
        btnInstalar.type = 'button';
        btnInstalar.id = 'btnInstalarApp';
        btnInstalar.className = 'btn-instalar-app';
        btnInstalar.innerHTML = '📲 Instalar App';

        btnInstalar.onclick = async (event) => {
            event.stopPropagation();
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            const choiceResult = await deferredPrompt.userChoice;
            deferredPrompt = null;
            if (choiceResult.outcome === 'accepted') {
                btnInstalar.style.display = 'none';
            }
        };

        controlesEstilo.appendChild(btnInstalar);
    }
});

// --- Lógica de la Tuerca / Configuración ---
btnTuerca.onclick = () => {
    controlesEstilo.classList.toggle("mostrar");
    if (controlesEstilo.classList.contains("mostrar") && cancionActual) {
        const yaEnRepertorio = repertorio.includes(cancionActual.id || cancionActual.titulo);
        btnAnadirRepertorioMenu.textContent = yaEnRepertorio ? "✔️ Añadido al Repertorio" : "+ Añadir al Repertorio";
        btnAnadirRepertorioMenu.onclick = (e) => {
            e.stopPropagation();
            const estaEnRepertorio = repertorio.includes(cancionActual.id || cancionActual.titulo);
            if (estaEnRepertorio) {
                eliminarDelRepertorio(cancionActual.id || cancionActual.titulo);
                btnAnadirRepertorioMenu.textContent = "+ Añadir al Repertorio";
            } else {
                anadirAlRepertorio(cancionActual.id || cancionActual.titulo);
                btnAnadirRepertorioMenu.textContent = "✔️ Añadido al Repertorio";
            }
        };
    }
};

// ESTE ES EL CÓDIGO NUEVO QUE DEBES PEGAR:
document.addEventListener("click", (e) => {
    // Si el menú está abierto y el clic NO fue en el botón ni en el menú...
    if (!btnTuerca.contains(e.target) && !controlesEstilo.contains(e.target)) {
        controlesEstilo.classList.remove("mostrar");
    }
});