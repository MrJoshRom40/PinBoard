import { startLocalStorage } from "./storage/startLocalStorage.js";
import { attachContextMenu } from "./js/Components/ContextMenu.js";
import { setupDeleteAll } from "./js/killer.js";

/* ---------- Siembra de datos (antes de leer nada) ---------- */
startLocalStorage();
setupDeleteAll("./pages/login.html");

/* ---------- Guardia de sesión ---------- */
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

function requireSession() {
  if (!localStorage.getItem("currentUser")) {
    window.location.replace("./pages/login.html");
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

let pins = JSON.parse(localStorage.getItem("pins") || "[]");
let users = JSON.parse(localStorage.getItem("users") || "[]");

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

/* ---------- Lógica compartida (menú contextual y Swal) ---------- */
function getPinState(pin) {
  pin.likes ??= [];
  const creator = users.find((u) => u.id === pin.user);

  return {
    creator,
    isOwn: pin.user === currentUser.id,
    isLiked: pin.likes.includes(currentUser.id),
    isSaved: currentUser.pinsSaved.includes(pin.id),
    isFollowing: (creator?.followers ?? []).includes(currentUser.id),
  };
}

function toggleLike(pin) {
  pin.likes ??= [];
  const now = toggleItem(pin.likes, currentUser.id);
  savePins();
  return now;
}

function toggleSave(pin) {
  const now = toggleItem(currentUser.pinsSaved, pin.id);
  saveCurrentUser();
  return now;
}

function toggleFollow(creator) {
  creator.followers ??= [];
  const now = toggleItem(creator.followers, currentUser.id);
  saveUsers();
  return now;
}

// Etiquetas e iconos según el estado (los mismos para menú y Swal)
function getActions(pin) {
  const s = getPinState(pin);

  return [
    {
      key: "like",
      label: s.isLiked ? "Unlike" : "Like",
      icon: s.isLiked ? "favorite" : "favorite_border",
      active: s.isLiked,
      disabled: false,
    },
    {
      key: "save",
      label: s.isSaved ? "Unsave" : "Save",
      icon: s.isSaved ? "bookmark_remove" : "save_alt",
      active: s.isSaved,
      disabled: false,
    },
    {
      key: "follow",
      label: s.isOwn
        ? "It's yours"
        : s.isFollowing
          ? "Unfollow creator"
          : "Follow creator!",
      icon: s.isFollowing ? "person_remove" : "person_add",
      active: s.isFollowing,
      disabled: s.isOwn || !s.creator,
    },
  ];
}

/* ---------- Eventos ---------- */
logo.addEventListener("click", (event) => {
  event.preventDefault();
  window.location.href = "/";
});

attachContextMenu(footer, () => [
  {
    label: "Logout",
    icon: "logout",
    danger: true,
    action: () => {
      localStorage.removeItem("currentUser");
      window.location.replace("./pages/login.html");
    },
  },
]);

// Menú de cada pin (delegación sobre la galería)
attachContextMenu(
  pin_container,
  (pinEl) => {
    const pin = pins.find((p) => String(p.id) === pinEl.dataset.id);
    if (!pin) return [];

    const [like, save, follow] = getActions(pin);
    const { creator } = getPinState(pin);

    return [
      {
        label: like.label,
        icon: like.icon,
        action: () => {
          const nowLiked = toggleLike(pin);
          toast({
            imageUrl: `./assets/svg/${nowLiked ? "like" : "unlike"}.svg`,
            imageWidth: 100,
            imageHeight: 100,
            imageAlt: "heart icon",
            title: nowLiked ? "Liked" : "Unliked",
          });
        },
      },
      {
        label: save.label,
        icon: save.icon,
        action: () => {
          const nowSaved = toggleSave(pin);
          toast({
            imageUrl: "./assets/svg/add_circle_outline_24dp_E3E3E3.svg",
            imageWidth: 100,
            imageHeight: 100,
            imageAlt: "save icon",
            title: nowSaved ? "Saved" : "Removed from saved",
          });
        },
      },
      {
        label: follow.label,
        icon: follow.icon,
        disabled: follow.disabled,
        action: () => {
          const nowFollowing = toggleFollow(creator);
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

/* ---------- Swal de detalle del pin ---------- */
// Todo se construye con DOM y textContent (los datos del pin los escribe el usuario)
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function openPinModal(pin) {
  const { creator } = getPinState(pin);

  const box = el("div", "pin-modal");

  const img = el("img", "pin-modal__image");
  img.src = pin.image;
  img.alt = pin.name;

  const body = el("div", "pin-modal__body");
  body.append(
    el("h3", "pin-modal__title", pin.name),
    el("p", "pin-modal__description", pin.description),
  );

  const creatorLine = el("p", "pin-modal__creator", "By ");
  creatorLine.append(el("strong", "", creator?.username ?? "Unknown user"));
  body.append(creatorLine);

  if (pin.categories?.length) {
    const chips = el("div", "pin-modal__chips");
    pin.categories.forEach((c) =>
      chips.append(el("span", "pin-modal__chip", c)),
    );
    body.append(chips);
  }

  // Iconos de acción (esquina inferior derecha)
  const footerRow = el("div", "pin-modal__footer");
  const likesCount = el("span", "pin-modal__likes");
  const actions = el("div", "pin-modal__actions");
  footerRow.append(likesCount, actions);

  const buttons = {};
  ["like", "save", "follow"].forEach((key) => {
    const btn = el("button", "pin-modal__action");
    btn.type = "button";
    const icon = el("span", "material-symbols-outlined");
    icon.setAttribute("aria-hidden", "true");
    btn.append(icon);
    buttons[key] = { btn, icon };
    actions.append(btn);
  });

  // Refresca iconos, textos y estados con las mismas condicionales del menú
  function refresh() {
    getActions(pin).forEach((a) => {
      const { btn, icon } = buttons[a.key];
      icon.textContent = a.icon;
      btn.title = a.label;
      btn.setAttribute("aria-label", a.label);
      btn.disabled = a.disabled;
      btn.classList.toggle("is-active", a.active);
    });
    likesCount.textContent = `${pin.likes.length} like${pin.likes.length === 1 ? "" : "s"}`;
  }

  buttons.like.btn.addEventListener("click", () => {
    toggleLike(pin);
    refresh();
  });
  buttons.save.btn.addEventListener("click", () => {
    toggleSave(pin);
    refresh();
  });
  buttons.follow.btn.addEventListener("click", () => {
    if (!creator) return;
    toggleFollow(creator);
    refresh();
  });

  refresh();
  box.append(img, body, footerRow);

  Swal.fire({
    html: box,
    width: "42rem",
    padding: 0,
    heightAuto: false,
    showConfirmButton: false,
    showCloseButton: true,
    background: "#fffdf5",
    color: "#0f3c65",
    customClass: { popup: "pin-modal-popup" },
  });
}

// Clic en un pin (delegación sobre la galería)
pin_container.addEventListener("click", (event) => {
  const pinEl = event.target.closest(".pin");
  if (!pinEl) return;

  const pin = pins.find((p) => String(p.id) === pinEl.dataset.id);
  if (pin) openPinModal(pin);
});

/* ---------- Render ---------- */
function createPinCard(pin) {
  const clone = pin_template.content.cloneNode(true);
  clone.querySelector(".pin").dataset.id = pin.id;
  clone.querySelector(".pin-image").src = pin.image;
  clone.querySelector(".pin-image").alt = pin.name;

  return clone;
}

function startUserData() {
  if (document.referrer.includes("splash.html")) {
    Swal.fire({
      icon: "success",
      title: "Excelsior!",
      text: "Login successful!",
      heightAuto: false,
      confirmButtonColor: "#58cd5f",
      confirmButtonText: "Continue",
      background: "#fffdf5",
      color: "#0f3c65",
    });
  }

  document.getElementById("user-icon").src =
    `./assets/icons/${currentUser.icon}`;
  document.getElementById("username").textContent = currentUser.username;

  pins.forEach((p) => {
    pin_container.appendChild(createPinCard(p));
  });
}

function addAdminOptions() {
  const list = document.querySelector("nav ul");

  list.insertAdjacentHTML(
    "beforeend",
    `
    <a href="./pages/Users.html">
      <img src="./assets/svg/manage_accounts_24dp_163A63_FILL0_wght400_GRAD0_opsz24.svg" alt="users" />
      <p>Users</p>
    </a>
    <a id="delete-all" style="cursor: pointer;">
      <img src="./assets/svg/delete_24dp_163A63_FILL0_wght400_GRAD0_opsz24.svg" alt="delete" />
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
