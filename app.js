const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const connectDB = require('./DB/dbConnect');
const initializeSocketHandlers = require('./socket/socketHandlers');
const debug = require('debug');
require('dotenv').config();

const debugApp = debug('app');
const debugSocket = debug('socket.io');

const publicPath = path.join(__dirname, '/public');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Connect to the database
connectDB();

app.use(express.static(publicPath));

server.listen(process.env.PORT, () => {
    debugApp(`Server started on port ${process.env.PORT}`);
});

initializeSocketHandlers(io);
