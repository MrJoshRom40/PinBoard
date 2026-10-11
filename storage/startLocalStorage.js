import { User } from "../js/classes/User.js";

export function startLocalStorage() {
  if (localStorage.getItem("users") === null) {
    const users = [
      new User("admin", "admin123", "admin@example.com", "admin"),
      new User("Hector", "hector123", "hector@example.com", "user"),
      new User("Valeria", "valeria123", "valeria@example.com", "user"),
      new User("Joshua", "joshua123", "joshua@example.com", "user"),
    ];
    localStorage.setItem("users", JSON.stringify(users));
  }
}
