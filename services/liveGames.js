const KahootGame = require("../DB/models/kahootGameModel");

class LiveGames {
  constructor() {
    this.model = KahootGame;
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
    await this.model.findOneAndDelete({ hostId }).exec();
  }

  async getGame(hostId) {
    return await this.model.findOne({ hostId }).exec();
  }
}

module.exports = { LiveGames };
