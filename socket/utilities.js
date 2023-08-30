
const { LiveGames } = require('../services/liveGames');
const { Players } = require('../services/players');
var games = new LiveGames();
var players = new Players();
const KahootGame = require('../DB/models/kahootGameModel'); // Replace with your actual model path


// Fetch game data by ID
const findAll = async () => {
    try {
        return await KahootGame.find();
    } catch (err) {
        console.error("Error fetching game data:", err);
        socket.emit('error', 'An error occurred fetching game data.');
        return null;
    }
};
// Fetch game data by ID
const fetchGameDataById = async (id) => {
    try {
        return await KahootGame.findOne({ id: parseInt(id) });
    } catch (err) {
        console.error("Error fetching game data:", err);
        socket.emit('error', 'An error occurred fetching game data.');
        return null;
    }
};

// Helper functions
function handleHostDisconnect(game) {
    if (!game.gameLive) {
        games.removeGame(socket.id);
        console.log('Game ended with pin:', game.pin);

        const playersToRemove = players.getPlayers(game.hostId);
        playersToRemove.forEach(p => players.removePlayer(p.playerId));

        io.to(game.pin).emit('hostDisconnect');
        socket.leave(game.pin);
    }
}

function handlePlayerDisconnect(playerId) {
    const player = players.getPlayer(playerId);
    if (player) {
        const game = games.getGame(player.hostId);
        if (game && !game.gameLive) {
            players.removePlayer(playerId);
            const playersInGame = players.getPlayers(game.hostId);
            io.to(game.pin).emit('updatePlayerLobby', playersInGame);
            socket.leave(game.pin);
        }
    }
}

async function handlePlayerAnswer(player, game, num) {
    player.gameData.answer = num;
    game.gameData.playersAnswered++;

    const gameQuestion = game.gameData.question;

    try {
        const gameData = await fetchGameDataById(game.gameData.gameid);
        if (!gameData) return;
        const correctAnswer = gameData.questions[gameQuestion - 1].correct;

        if (num == correctAnswer) {
            player.gameData.score += 100;
            io.to(game.pin).emit('getTime', socket.id);
            socket.emit('answerResult', true);
        }

        if (game.gameData.playersAnswered == players.getPlayers(game.hostId).length) {
            game.gameData.questionLive = false;
            const playerData = players.getPlayers(game.hostId);
            io.to(game.pin).emit('questionOver', playerData, correctAnswer);
        } else {
            io.to(game.pin).emit('updatePlayersAnswered', {
                playersInGame: players.getPlayers(game.hostId).length,
                playersAnswered: game.gameData.playersAnswered
            });
        }
    } catch (err) {
        console.error("Error processing player answer:", err);
    }
}

// Emit game questions to the host
const emitGameQuestions = async (gameId) => {
    try {
        const gameData = await KahootGame.findOne({ id: parseInt(gameId) });

        if (gameData && gameData.questions && gameData.questions.length > 0) {
            const { question, answers, correct } = gameData.questions[0];

            socket.emit('gameQuestions', {
                q1: question,
                a1: answers[0],
                a2: answers[1],
                a3: answers[2],
                a4: answers[3],
                correct: correct,
                playersInGame: players.getPlayers(socket.id).length
            });
        }
    } catch (err) {
        console.error("Error fetching game questions:", err);
        socket.emit('error', 'An error occurred fetching game questions.');
    }
};


module.exports = {
    fetchGameDataById,
    handleHostDisconnect,
    handlePlayerDisconnect,
    handlePlayerAnswer,
    emitGameQuestions,
    findAll
};
