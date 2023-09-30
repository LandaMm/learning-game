const Game = require("../DB/models/game");

class Games {
  constructor() {
    this.model = Game;
  }

  async addGame(pin, hostId, gameLive, gameData, creator) {
    const game = { pin, hostId, gameLive, gameData, createdBy: creator };
    await this.model.create(game);
    return game;
  }

  async findAll(filter = {}) {
    return await this.model.find(filter).sort({ createdAt: -1 }).exec();
  }

  async removeGame(hostId) {
    return await this.model.findOneAndDelete({ hostId }).exec();
  }

  async finishGame(hostId) {
    return await this.model
      .findOneAndUpdate(
        { hostId },
        { $set: { gameFinished: true, gameLive: false } },
        { new: true },
      )
      .exec();
  }

  async getGame(hostId) {
    return await this.model.findOne({ hostId }).exec();
  }

  async getGameById(gameId) {
    return await this.model.findById(gameId).exec();
  }

  async getGameByPin(pin) {
    return await this.model.findOne({ pin }).exec();
  }
}

module.exports = { Games };
