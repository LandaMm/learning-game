const registerHostHandlers = require("./host");
const registerGameHandlers = require("./game");
const registerPlayerHandlers = require("./player");

module.exports = (io) => {
  io.on("connection", (socket) => {
    // host
    registerHostHandlers(socket, io);

    // game handlers
    registerGameHandlers(socket, io);

    // players
    registerPlayerHandlers(socket, io);
  });
};
