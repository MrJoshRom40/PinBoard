export class Pin {
  constructor(name, description, image, user, id = crypto.randomUUID()) {
    this.id = id; //Unique identifier for the pin
    this.name = name;
    this.description = description;
    this.image = image; //Image src
    this.likes = []; //Array of User ids who liked the pin
    this.user = user; //User id who published the pin
  }
}
