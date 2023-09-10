const Player = require("../DB/models/player");

class Players {
  constructor() {
    this.model = Player;
  }

  async addPlayer(hostId, playerId, name, gameData) {
    const player = { hostId, playerId, name, gameData };
    console.log("adding player", player);
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
}

module.exports = { Players };
