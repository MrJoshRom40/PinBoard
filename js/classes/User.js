export class User {
  constructor(username, password, email, type) {
    this.username = username;
    this.password = password;
    this.email = email;
    this.type = type;
    this.pinsCreated = []; //Array of Pin objects cretated by the user
    this.pinsSaved = []; //Array of Pin objects saved by the user
  }

  addPin(pin) {
    this.pins.push(pin);
  }

  removePin(pin) {
    this.pins = this.pins.filter((p) => p !== pin);
  }
}
