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
function mostrarListado(filtro="") {
  lista.innerHTML = "";
  canciones
    .filter(c => 
        !filtro || 
        c.categoria === filtro || 
        c.titulo.toLowerCase().includes(filtro.toLowerCase()) 
    )
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
            btnRep.title = "Clic para eliminar del repertorio";
        } else {
            btnRep.textContent = "+ Repertorio";
            btnRep.className = "btn-anadir-repertorio";
            btnRep.onclick = (e) => {
                e.stopPropagation(); 
                anadirAlRepertorio(idCancion); 
            };
            btnRep.title = "Clic para añadir al repertorio";
        }
        
        li.appendChild(tituloSpan);
        li.appendChild(btnRep);
        lista.appendChild(li);
    });

    // Oculta las demás pantallas
    pantallaLetra.style.display="none";
    pantallaRepertorio.style.display="none";
    pantallaListado.style.display="block";
    
    // Aseguramos que el botón Repertorio no esté marcado como activo cuando vemos el listado
    if(btnRepertorio) btnRepertorio.classList.remove('activo');
}

// --- Mostrar canción (MODIFICADA para saber de dónde viene) ---
function mostrarCancion(cancion, desdeRepertorio) {
  cancionActual = cancion;
  vinoDesdeRepertorio = desdeRepertorio; // Guardamos la procedencia
  tonoBase = 0;
  tituloCancion.textContent = cancion.titulo;
  renderizarLetra();
  pantallaListado.style.display="none";
  pantallaRepertorio.style.display="none"; 
  pantallaLetra.style.display="block";
}

// --- Renderizar letra con acordes posicionados (Mantenemos) ---
function renderizarLetra() {
    // ... (Tu función renderizarLetra sin cambios) ...
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

    const divLinea = document.createElement("div");
    divLinea.className = "linea";

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
    divEstrofa.appendChild(divLinea);

    return;
}
      let pos = 0;
      let buffer = "";
      let chords = [];

      // Extraemos acordes y posiciones
      for (let i = 0; i < linea.length; i++) {
        if (linea[i] === "[") {
          let j = i + 1;
          let chord = "";
          while (linea[j] && linea[j] !== "]") {
            chord += linea[j];
            j++;
          }
          chords.push({ chord: transponer(chord, tonoBase), index: pos });
          i = j; // saltar el acorde
        } else {
          buffer += linea[i];
          pos++;
        }
      }

      // Div de acordes
      const divChords = document.createElement("div");
      divChords.className = "chords";
      divChords.style.position = "absolute";
      divChords.style.top = "0";
      divChords.style.left = "0";
      divChords.style.height = "20px";

      chords.forEach(c => {
        const span = document.createElement("span");
        span.textContent = c.chord;
        span.style.position = "absolute";
        span.style.left = `${c.index}ch`; 
        divChords.appendChild(span);
      });

      // Div de letras
      const divLetras = document.createElement("div");
      divLetras.className = "letras";
      divLetras.textContent = buffer;
      divLetras.style.paddingTop = "20px";

      divLinea.appendChild(divChords);
      divLinea.appendChild(divLetras);
      divEstrofa.appendChild(divLinea);
    });

    songContainer.appendChild(divEstrofa);
  });
}


// --- Transponer acordes (Mantenemos) ---
function transponer(chord, steps) {
    const match = chord.match(/^([A-G][b#]?)(.*)$/);
    if (!match) return chord;
    
    let [ , nota, resto ] = match;

    // 1. Definir las equivalencias (Normalización a SOSTENIDOS)
    const bemolesMap = {
        'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
        'Cb': 'B', 'Fb': 'E'
    };
    let notaNormalizada = nota;
    if (nota.includes('b')) {
        notaNormalizada = bemolesMap[nota] || nota; 
    }
    if (notaNormalizada === 'B#') notaNormalizada = 'C';
    if (notaNormalizada === 'E#') notaNormalizada = 'F';

    
    // 2. Buscar el índice en el array de notas
    let i = notas.indexOf(notaNormalizada);

    if (i === -1) {
        console.warn(`Advertencia: La nota ${nota} no pudo ser reconocida.`);
        return chord;
    }
    
    // 3. Calcular la nueva posición y obtener la nueva nota
    let nueva = notas[(i + steps + 12) % 12];
    
    // 4. Devolver la nueva nota junto con el resto de la notación
    return nueva + resto;
}


// =========================================================
// == EVENTOS ==
// =========================================================

// --- Transposición y Volver ---
document.getElementById("subir").onclick = () => { 
    if (cancionActual) { tonoBase++; renderizarLetra(); }
};
document.getElementById("bajar").onclick = () => { 
    if (cancionActual) { tonoBase--; renderizarLetra(); }
};

// Evento para volver desde la PANTALLA DE LETRA
document.getElementById("btnVolver").onclick = () => {
    // Si vino del repertorio, vuelve al repertorio. Si no, vuelve al listado.
    if (vinoDesdeRepertorio) {
         renderizarRepertorio(); 
    } else {
         pantallaLetra.style.display="none";
         pantallaListado.style.display="block";
         pantallaRepertorio.style.display="none";
    }
};

document.getElementById("btnImprimir").onclick = () => window.print();

buscador.onkeyup = () => {
    // Al buscar, limpia la selección de categorías
    categorias.forEach(b => b.classList.remove('activo'));
    mostrarListado(buscador.value);
};


// --- LÓGICA DE CATEGORÍAS (CORREGIDA) ---
categorias.forEach(btn => {
    // Asignamos evento a los botones de categoría (los que tienen data-cat)
    if (btn.hasAttribute('data-cat')) {
        btn.onclick = () => {
            const categoriaFiltro = btn.dataset.cat;
            
            // 1. Manejo de clase activa
            categorias.forEach(b => b.classList.remove('activo'));
            btn.classList.add('activo');
            
            // 2. Limpiar buscador
            buscador.value = ""; 
            
            // 3. Mostrar lista filtrada
            mostrarListado(categoriaFiltro);
        };
    }
});


// 4. Evento para ir a la pantalla de Repertorio
if (btnRepertorio) {
    btnRepertorio.onclick = () => {
        // Quitamos la clase 'activo' de las categorías al ir al repertorio
        categorias.forEach(b => b.classList.remove('activo'));
        btnRepertorio.classList.add('activo'); // Marca el botón Repertorio
        renderizarRepertorio();
    };
}

// 5. Evento para volver al listado desde la pantalla de Repertorio
if (btnVolverListado) {
    btnVolverListado.onclick = () => {
        // Muestra el listado general (sin filtro)
        categorias.forEach(b => b.classList.remove('activo'));
        mostrarListado(""); 
    };
}

// --- Tuerca flotante y Estilos ---
btnTuerca.addEventListener("click", () => {
  controlesEstilo.classList.toggle("mostrar");
});

function aplicarEstilos() {
  songContainer.style.fontSize = selectTamanio.value;
  songContainer.style.color = selectColor.value;
  songContainer.style.fontFamily = selectFuente.value;
}

selectTamanio.onchange = aplicarEstilos;
selectFuente.onchange = aplicarEstilos;
selectColor.onchange = aplicarEstilos;


// --- Inicializar ---
document.addEventListener("DOMContentLoaded", () => {
    // Aseguramos que todas las canciones tengan un 'id' si no lo tienen
    canciones.forEach(c => { if (!c.id) c.id = c.titulo; }); 

    // Ocultamos todas las pantallas excepto el listado inicial
    pantallaLetra.style.display="none";
    if(pantallaRepertorio) pantallaRepertorio.style.display="none"; 

    // Inicializar el contador del repertorio
    actualizarContadorRepertorio();
    
    // Muestra el listado inicial.
    mostrarListado(); 
// ================== PWA ==================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('SW registrado:', reg.scope))
            .catch(err => console.error('Error SW:', err));
    });
}
});
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    const btn = document.createElement('button');
    btn.innerHTML = "📲 Instalar App";
    
    btn.style.position = "fixed";
    btn.style.bottom = "90px";
    btn.style.right = "20px";
    btn.style.background = "#0d6efd";
    btn.style.color = "#fff";
    btn.style.border = "none";
    btn.style.padding = "12px 18px";
    btn.style.borderRadius = "25px";
    btn.style.boxShadow = "0 4px 10px rgba(0,0,0,0.3)";
    btn.style.cursor = "pointer";
    btn.style.fontSize = "14px";
    btn.style.zIndex = "1000";

    document.body.appendChild(btn);

    btn.onclick = async () => {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('Instalación:', outcome);
        deferredPrompt = null;
        btn.remove();
    };
});