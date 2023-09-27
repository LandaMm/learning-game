const requestGamesHandler = require("./handlers/requestGames");
const utilities = require("../utilities");
const gameDisconnectHandler = require("./handlers/disconnect");
const { Games } = require("../../services/games");
const { Players } = require("../../services/players");
const playerAnswerHandler = require("./handlers/playerAnswer");
const getScoreHandler = require("./handlers/getScore");
const timeHandler = require("./handlers/time");
const timeUpHandler = require("./handlers/timeUp");
const nextQuestionHandler = require("./handlers/nextQuestion");
const startGameHandler = require("./handlers/startGame");
const newQuizHandler = require("./handlers/newQuiz");
const Quizes = require("../../services/quiz");

const games = new Games();
const players = new Players();
const quizes = new Quizes();

const registerGameHandlers = (socket, io) => {
  socket.on("requestDbNames", (filter) =>
    requestGamesHandler(socket, quizes, filter),
  );
  socket.on("disconnect", () =>
    gameDisconnectHandler(socket, io, games, players),
  );
  // TODO: check if it's correct way of getting num from payload
  socket.on("playerAnswer", (num) =>
    playerAnswerHandler(socket, io, num, games, players, quizes),
  );
  socket.on("getScore", () => getScoreHandler(socket, players));
  socket.on("time", (data) => timeHandler(players, data));
  socket.on("timeUp", () =>
    timeUpHandler(socket, io, games, players, utilities),
  );
  socket.on("nextQuestion", () =>
    nextQuestionHandler(socket, io, games, players, utilities),
  );
  socket.on("startGame", () => startGameHandler(socket, games));
  socket.on("newQuiz", (data) => newQuizHandler(socket, data, utilities));
};

module.exports = registerGameHandlers;
