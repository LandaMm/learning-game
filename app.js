const path = require("path");
const http = require("http");
const express = require("express");

const { registerIO } = require("./io");

const connectDB = require("./DB/dbConnect");
const initializeSocketHandlers = require("./socket/socketHandlers");
const cors = require("cors");
const { appLogger } = require("./logger");

const adminRouter = require("./admin/router");
const teacherRouter = require("./teacher/router");
const makeAdmin = require("./admin/makeadmin");

require("dotenv").config();

const publicPath = path.join(__dirname, "/public");

const app = express();
const server = http.createServer(app);

app.use(express.static(publicPath));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors());

app.use("/admin", adminRouter);
app.use("/teacher", teacherRouter);

makeAdmin(app);

registerIO(server, (io) => {
  initializeSocketHandlers(io);
  app.locals.io = io;
});

connectDB().then(() => {
  server.listen(process.env.PORT, () => {
    appLogger.info(`Server started on port ${process.env.PORT}`);
  });
});
