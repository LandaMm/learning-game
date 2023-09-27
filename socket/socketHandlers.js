const registerHostHandlers = require("./host");
const registerGameHandlers = require("./game");
const registerPlayerHandlers = require("./player");
const { appLogger } = require("../logger");
const Teachers = require("../services/teacher");

const teachers = new Teachers();

module.exports = (io) => {
  io.on("connection", async (socket) => {
    appLogger.info("socket connected with handshake", socket.handshake.auth);

    const auth = socket.handshake.auth;

    if (auth?.token) {
      const teacher = await teachers.findByAccessToken(auth.token);
      teacher.socketId = socket.id;
      await teacher.save();
    }

    // host
    registerHostHandlers(socket, io);

    // game handlers
    registerGameHandlers(socket, io);

    // players
    registerPlayerHandlers(socket, io);
  });
};
