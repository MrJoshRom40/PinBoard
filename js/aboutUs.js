import { startLocalStorage } from "../storage/startLocalStorage.js";
import { attachContextMenu } from "./Components/ContextMenu.js";
import { setupDeleteAll } from "./killer.js";

/* ---------- Siembra de datos (antes de leer nada) ---------- */
startLocalStorage();
setupDeleteAll("../pages/login.html");

/* ---------- Guardia de sesión ---------- */
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

function requireSession() {
  if (!localStorage.getItem("currentUser")) {
    window.location.replace("../pages/login.html");
  }
}

requireSession();

window.addEventListener("pageshow", (event) => {
  if (event.persisted) requireSession();
});

if (!currentUser) throw new Error("No hay sesión iniciada");

/* ---------- Elementos ---------- */
const footer = document.querySelector("footer");

/* ---------- Eventos ---------- */
attachContextMenu(footer, () => [
  {
    label: "Logout",
    icon: "logout",
    danger: true,
    action: () => {
      localStorage.removeItem("currentUser");
      window.location.replace("../pages/login.html");
    },
  },
]);

/* ---------- Usuario y menú ---------- */
function startUserData() {
  document.getElementById("user-icon").src =
    `../assets/icons/${currentUser.icon}`;
  document.getElementById("username").textContent = currentUser.username;
}

function addAdminOptions() {
  const list = document.querySelector("nav ul");

  list.insertAdjacentHTML(
    "beforeend",
    `
    <a href="./Users.html">
      <img src="../assets/svg/manage_accounts_24dp_163A63_FILL0_wght400_GRAD0_opsz24.svg" alt="users" />
      <p>Users</p>
    </a>
    <a id="delete-all" style="cursor: pointer;">
      <img src="../assets/svg/delete_24dp_163A63_FILL0_wght400_GRAD0_opsz24.svg" alt="delete" />
      <p>Delete All</p>
    </a>
    `,
  );
}

/* ---------- Inicio ---------- */
startUserData();

if (currentUser.type === "admin") {
  addAdminOptions();
}