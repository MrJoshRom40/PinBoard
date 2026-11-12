import { User } from "../js/classes/User.js";

const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const iconSelector = document.getElementById("icon-selector");
const registerButton = document.getElementById("register-button");

const icons = [
  "choper.jpg",
  "icon.jpg",
  "josefresa.jpg",
  "Perfil1.jpg",
  "Perfil2.jpeg",
  "Perfil3.jpeg",
];

let selectedIcon;

function renderUserIcons() {
  // Implementation for rendering the register icons
  icons.forEach((icon) => {
    const img = document.createElement("img");
    img.src = `../assets/icons/${icon}`;
    img.alt = icon.split(".")[0];
    img.classList.add("user-icon");
    (img.addEventListener("click", () => {
      if (selectedIcon == icon) {
        img.classList.remove("selected");
        selectedIcon = null;
      } else {
        img.classList.add("selected");
      }
      selectedIcon = icon;
    }),
      iconSelector.appendChild(img));
  });
}

registerButton.addEventListener("click", (event) => {
  event.preventDefault();

  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const equalUsername = users.some((u) => u.username === username);
  const equalEmail = users.some((u) => u.email === email);

  if (equalUsername || equalEmail) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: equalUsername
        ? "You can't use that username!"
        : "You can't use that email!",
      confirmButtonColor: "#d9693f",
      confirmButtonText: "Try Again",
      background: "#fffdf5",
      color: "#0f3c65",
    });
    return;
  }

  if (!selectedIcon) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Please select an icon!",
      confirmButtonColor: "#d9693f",
      confirmButtonText: "Try Again",
      background: "#fffdf5",
      color: "#0f3c65",
    });
    return;
  }

  const user = new User(username, password, email, "user", selectedIcon);
  users.push(user);

  localStorage.setItem("users", JSON.stringify(users));

  console.log(users);

  Swal.fire({
    icon: "success",
    title: "Registration Successful!",
    text: "You have been registered successfully, try to log in!",
    confirmButtonColor: "#58cd5f",
    confirmButtonText: "Go to Login",
    background: "#fffdf5",
    color: "#0f3c65",
  }).then(() => {
    window.location.href = "./login.html";
  });
});

renderUserIcons();
