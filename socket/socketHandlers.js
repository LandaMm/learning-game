const hostHandlers = require('./hostHandlers');
const playerHandlers = require('./playerHandlers');
const gameHandlers = require('./gameHandlers');
const utilities = require('./utilities');

const { LiveGames } = require('../services/liveGames');
const { Players } = require('../services/players');
var games = new LiveGames();
var players = new Players();


module.exports = (io) => {
    io.on('connection', (socket) => {

        socket.on('host-join', (data) => hostHandlers(io).hostJoin(socket, data, games, utilities));
        socket.on('host-join-game', (data) => hostHandlers().hostJoinGame(socket, data));
        socket.on('requestDbNames', () => gameHandlers(socket).requestDbNames(utilities));
        socket.on('player-join', (params) => playerHandlers(io).playerJoin(socket, params, games, players));


    });
};