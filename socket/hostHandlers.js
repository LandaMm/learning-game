let igre = {};

module.exports = () => {
    return {
        hostJoin: async (socket, data, games, utilities) => {
            try {
                console.log("1. hostJoin");
                console.log("2. data", data);
                const gameData = await utilities.fetchGameDataById(data.id);
                if (!gameData) {
                    socket.emit('noGameFound');
                    return;
                }
                if (gameData) {
                    const gamePin = Math.floor(Math.random() * 90000) + 10000;
                    games.addGame(gamePin, socket.id, false, {
                        playersAnswered: 0,
                        questionLive: false,
                        gameid: data.id,
                        question: 1
                    });

                    console.log("hostJoin games", games);

                    socket.join(gamePin);
                    console.log('Game Created with pin:', gamePin, Date.now());
                    socket.emit('showGamePin', { pin: gamePin });
                } else {
                    socket.emit('noGameFound');
                }
            } catch (err) {
                console.error("Error during host join:", err);
                socket.emit('error', 'An error occurred during game join.');
            }
        },
        hostJoinGame: async (socket, data) => {
            const oldHostId = data.id;
            console.log("hostJoinGame oldHostId", oldHostId);
            const game = games.getGame(oldHostId);

            if (game) {
                game.hostId = socket.id;
                socket.join(game.pin);

                // Update player hostIds
                for (let player of Object.values(players.players)) {
                    if (player.hostId === oldHostId) {
                        player.hostId = socket.id;
                    }
                }

                await emitGameQuestions(game.gameData.gameid);
                io.to(game.pin).emit('gameStartedPlayer');
                game.gameData.questionLive = true;
            } else {
                socket.emit('noGameFound');
            }
        }

    };
};

