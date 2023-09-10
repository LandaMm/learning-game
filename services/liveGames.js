const KahootGame = require("../DB/models/kahootGameModel");

class LiveGames {
  constructor() {
    this.model = KahootGame;
  }

  async addGame(pin, hostId, gameLive, gameData) {
    const game = { pin, hostId, gameLive, gameData };
    await this.model.create(game);
    this.games.push(game);
    return game;
  }

  async removeGame(hostId) {
    await this.model.findOneAndDelete({ hostId });
  }

  async getGame(hostId) {
    return await this.model.findOne({ hostId });
  }
}

module.exports = { LiveGames };
