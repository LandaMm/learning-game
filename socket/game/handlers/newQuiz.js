const newQuizHandler = async (socket, data, utilities) => {
  try {
    const allGames = await utilities.findAll();

    if (!allGames) {
      socket.emit("error", "An error occurred fetching all game data.");
      return;
    }

    const numGames = allGames.length;

    // Adjusting the game ID logic
    const gameId = numGames === 0 ? 1 : allGames[numGames - 1].id + 1;
    data.id = gameId;

    // Inserting the new game data
    await utilities.insertNewGame(data);

    socket.emit("startGameFromCreator", gameId);
  } catch (err) {
    console.error("Error in newQuiz function:", err);
    socket.emit("error", "An error occurred during the newQuiz operation.");
  }
};

module.exports = newQuizHandler;
