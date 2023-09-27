const socketIO = require("socket.io");
const { ioLogger } = require("./logger");

const ioMiddleware = require("socketio-wildcard")();

const registerIO = (httpServer, cb) => {
  const IO = socketIO(httpServer);

  IO.use(ioMiddleware);

  IO.on("connection", (socket) => {
    ioLogger.info(`socket with "${socket.id}" id connected`);
    socket.on("disconnect", () => {
      ioLogger.info(`socket with "${socket.id}" id disconnected`);
    });
    socket.on("*", (packet) => {
      const [eventName, eventData] = packet.data;
      ioLogger.info(
        `event "${eventName}" with ${
          eventData ? JSON.stringify(eventData) : "no"
        } data from "${socket.id}" socket`,
      );
    });
    let _emit = socket.emit;

    // decorate emit function
    socket.emit = (...args) => {
      _emit.apply(socket, args);
      let { 0: eventName, 1: eventData } = args;
      ioLogger.info(
        `emit "${eventName}" event with ${
          eventData ? JSON.stringify(eventData) : "no"
        } data to "${socket.id}" socket`,
      );
    };
  });

  cb(IO);
};

module.exports = { registerIO };
