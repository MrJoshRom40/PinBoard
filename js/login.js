const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("login-button");

loginButton.addEventListener("click", (event) => {
  event.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  const users = JSON.parse(localStorage.getItem("users") || "[]");

  const exists = users.some(
    (user) => user.username === username && user.password === password,
  );

  if (exists) {
    window.location.href = "../index.html";
  } else {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Invalid username or password!",
      confirmButtonColor: "#d9693f",
      confirmButtonText: "Try Again",
      background: "#fffdf5",
      color: "#0f3c65",
    });
  }
});
