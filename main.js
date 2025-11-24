import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAs_LBouq2njfy0cJHJjuiUfASC3RqVKkM",
  authDomain: "practicas-comunitario.firebaseapp.com",
  projectId: "practicas-comunitario",
  storageBucket: "practicas-comunitario.firebasestorage.app",
  messagingSenderId: "874017448238",
  appId: "1:874017448238:web:03928054e98441838d1abf",
  measurementId: "G-XF0GC0DZY4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Analytics es opcional - se inicializa solo si es necesario y está disponible
// No es esencial para el funcionamiento del login

// Ejemplo básico de login con Google:
const provider = new GoogleAuthProvider();

// Función para inicializar el botón de login
function inicializarLogin() {
  const loginBtn = document.getElementById("loginBtn");
  
  if (!loginBtn) {
    console.error("Error: No se encontró el botón de login con id 'loginBtn'");
    return;
  }
  
  loginBtn.addEventListener("click", () => {
    signInWithPopup(auth, provider)
      .then(result => {
        console.log("Usuario autenticado:", result.user);
        alert(`Bienvenido ${result.user.displayName}`);
        window.location.href = "preguntas.html";
      })
      .catch(error => {
        console.error("Error login:", error);
        alert(`Error al iniciar sesión: ${error.message}`);
      });
  });
}

// Verificar si el DOM ya está cargado o esperar a que se cargue
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", inicializarLogin);
} else {
  // El DOM ya está cargado
  inicializarLogin();
}
