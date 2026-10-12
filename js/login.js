const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("login-button");

loginButton.addEventListener("click", (event) => {
  event.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  const users = JSON.parse(localStorage.getItem("users") || "[]");

  const user = users.find(
    (u) => u.username === username && u.password === password,
  );

  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
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
