const path = require("path");
const http = require("http");
const express = require("express");

const socketIO = require("socket.io");
const ioMiddleware = require("socketio-wildcard")();

const connectDB = require("./DB/dbConnect");
const initializeSocketHandlers = require("./socket/socketHandlers");
const cors = require("cors");
const { appLogger, ioLogger } = require("./logger");

require("dotenv").config();

const publicPath = path.join(__dirname, "/public");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

io.use(ioMiddleware);

io.on("connection", (socket) => {
  ioLogger.info(`socket with "${socket.id}" id connected`);
  socket.on("disconnect", () => {
    ioLogger.info(`socket with "${socket.id}" id disconnected`);
  });
  socket.on("*", (packet) => {
    console.log("PACKET RECEIVE", packet);
    const [eventName, eventData] = packet.data;
    ioLogger.info(
      `event "${eventName}" with ${JSON.stringify(eventData)} data from "${
        socket.id
      }" socket`,
    );
  });
  let _emit = socket.emit;

  // decorate emit function
  socket.emit = (...args) => {
    _emit.apply(socket, args);
    let { 0: eventName, 1: eventData } = args;
    ioLogger.info(
      `emit "${eventName}" event with ${JSON.stringify(eventData)} data to "${
        socket.id
      }" socket`,
    );
  };
});

app.use(express.static(publicPath));

app.use(cors());

initializeSocketHandlers(io);

connectDB().then(() => {
  server.listen(process.env.PORT, () => {
    appLogger.info(`Server started on port ${process.env.PORT}`);
  });
});
