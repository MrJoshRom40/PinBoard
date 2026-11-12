import { startLocalStorage } from "../storage/startLocalStorage.js";
import { attachContextMenu } from "./Components/ContextMenu.js";

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

currentUser.pinsSaved ??= [];
currentUser.followers ??= [];

/* ---------- Elementos y datos ---------- */
const logo = document.getElementById("logo");
const pin_template = document.querySelector("#pin-template");
const pin_container = document.querySelector(".pin-gallery");
const footer = document.querySelector("footer");
const tabsContainer = document.getElementById("category-tabs");

let pins = JSON.parse(localStorage.getItem("pins") || "[]");
let users = JSON.parse(localStorage.getItem("users") || "[]");
const categories = JSON.parse(localStorage.getItem("categories") || "[]");

let activeCategory = "All";

/* ---------- Guardado ---------- */
function savePins() {
  localStorage.setItem("pins", JSON.stringify(pins));
}

function saveUsers() {
  localStorage.setItem("users", JSON.stringify(users));
}

// currentUser es una copia: se sincroniza con su registro en "users"
function saveCurrentUser() {
  const stored = users.find((u) => u.id === currentUser.id);
  if (stored) {
    stored.pinsSaved = currentUser.pinsSaved;
    saveUsers();
  }
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
}

/* ---------- Helpers ---------- */
// Agrega el item si no está, lo quita si ya está. Devuelve true si quedó agregado.
function toggleItem(array, item) {
  const index = array.indexOf(item);
  if (index === -1) {
    array.push(item);
    return true;
  }
  array.splice(index, 1);
  return false;
}

function toast(options) {
  Swal.fire({
    position: "top-end",
    showConfirmButton: false,
    timer: 750,
    ...options,
  });
}

/* ---------- Eventos ---------- */
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

// Menú de cada pin (delegación sobre la galería)
attachContextMenu(
  pin_container,
  (pinEl) => {
    const pin = pins.find((p) => String(p.id) === pinEl.dataset.id);
    if (!pin) return [];

    pin.likes ??= [];

    const isOwn = pin.user === currentUser.id;
    const isLiked = pin.likes.includes(currentUser.id);
    const isSaved = currentUser.pinsSaved.includes(pin.id);
    const creator = users.find((u) => u.id === pin.user);
    const isFollowing = (creator?.followers ?? []).includes(currentUser.id);

    console.log(pin);

    return [
      {
        label: isLiked ? "Unlike" : "Like",
        icon: isLiked ? "favorite" : "favorite_border",
        action: () => {
          const nowLiked = toggleItem(pin.likes, currentUser.id);
          savePins();
          toast({
            imageUrl: `../assets/svg/${nowLiked ? "like" : "unlike"}.svg`,
            imageWidth: 100,
            imageHeight: 100,
            imageAlt: "heart icon",
            title: nowLiked ? "Liked" : "Unliked",
          });
        },
      },
      {
        label: isSaved ? "Unsave" : "Save",
        icon: isSaved ? "bookmark_remove" : "save_alt",
        action: () => {
          const nowSaved = toggleItem(currentUser.pinsSaved, pin.id);
          saveCurrentUser();
          toast({
            imageUrl: "../assets/svg/add_circle_outline_24dp_E3E3E3.svg",
            imageWidth: 100,
            imageHeight: 100,
            imageAlt: "save icon",
            title: nowSaved ? "Saved" : "Removed from saved",
          });
        },
      },
      {
        label: isOwn
          ? "It's yours"
          : isFollowing
            ? "Unfollow creator"
            : "Follow creator!",
        icon: isFollowing ? "person_remove" : "person_add",
        disabled: isOwn || !creator,
        action: () => {
          creator.followers ??= [];
          const nowFollowing = toggleItem(creator.followers, currentUser.id);
          saveUsers();
          toast({
            icon: "success",
            title: nowFollowing ? "Following!" : "Unfollowed",
          });
        },
      },
    ];
  },
  ".pin",
);

/* ---------- Pestañas de categorías ---------- */
function renderTabs() {
  tabsContainer.replaceChildren();

  ["All", ...categories].forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = "tab";
    btn.type = "button";
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", String(cat === activeCategory));
    btn.textContent = cat;
    btn.addEventListener("click", () => {
      activeCategory = cat;
      renderTabs();
      renderGallery();
    });
    tabsContainer.appendChild(btn);
  });
}

function getFilteredPins() {
  if (activeCategory === "All") return pins;
  return pins.filter((p) => (p.categories ?? []).includes(activeCategory));
}

/* ---------- Render ---------- */
function createPinCard(pin) {
  const clone = pin_template.content.cloneNode(true);
  clone.querySelector(".pin").dataset.id = pin.id;
  clone.querySelector(".pin-image").src = pin.image;
  clone.querySelector(".pin-image").alt = pin.name;

  return clone;
}

function renderGallery() {
  pin_container.replaceChildren();
  const list = getFilteredPins();

  if (!list.length) {
    const empty = document.createElement("p");
    empty.className = "empty-message";
    empty.textContent = "No hay pins en esta categoría.";
    pin_container.appendChild(empty);
    return;
  }

  list.forEach((p) => pin_container.appendChild(createPinCard(p)));
}

function startUserData() {
  document.getElementById("user-icon").src =
    `../assets/icons/${currentUser.icon}`;
  document.getElementById("username").textContent = currentUser.username;

  renderTabs();
  renderGallery();
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
