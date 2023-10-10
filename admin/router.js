const { Router } = require("express");
const { adminLogger, appLogger } = require("../logger");

const { Games } = require("../services/games");
const { Players } = require("../services/players");
const Teachers = require("../services/teacher");
const GameStatsService = require("../services/gameStats");

const jwt = require("jsonwebtoken");
const Quizes = require("../services/quiz");
const { verifyAdmin } = require("./service");

const adminRouter = Router();

const games = new Games();
const players = new Players();
const quizes = new Quizes();
const teachers = new Teachers();
const gameStats = new GameStatsService();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET;

adminRouter.use(async (req, res, next) => {
  adminLogger.info(
    `request to "${req.path}" with data "${JSON.stringify(req.body)}"`,
  );
  if (req.headers["authorization"]) {
    adminLogger.info(
      `authenticated with "${req.headers["authorization"]}" token`,
    );
  }

  if (req.path !== "/login") {
    const authToken = req.headers["authorization"].slice(7);
    if (!authToken)
      return res.status(401).json({
        statusCode: 401,
        message: "Unauthorized",
      });

    try {
      await verifyAdmin(authToken);
    } catch (err) {
      return res.status(401).json({
        statusCode: 401,
        message: err?.message || "Unauthorized",
      });
    }
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

adminRouter.get("/teachers", async (req, res) => {
  const records = await teachers.getAll();
  res.status(200).json(records);
});

adminRouter.get("/games", async (req, res) => {
  const teacherFilter = req.query.teacher;
  const gameQuery = {};
  if (teacherFilter) {
    const teacher = await teachers.findById(teacherFilter);
    adminLogger.info("got teacher filter", teacher.toJSON());
    gameQuery.createdBy = teacher;
  }
  const gameList = await games.findAll(gameQuery);
  const gameWithPlayers = await Promise.all(
    gameList.map(async (game) => {
      const playersInGame = await players.getPlayers(game.hostId);

      return {
        ...game.toJSON(),
        players: playersInGame,
      };
    }),
  );
  res.status(200).json(gameWithPlayers);
});

adminRouter.get("/quizes", async (req, res) => {
  const teacherFilter = req.query.teacher;
  appLogger.info("req.query", req.query);
  const quizList = await quizes.getAllQuizes(teachers, teacherFilter || "all");
  res.status(200).json(quizList);
});

adminRouter.get("/quizes/:id", async (req, res) => {
  const quiz = await quizes.findById(req.params.id);
  res.status(200).json(quiz);
});

adminRouter.delete("/quizes/:id", async (req, res) => {
  await quizes.adminRemoveQuiz(req.params.id);
  res.status(200).json({
    statusCode: 200,
    message: "Quiz deleted.",
  });
});

adminRouter.put("/quizes/:id", async (req, res) => {
  const updated = await quizes.adminUpdateQuiz(
    req.params.id,
    req.body.name,
    req.body.questions,
  );
  res.status(200).json(updated);
});

adminRouter.delete("/games/:id", async (req, res) => {
  const gameId = req.params.id;
  await games.removeById(gameId);
  res.status(200).json({
    statusCode: 200,
    message: "Game deleted successfully!",
  });
});

adminRouter.get("/games/:id", async (req, res) => {
  const gameId = req.params.id;
  const sortBy = req.query.sortBy;
  let questions;
  if (sortBy === "easiest") {
    questions = await gameStats.findGameEasiestQuestions(gameId);
    appLogger.info("easiest questions (router)", questions);
  }
  if (sortBy == "hardest")
    questions = await gameStats.findGameHardestQuestions(gameId);
  if (sortBy === "mostNoAnswer") {
    questions = await gameStats.findGameMostMissAnsweredQuestions(gameId);
  }

  if (!["easiest", "hardest", "mostNoAnswer"].includes(sortBy)) {
    questions = await gameStats.findGameEasiestQuestions(gameId);
  }
  res.status(200).json(questions);
});

adminRouter.get("/quizes/:id/stats", async (req, res) => {
  const quizId = req.params.id;
  const sortBy = req.query.sortBy;
  let questions;
  if (sortBy === "easiest") {
    questions = await gameStats.findQuizEasiestQuestions(quizId);
    appLogger.info("easiest questions (router)", questions);
  }
  if (sortBy == "hardest")
    questions = await gameStats.findQuizHardestQuestions(quizId);
  if (sortBy === "mostNoAnswer") {
    questions = await gameStats.findQuizMostNoAnswerQuestions(quizId);
  }

  if (!["easiest", "hardest", "mostNoAnswer"].includes(sortBy)) {
    questions = await gameStats.findQuizEasiestQuestions(quizId);
  }
  res.status(200).json(questions);
});

module.exports = adminRouter;
