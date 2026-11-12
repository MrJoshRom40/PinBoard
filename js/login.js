const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("login-button");
const registerButton = document.getElementById("register-button");

function showError(text) {
  Swal.fire({
    icon: "error",
    title: "Oops...",
    text,
    confirmButtonColor: "#d9693f",
    confirmButtonText: "Try Again",
    background: "#fffdf5",
    color: "#0f3c65",
  });
}

loginButton.addEventListener("click", (event) => {
  event.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  const users = JSON.parse(localStorage.getItem("users") || "[]");

  const user = users.find(
    (u) => u.username === username && u.password === password,
  );

  if (!user) return showError("Invalid username or password!");

  // Un usuario eliminado se trata como si no existiera
  if (user.status === "deleted") {
    return showError("Invalid username or password!");
  }

  if (user.status === "sleeping") {
    return showError("Your account is temporarily suspended.");
  }

  localStorage.setItem("currentUser", JSON.stringify(user));
  window.location.href = "./splash.html";
});

registerButton.addEventListener("click", (event) => {
  event.preventDefault();
  window.location.href = "./register.html";
});
