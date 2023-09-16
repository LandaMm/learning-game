const Game = require("../DB/models/game");

class Games {
  constructor() {
    this.model = Game;
  }

  async addGame(pin, hostId, gameLive, gameData) {
    const game = { pin, hostId, gameLive, gameData };
    await this.model.create(game);
    return game;
  }

  async findAll() {
    return await this.model.find({}).exec();
  }

  async removeGame(hostId) {
    return await this.model.findOneAndDelete({ hostId }).exec();
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
