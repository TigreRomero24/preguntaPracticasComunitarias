// ===============================
// APP v12 - Simulador de preguntas (con Guardado Local)
// ===============================

// --- Config y estado ---

// Materia Fija y configuración
const MATERIA_URL = 'preguntas/practicas.json';
const CANTIDAD_EXAMEN = 30; // Límite para el modo examen
const MATERIA_NOMBRE = 'practicas'; // Nuevo: Valor fijo para guardar en local

const estado = document.getElementById('estado');
const contenedor = document.getElementById('contenedor');
const timerEl = document.getElementById('timer');

const btnEmpezar = document.getElementById('btnEmpezar');
// REINTRODUCIDOS: referencias a los botones de Guardar/Cargar
const btnGuardar = document.getElementById('btnGuardar'); 
const btnCargar = document.getElementById('btnCargar'); 

// SE ELIMINÓ materiaSel. Solo usamos los selectores que quedan.
const modoSel = document.getElementById('modo');
const minutosSel = document.getElementById('minutos');

let banco = []; 
let ronda = []; 
let idx = 0;
let correctas = 0;
let respuestas = [];
let interval = null;

// --- Utils ---
function shuffle(a){ const b=a.slice(); for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [b[i],b[j]]=[b[j],b[i]];} return b; }
function sample(a,n){ return shuffle(a).slice(0, Math.min(n, a.length)); }
function fmt(seg){ const m=Math.floor(seg/60).toString().padStart(2,'0'); const s=(seg%60).toString().padStart(2,'0'); return `${m}:${s}`; }

async function cargarMateria(){
  const res = await fetch(MATERIA_URL); 
  if(!res.ok) throw new Error('No pude cargar el banco de preguntas de Practicas');
  const data = await res.json();
  if(!Array.isArray(data)) throw new Error('El JSON de preguntas debe ser un arreglo');
  return data;
}

// --- Timer, Render, Responder, Feedback, DeshabilitarOpciones y Finalizar se mantienen igual ---
// [El código de estas funciones es el mismo de tu último envío corregido, pero las omito aquí por brevedad.]

function iniciarTimer(){
  clearInterval(interval);
  let seg = parseInt(minutosSel.value,10)*60;
  if (seg <= 0){ timerEl.textContent = 'Sin tiempo'; return; }
  timerEl.textContent = fmt(seg);
  interval = setInterval(()=>{
    seg--; timerEl.textContent = fmt(seg);
    if(seg<=0){ clearInterval(interval); finalizar(true); }
  },1000);
}

function mostrarPregunta(){
  if (idx >= ronda.length) { finalizar(false); return; }
  const q = ronda[idx];

  contenedor.innerHTML = `
    <div class="card p-6 animate-fade-in">
      <div class="flex items-center gap-2 mb-4">
        <span class="pill text-sm font-semibold">📋 Pregunta ${idx+1} / ${ronda.length}</span>
      </div>

      <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-slate-100">${q.pregunta}</h2>
      ${q.imagen ? `
 <div class="flex justify-center my-6">
   <img src="${q.imagen}" alt="Imagen de la pregunta"
        class="img-pregunta">
 </div>
` : ''}

      <div id="opciones" class="space-y-3 mb-4"></div>

      <div id="feedback" class="mt-4 mb-4"></div>

      <div class="mt-6 flex flex-wrap gap-3">
        <button id="btnPrev" class="btn btn-ghost"
                ${idx===0 ? "disabled" : ""}>⬅️ Anterior</button>

        <button id="btnNext" class="btn btn-ghost">
          Siguiente ➡️
        </button>

        <button id="btnFin" class="btn btn-primary ml-auto">
          ✅ Finalizar
        </button>
      </div>
    </div>
  `;

  // Opciones con mejor estilo visual
  const wrap = document.getElementById('opciones');
  wrap.innerHTML = q.opciones.map((op,i)=>`
    <button
      class="opt"
      data-i="${i}">
      ${String.fromCharCode(65 + i)}. ${op}
    </button>
  `).join('');

  // Listeners
  wrap.querySelectorAll('.opcion').forEach(btn=>{
    btn.addEventListener('click', () => responder(parseInt(btn.dataset.i,10)));
  });
  document.getElementById('btnPrev').onclick = () => { if (idx>0) { idx--; mostrarPregunta(); } };
  document.getElementById('btnNext').onclick = () => { if (idx<ronda.length-1) { idx++; mostrarPregunta(); } else { finalizar(false); } };
  document.getElementById('btnFin').onclick  = () => finalizar(false);

  // Si ya había respuesta, refléjala
  if (respuestas[idx] != null){
    deshabilitarOpciones(q.respuesta, respuestas[idx], modoSel.value==='examen');
    if (modoSel.value==='estudio'){
      mostrarFeedback(respuestas[idx]===q.respuesta, q);
    }
  }
}

function responder(iElegido){
  const q = ronda[idx];
  // si el usuario cambia de opción en estudio, ajustamos el conteo
  if (modoSel.value === 'estudio' && respuestas[idx] !== undefined) {
    if (respuestas[idx] === q.respuesta) correctas--; // quitamos la anterior si era correcta
  }
  respuestas[idx] = iElegido;

  if (modoSel.value === 'estudio'){
    const ok = iElegido === q.respuesta;
    if (ok) correctas++;
    mostrarFeedback(ok, q);
    deshabilitarOpciones(q.respuesta, iElegido, false);
  } else {
    // examen: solo marcar la opción elegida, sin decir si es correcta
    deshabilitarOpciones(null, iElegido, true);
  }
}

function mostrarFeedback(ok, q){
  const box = document.getElementById('feedback');
  const correcta = q.opciones[q.respuesta];
  const exp = q.explicacion ? ` ${q.explicacion}` : '';
  if(ok){
    box.className = 'p-4 rounded-xl border-2 bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 text-green-800 dark:from-green-900/30 dark:to-emerald-900/30 dark:border-green-600 dark:text-green-300 font-medium shadow-md';
    box.innerHTML = '<div class="flex items-center gap-2"><span class="text-2xl">✅</span><span><strong>¡Correcto!</strong>' + exp + '</span></div>';
  }else{
    box.className = 'p-4 rounded-xl border-2 bg-gradient-to-r from-red-50 to-rose-50 border-red-300 text-red-800 dark:from-red-900/30 dark:to-rose-900/30 dark:border-red-600 dark:text-red-300 font-medium shadow-md';
    box.innerHTML = `<div class="flex items-start gap-2"><span class="text-2xl">❌</span><span><strong>Incorrecto.</strong> Respuesta correcta: <strong>"${correcta}"</strong>.` + exp + '</span></div>';
  }
}

function deshabilitarOpciones(indiceCorrecta, indiceElegida, soloMarcar){
  document.querySelectorAll('#opciones .opt').forEach((b,i)=>{
    b.disabled = true;
    // Marca visual: correcta en verde, elegida con aro indigo
    if (!soloMarcar && indiceCorrecta!=null && i===indiceCorrecta) {
      b.classList.add('ring-ok');
    }
    if (i===indiceElegida) {
      b.classList.add('ring-sel');
    }
  });
}

async function finalizar(porTiempo){
  clearInterval(interval);
  let total;

  if (modoSel.value === 'examen'){
    total = respuestas.reduce((acc, r, i)=> acc + (r===ronda[i].respuesta ? 1 : 0), 0);
  } else {
    total = correctas;
  }

  estado.textContent = (porTiempo ? '⏰ Se acabó el tiempo. ' : '🏁 Finalizado. ') + `Puntaje: ${total}/${ronda.length}`;
  contenedor.innerHTML = '';
}

// --- Botones principales ---
btnEmpezar.onclick = async () => {
  try{
    btnEmpezar.disabled = true;
    estado.textContent = 'Cargando preguntas de Practicas...';
    contenedor.innerHTML = '';
    correctas = 0; respuestas = []; idx = 0;

    banco = await cargarMateria(); 

    if (modoSel.value === 'examen') {
        ronda = sample(banco, CANTIDAD_EXAMEN);
    } else {
        ronda = shuffle(banco); 
    }

    estado.textContent = `Materia: Practicas de servicio comunitario — Preguntas seleccionadas: ${ronda.length}`;
    mostrarPregunta();
    iniciarTimer();
  }catch(e){
    estado.textContent = 'Error al iniciar el simulador: ' + e.message;
  }finally{
    btnEmpezar.disabled = false;
  }
};

// --- Guardar/Cargar progreso local (CORREGIDO) ---
const STORAGE_KEY = 'simulador_quiz_estado_v1';

btnGuardar && (btnGuardar.onclick = ()=>{
    // CORRECCIÓN: Se usa la variable MATERIA_NOMBRE fija en lugar de materiaSel.value
  const data = { materia: MATERIA_NOMBRE, modo: modoSel.value, minutos: minutosSel.value, ronda, idx, correctas, respuestas };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  alert('✅ Progreso guardado en este dispositivo.');
});

btnCargar && (btnCargar.onclick = ()=>{
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw) return alert('No hay progreso guardado.');
  try{
    const d = JSON.parse(raw);
    
    // CORRECCIÓN: No se intenta asignar a materiaSel.value ya que el elemento no existe.
    if (d.materia !== MATERIA_NOMBRE) {
        return alert(`El progreso guardado es de la materia "${d.materia}". Solo se admite "Practicas de servicio comunitario".`);
    }

    modoSel.value = d.modo; minutosSel.value = d.minutos;
    ronda = d.ronda; idx = d.idx; correctas = d.correctas; respuestas = d.respuestas || [];
    estado.textContent = `Progreso cargado. Materia: Practicas de servicio comunitario — Preguntas: ${ronda.length}`;
    mostrarPregunta(); iniciarTimer();
  }catch(e){ alert('No pude cargar el progreso. Archivo corrupto.'); }
});
