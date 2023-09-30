const { Router } = require("express");
const { adminLogger } = require("../logger");

const { Games } = require("../services/games");
const { Players } = require("../services/players");
const Teachers = require("../services/teacher");
const GameStatsService = require("../services/gameStats");

const jwt = require("jsonwebtoken");
const Quizes = require("../services/quiz");

const adminRouter = Router();

const games = new Games();
const players = new Players();
const quizes = new Quizes();
const teachers = new Teachers();
const gameStats = new GameStatsService();

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

  if (req.path !== "/login") {
    const authToken = req.headers["authorization"].slice(7);
    if (!authToken)
      return res.status(401).json({
        statusCode: 401,
        message: "Unauthorized",
      });

    try {
      const payload = jwt.verify(authToken, ADMIN_TOKEN_SECRET, {
        algorithms: "HS256",
      });

      if (!payload)
        return res.status(401).json({
          statusCode: 401,
          message: "Unauthorized",
        });

      adminLogger.info("verified token with payload:", payload);

      const { username, password } = payload;

      if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD)
        return res.status(401).json({
          statusCode: 401,
          message: "Unauthorized",
        });
    } catch (err) {
      return res.status(401).json({
        statusCode: 401,
        message: "Unauthorized",
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
  const quizList = await quizes.getAllQuizes("all");
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
  const easiestQuestions = await gameStats.findGameHardestQuestions(gameId);
  const hardestQuestions = await gameStats.findGameHardestQuestions(gameId);
  const mostNoAnswerQuestions =
    await gameStats.findGameMostMissAnsweredQuestions(gameId);
  res.status(200).json({
    easiest: easiestQuestions,
    hardest: hardestQuestions,
    mostNoAnswer: mostNoAnswerQuestions,
  });
});

adminRouter.get("/quizes/:id", async (req, res) => {
  const quizId = req.params.id;
  const easiestQuestions = await gameStats.findQuizEasiestQuestions(quizId);
  const hardestQuestions = await gameStats.findQuizHardestQuestions(quizId);
  const mostNoAnswerQuestions =
    await gameStats.findGameMostMissAnsweredQuestions(quizId);
  res.status(200).json({
    easiest: easiestQuestions,
    hardest: hardestQuestions,
    mostNoAnswer: mostNoAnswerQuestions,
  });
});

module.exports = adminRouter;
