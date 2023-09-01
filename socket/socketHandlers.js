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

        // host
        socket.on('host-join', (data) => hostHandlers(io).hostJoin(socket, data, games, utilities));
        socket.on('host-join-game', (data) => hostHandlers().hostJoinGame(socket, data, utilities));

        // game handlers
        socket.on('requestDbNames', () => gameHandlers(socket).requestDbNames(utilities));
        socket.on('disconnect', () => gameHandlers(socket).disconnect(socket, games, players));
        socket.on('playerAnswer', () => gameHandlers(socket).playerAnswer(socket, num, games, players, utilities));
        socket.on('getScore', () => gameHandlers(socket).getScore(socket, players));
        socket.on('time', () => gameHandlers(socket).time(players));
        socket.on('timeUp', () => gameHandlers(socket).timeUp(games, players, utilities));
        socket.on('nextQuestion', () => gameHandlers(socket).nextQuestion(games, players));
        socket.on('startGame', () => gameHandlers(socket).startGame(socket, games));
        socket.on('newQuiz', () => gameHandlers(socket).newQuiz(socket, utilities));

        // players
        socket.on('player-join', (params) => playerHandlers(io).playerJoin(socket, params, games, players));
        socket.on('player-join-game', (data) => playerHandlers(io).playerJoinGame(socket, data, games, players));



    });
};