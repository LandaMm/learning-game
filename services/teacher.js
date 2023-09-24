const Teacher = require("../DB/models/teacher");
const bcrypt = require("bcrypt");

class Teachers {
  constructor() {
    this.model = Teacher;
  }

  async register(data) {
    return await this.model.create(data);
  }

  async validate(email, password) {
    const user = await this.model.findOne({ email }).exec();
    if (!user) throw new Error("User with given email is not found.");
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Bad credentials.");
    return user.toJSON();
  }
}

module.exports = Teachers;
