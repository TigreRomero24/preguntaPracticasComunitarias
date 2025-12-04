import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// --- 1. CONFIGURACIÓN (PROYECTO: autenticacion-8faac) ---
const firebaseConfig = {
  apiKey: "AIzaSyAs_LBouq2njfy0cJHJjuiUfASC3RqVKkM",
  authDomain: "practicas-comunitario.firebaseapp.com",
  projectId: "practicas-comunitario",
  storageBucket: "practicas-comunitario.firebasestorage.app",
  messagingSenderId: "874017448238",
  appId: "1:874017448238:web:03928054e98441838d1abf"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- 2. LISTA DE CORREOS AUTORIZADOS Y DIFERENCIADOS ---

// Correo que tendrán límite de 2 dispositivos
const correosDosDispositivos = [
    "dpachecog2@unemi.edu.ec", "htigrer@unemi.edu.ec", "sgavilanezp2@unemi.edu.ec", 
    "jzamoram9@unemi.edu.ec", "fcarrillop@unemi.edu.ec", "naguilarb@unemi.edu.ec", 
    "kholguinb2@unemi.edu.ec"
];

// Correos que tendrán límite de 1 dispositivo
const correosUnDispositivo = [
    "cnavarretem4@unemi.edu.ec", "gorellanas2@unemi.edu.ec", "ehidalgoc4@unemi.edu.ec", 
    "lbrionesg3@unemi.edu.ec", "xsalvadorv@unemi.edu.ec", "nbravop4@unemi.edu.ec", 
    "jmoreirap6@unemi.edu.ec", "jcastrof8@unemi.edu.ec"
];

// Unimos las listas para la validación de acceso inicial
const correosPermitidos = [
    ...correosDosDispositivos, 
    ...correosUnDispositivo
];

// --- 3. BANCO DE PREGUNTAS CORREGIDO (64 PREGUNTAS) ---
const bancoPreguntas = [
    { texto: "¿Por qué es importante considerar las habilidades y fortalezas personales al analizar la situación respecto a las prácticas preprofesionales?", opciones: ["Para destacar la falta de competencia.", "Para determinar el nivel de amistad con los colegas.", "Para identificar áreas de mejora y posibles contribuciones al equipo.", "Para reducir la necesidad de comunicación con el supervisor."], respuesta: 2, explicacion: "Considerar las habilidades y fortalezas personales permite identificar áreas donde se puede mejorar y cómo se puede contribuir efectivamente al equipo de trabajo." },
    { texto: "¿Qué aspecto debe considerarse al analizar la cultura organizacional durante las prácticas preprofesionales?", opciones: ["El tamaño del edificio de la empresa.", "El número de empleados en la organización.", "Los valores, normas y prácticas compartidas dentro de la empresa.", "La cantidad de tiempo dedicado al trabajo diario."], respuesta: 2, explicacion: "La cultura organizacional se define por los valores, normas y prácticas compartidas dentro de la empresa, elementos fundamentales para comprender el entorno laboral." },
    { texto: "¿Cuál de los siguientes NO es un elemento del servicio comunitario?", opciones: ["Voluntariado", "Responsabilidad social", "Solidaridad", "Competencia individual"], respuesta: 3, explicacion: "La competencia individual no es un elemento del servicio comunitario, ya que este se basa en la colaboración, solidaridad y trabajo conjunto para el beneficio de la comunidad." },
    { texto: "¿Qué aspecto es fundamental al analizar una situación respecto a las prácticas preprofesionales?", opciones: ["Experiencia laboral previa.", "Conocimiento teórico profundo.", "Comprensión del entorno laboral y las expectativas del empleador.", "Habilidades de comunicación escrita."], respuesta: 2, explicacion: "La comprensión del entorno laboral y las expectativas del empleador es fundamental para adaptarse adecuadamente y cumplir con los objetivos de las prácticas preprofesionales." },
    { texto: "¿Qué significa el elemento de responsabilidad social en el servicio comunitario?", opciones: ["El reconocimiento de las diferencias individuales dentro de la comunidad", "La promoción de la colaboración entre empresas y organizaciones comunitarias.", "El compromiso de los individuos y grupos con el bienestar de la comunidad en su conjunto", "La búsqueda de beneficios personales sin considerar el impacto en la comunidad."], respuesta: 2, explicacion: "La responsabilidad social implica el compromiso genuino de individuos y grupos con el bienestar colectivo de la comunidad." },
    { texto: "¿Cuál de los siguientes NO es un ejemplo de responsabilidad social en el servicio comunitario?", opciones: ["Donar alimentos a un banco de alimentos local", "Participar en actividades de limpieza en el vecindario", "Ofrecer tutorías gratuitas a estudiantes de bajos recursos.", "Ignorar las necesidades de la comunidad"], respuesta: 3, explicacion: "Ignorar las necesidades comunitarias contradice el concepto de responsabilidad social en el servicio comunitario." },
    { texto: "¿Cuál es una razón para incluir disposiciones sobre igualdad de oportunidades en el reglamento de prácticas preprofesionales?", opciones: ["Fomentar la discriminación y el favoritismo.", "Garantizar que todos los estudiantes tengan acceso equitativo a oportunidades de prácticas.", "Reducir la diversidad en el lugar de trabajo.", "Aumentar la competencia entre los estudiantes."], respuesta: 1, explicacion: "Las disposiciones sobre igualdad de oportunidades aseguran que todos los estudiantes tengan acceso justo y equitativo a las oportunidades de prácticas preprofesionales." },
    { texto: "¿Qué tipo de actividades fomentan la educación en la comunidad?", opciones: ["Organizar competencias de videojuegos", "Ofrecer tutorías académicas gratuitas", "Realizar conciertos musicales", "Diseñar murales artísticos en edificios públicos"], respuesta: 1, explicacion: "Ofrecer tutorías académicas gratuitas es una actividad directamente orientada a fomentar la educación en la comunidad." },
    { texto: "¿Qué aspecto debe considerarse al revisar el reglamento de prácticas preprofesionales en relación con las responsabilidades de los estudiantes?", opciones: ["Aumentar las horas de prácticas requeridas.", "Reducir la supervisión del personal docente.", "Clarificar las expectativas y obligaciones de los estudiantes durante las prácticas.", "Eliminar por completo las evaluaciones de desempeño."], respuesta: 2, explicacion: "Es fundamental clarificar las expectativas y obligaciones de los estudiantes para que comprendan sus responsabilidades durante las prácticas." },
    { texto: "¿Qué etapa del desarrollo comunitario implica la ejecución de actividades y programas diseñados previamente?", opciones: ["Evaluación de resultados", "Implementación de programas", "Evaluación de impacto", "Diagnóstico comunitario"], respuesta: 1, explicacion: "La implementación de programas es la etapa donde se ejecutan las actividades y programas que fueron planificados anteriormente." },
    { texto: "¿Cuál de los siguientes ejemplos representa una debilidad en el análisis FODA en el campo laboral?", opciones: ["Tener habilidades de comunicación efectivas", "Falta de experiencia en una determinada área", "Acceso a nuevas oportunidades de desarrollo profesional", "Reconocimiento de la marca en el mercado laboral"], respuesta: 1, explicacion: "La falta de experiencia en un área específica es una debilidad interna que puede limitar el desempeño laboral." },
    { texto: "¿Por qué es importante evaluar la cultura organizacional durante el diagnóstico situacional?", opciones: ["Para mantener el status quo.", "Para ignorar las necesidades del personal.", "Para comprender las normas, valores y prácticas compartidas dentro de la organización.", "Para minimizar el compromiso del equipo."], respuesta: 2, explicacion: "Evaluar la cultura organizacional permite comprender las normas, valores y prácticas que rigen el funcionamiento de la organización." },
    { texto: "¿Cuál es uno de los beneficios de una delimitación clara del campo de acción?", opciones: ["Aumentar la confusión sobre las responsabilidades del estudiante", "Reducir la efectividad de las prácticas preprofesionales", "Facilitar la evaluación del desempeño y el progreso del estudiante", "Minimizar la comunicación con el personal docente"], respuesta: 2, explicacion: "Una delimitación clara del campo de acción facilita la evaluación del desempeño al establecer objetivos y responsabilidades específicas." },
    { texto: "¿Cuál es un beneficio de actualizar el reglamento de prácticas preprofesionales según los avances tecnológicos?", opciones: ["Aumentar la brecha digital entre estudiantes.", "Facilitar el acceso a recursos y herramientas digitales relevantes.", "Ignorar completamente las tendencias tecnológicas.", "Aumentar la complejidad y la confusión del reglamento."], respuesta: 1, explicacion: "Actualizar el reglamento según avances tecnológicos facilita el acceso a recursos digitales modernos y relevantes para la formación." },
    { texto: "¿Qué papel juega la investigación sobre la empresa o la organización antes de comenzar las prácticas preprofesionales?", opciones: ["No es necesario realizar ninguna investigación previa.", "Proporciona información valiosa sobre la misión, visión y valores de la empresa.", "Reduce la necesidad de adaptación al entorno laboral.", "Aumenta el aislamiento social en el lugar de trabajo."], respuesta: 1, explicacion: "La investigación previa proporciona información importante sobre la misión, visión y valores de la empresa, facilitando la adaptación al entorno laboral." },
    { texto: "¿Cuál es el propósito principal de revisar el reglamento de prácticas preprofesionales?", opciones: ["Cumplir con un requisito burocrático.", "Adaptar las normativas a las necesidades y cambios actuales.", "Reducir la carga de trabajo del personal administrativo.", "Ignorar las sugerencias de los estudiantes."], respuesta: 1, explicacion: "El propósito principal es adaptar las normativas a las necesidades actuales y cambios del contexto educativo y laboral." },
    { texto: "¿Por qué es importante que los estudiantes participen en el proceso de revisión del reglamento de prácticas preprofesionales?", opciones: ["Para aumentar la carga de trabajo del personal administrativo.", "Para garantizar que las normativas reflejen las necesidades y preocupaciones de los estudiantes.", "Para evitar cualquier cambio en las normativas existentes.", "Para disminuir la transparencia en el proceso."], respuesta: 1, explicacion: "La participación estudiantil garantiza que las normativas reflejen sus necesidades reales y preocupaciones legítimas." },
    { texto: "¿Cuál es uno de los beneficios de identificar las fortalezas y debilidades del área durante el diagnóstico situacional?", opciones: ["Limitar el crecimiento organizacional.", "Minimizar la comunicación con el personal.", "Facilitar la identificación de oportunidades de mejora y crecimiento.", "Incrementar la desconexión entre los equipos de trabajo."], respuesta: 2, explicacion: "Identificar fortalezas y debilidades facilita encontrar oportunidades de mejora y áreas de crecimiento organizacional." },
    { texto: "¿Qué información se busca al realizar un diagnóstico situacional del área donde se realizarán las prácticas preprofesionales?", opciones: ["Datos irrelevantes para el proceso de aprendizaje.", "Información detallada sobre la vida personal de los empleados.", "Contexto laboral, necesidades y desafíos específicos del área.", "Tendencias de entretenimiento en la región."], respuesta: 2, explicacion: "El diagnóstico situacional busca información sobre el contexto laboral, las necesidades específicas y los desafíos del área de prácticas." },
    { texto: "¿Qué tipo de factores son considerados amenazas en el análisis FODA en el campo laboral?", opciones: ["Capacitación continua ofrecida por la empresa", "Competencia agresiva en el mercado", "Altos niveles de satisfacción del cliente", "Colaboración efectiva entre los equipos de trabajo"], respuesta: 1, explicacion: "La competencia agresiva en el mercado es un factor externo negativo que representa una amenaza para la organización." },
    { texto: "¿Qué implica el elemento de solidaridad en el servicio comunitario?", opciones: ["La competencia entre individuos por recursos limitados.", "El apoyo mutuo y la cooperación entre miembros de la comunidad.", "La exclusión de ciertos grupos de la sociedad.", "La búsqueda de beneficios individuales sin considerar las necesidades de los demás"], respuesta: 1, explicacion: "La solidaridad implica el apoyo mutuo y la cooperación entre los miembros de la comunidad para alcanzar objetivos comunes." },
    { texto: "¿Cuál de las siguientes habilidades es fundamental para trabajar en equipo durante el servicio comunitario?", opciones: ["Liderazgo", "Comunicación", "Competitividad", "Individualismo"], respuesta: 1, explicacion: "La comunicación es fundamental para trabajar en equipo, permitiendo la coordinación efectiva y el intercambio de ideas." },
    { texto: "¿En qué etapa del desarrollo comunitario se identifican las necesidades, recursos y potencialidades de la comunidad?", opciones: ["Evaluación de impacto", "Implementación de programas", "Diagnóstico comunitario", "Evaluación de resultados"], respuesta: 2, explicacion: "El diagnóstico comunitario es la etapa inicial donde se identifican necesidades, recursos disponibles y potencialidades de la comunidad." },
    { texto: "¿Cuál es el propósito de la evaluación en un proyecto comunitario?", opciones: ["Gastar tiempo innecesario.", "Determinar qué tan bien se alcanzaron los objetivos", "Ignorar los resultados obtenidos.", "No tiene ningún propósito"], respuesta: 1, explicacion: "La evaluación permite determinar el grado de cumplimiento de los objetivos y la efectividad del proyecto comunitario." },
    { texto: "¿Cuál de las siguientes actividades promueve la inclusión y la diversidad en la comunidad?", opciones: ["Organizar eventos exclusivos para un grupo étnico particular", "Realizar actividades de intercambio cultural", "Crear barreras arquitectónicas en espacios públicos", "Promover la discriminación y el racismo"], respuesta: 1, explicacion: "Las actividades de intercambio cultural promueven la inclusión al facilitar el conocimiento y respeto entre diferentes grupos culturales." },
    { texto: "¿Qué implica el elemento de voluntariado en el servicio comunitario?", opciones: ["La participación activa de la comunidad en actividades recreativas", "La contribución desinteresada de tiempo y esfuerzo para el beneficio de la comunidad.", "La promoción de la competencia individual para lograr objetivos personales.", "La búsqueda de beneficios económicos para los participantes"], respuesta: 1, explicacion: "El voluntariado implica la contribución desinteresada de tiempo y esfuerzo para beneficiar a la comunidad sin expectativa de retribución económica." },
    { texto: "¿Cómo está estructurado típicamente un proyecto comunitario?", opciones: ["Con una única actividad planificada", "Sin planificación previa", "Con múltiples actividades organizadas en fases o etapas", "Con una evaluación exclusiva al final del proyecto"], respuesta: 2, explicacion: "Un proyecto comunitario típicamente se estructura en múltiples actividades organizadas en fases o etapas secuenciales." },
    { texto: "¿Qué tipo de actividades contribuyen al desarrollo sostenible de la comunidad?", opciones: ["Usar productos desechables en lugar de reutilizables", "Plantar árboles y crear jardines comunitarios", "Promover el consumo excesivo de recursos naturales", "Ignorar los problemas ambientales locales"], respuesta: 1, explicacion: "Plantar árboles y crear jardines comunitarios son actividades que promueven el desarrollo sostenible al mejorar el medio ambiente local." },
    { texto: "¿Qué representa la sigla 'FODA' en el contexto del análisis laboral?", opciones: ["Fortalezas, Obligaciones, Desafíos, Amenazas", "Funciones, Objetivos, Decisiones, Acciones", "Factores, Oportunidades, Desventajas, Avances", "Fortalezas, Oportunidades, Debilidades, Amenazas"], respuesta: 3, explicacion: "FODA significa Fortalezas, Oportunidades, Debilidades y Amenazas, herramienta de análisis estratégico." },
    { texto: "¿Qué aspecto debe considerarse al evaluar las oportunidades laborales en un área de especialidad de interés?", opciones: ["El salario inicial más alto disponible.", "La demanda actual y futura de profesionales en ese campo.", "La ubicación geográfica de las empresas relacionadas.", "La preferencia personal de trabajar solo en proyectos independientes."], respuesta: 1, explicacion: "La demanda actual y futura de profesionales es crucial para evaluar las oportunidades laborales y la estabilidad en un área de especialidad." },
    { texto: "¿Qué habilidad es crucial para entender y abordar las necesidades de la comunidad durante el servicio comunitario?", opciones: ["Empatía", "Competitividad", "Individualismo", "Apatía"], respuesta: 0, explicacion: "La empatía es crucial para comprender las necesidades reales de la comunidad y abordarlas de manera efectiva." },
    { texto: "¿Qué es el servicio comunitario?", opciones: ["Un programa de televisión popular", "Una actividad voluntaria que beneficia a la comunidad", "Un tipo de deporte extremo", "Una forma de entretenimiento en línea"], respuesta: 1, explicacion: "El servicio comunitario es una actividad voluntaria orientada a beneficiar a la comunidad y mejorar la calidad de vida de sus miembros." },
    { texto: "¿Cuál de los siguientes ejemplos representa una fortaleza en el análisis FODA en el campo laboral?", opciones: ["Falta de diversidad en el equipo de trabajo", "Localización inadecuada de la oficina", "Alta reputación de la empresa en el sector", "Falta de acceso a recursos financieros"], respuesta: 2, explicacion: "La alta reputación de la empresa en el sector es una fortaleza interna que proporciona ventajas competitivas." },
    { texto: "¿Qué se puede incluir en la delimitación del campo de acción además de las tareas específicas a realizar?", opciones: ["Lista de películas para ver durante el horario laboral", "Horario flexible sin responsabilidades específicas", "Objetivos de aprendizaje y desarrollo profesional", "Acceso ilimitado a redes sociales en el lugar de trabajo"], respuesta: 2, explicacion: "Los objetivos de aprendizaje y desarrollo profesional son componentes importantes de la delimitación del campo de acción en las prácticas." },
    { texto: "¿Cuál de las siguientes NO es una etapa típica del desarrollo comunitario?", opciones: ["Diagnóstico comunitario", "Implementación de programas", "Evaluación de impacto", "Desarrollo individual"], respuesta: 3, explicacion: "El desarrollo individual no es una etapa del desarrollo comunitario, que se enfoca en el bienestar colectivo de la comunidad." },
    { texto: "¿Cuál es uno de los beneficios de realizar un análisis de la situación antes de comenzar las prácticas preprofesionales?", opciones: ["Reducción de la carga de trabajo.", "Mayor claridad sobre las responsabilidades y expectativas.", "Limitación del aprendizaje en el entorno laboral.", "Menor necesidad de comunicación con el supervisor."], respuesta: 1, explicacion: "El análisis situacional proporciona mayor claridad sobre las responsabilidades y expectativas de las prácticas preprofesionales." },
    { texto: "¿Cuáles son algunas partes del servicio comunitario?", opciones: ["Planificación, ejecución y evaluación", "Lectura, escritura y matemáticas", "Almuerzo, cena y merienda", "Deportes, música y arte"], respuesta: 0, explicacion: "Las partes fundamentales del servicio comunitario son la planificación, ejecución y evaluación de las actividades." },
    { texto: "¿Cuál es uno de los beneficios de establecer metas y objetivos claros al analizar un área de especialidad de interés?", opciones: ["Limitar el crecimiento personal y profesional.", "Perder de vista la dirección deseada.", "Mantener el enfoque y la motivación durante el proceso.", "Evitar la planificación a largo plazo."], respuesta: 2, explicacion: "Establecer metas y objetivos claros ayuda a mantener el enfoque y la motivación durante todo el proceso de especialización." },
    { texto: "¿Por qué es importante delimitar el campo de acción antes de iniciar las prácticas preprofesionales?", opciones: ["Para aumentar la confusión y la incertidumbre", "Para evitar cualquier tipo de aprendizaje", "Para garantizar que el estudiante comprenda sus responsabilidades y objetivos.", "Para disminuir la colaboración con el equipo de trabajo"], respuesta: 2, explicacion: "Delimitar el campo de acción garantiza que el estudiante comprenda claramente sus responsabilidades y objetivos de aprendizaje." },
    { texto: "¿Cuál es el propósito principal de la etapa de planificación en el desarrollo comunitario?", opciones: ["Establecer metas y objetivos claros para el proyecto", "Evaluar el impacto de las acciones implementadas", "Identificar las necesidades y recursos de la comunidad", "Realizar estudios y análisis para diagnosticar la situación comunitaria"], respuesta: 0, explicacion: "La planificación tiene como propósito principal establecer metas y objetivos claros que guíen la ejecución del proyecto comunitario." },
    { texto: "¿Qué se entiende por delimitación del campo de acción en el contexto de las prácticas preprofesionales?", opciones: ["Limitar el número de horas de trabajo por día.", "Establecer claramente las tareas y responsabilidades del estudiante en el lugar de prácticas.", "Reducir la supervisión por parte del personal docente", "Ignorar las políticas y procedimientos de la empresa"], respuesta: 1, explicacion: "La delimitación del campo de acción implica establecer claramente las tareas y responsabilidades específicas del estudiante." },
    { texto: "¿En qué etapa del desarrollo comunitario se evalúa el éxito o fracaso de las acciones implementadas?", opciones: ["Diagnóstico comunitario", "Evaluación de resultados", "Evaluación de impacto", "Implementación de programas"], respuesta: 1, explicacion: "La evaluación de resultados es la etapa donde se mide el éxito o fracaso de las acciones implementadas en el proyecto." },
    { texto: "¿Qué papel desempeña la planificación en el servicio comunitario?", opciones: ["No tiene ningún papel", "Es importante para organizar las actividades y recursos", "Es opcional y no necesaria", "Solo se usa para documentación"], respuesta: 1, explicacion: "La planificación es fundamental para organizar eficientemente las actividades y recursos del servicio comunitario." },
    { texto: "¿Qué aspecto debe considerarse al delimitar el campo de acción en un entorno laboral específico?", opciones: ["Ignorar por completo las políticas de la empresa", "Adaptarse únicamente a las preferencias del estudiante", "Cumplir con las normativas y procedimientos de la empresa", "Limitar la comunicación con el supervisor"], respuesta: 2, explicacion: "Es fundamental cumplir con las normativas y procedimientos establecidos por la empresa al delimitar el campo de acción." },
    { texto: "¿Por qué es importante considerar las tendencias y desarrollos actuales en el área de especialidad de interés?", opciones: ["Para evitar la innovación y el cambio.", "Para mantenerse actualizado y relevante en el campo.", "Para limitar el alcance de la exploración.", "Para enfocarse únicamente en métodos tradicionales."], respuesta: 1, explicacion: "Considerar las tendencias actuales permite mantenerse actualizado y relevante en el campo profesional elegido." },
    { texto: "¿Cuál es uno de los pasos clave en el análisis del área de especialidad de interés?", opciones: ["Ignorar la investigación previa.", "Limitar la exploración a una sola fuente de información.", "Investigar y recopilar información relevante sobre el área de interés.", "Dejar de lado la reflexión personal."], respuesta: 2, explicacion: "Investigar y recopilar información relevante es un paso clave para comprender profundamente el área de especialidad de interés." },
    { texto: "¿Por qué es importante realizar un análisis de fortalezas y debilidades personales al explorar un área de especialidad?", opciones: ["Para ignorar los aspectos negativos de la propia habilidad.", "Para destacar solo las habilidades existentes.", "Para identificar oportunidades de desarrollo y áreas para mejorar.", "Para minimizar la autoconciencia y la autocrítica."], respuesta: 2, explicacion: "El análisis de fortalezas y debilidades permite identificar áreas de desarrollo y oportunidades de mejora profesional." },
    { texto: "¿Qué tipo de factores incluirías en la sección 'Oportunidades' del análisis FODA en el campo laboral?", opciones: ["Tecnología obsoleta", "Cambios en la regulación laboral", "Aumento de la demanda del producto o servicio ofrecido por la empresa", "Escasez de talento en la industria"], respuesta: 2, explicacion: "El aumento de la demanda de productos o servicios representa una oportunidad externa positiva para la empresa." },
    { texto: "¿Qué aspecto es fundamental al realizar un diagnóstico situacional de la entidad donde se realizarán las prácticas preprofesionales?", opciones: ["Ignorar la cultura organizacional.", "Evaluar únicamente las áreas de mejora.", "Analizar tanto los puntos fuertes como las áreas de oportunidad.", "Limitar la investigación a una sola fuente de información."], respuesta: 2, explicacion: "Es fundamental analizar tanto los puntos fuertes como las áreas de oportunidad para tener una visión completa de la organización." },
    { texto: "Después de programar nuestro objeto, damos inicio a el programa dando clic en:", opciones: ["Hexágono rojo.", "Bandera verde.", "Sonido.", "Fondo."], respuesta: 1 },
    { texto: "Si quiero enviar mi objeto hacia (Arriba), ¿Cuántos grados debo de escribir?", opciones: ["180", "-90", "0", "90"], respuesta: 2 },
    { texto: "Scratch, necesita siempre internet para funcionar", opciones: ["No, se puede usar sin internet.", "Siempre con internet.", "Las dos opciones (con y sin internet).", "Ninguno."], respuesta: 0 },
    { texto: "Al Presionar, se encuentra dentro de __________.", opciones: ["Eventos", "Control", "Sensores", "Operadores"], respuesta: 0 },
    { texto: "Cuando programo, utilizo mi razonamiento….", opciones: ["Opcional", "Creativo", "Especial", "Interpersonal"], respuesta: 1 },
    { texto: "¿Como se llama la plataforma donde enviamos Tareas?", opciones: ["Youtube", "Excel", "Classroom", "Kahoot"], respuesta: 2 },
    { texto: "La finalidad de Scratch es que cuando programes te diviertas", opciones: ["Verdadero", "Falso"], respuesta: 0 },
    { texto: "¿Para qué sirven los disfraces? Scratch", opciones: ["Para dar vida y envolvimiento a los objetos", "Para ver opciones", "Para mejor vista", "Para cambiar"], respuesta: 0 },
    { texto: "Damos inicio con Hexágono rojo al programa", opciones: ["Verdadero", "Falso"], respuesta: 1 },
    { texto: "Los disfraces son elementos que modifican la velocidad de movimiento de un objeto", opciones: ["Verdadero", "Falso"], respuesta: 1 },
    { texto: "Cuántos botones tiene scratch", opciones: ["5", "9", "7", "8"], respuesta: 1 },
    { texto: "El escenario es el fondo que colocamos en nuestro proyecto y puede ser cambiado tantas veces queramos", opciones: ["Verdadero", "Falso"], respuesta: 0 },
    { texto: "Para que sirven los disfraces", opciones: ["Para colorear", "Ninguno", "Para Editar rostros", "Para darle movimiento a los objetos"], respuesta: 3 },
    { texto: "¿Qué es programar?", opciones: ["Dar ordenes", "No realizar acciones", "Seguir instrucciones", "Ejecutar ordenes"], respuesta: 3 },
    { texto: "Son elementos de la paleta de \"comandos del bloque Control\" en Scratch:", opciones: ["Por Siempre y Movimiento", "Por Siempre y Al Presionar", "Al entrar y Al Presionar", "Al Presionar y Apariencia"], respuesta: 1 },
    { texto: "¿Cómo se le llama a las diferentes facetas o posiciones del objeto?", opciones: ["Sonido", "Hexágono rojo", "Bandera verde", "Disfraces"], respuesta: 3 },
    { texto: "Scratch para quien fue creado Inicialmente", opciones: ["Para Universidades", "Para niños", "Para personas de la tercera edad", "Ninguno"], respuesta: 1 },
    { texto: "Scratch, es programación secuencial", opciones: ["SI", "En este ejemplo no", "NINGUNO", "NO"], respuesta: 0 },
    { texto: "Scratch es una programación de tipo", opciones: ["LINEAL", "Orientada a objetos", "Ninguno"], respuesta: 1 },
    { texto: "Un objeto es igual a un Sprite", opciones: ["Correcto", "Incorrecto", "En programación no", "Ninguno"], respuesta: 0 },
    { texto: "Al terminar de ejecutarse el siguiente programa, el objeto queda en la misma posición", opciones: ["Verdadero", "Falso"], respuesta: 1 },
    { texto: "Un programa de Scratch", opciones: ["Solo puede empezar pulsando la tecla COMENZAR", "Pulsando el objeto", "Puede comenzar pulsando la barra espaciadora exclusivamente", "Puede comenzar pulsando la bandera verde superior"], respuesta: 3 },
    { texto: "Pertenecen al entorno gráfico de Scratch", opciones: ["Barra de herramientas. Botón Iniciar. Botón Detener", "Información del objeto seleccionado. Delete. Botón Iniciar .Botón Detener.", "Bordes. Barra de herramientas. Botón Iniciar. Botón Delete", "Información del objeto seleccionado. Barra de herramientas. Botón Iniciar. Botón Detener."], respuesta: 3 },
    { texto: "Cambiar disfraz a ...., se encuentra dentro de __________.", opciones: ["Apariencia", "Control", "Mis bloques", "Eventos"], respuesta: 0 },
    { texto: "El creador del programa Scratch es:", opciones: ["Linux Torvalds", "Mitchel Resnick.", "Bill Gates", "Steve Jobs"], respuesta: 1 },
    { texto: "Scratch te ayuda a desarrollar habilidades de pensamiento lógico-matemático", opciones: ["Verdadero", "Falso"], respuesta: 0 },
    { texto: "¿Ratón presionado?, se encuentra dentro de __________.", opciones: ["Movimiento", "Sensores", "Eventos", "Operadores"], respuesta: 1 },
    { texto: "Nos comunicamos con el computador para que entienda las ordenes mediante un lenguaje de programación", opciones: ["Verdadero", "Falso"], respuesta: 0 },
    { texto: "Scratch es un entorno gráfico de programación", opciones: ["Verdadero", "Falso"], respuesta: 0 },
    { texto: "¿Qué puedo crear con Scratch?", opciones: ["Todas las anteriores", "Historias interactivas propias", "Animaciones", "Juegos"], respuesta: 0 },
    { texto: "Este es un formato de imagen que acepta Scratch?", opciones: ["ÑÑ", "PPT", "JPG", "MM"], respuesta: 2 },
    { texto: "Cuál es la dirección (ángulo) que coloca Scratch a un objeto recién creado?", opciones: ["90", "0 (Cero)", "-90", "180"], respuesta: 0 },
    { texto: "Rebotar si toca un borde, se encuentra dentro de __________.", opciones: ["Sensores", "Movimiento", "Operadores", "Eventos"], respuesta: 1 },
    { texto: "Scratch Acepta audio", opciones: ["Nunca", "Para nada", "Si", "No"], respuesta: 2 },
    { texto: "Son elementos de la paleta de bloques de programación en Scratch:", opciones: ["Al Presionar y Apariencia", "Al entrar y Al Presionar", "Por Siempre y Al Presionar", "Por Siempre y Movmiento"], respuesta: 2 },
    { texto: "Puedo hacer mis propios Juego en Scratch", opciones: ["No", "Si"], respuesta: 1 },
    { texto: "Puedo grabar audio en scratch", opciones: ["Si", "No"], respuesta: 0 },
    { texto: "Una variable es", opciones: ["Ninguno", "Es una celda o pestaña que cambia de disfraz a lo largo del tiempo", "Aquel elemento que mantiene constante su valor y nos sirve para definir las VIDAS", "Aquel elemento que altera su valor a lo largo del tiempo"], respuesta: 3 },
    { texto: "Un algoritmo es una serie ordenada de instrucciones, pasos o procesos que llevan a la solución de un determinado problema", opciones: ["Falso", "Verdadero"], respuesta: 1 },
    { texto: "¿Cómo se llama el personaje que introducimos en nuestro programa?", opciones: ["Sonido", "Hexágono rojo", "Bandera verde", "Objeto"], respuesta: 3 },
    { texto: "La parte donde se muestra el objeto que estamos programando y sus distintos movimientos de acuerdo a nuestro código se denomina:", opciones: ["Objeto", "Escenario", "Barra de herramientas", "Escritorio"], respuesta: 1 }
];

// VARIABLES GLOBALES
let preguntasExamen = []; // Se llena aleatoriamente con 20 preguntas
let indiceActual = 0;
let respuestasUsuario = []; 
let seleccionTemporal = null; 
let tiempoRestante = 0;
let intervaloTiempo;

// REFERENCIAS HTML
const authScreen = document.getElementById('auth-screen');
const setupScreen = document.getElementById('setup-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const reviewScreen = document.getElementById('review-screen');
const btnLogout = document.getElementById('btn-logout');
const btnNextQuestion = document.getElementById('btn-next-question');

// --- 4. FUNCIÓN: OBTENER ID ÚNICO DEL DISPOSITIVO ---
function obtenerDeviceId() {
    let deviceId = localStorage.getItem('device_id_seguro');
    if (!deviceId) {
        deviceId = 'dev_' + Math.random().toString(36).substr(2, 9) + Date.now();
        localStorage.setItem('device_id_seguro', deviceId);
    }
    return deviceId;
}

// --- 5. LÓGICA DE SEGURIDAD AVANZADA (Cupo de 2 Dispositivos) ---
async function validarDispositivo(user) {
    const email = user.email;
    const miDeviceId = obtenerDeviceId(); 

    // Consultar la base de datos
    const docRef = doc(db, "usuarios_seguros", email);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const datos = docSnap.data();
        let listaDispositivos = datos.dispositivos || []; 
        
        if (listaDispositivos.includes(miDeviceId)) {
            return true; 
        } else {
            if (listaDispositivos.length < 2) {
                listaDispositivos.push(miDeviceId);
                await setDoc(docRef, { dispositivos: listaDispositivos }, { merge: true });
                return true;
            } else {
                alert(`⛔ ACCESO DENEGADO ⛔\n\nYa tienes 2 dispositivos registrados (PC y Celular).\nNo puedes iniciar sesión en un tercer equipo.`);
                await signOut(auth);
                location.reload();
                return false;
            }
        }
    } else {
        await setDoc(docRef, {
            dispositivos: [miDeviceId],
            fecha_registro: new Date().toISOString()
        });
        return true;
    }
}

// --- 6. MONITOR DE AUTENTICACIÓN ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        if (correosPermitidos.includes(user.email)) {
            const titulo = document.querySelector('h2');
            if(titulo) titulo.innerText = "Verificando Dispositivo..."; 
            
            const dispositivoValido = await validarDispositivo(user);
            
            if (dispositivoValido) {
                authScreen.classList.add('hidden');
                setupScreen.classList.remove('hidden');
                btnLogout.classList.remove('hidden');
                document.getElementById('user-display').innerText = user.email;
                if(titulo) titulo.innerText = "Bienvenido";
            }
        } else {
            alert("ACCESO RESTRINGIDO: Tu correo no está autorizado.");
            signOut(auth);
        }
    } else {
        authScreen.classList.remove('hidden');
        setupScreen.classList.add('hidden');
        quizScreen.classList.add('hidden');
        resultScreen.classList.add('hidden');
        reviewScreen.classList.add('hidden');
        btnLogout.classList.add('hidden');
    }
});

// --- 7. EVENTOS ---
document.getElementById('btn-google').addEventListener('click', () => {
    signInWithPopup(auth, new GoogleAuthProvider()).catch(e => alert("Error Google: " + e.message));
});

btnLogout.addEventListener('click', () => { signOut(auth); location.reload(); });

// --- 8. LÓGICA DEL EXAMEN (Aleatorio 20 o Estudio todas) ---
document.getElementById('btn-start').addEventListener('click', () => {
    const tiempo = document.getElementById('time-select').value;
    const modo = document.getElementById('mode-select').value;

    if (tiempo !== 'infinity') { tiempoRestante = parseInt(tiempo) * 60; iniciarReloj(); } 
    else { document.getElementById('timer-display').innerText = "--:--"; }
    
    // Lógica de Modo
    if (modo === 'study') {
        preguntasExamen = [...bancoPreguntas].sort(() => 0.5 - Math.random());
    } else {
        // MODO EXAMEN: Carga 20 preguntas aleatorias
        preguntasExamen = [...bancoPreguntas]
            .sort(() => 0.5 - Math.random()) 
            .slice(0, 20); // 20 PREGUNTAS
    }
    
    respuestasUsuario = []; 
    indiceActual = 0;
    setupScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    cargarPregunta();
});

function cargarPregunta() {
    seleccionTemporal = null; 
    btnNextQuestion.classList.add('hidden'); 
    
    if (indiceActual >= preguntasExamen.length) { terminarQuiz(); return; }
    
    const data = preguntasExamen[indiceActual];
    document.getElementById('question-text').innerText = `${indiceActual + 1}. ${data.texto}`;
    const cont = document.getElementById('options-container'); cont.innerHTML = '';
    
    data.opciones.forEach((opcion, index) => {
        const btn = document.createElement('button');
        btn.innerText = opcion;
        btn.onclick = () => seleccionarOpcion(index, btn); 
        cont.appendChild(btn);
    });
    document.getElementById('progress-display').innerText = `Pregunta ${indiceActual + 1} de ${preguntasExamen.length}`;

    if(indiceActual === preguntasExamen.length - 1) {
        btnNextQuestion.innerHTML = 'Finalizar <i class="fa-solid fa-check"></i>';
    } else {
        btnNextQuestion.innerHTML = 'Siguiente <i class="fa-solid fa-arrow-right"></i>';
    }
}

// --- FUNCIÓN MODIFICADA PARA SEPARAR EL MODO ESTUDIO/EXAMEN ---
function seleccionarOpcion(index, btnClickeado) {
    const isStudyMode = document.getElementById('mode-select').value === 'study';

    // Si ya se ha seleccionado una opción en el modo estudio, no permitir cambiar
    if (isStudyMode && seleccionTemporal !== null) {
        return;
    }
    
    seleccionTemporal = index;
    const botones = document.getElementById('options-container').querySelectorAll('button');
    botones.forEach(b => b.classList.remove('option-selected'));
    btnClickeado.classList.add('option-selected');
    
    if (isStudyMode) {
        mostrarResultadoInmediato(index);
    } else {
        // MODO EXAMEN: Solo guarda la selección temporal y muestra el botón Siguiente
        btnNextQuestion.classList.remove('hidden');
    }
}

// --- NUEVA FUNCIÓN: Muestra respuesta y explicación en modo Estudio ---
function mostrarResultadoInmediato(seleccionada) {
    const pregunta = preguntasExamen[indiceActual];
    const correcta = pregunta.respuesta;
    const cont = document.getElementById('options-container');
    const botones = cont.querySelectorAll('button');
    
    // Deshabilitar todos los botones para que no se pueda cambiar la respuesta
    botones.forEach(btn => btn.disabled = true);

    // Iterar para mostrar el feedback visual (verde/rojo)
    botones.forEach((btn, index) => {
        btn.classList.remove('option-selected'); // Quitar selección temporal
        
        if (index === correcta) {
            btn.classList.add('ans-correct', 'feedback-visible');
        } else if (index === seleccionada) {
            btn.classList.add('ans-wrong', 'feedback-visible');
        }
    });

    // Añadir la explicación
    const divExplicacion = document.createElement('div');
    divExplicacion.className = 'explanation-feedback';
    divExplicacion.innerHTML = `<strong>Explicación:</strong> ${pregunta.explicacion}`;
    cont.appendChild(divExplicacion);
    
    // Registrar la respuesta y mostrar el botón Siguiente
    respuestasUsuario.push(seleccionada);
    btnNextQuestion.classList.remove('hidden');
}


// --- EVENTO MODIFICADO para el botón Siguiente ---
btnNextQuestion.addEventListener('click', () => {
    const isStudyMode = document.getElementById('mode-select').value === 'study';
    
    // En modo estudio, simplemente avanza a la siguiente pregunta (la respuesta ya fue registrada en mostrarResultadoInmediato)
    if (isStudyMode && seleccionTemporal !== null) {
        indiceActual++;
        cargarPregunta();
        return; 
    }
    
    // MODO EXAMEN: Registra la respuesta y avanza (sin feedback inmediato)
    if (seleccionTemporal !== null) {
        respuestasUsuario.push(seleccionTemporal);
        indiceActual++;
        cargarPregunta();
    }
});


function iniciarReloj() {
    intervaloTiempo = setInterval(() => {
        tiempoRestante--;
        let m = Math.floor(tiempoRestante / 60), s = tiempoRestante % 60;
        document.getElementById('timer-display').innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
        if (tiempoRestante <= 0) { clearInterval(intervaloTiempo); terminarQuiz(); }
    }, 1000);
}

function terminarQuiz() {
    clearInterval(intervaloTiempo);
    let aciertos = 0;
    preguntasExamen.forEach((p, i) => { if (respuestasUsuario[i] === p.respuesta) aciertos++; });
    quizScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    document.getElementById('score-final').innerText = `${aciertos} / ${preguntasExamen.length}`;
    
    // --- Ocultar botón Revisar Respuestas si es modo Estudio ---
    const modeSelect = document.getElementById('mode-select');
    if (modeSelect && modeSelect.value === 'study') {
        document.getElementById('btn-review').classList.add('hidden');
    } else {
        document.getElementById('btn-review').classList.remove('hidden');
    }
    // --------------------------------------------------------
}

// --- 9. REVISIÓN ---
document.getElementById('btn-review').addEventListener('click', () => {
    resultScreen.classList.add('hidden');
    reviewScreen.classList.remove('hidden');
    const cont = document.getElementById('review-container'); cont.innerHTML = '';
    
    preguntasExamen.forEach((p, i) => {
        const dada = respuestasUsuario[i], ok = (dada === p.respuesta);
        const card = document.createElement('div'); card.className = 'review-item';
        let ops = '';
        p.opciones.forEach((o, x) => {
            let c = (x === p.respuesta) ? 'ans-correct' : (x === dada && !ok ? 'ans-wrong' : '');
            let ico = (x === p.respuesta) ? '✅ ' : (x === dada && !ok ? '❌ ' : '');
            let b = (x === dada) ? 'user-selected' : '';
            ops += `<div class="review-answer ${c} ${b}">${ico}${o}</div>`;
        });
        card.innerHTML = `<div class="review-question">${i+1}. ${p.texto}</div>${ops}<div class="review-explanation"><strong>Explicación:</strong> ${p.explicacion}</div>`;
        cont.appendChild(card);
    });
});