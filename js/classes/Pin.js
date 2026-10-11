export class Pin {
  constructor(name, description, image, user) {
    this.name = name;
    this.description = description;
    this.image = image; //Image src
    this.likes = []; //Array of User objects who liked the pin
    this.comments = []; //Array of User objects who commented on the pin
    this.user = user; //User who published the pin
  }

  like(user) {
    if (this.likes.includes(user)) {
      this.likes = this.likes.filter((u) => u !== user); //Deletes the user from the likes array if they already liked the pin
    } else {
      this.likes.push(user); //Add the user to the likes array if they haven't liked the pin yet
    }
  }

  comment(user, comment) {
    this.comments.push({ user, comment }); //Add the user and their comment to the comments array
  }
}
