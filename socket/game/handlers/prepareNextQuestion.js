const { appLogger } = require("../../../logger");

const prepareNextQuestionHandler = async (io, socket, games) => {
  var game = await games.getGame(socket.id);
  appLogger.info("prepareNextQuestion", game);
  if (!game) {
    socket.emit("noGameFound");
    return;
  }

  io.to(game.pin).emit("prepareNextQuestion");
};

module.exports = prepareNextQuestionHandler;
