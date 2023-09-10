const games = new Games();
const players = new Players();

const { Games } = require("../services/games");
const { Players } = require("../services/players");
const playerJoinHandler = require("./player/handlers/playerJoin");
const playerJoinGameHandler = require("./player/handlers/playerJoinGame");

const registerPlayerHandlers = (socket, io) => {
  socket.on("player-join", (params) =>
    playerJoinHandler(socket, io, params, games, players),
  );
  socket.on("player-join-game", (data) =>
    playerJoinGameHandler(socket, data, games, players),
  );
};

module.exports = registerPlayerHandlers;
