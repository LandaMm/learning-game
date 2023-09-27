const Quiz = require("../DB/models/quiz");
const { appLogger } = require("../logger");

class Quizes {
  constructor() {
    this.model = Quiz;
  }

  async addQuiz(data) {
    return await this.model.create(data);
  }

  async findById(id, creator) {
    return await this.model.findById(id).where({ createdBy: creator }).exec();
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

  async updateQuiz(user, quizId, name, questions) {
    return await this.model
      .findByIdAndUpdate(quizId, { name, questions }, { new: true })
      .where({ createdBy: user })
      .exec();
  }

  async removeQuiz(teachers, quizId, token) {
    const user = await teachers.findByAccessToken(token);
    if (!user) {
      return;
    }

    return await this.model
      .findByIdAndRemove(quizId)
      .where({ createdBy: user })
      .exec();
  }
}

module.exports = Quizes;
