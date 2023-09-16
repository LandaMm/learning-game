const { appLogger } = require("../../../logger");

const hostJoinHandler = async (socket, data, games, quizes) => {
  try {
    appLogger.info("1. hostJoin");
    appLogger.info("2. data", data);
    const gameData = await quizes.findById(data.id);
    if (!gameData) {
      socket.emit("noGameFound");
      return;
    }
    if (gameData) {
      const gamePin = Math.floor(Math.random() * 90000) + 10000;
      games.addGame(gamePin, socket.id, false, {
        playersAnswered: 0,
        questionLive: false,
        gameid: data.id,
        question: 1,
      });

      appLogger.info("hostJoin games", games);

      socket.join(gamePin);
      appLogger.info("Game Created with pin:", gamePin, Date.now());
      socket.emit("showGamePin", { pin: gamePin });
    } else {
      socket.emit("noGameFound");
    }
  } catch (err) {
    console.error("Error during host join:", err);
    socket.emit("error", "An error occurred during game join.");
  }
};

module.exports = hostJoinHandler;
