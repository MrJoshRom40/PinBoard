import { startLocalStorage } from "../storage/startLocalStorage.js";
import { attachContextMenu } from "./Components/ContextMenu.js";
import { setupDeleteAll } from "./killer.js";

/* ---------- Siembra de datos (antes de leer nada) ---------- */
startLocalStorage();
setupDeleteAll("../pages/login.html");

/* ---------- Guardia de sesión y de rol ---------- */
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

// Solo un admin puede estar aquí
if (currentUser.type !== "admin") {
  window.location.replace("../index.html");
  throw new Error("Acceso solo para administradores");
}

/* ---------- Elementos y datos ---------- */
const logo = document.getElementById("logo");
const footer = document.querySelector("footer");
const grid = document.getElementById("user-grid");

let users = JSON.parse(localStorage.getItem("users") || "[]");

function saveUsers() {
  localStorage.setItem("users", JSON.stringify(users));
}

/* ---------- Helpers ---------- */
function toast(options) {
  Swal.fire({
    position: "top-end",
    showConfirmButton: false,
    timer: 900,
    ...options,
  });
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// Los usuarios viejos sin status cuentan como activos
const getStatus = (user) => user.status ?? "active";

// Se listan todos menos el admin y los eliminados
function getVisibleUsers() {
  return users.filter((u) => u.type !== "admin" && getStatus(u) !== "deleted");
}

/* ---------- Acciones ---------- */
function setStatus(userId, status) {
  const user = users.find((u) => u.id === userId);
  if (!user) return;

  user.status = status;
  saveUsers();
  renderUsers();
}

function sleepUser(user) {
  setStatus(user.id, "sleeping");
  toast({ icon: "success", title: `${user.username} is now sleeping` });
}

function wakeUser(user) {
  setStatus(user.id, "active");
  toast({ icon: "success", title: `${user.username} is awake` });
}

function deleteUser(user) {
  Swal.fire({
    icon: "warning",
    title: `Delete ${user.username}?`,
    text: "They will never be able to log in again. This cannot be undone.",
    showCancelButton: true,
    confirmButtonColor: "#d9693f",
    cancelButtonColor: "#0f3c65",
    confirmButtonText: "Yes, delete",
    cancelButtonText: "Cancel",
    heightAuto: false,
    background: "#fffdf5",
    color: "#0f3c65",
  }).then((result) => {
    if (!result.isConfirmed) return;
    setStatus(user.id, "deleted");
    toast({ icon: "success", title: "User deleted" });
  });
}

/* ---------- Menú contextual de cada tarjeta ---------- */
attachContextMenu(
  grid,
  (cardEl) => {
    const user = users.find((u) => u.id === cardEl.dataset.id);
    if (!user) return [];

    const sleeping = getStatus(user) === "sleeping";

    return [
      sleeping
        ? {
            label: "Wake up",
            icon: "wb_sunny",
            action: () => wakeUser(user),
          }
        : {
            label: "Put to sleep",
            icon: "bedtime",
            action: () => sleepUser(user),
          },
      { separator: true },
      {
        label: "Delete user",
        icon: "delete",
        danger: true,
        action: () => deleteUser(user),
      },
    ];
  },
  ".user-card",
);

/* ---------- Render ---------- */
function createUserCard(user) {
  const sleeping = getStatus(user) === "sleeping";

  const card = el("article", "user-card");
  card.dataset.id = user.id;
  card.classList.toggle("is-sleeping", sleeping);

  const avatar = el("img", "user-card__avatar");
  avatar.src = `../assets/icons/${user.icon}`;
  avatar.alt = `${user.username} icon`;

  card.append(
    avatar,
    el("p", "user-card__name", user.username),
    el("p", "user-card__email", user.email),
    el("span", "user-card__status", sleeping ? "Sleeping" : "Active"),
  );

  return card;
}

function renderUsers() {
  grid.replaceChildren();
  const list = getVisibleUsers();

  if (!list.length) {
    grid.append(el("p", "empty-message", "There are no users to manage."));
    return;
  }

  list.forEach((u) => grid.appendChild(createUserCard(u)));
}

/* ---------- Eventos generales ---------- */
logo.addEventListener("click", (event) => {
  event.preventDefault();
  window.location.href = "../index.html";
});

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

/* ---------- Inicio ---------- */
document.getElementById("user-icon").src =
  `../assets/icons/${currentUser.icon}`;
document.getElementById("username").textContent = currentUser.username;

// Opciones de admin en el nav
document.querySelector("nav ul").insertAdjacentHTML(
  "beforeend",
  `
  <a href="./Users.html" aria-current="page">
    <img src="../assets/svg/manage_accounts_24dp_163A63_FILL0_wght400_GRAD0_opsz24.svg" alt="users" />
    <p>Users</p>
  </a>
  <a id="delete-all" style="cursor: pointer;">
    <img src="../assets/svg/delete_24dp_163A63_FILL0_wght400_GRAD0_opsz24.svg" alt="delete" />
    <p>Delete All</p>
  </a>
  `,
);

renderUsers();
