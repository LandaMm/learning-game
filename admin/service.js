const jwt = require("jsonwebtoken");
const { adminLogger } = require("../logger");

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET;

const verifyAdmin = (authToken) => {
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
    throw new Error("Unauthorized");
  }
};

module.exports = {
  verifyAdmin,
};
