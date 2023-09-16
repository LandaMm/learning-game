const path = require("path");
const http = require("http");
const express = require("express");
const socketIO = require("socket.io");
const connectDB = require("./DB/dbConnect");
const initializeSocketHandlers = require("./socket/socketHandlers");
const cors = require("cors");
const { appLogger } = require("./logger");

require("dotenv").config();

const publicPath = path.join(__dirname, "/public");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(publicPath));

app.use(cors());

initializeSocketHandlers(io);

connectDB().then(() => {
  server.listen(process.env.PORT, () => {
    appLogger.info(`Server started on port ${process.env.PORT}`);
  });
});
