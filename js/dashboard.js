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
const tabCreated = document.getElementById("tab-created");
const tabSaved = document.getElementById("tab-saved");

let pins = JSON.parse(localStorage.getItem("pins") || "[]");
let users = JSON.parse(localStorage.getItem("users") || "[]");

let activeTab = tabCreated;

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

function countFollowing() {
  return users.filter((u) => (u.followers ?? []).includes(currentUser.id))
    .length;
}

function updateCounts() {
  const me = users.find((u) => u.id === currentUser.id);
  document.getElementById("profile-followers").textContent =
    `Followers: ${(me?.followers ?? currentUser.followers).length}`;
  document.getElementById("profile-following").textContent =
    `Following: ${countFollowing()}`;
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
            imageUrl: "../assets/svg/save.svg",
            imageWidth: 100,
            imageHeight: 100,
            imageAlt: "save icon",
            title: nowSaved ? "Saved" : "Removed from saved",
          });
          // Si estás viendo "Saved", el pin desaparece al instante
          if (activeTab === tabSaved) renderActiveTab();
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
          updateCounts();
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

/* ---------- Pestañas ---------- */
function getPinsForTab() {
  if (activeTab === tabSaved) {
    return pins.filter((p) => currentUser.pinsSaved.includes(p.id));
  }
  return pins.filter((p) => p.user === currentUser.id);
}

function renderGallery(list) {
  pin_container.replaceChildren();

  if (!list.length) {
    const empty = document.createElement("p");
    empty.className = "empty-message";
    empty.textContent =
      activeTab === tabSaved
        ? "You haven't saved any pins yet."
        : "You haven't created any pins yet.";
    pin_container.appendChild(empty);
    return;
  }

  list.forEach((p) => pin_container.appendChild(createPinCard(p)));
}

function renderActiveTab() {
  tabCreated.setAttribute("aria-selected", String(activeTab === tabCreated));
  tabSaved.setAttribute("aria-selected", String(activeTab === tabSaved));
  renderGallery(getPinsForTab());
}

function selectTab(tab) {
  activeTab = tab;
  renderActiveTab();
}

tabCreated.addEventListener("click", () => selectTab(tabCreated));
tabSaved.addEventListener("click", () => selectTab(tabSaved));

/* ---------- Render ---------- */
function createPinCard(pin) {
  const clone = pin_template.content.cloneNode(true);
  clone.querySelector(".pin").dataset.id = pin.id;
  clone.querySelector(".pin-image").src = pin.image;
  clone.querySelector(".pin-image").alt = pin.name;

  return clone;
}

function startUserData() {
  const userIcon = document.getElementById("user-icon");

  userIcon.src = `../assets/icons/${currentUser.icon}`;
  document.getElementById("profile-icon").src = userIcon.src;
  document.getElementById("profile-username").textContent =
    currentUser.username;
  document.getElementById("username").textContent = currentUser.username;

  updateCounts();
  selectTab(tabCreated);
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
