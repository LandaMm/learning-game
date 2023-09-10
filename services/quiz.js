const Quiz = require("../DB/models/quiz");

class Quizes {
  constructor() {
    this.model = Quiz;
  }

  async addQuiz(data) {
    return await this.model.create(data);
  }

  async findById(id) {
    return await this.model.findById(id).exec();
  }

  async getAllQuizes() {
    return await this.model.find({}).exec();
  }
}

module.exports = Quizes;
