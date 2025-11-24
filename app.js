// ===============================
// APP v12 - Simulador de preguntas (con Guardado Local)
// ===============================

// --- Config y estado ---

// Materia Fija y configuración
const MATERIA_URL = 'preguntas/practicas.json';
const CANTIDAD_EXAMEN = 30;
const MATERIA_NOMBRE = 'practicas';

const estado = document.getElementById('estado');
const contenedor = document.getElementById('contenedor');
const timerEl = document.getElementById('timer');

const btnEmpezar = document.getElementById('btnEmpezar');
const btnGuardar = document.getElementById('btnGuardar'); 
const btnCargar = document.getElementById('btnCargar'); 

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
  if(!res.ok) throw new Error('No pude cargar el banco de preguntas de Practicas de servicio comunitario');
  const data = await res.json();
  if(!Array.isArray(data)) throw new Error('El JSON de preguntas debe ser un arreglo');
  return data;
}

// --- Lógica y Render ---

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
    <div class="space-y-4 animate-fade-in">
      <!-- Caja de la pregunta -->
      <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
        <div class="flex items-center gap-2 mb-3">
          <span class="pill text-sm font-semibold">📋 Pregunta ${idx+1} / ${ronda.length}</span>
        </div>
        <h2 class="text-xl font-bold text-gray-800">${q.pregunta}</h2>
        ${q.imagen ? `
        <div class="flex justify-center mt-4">
          <img src="${q.imagen}" alt="Imagen de la pregunta"
                class="img-pregunta">
        </div>
        ` : ''}
      </div>

      <!-- Opciones - cada una en su propia caja -->
      <div id="opciones" class="space-y-3"></div>

      <!-- Feedback -->
      <div id="feedback" class="mt-4"></div>

      <!-- Botones de navegación -->
      <div class="bg-white rounded-xl shadow-lg p-4 border-2 border-gray-200 flex flex-wrap gap-3">
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

  const wrap = document.getElementById('opciones');
  wrap.innerHTML = q.opciones.map((op,i)=>`
    <button
      class="w-full bg-white rounded-xl shadow-md p-4 text-left border-2 border-gray-200 hover:border-indigo-400 hover:shadow-lg transition-all duration-200 text-gray-800 dark:text-slate-900 font-medium"
      data-i="${i}">
      <span class="font-bold text-indigo-600 mr-2">${String.fromCharCode(65 + i)}.</span>
      ${op}
    </button>
  `).join('');

  wrap.querySelectorAll('button').forEach(btn=>{
    btn.addEventListener('click', () => responder(parseInt(btn.dataset.i,10)));
  });
  document.getElementById('btnPrev').onclick = () => { if (idx>0) { idx--; mostrarPregunta(); } };
  document.getElementById('btnNext').onclick = () => { if (idx<ronda.length-1) { idx++; mostrarPregunta(); } else { finalizar(false); } };
  document.getElementById('btnFin').onclick  = () => finalizar(false);

  // Si ya había respuesta, mostrar feedback y deshabilitar opciones
  if (respuestas[idx] != null){
    const ok = respuestas[idx] === q.respuesta;
    mostrarFeedback(ok, q);
    deshabilitarOpciones(q.respuesta, respuestas[idx], false);
  }
}

function responder(iElegido){
  const q = ronda[idx];

  // Si ya había una respuesta previa, ajustar el conteo
  if (respuestas[idx] !== undefined && respuestas[idx] === q.respuesta) {
    correctas--;
  }

  respuestas[idx] = iElegido;

  // SIEMPRE mostrar feedback inmediatamente (tanto en examen como estudio)
  const ok = iElegido === q.respuesta;
  if (ok) correctas++;
  
  // Mostrar feedback inmediatamente
  mostrarFeedback(ok, q);
  
  // Deshabilitar opciones y mostrar la respuesta correcta
  deshabilitarOpciones(q.respuesta, iElegido, false);
}

function mostrarFeedback(ok, q){
  const box = document.getElementById('feedback');
  const correcta = q.opciones[q.respuesta];
  const exp = q.explicacion ? ` ${q.explicacion}` : '';
  
  if(ok){
    box.className = 'p-4 rounded-xl border-2 bg-gradient-to-r from-green-100 to-emerald-100 border-green-300 text-green-800 dark:bg-green-900/40 dark:border-green-400 dark:text-green-200 font-medium shadow-md';
    box.innerHTML = `<div class="flex items-center gap-2"><span class="text-2xl">✅</span><span><strong>¡Correcto!</strong> ${exp}</span></div>`;
  }else{
    box.className = 'p-4 rounded-xl border-2 bg-gradient-to-r from-red-100 to-rose-100 border-red-300 text-red-800 dark:bg-red-900/40 dark:border-red-400 dark:text-red-200 font-medium shadow-md';
    box.innerHTML = `<div class="flex items-start gap-2"><span class="text-2xl">❌</span><span><strong>Incorrecto.</strong> Respuesta correcta: <strong>"${correcta}"</strong>. ${exp}</span></div>`;
  }
}




function deshabilitarOpciones(indiceCorrecta, indiceElegida, soloMarcar){
  document.querySelectorAll('#opciones button').forEach((b,i)=>{
    b.disabled = true;
    b.classList.add('cursor-not-allowed', 'opacity-90');
    
    // Marca visual: correcta en verde, elegida con aro indigo
    if (!soloMarcar && indiceCorrecta!=null && i===indiceCorrecta) {
      b.classList.remove('border-gray-200', 'bg-white');
      b.classList.add('border-green-500', 'bg-green-50', 'ring-4', 'ring-green-300');
    }
    if (i===indiceElegida) {
      if (i !== indiceCorrecta) {
        b.classList.remove('border-gray-200', 'bg-white');
        b.classList.add('border-red-500', 'bg-red-50', 'ring-4', 'ring-red-300');
      } else {
        b.classList.add('ring-4', 'ring-green-300');
      }
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

btnEmpezar.onclick = async () => {
  try{
    btnEmpezar.disabled = true;
    estado.textContent = 'Cargando preguntas de Practicas de servicio comunitario...';
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

const STORAGE_KEY = 'simulador_quiz_estado_v1';

btnGuardar && (btnGuardar.onclick = ()=>{
  const data = { materia: MATERIA_NOMBRE, modo: modoSel.value, minutos: minutosSel.value, ronda, idx, correctas, respuestas };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  alert('✅ Progreso guardado en este dispositivo.');
});

btnCargar && (btnCargar.onclick = ()=>{
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw) return alert('No hay progreso guardado.');
  try{
    const d = JSON.parse(raw);

    if (d.materia !== MATERIA_NOMBRE) {
        return alert(`El progreso guardado es de la materia "${d.materia}". Solo se admite "Practicas de servicio comunitario".`);
    }

    modoSel.value = d.modo; minutosSel.value = d.minutos;
    ronda = d.ronda; idx = d.idx; correctas = d.correctas; respuestas = d.respuestas || [];
    estado.textContent = `Progreso cargado. Materia: Practicas de servicio comunitario — Preguntas: ${ronda.length}`;
    mostrarPregunta(); iniciarTimer();
  }catch(e){ alert('No pude cargar el progreso. Archivo corrupto.'); }
});