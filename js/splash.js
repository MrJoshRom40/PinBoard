const DELAY_MS = 2500; // 2.5 segundos
const NEXT_PAGE = "../index.html"; // ajusta a tu ruta
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
function requireSession() {
  if (!localStorage.getItem("currentUser")) {
    window.location.replace("../pages/login.html");
  }
}

requireSession();

// Si el navegador restaura la página desde caché con "atrás", se vuelve a comprobar
window.addEventListener("pageshow", (event) => {
  if (event.persisted) requireSession();
});

// Detiene el resto del script si no hay sesión
if (!currentUser) throw new Error("No hay sesión iniciada");

setTimeout(() => {
  window.location.href = NEXT_PAGE;
}, DELAY_MS);
