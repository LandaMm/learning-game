const registerHostHandlers = require("./host");
const registerGameHandlers = require("./game");
const registerPlayerHandlers = require("./playerHandlers");

module.exports = (io) => {
  io.on("connection", (socket) => {
    // host
    registerHostHandlers(socket);

    // game handlers
    registerGameHandlers(socket, io);

    // players
    registerPlayerHandlers(socket, io);
  });
};
