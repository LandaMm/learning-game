const { LiveGames } = require("../../services/liveGames");

const utilities = require("../utilities");
const games = new LiveGames();

// import host handlers
const hostJoinHandler = require("./handlers/join");
const hostJoinGameHandler = require("./handlers/join-game");

/**
 *
 * @param {Socket} socket
 */
const registerHostHandlers = (socket) => {
  socket.on("host-join", (data) =>
    hostJoinHandler(socket, data, games, utilities),
  );
  socket.on("host-join-game", (data) =>
    hostJoinGameHandler(socket, data, utilities),
  );
};

module.exports = registerHostHandlers;
