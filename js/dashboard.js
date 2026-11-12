import { startLocalStorage } from "../storage/startLocalStorage.js";
import { attachContextMenu } from "./Components/ContextMenu.js";

/* ---------- Siembra de datos iniciales (antes de leer nada) ---------- */
startLocalStorage();

/* ---------- Guardia de sesión ---------- */
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

/* ---------- Elementos y datos ---------- */
const logo = document.getElementById("logo");
const pin_template = document.querySelector("#pin-template");
const pin_container = document.querySelector(".pin-gallery");
const footer = document.querySelector("footer");

const users = JSON.parse(localStorage.getItem("users") || "[]");
const following = users.filter((u) =>
  (u.followers ?? []).includes(currentUser.id),
).length;

const pins = JSON.parse(localStorage.getItem("pins") || "[]");
const userPins = pins.filter((p) => p.user === currentUser.id);

console.table(pins);

/* ---------- Eventos ---------- */
logo.addEventListener("click", (event) => {
  event.preventDefault();
  window.location.href = "../index.html";
});

attachContextMenu(footer, () => [
  {
    label: "Logout",
    danger: true,
    action: () => {
      localStorage.removeItem("currentUser");
      window.location.replace("../pages/login.html");
    },
  },
]);

/* ---------- Render ---------- */
function createPinCard(pin) {
  const clone = pin_template.content.cloneNode(true);
  clone.querySelector(".pin-image").src = pin.image;
  clone.querySelector(".pin-image").alt = pin.name;

  return clone;
}

function startUserData() {
  const userIcon = document.getElementById("user-icon");
  console.log("Current user data:", currentUser.type);

  userIcon.src = `../assets/icons/${currentUser.icon}`;
  document.getElementById("profile-icon").src = userIcon.src;
  document.getElementById("profile-username").textContent =
    currentUser.username;
  document.getElementById("profile-followers").textContent =
    `Followers: ${(currentUser.followers ?? []).length}`;
  document.getElementById("profile-following").textContent =
    `Following: ${following}`;

  document.getElementById("username").textContent = currentUser.username;

  userPins.forEach((p) => {
    pin_container.appendChild(createPinCard(p));
  });
}

function addAdminOptions() {
  const list = document.querySelector("nav ul");

  list.insertAdjacentHTML(
    "beforeend",
    `
    <a href="/users">
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
