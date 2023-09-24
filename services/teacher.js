const Teacher = require("../DB/models/teacher");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const TEACHER_TOKEN_SECRET = process.env.TEACHER_TOKEN_SECRET;

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

  async getTokens(user) {
    const payload = {
      sub: user.email,
    };
    const accessToken = jwt.sign(payload, TEACHER_TOKEN_SECRET, {
      algorithm: "HS256",
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign(payload, TEACHER_TOKEN_SECRET, {
      algorithm: "HS256",
      expiresIn: "1d",
    });
    const salt = await bcrypt.genSalt(10);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);
    return {
      accessToken,
      refreshToken: hashedRefreshToken,
    };
  }
}

module.exports = Teachers;
