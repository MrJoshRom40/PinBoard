import { User } from "../js/classes/User.js";

export function startLocalStorage() {
  const users = [
    new User("admin", "admin123", "admin@example.com", "admin", "choper.jpg"),
    new User(
      "Hector",
      "hector123",
      "hector@example.com",
      "user",
      "Perfil2.jpeg",
    ),
    new User(
      "Valeria",
      "valeria123",
      "valeria@example.com",
      "user",
      "Perfil3.jpeg",
    ),
    new User(
      "Joshua",
      "joshua123",
      "joshua@example.com",
      "user",
      "Perfil1.jpg",
    ),
  ];
  localStorage.setItem("users", JSON.stringify(users));
}
