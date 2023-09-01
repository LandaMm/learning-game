module.exports = (io) => {
    return {


        playerJoin: (socket, params, games, players) => {
            const game = games.games.find(g => g.pin.toString() === params.pin);

            if (game) {
                players.addPlayer(game.hostId, socket.id, params.name, { score: 0, answer: 0 });
                socket.join(params.pin);
                const playersInGame = players.getPlayers(game.hostId);
                io.to(params.pin).emit('updatePlayerLobby', playersInGame);
                io.emit('sikimikitwo', { aaa: "asdsa" });

                socket.on('error', function (err) {
                    console.error("Socket.IO Error:", err);
                });
            } else {
                socket.emit('noGameFound');
            }
        },

        playerJoinGame: (socket, data, games, players) => {
            const player = players.getPlayer(data.id);
            if (player) {
                const game = games.getGame(player.hostId);
                socket.join(game.pin);
                player.playerId = socket.id; // Update player id with socket id

                const playerData = players.getPlayers(game.hostId);
                socket.emit('playerGameData', playerData);
            } else {
                socket.emit('noGameFound'); // No player found
            }
        },

        playerAnswer: async (socket, num, games, players, utilities) => {
            const player = players.getPlayer(socket.id);
            const game = games.getGame(player.hostId);

            if (game && game.gameData.questionLive) {
                const gameData = await utilities.fetchGameDataById(game.gameData.gameid);
                if (gameData) {
                    utilities.handlePlayerAnswer(player, game, num);
                } else {
                    socket.emit('error', 'An error occurred fetching game data.');
                }
            }
        }
    };
};
