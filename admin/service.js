const jwt = require("jsonwebtoken");
const { adminLogger } = require("../logger");
const Teachers = require("../services/teacher");

const teachers = new Teachers();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET;

const verifyAdmin = async (authToken) => {
  try {
    const payload = jwt.verify(authToken, ADMIN_TOKEN_SECRET, {
      algorithms: "HS256",
    });

    if (!payload) throw new Error("Unauthorized");

    adminLogger.info("verified token with payload:", payload);

    const { username, password } = payload;

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD)
      throw new Error("Unauthorized");

    return true;
  } catch (err) {
    const teacher = await teachers.findByAccessToken(authToken);
    if (teacher && teacher.isAdmin === true) {
      return true;
    }
    throw new Error("Unauthorized");
  }
};

module.exports = {
  verifyAdmin,
};
