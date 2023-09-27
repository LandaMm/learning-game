const Teacher = require("../DB/models/teacher");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { appLogger } = require("../logger");

const TEACHER_TOKEN_SECRET = process.env.TEACHER_TOKEN_SECRET;

class Teachers {
  constructor() {
    this.model = Teacher;
  }

  async register(data) {
    const salts = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salts);
    return await this.model.create({
      ...data,
      password: hashedPassword,
    });
  }

  async validate(email, password) {
    const user = await this.model.findOne({ email }).select("+password").exec();
    if (!user) throw new Error("User with given email is not found.");
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Bad credentials.");
    return user;
  }

  encodeRefreshToken(content) {
    return Buffer.from(content).toString("base64");
  }

  decodeRefreshToken(token) {
    return Buffer.from(token, "base64").toString("utf-8");
  }

  async getTokens(user) {
    const payload = {
      sub: user.email,
    };
    const accessToken = jwt.sign(payload, TEACHER_TOKEN_SECRET, {
      algorithm: "HS256",
      expiresIn: "1m",
    });
    const refreshToken = jwt.sign(payload, TEACHER_TOKEN_SECRET, {
      algorithm: "HS256",
      expiresIn: "1d",
    });
    appLogger.info("generated tokens for teacher", {
      accessToken,
      refreshToken,
    });
    const hashedRefreshToken = this.encodeRefreshToken(refreshToken);
    appLogger.info("hashed refresh token", hashedRefreshToken);
    user.refreshToken = refreshToken;
    await user.save();
    return {
      accessToken,
      refreshToken: hashedRefreshToken,
    };
  }

  async findByEmail(email, selectToken) {
    const query = this.model.findOne({ email });
    if (selectToken) {
      query.select("+refreshToken");
    }
    return query.exec();
  }

  async findByAccessToken(token) {
    try {
      const payload = await jwt.verify(token, TEACHER_TOKEN_SECRET);

      appLogger.info("verified access token with payload", payload);

      if (payload.sub) {
        return await this.findByEmail(payload.sub);
      }

      return null;
    } catch (err) {
      appLogger.info("failed to verify token", err);
      return null;
    }
  }
}

module.exports = Teachers;
