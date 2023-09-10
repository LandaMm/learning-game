const { Games } = require("../../services/games");
const { Players } = require("../../services/players");
const Quizes = require("../../services/quiz");

const utilities = require("../utilities");
const quizes = new Quizes();
const games = new Games();
const players = new Players();

// import host handlers
const hostJoinHandler = require("./handlers/join");
const hostJoinGameHandler = require("./handlers/join-game");

/**
 *
 * @param {Socket} socket
 */
const registerHostHandlers = (socket, io) => {
  socket.on("host-join", (data) =>
    hostJoinHandler(socket, data, games, quizes),
  );
  socket.on("host-join-game", (data) => {
    console.log("host-join-game data", data);
    hostJoinGameHandler(socket, io, data, utilities, games, players);
  });
};

module.exports = registerHostHandlers;
