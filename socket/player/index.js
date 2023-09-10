const { Games } = require("../../services/games");
const { Players } = require("../../services/players");
const playerJoinHandler = require("./handlers/playerJoin");
const playerJoinGameHandler = require("./handlers/playerJoinGame");

const games = new Games();
const players = new Players();

const registerPlayerHandlers = (socket, io) => {
  console.log("register player.players", players);
  socket.on("player-join", (params) =>
    playerJoinHandler(socket, io, params, games, players),
  );
  socket.on("player-join-game", (data) =>
    playerJoinGameHandler(socket, data, games, players),
  );
};

module.exports = registerPlayerHandlers;
