const { Router } = require("express");
const { adminLogger } = require("../logger");

const jwt = require("jsonwebtoken");

const adminRouter = Router();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET;

adminRouter.use((req, res, next) => {
  adminLogger.info(
    `request to "${req.path}" with data "${JSON.stringify(req.body)}"`,
  );
  if (req.headers["authorization"]) {
    adminLogger.info(
      `authenticated with "${req.headers["authorization"]}" token`,
    );
  }
  next();
});

adminRouter.post("/login", (req, res) => {
  const body = req.body;
  const { username, password } = body;
  if (!username || !password) {
    res.status(401).json({
      statusCode: 401,
      message: "Missing required fields",
    });
    return;
  }

  if (ADMIN_USERNAME !== username || ADMIN_PASSWORD !== password) {
    res.status(401).json({
      statusCode: 401,
      message: "Bad credentials",
    });
    return;
  }

  const token = jwt.sign({ username, password }, ADMIN_TOKEN_SECRET, {
    algorithm: "HS256",
    expiresIn: "1d",
  });

  adminLogger.info("generated auth token", token);

  res.send({
    statusCode: 200,
    message: "Successfully logged in",
    payload: body,
    token,
  });
});

module.exports = adminRouter;
