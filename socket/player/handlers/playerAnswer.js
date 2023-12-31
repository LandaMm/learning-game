const playerAnswerHandler = async (socket, num, games, players, utilities) => {
  const player = await players.getPlayer(socket.id);
  const game = await games.getGame(player.hostId);

  if (game && game.gameData.questionLive) {
    const gameData = await utilities.fetchGameDataById(game.gameData.gameid);
    if (gameData) {
      utilities.handlePlayerAnswer(player, game, num);
    } else {
      socket.emit("error", "An error occurred fetching game data.");
    }
  }
};

module.exports = playerAnswerHandler;
