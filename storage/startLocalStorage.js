import { User } from "../js/classes/User.js";
import { Pin } from "../js/classes/Pin.js";

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
  
 // if (localStorage.getItem("pins") === null) {
        const pins = [
          new Pin(
            "Gato", 
            "Gato tragon", 
            "https://i.pinimg.com/originals/1a/fb/aa/1afbaae40d6471fc85438e7df52bf1d0.jpg", 
            "admin",
          ),
          new Pin(
            "Flor", 
            "Flor brillante increible", 
            "https://tse3.mm.bing.net/th/id/OIP.jv5V9fl3iyYRi4_afCHYcAHaE7?r=0&w=2000&h=1333&rs=1&pid=ImgDetMain&o=7&rm=3", 
            "admin",
          ),
          new Pin(
            "Calamardo guapo", 
            "Imagen de calamardo guapisimo", 
            "https://i.pinimg.com/originals/cd/25/fd/cd25fd373c370bffebe5a9743c907299.jpg", 
            "admin",
          ),
          new Pin(
            "Akaza", 
            "Portada de la pelicula castillo infinito", 
            "https://tse1.mm.bing.net/th/id/OIP.2O-9C4tr2ibA-xdUdpxcrAHaLG?r=0&rs=1&pid=ImgDetMain&o=7&rm=3", 
            "admin",
          ),
          new Pin(
            "Gato", 
            "Gato sorprendido", 
            "https://pbs.twimg.com/profile_images/1717824815711879168/CWPKCNng_400x400.jpg", 
            "admin",
          ),
          new Pin(
            "Carro IA", 
            "Carro hecho con IA", 
            "https://tse3.mm.bing.net/th/id/OIP.A79mpHiXQcRSh_-oCQv2WQHaDt?r=0&rs=1&pid=ImgDetMain&o=7&rm=3", 
            "admin",
          ),
          new Pin(
            "Perro que rie", 
            "Perro que se rie de ti jajajaja", 
            "https://i.pinimg.com/originals/2d/08/b0/2d08b0fd5cb36b6d1c468e621ca220e5.jpg", 
            "admin",
          ),
          new Pin(
            "Edificios", 
            "Foto de edificios", 
            "https://hdwallpaperim.com/wp-content/uploads/2017/08/24/100296-urban-city.jpg", 
            "admin",
          ),
          new Pin(
            "wallpaper celular", 
            "wallpaper para celular", 
            "https://wallpapercave.com/wp/wp5550777.jpg", 
            "admin",
          ),
          new Pin(
            "Evangelion", 
            "Robot de evangelion", 
            "https://tse4.mm.bing.net/th/id/OIP.pdmt-bywYH2QJnr6fi_24QHaF7?r=0&rs=1&pid=ImgDetMain&o=7&rm=3", 
            "admin",
          ),
          new Pin(
            "Attack on titan", 
            "Portada de la temporada de attack on titan", 
            "https://tse3.mm.bing.net/th/id/OIP.WEynbQZGXy0bWDah4e6KdAHaEK?r=0&rs=1&pid=ImgDetMain&o=7&rm=3", 
            "admin",
          ),
        ];
        localStorage.setItem("pins", JSON.stringify(pins))
   // }
}
