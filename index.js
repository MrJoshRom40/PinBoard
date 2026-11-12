import { startLocalStorage } from "./storage/startLocalStorage.js";
import { attachContextMenu } from "./js/Components/ContextMenu.js";

/* ---------- Siembra de datos (antes de leer nada) ---------- */
startLocalStorage();

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

/* ---------- Elementos y datos ---------- */
const logo = document.getElementById("logo");
const pin_template = document.querySelector("#pin-template");
const pin_container = document.querySelector(".pin-gallery");
const footer = document.querySelector("footer");

let pins = JSON.parse(localStorage.getItem("pins") || "[]");
let users = JSON.parse(localStorage.getItem("users") || "[]");

console.log("Cantidad de pines:", pins.length);

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

function toggleItem(array, item) {
  const index = array.indexOf(item);
  if (index === -1) {
    array.push(item);
    return true;
  }
  array.splice(index, 1);
  return false;
}

/* ---------- Eventos ---------- */
logo.addEventListener("click", (event) => {
  event.preventDefault();
  window.location.href = "/";
});

attachContextMenu(footer, () => [
  {
    label: "Logout",
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

    const isOwn = pin.user === currentUser.id;
    const isLiked = pin.likes.includes(currentUser.id);
    const isSaved = currentUser.pinsSaved.includes(pin.id);

    console.log(currentUser.pinsSaved);

    return [
      {
        label: isLiked ? "Unlike" : "Like",
        icon: isLiked ? "favorite" : "favorite_border",
        action: () => {
          if (isLiked) {
            pin.likes = pin.likes.filter((u) => u !== currentUser.id);
          } else {
            pin.likes.push(currentUser.id);
          }
          savePins();
          pinEl.querySelector(".pin-image").src = pin.image;
          Swal.fire({
            position: "top-end",
            imageUrl: `./assets/svg/${isLiked ? "unlike" : "like"}.svg`,
            imageWidth: 100,
            imageHeight: 100,
            imageAlt: "heart icon",
            title: isLiked ? "Unliked" : "Liked",
            showConfirmButton: false,
            timer: 750,
          });
        },
      },
      {
        label: isSaved ? "Unsave" : "Save",
        icon: isSaved ? "bookmark_remove" : "save_alt",
        action: () => {
          const nowSaved = toggleItem(currentUser.pinsSaved, pin.id);
          saveCurrentUser();
          Swal.fire({
            position: "top-end",
            imageUrl: "./assets/svg/add_circle_outline_24dp_E3E3E3.svg",
            imageWidth: 100,
            imageHeight: 100,
            imageAlt: "save icon",
            title: nowSaved ? "Saved" : "Removed from saved",
            showConfirmButton: false,
            timer: 750,
          });
        },
      },
      {
        label: isOwn ? "It's yours" : "Follow creator!",
        icon: "person_add",
        disabled: isOwn,
        action: () => followCreator(pin.user),
      },
    ];
  },
  ".pin",
);

/* ---------- Lógica ---------- */
function followCreator(creatorId) {
  const creator = users.find((u) => u.id === creatorId);
  if (!creator) return;

  if (!creator.followers.includes(currentUser.id)) {
    //if current user isn't following the pin creator...
    creator.followers.push(currentUser.id); //add current user to the pin creator's followers
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: "Following!",
      showConfirmButton: false,
      timer: 750,
    });
  }
  saveUsers();
}

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

  const userIcon = document.getElementById("user-icon");
  console.log("Current user data:", currentUser.type);

  userIcon.src = `./assets/icons/${currentUser.icon}`;
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
    <a href="/users">
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
