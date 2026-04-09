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
const categorias = document.querySelectorAll("#categorias button"); // Selecciona todos los botones
const pantallaListado = document.getElementById("pantallaListado");
const pantallaLetra = document.getElementById("pantallaLetra");

// ¡NUEVOS ELEMENTOS DEL REPERTORIO!
const btnRepertorio = document.getElementById("btnRepertorio");
const pantallaRepertorio = document.getElementById("pantallaRepertorio");
const listaRepertorio = document.getElementById("listaRepertorio");
const btnVolverListado = document.getElementById("btnVolverListado");
const contadorRepertorio = document.getElementById("contadorRepertorio");

const tituloCancion = document.getElementById("tituloCancion");
const songContainer = document.getElementById("song-container");

// Controles de estilo
const selectTamanio = document.getElementById("selectTamanio");
const selectFuente = document.getElementById("selectFuente");
const selectColor = document.getElementById("selectColor");
const btnTuerca = document.getElementById("btnTuerca");
const controlesEstilo = document.getElementById("controles-estilo");


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

        li.appendChild(tituloSpan);
        li.appendChild(btnEliminar);
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

function mostrarListado(filtro = "") {
    lista.innerHTML = "";

    if (!filtro && buscador.value.trim() === "") {
        lista.innerHTML = `
            <li class="lista-vacia">
                <i class="fa-solid fa-music"></i>
                <span>Selecciona una categoría para ver los coros</span>
            </li>`;
        return;
    }

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

            const btnRep = document.createElement("button");
            const yaEnRepertorio = repertorio.includes(idCancion);

            if (yaEnRepertorio) {
                btnRep.textContent = "✔️ Añadido";
                btnRep.className = "btn-anadir-repertorio activo";
                btnRep.onclick = (e) => {
                    e.stopPropagation();
                    eliminarDelRepertorio(idCancion);
                };
            } else {
                btnRep.textContent = "+ Repertorio";
                btnRep.className = "btn-anadir-repertorio";
                btnRep.onclick = (e) => {
                    e.stopPropagation();
                    anadirAlRepertorio(idCancion);
                };
            }

            li.appendChild(tituloSpan);
            li.appendChild(btnRep);
            lista.appendChild(li);
        });

    pantallaLetra.style.display = "none";
    pantallaRepertorio.style.display = "none";
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

buscador.onkeyup = () => {
    categorias.forEach(b => b.classList.remove('activo'));
    mostrarListado(buscador.value);
};

categorias.forEach(btn => {
    if (btn.hasAttribute('data-cat')) {
        btn.onclick = () => {
            const categoriaFiltro = btn.dataset.cat;
            categorias.forEach(b => b.classList.remove('activo'));
            btn.classList.add('activo');
            buscador.value = "";
            mostrarListado(categoriaFiltro);
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
        pantallaLetra.style.display = "none";
        renderizarRepertorio();
    };
}

if (btnVolverListado) {
    btnVolverListado.onclick = () => {

        // CAMBIO DE PANTALLA: Volvemos a las categorías
        pantallaRepertorio.style.display = "none";
        pantallaListado.style.display = "block";
        pantallaLetra.style.display = "none";
        categorias.forEach(b => b.classList.remove('activo'));
        mostrarListado("");
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
    actualizarContadorRepertorio();
    mostrarListado("");

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js');
        });
    }
});

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const btn = document.createElement('button');
    btn.innerHTML = "📲 Instalar App";
    Object.assign(btn.style, {
        position: "fixed", bottom: "90px", right: "20px", background: "#0d6efd",
        color: "#fff", border: "none", padding: "12px 18px", borderRadius: "25px",
        zIndex: "1000", cursor: "pointer"
    });
    document.body.appendChild(btn);
    btn.onclick = async () => {
        deferredPrompt.prompt();
        deferredPrompt = null;
        btn.remove();
    };
});