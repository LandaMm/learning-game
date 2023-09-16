const path = require("path");
const http = require("http");
const express = require("express");
const socketIO = require("socket.io");
const connectDB = require("./DB/dbConnect");
const initializeSocketHandlers = require("./socket/socketHandlers");
const debug = require("debug");
const cors = require("cors");
const winston = require("winston");
require("dotenv").config();

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}

const debugApp = debug("app");
// TODO: find out if we really need this
// const debugSocket = debug("socket.io");

const publicPath = path.join(__dirname, "/public");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(publicPath));

app.use(cors());

initializeSocketHandlers(io);

connectDB().then(() => {
  server.listen(process.env.PORT, () => {
    debugApp(`Server started on port ${process.env.PORT}`);
  });
});
