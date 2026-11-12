import { startLocalStorage } from "../storage/startLocalStorage.js";
import { attachContextMenu } from "./Components/ContextMenu.js";
import { Pin } from "./classes/Pin.js";

/* ---------- Siembra de datos (antes de leer nada) ---------- */
startLocalStorage();

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
const logo = document.getElementById("logo");
const footer = document.querySelector("footer");
const form = document.getElementById("pin-form");
const nameInput = document.getElementById("pin-name");
const descriptionInput = document.getElementById("pin-description");
const urlInput = document.getElementById("pin-url");
const categoryOptions = document.getElementById("category-options");
const errorBox = document.getElementById("form-error");
const previewBox = document.getElementById("preview-box");
const previewImage = document.getElementById("preview-image");

const categories = JSON.parse(localStorage.getItem("categories") || "[]");

/* ---------- Helpers ---------- */
function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = false;
}

function clearError() {
  errorBox.hidden = true;
  errorBox.textContent = "";
}

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function getSelectedCategories() {
  return [
    ...categoryOptions.querySelectorAll("input[type='checkbox']:checked"),
  ].map((input) => input.value);
}

/* ---------- Categorías (botones seleccionables) ---------- */
function renderCategories() {
  categories.forEach((cat) => {
    const label = document.createElement("label");
    label.className = "category-chip";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = cat;

    const text = document.createElement("span");
    text.textContent = cat;

    label.append(input, text);
    categoryOptions.appendChild(label);
  });
}

/* ---------- Vista previa de la imagen ---------- */
let previewTimer;

function updatePreview() {
  const url = urlInput.value.trim();

  if (!url || !isValidUrl(url)) {
    previewBox.hidden = true;
    previewImage.removeAttribute("src");
    return;
  }

  // Se oculta hasta confirmar que la imagen realmente cargó
  previewBox.hidden = true;
  previewImage.src = url;
}

previewImage.addEventListener("load", () => {
  previewBox.hidden = false;
  clearError();
});

previewImage.addEventListener("error", () => {
  previewBox.hidden = true;
  if (urlInput.value.trim()) {
    showError("No se pudo cargar la imagen con esa URL.");
  }
});

urlInput.addEventListener("input", () => {
  clearTimeout(previewTimer);
  previewTimer = setTimeout(updatePreview, 300); // espera a que dejes de escribir
});

/* ---------- Envío ---------- */
form.addEventListener("submit", (event) => {
  event.preventDefault();
  clearError();

  const name = nameInput.value.trim();
  const description = descriptionInput.value.trim();
  const image = urlInput.value.trim();
  const selected = getSelectedCategories();

  if (!name) return showError("Escribe un nombre para el pin.");
  if (!description) return showError("Escribe una descripción.");
  if (!selected.length) return showError("Elige al menos una categoría.");
  if (!isValidUrl(image))
    return showError("Escribe una URL válida (http o https).");
  if (previewBox.hidden)
    return showError("La imagen no se pudo cargar, revisa la URL.");

  const pins = JSON.parse(localStorage.getItem("pins") || "[]");
  const pin = new Pin(
    name,
    description,
    image,
    currentUser.id,
    undefined, // id: se genera solo
    selected,
  );

  pins.push(pin);
  localStorage.setItem("pins", JSON.stringify(pins));

  Swal.fire({
    icon: "success",
    title: "Pin published!",
    text: "Your pin is now on PinBoard.",
    heightAuto: false,
    confirmButtonColor: "#58cd5f",
    confirmButtonText: "See my pins",
    background: "#fffdf5",
    color: "#0f3c65",
  }).then(() => {
    window.location.href = "../pages/Dashboard.html";
  });
});

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

renderCategories();

if (currentUser.type === "admin") {
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
