const { appLogger } = require("../../../logger");

const requestGamesHandler = async (socket, quizes) => {
  try {
    const gamesList = await quizes.getAllQuizes();
    appLogger.info("gamesList", gamesList);
    socket.emit("gameNamesData", gamesList);
  } catch (err) {
    console.error("Error fetching game names:", err);
    socket.emit("error", "An error occurred fetching game names.");
  }
};

module.exports = requestGamesHandler;