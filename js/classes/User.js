export class User {
  constructor(username, password, email, type, icon, id = crypto.randomUUID()) {
    this.id = id; //Unique identifier for the user
    this.username = username;
    this.password = password;
    this.email = email;
    this.type = type;
    this.icon = icon; //Icon src representing the user's profile picture
    this.pinsSaved = []; //Array of Pin id saved by the user
    this.followers = []; //Array of User id that follow the user
  }
}
