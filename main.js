import { startLocalStorage } from "./storage/startLocalStorage.js";

startLocalStorage();

console.log("Local storage initialized with default users.");
console.table(JSON.parse(localStorage.getItem("users")));
