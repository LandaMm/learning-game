const { Router } = require("express");
const { appLogger } = require("../logger");

const jwt = require("jsonwebtoken");

const TEACHER_TOKEN_SECRET = process.env.TEACHER_TOKEN_SECRET;

const Teachers = require("../services/teacher");
const Quizes = require("../services/quiz");

const teachers = new Teachers();
const quizes = new Quizes();

const teacherRouter = Router();

const teacherAuthGuard = async (req, res, next) => {
  appLogger.info(
    `request to "${req.path}" with data "${JSON.stringify(req.body)}"`,
  );
  if (req.headers["authorization"]) {
    appLogger.info(
      `authenticated with "${req.headers["authorization"]}" token`,
    );
  }

  const authToken = req.headers["authorization"].slice(7);
  if (!authToken)
    return res.status(401).json({
      statusCode: 401,
      message: "Unauthorized",
    });

  try {
    const payload = jwt.verify(authToken, TEACHER_TOKEN_SECRET, {
      algorithms: "HS256",
    });

    if (!payload)
      return res.status(401).json({
        statusCode: 401,
        message: "Unauthorized",
      });

    appLogger.info("verified token with payload:", payload);

    const { sub: email } = payload;
    const user = await teachers.findByEmail(email);

    if (!user) {
      return res.status(401).json({
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    req.user = user;

    next();
  } catch (err) {
    return res.status(401).json({
      statusCode: 401,
      message: "Unauthorized",
    });
  }
};

teacherRouter.post("/login", async (req, res) => {
  const body = req.body;
  const { email, password } = body;
  if (!email || !password)
    res.status(400).json({
      statusCode: 400,
      message: "Missing required fields",
    });

  try {
    const teacher = await teachers.validate(email, password);

    const tokens = await teachers.getTokens(teacher);

    res.status(200).json(tokens);
  } catch (err) {
    appLogger.info("teacher login failed", err);
    res.status(400).json({
      statusCode: err?.message ? 400 : 500,
      message: err?.message || "Unknown error",
    });
  }
});

teacherRouter.post("/refresh", async (req, res) => {
  const refreshToken = req.headers["authorization"];
  if (!refreshToken) {
    return res.status(400).json({
      statusCode: 400,
      message: "Refresh Token is required",
    });
  }

  const decoded = teachers.decodeRefreshToken(refreshToken);

  try {
    const payload = jwt.verify(decoded, TEACHER_TOKEN_SECRET);

    appLogger.info("verified refresh token", payload);

    const email = payload.sub;
    if (!email) {
      return res.status(401).json({
        statusCode: 401,
        message: "Invalid refresh token.",
      });
    }

    const user = await teachers.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        statusCode: 401,
        message: "Invalid session",
      });
    }

    const tokens = await teachers.getTokens(user);

    res.status(200).json(tokens);
  } catch (err) {
    res.status(401).json({
      statusCode: 401,
      message: "Invalid refresh token",
    });
  }
});

teacherRouter.get("/quizes", teacherAuthGuard, async (req, res) => {
  appLogger.info("getting quizes for user", req.user);
  const userQuizes = await quizes.getTeacherQuizes(req.user._id);
  res.status(200).json(userQuizes);
});

module.exports = teacherRouter;
