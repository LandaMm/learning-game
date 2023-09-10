const newQuizHandler = async (socket, data, utilities) => {
  try {
    // Inserting the new game data
    const game = await utilities.insertNewGame(data);

    socket.emit("startGameFromCreator", game._id);
  } catch (err) {
    console.error("Error in newQuiz function:", err);
    socket.emit("error", "An error occurred during the newQuiz operation.");
  }
};

module.exports = newQuizHandler;
