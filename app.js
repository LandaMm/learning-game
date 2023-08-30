//Import dependencies
const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

//Import classes
const initializeSocketHandlers = require('./socket/socketHandlers');

const publicPath = path.join(__dirname, '/public');
var app = express();
var server = http.createServer(app);
var io = socketIO(server);


const connectDB = require('./DB/dbConnect');
connectDB();



app.use(express.static(publicPath));

//Starting server on port 3000
server.listen(3333, () => {
    console.log("Server started on port 3333");
});


initializeSocketHandlers(io);




