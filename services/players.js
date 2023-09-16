const Player = require("../DB/models/player");
const { appLogger } = require("../logger");

class Players {
  constructor() {
    this.model = Player;
  }

  async addPlayer(hostId, playerId, name, gameData) {
    const player = { hostId, playerId, name, gameData };
    appLogger.info("adding player", player);
    return await this.model.create(player);
  }

  async removePlayer(playerId) {
    return await this.model.findOneAndDelete({ playerId }).exec();
  }

  async getPlayer(playerId) {
    return await this.model.findOne({ playerId }).exec();
  }

  async getPlayers(hostId) {
    return await this.model.find({ hostId }).exec();
  }

  async removePlayersByHostId(hostId) {
    return await this.model.deleteMany({ hostId }).exec();
  }
}

module.exports = { Players };
