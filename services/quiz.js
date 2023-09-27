const Quiz = require("../DB/models/quiz");
const { appLogger } = require("../logger");

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

  async getAllQuizes(teachers, filter, token) {
    const query = {};
    if (filter === "my") {
      const user = await teachers.findByAccessToken(token);
      if (user) {
        query.createdBy = user;
      }
    }
    appLogger.info("getting quizes with filter", query);
    return await this.model.find(query).exec();
  }

  async getTeacherQuizes(teacherId) {
    return await this.model.find({ createdBy: teacherId }).exec();
  }
}

module.exports = Quizes;
