const { appLogger } = require("../../../logger");

const requestGamesHandler = async (socket, quizes, teachers, filter) => {
  try {
    appLogger.info(
      "get quizes with filter for socket",
      filter,
      socket.handshake.auth,
    );
    const token = socket.handshake.auth?.token;
    const gamesList = await quizes.getAllQuizes(teachers, filter, token);
    appLogger.info("gamesList", gamesList);
    socket.emit("gameNamesData", gamesList);
  } catch (err) {
    console.error("Error fetching game names:", err);
    socket.emit("error", "An error occurred fetching game names.");
  }
};

module.exports = requestGamesHandler;
