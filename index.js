import { startLocalStorage } from "./storage/startLocalStorage.js";
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
const logo = document.getElementById("logo");
const pin_template = document.querySelector("#pin-template");
const pin_container = document.querySelector(".pin-gallery");
const pins = JSON.parse(localStorage.getItem("pins") || "[]");
console.log("Cantidad de pines:", pins.length);

startLocalStorage();

logo.addEventListener("click", (event) => {
  event.preventDefault();
  window.location.href = "/";
});

function createPinCard(pin) {
    const clone = pin_template.content.cloneNode(true);
    clone.querySelector(".pin-image").src = pin.image;
    clone.querySelector(".pin-image").alt = pin.name;

    return clone;
}

function startUserData() {
  if (!currentUser) {
    window.location.href = "./pages/login.html";
    return;
  }

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

  const userIcon = document.getElementById("user-icon");
  console.log("Current user data:", currentUser.type);

  userIcon.src = `./assets/icons/${currentUser.icon}`;

  const usernameElement = document.getElementById("username");
  usernameElement.textContent = currentUser.username;


  pins.forEach(p => {
      pin_container.appendChild(createPinCard(p));
  });
   console.log(pins)

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

startUserData();

if (currentUser.type === "admin") {
  addAdminOptions();
}

