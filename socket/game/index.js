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

const games = new Games();
const players = new Players();

const registerGameHandlers = (socket, io) => {
  socket.on("requestDbNames", () => requestGamesHandler(socket, utilities));
  socket.on("disconnect", () =>
    gameDisconnectHandler(socket, io, games, players),
  );
  // TODO: check if it's correct way of getting num from payload
  socket.on("playerAnswer", (num) =>
    playerAnswerHandler(socket, io, num, games, players, utilities),
  );
  socket.on("getScore", () => getScoreHandler(socket, players));
  socket.on("time", (data) => timeHandler(socket, data));
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
