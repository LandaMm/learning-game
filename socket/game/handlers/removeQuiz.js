const { appLogger } = require("../../../logger");

const removeQuizHandler = async (socket, quizes, teachers, quizId) => {
  try {
    appLogger.info(
      "remove quiz with for socket",
      quizId,
      socket.handshake.auth,
    );
    const token = socket.handshake.auth?.token;
    await quizes.removeQuiz(teachers, quizId, token);
    const gamesList = await quizes.getAllQuizes(teachers, "all", token);
    appLogger.info("gamesList", gamesList);
    socket.emit("gameNamesData", gamesList);
  } catch (err) {
    console.error("Error fetching game names:", err);
    socket.emit("error", "An error occurred fetching game names.");
  }
};

module.exports = removeQuizHandler;
