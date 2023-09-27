const registerHostHandlers = require("./host");
const registerGameHandlers = require("./game");
const registerPlayerHandlers = require("./player");
const { appLogger } = require("../logger");

module.exports = (io) => {
  io.on("connection", (socket) => {
    appLogger.info("socket connected with handshake", socket.handshake.auth);
    // host
    registerHostHandlers(socket, io);

    // game handlers
    registerGameHandlers(socket, io);

    // players
    registerPlayerHandlers(socket, io);
  });
};
