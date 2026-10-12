const currentUser = JSON.parse(localStorage.getItem("currentUser"));

function startUserData() {
  const userIcon = document.getElementById("user-icon");
  console.log("Current user data:", currentUser);

  userIcon.src = `./assets/icons/${currentUser.icon}`;

  const usernameElement = document.getElementById("username");
  usernameElement.textContent = currentUser.username;
}

startUserData();
