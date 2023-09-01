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
        socket.on('host-join-game', (data) => hostHandlers(io).hostJoinGame(socket, data, utilities));

        // game handlers
        socket.on('requestDbNames', () => gameHandlers(io).requestDbNames(utilities));
        socket.on('disconnect', () => gameHandlers(io).disconnect(socket, games, players));
        socket.on('playerAnswer', () => gameHandlers(io).playerAnswer(socket, num, games, players, utilities));
        socket.on('getScore', () => gameHandlers(io).getScore(socket, players));
        socket.on('time', () => gameHandlers(io).time(players));
        socket.on('timeUp', () => gameHandlers(io).timeUp(games, players, utilities));
        socket.on('nextQuestion', () => gameHandlers(io).nextQuestion(games, players));
        socket.on('startGame', () => gameHandlers(io).startGame(socket, games));
        socket.on('newQuiz', () => gameHandlers(io).newQuiz(socket, utilities));

        // players
        socket.on('player-join', (params) => playerHandlers(io).playerJoin(socket, params, games, players));
        socket.on('player-join-game', (data) => playerHandlers(io).playerJoinGame(socket, data, games, players));


    });
};