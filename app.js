//Import dependencies
const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
require('dotenv').config();

//Import classes
const { LiveGames } = require('./services/liveGames');
const { Players } = require('./services/players');
var games = new LiveGames();
var players = new Players();
var randomUrl = require('./services/randomUrl')

const publicPath = path.join(__dirname, '/public');
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

const connectDB = require('./DB/dbConnect');
connectDB();
const KahootGame = require('./DB/models/kahootGameModel');
const initializeSocketHandlers = require('./socket/socketHandlers');

app.use(express.static(publicPath));
app.use(express.json())

app.use('/randomUrl', randomUrl);
app.get('/healthCheck', (req, res) => {
    console.log("healthCheck")
    res.send('Hello World!')
})

server.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT}`);
});


initializeSocketHandlers(io, KahootGame);
