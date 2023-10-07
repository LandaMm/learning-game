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
    const query = this.model.findById(id);
    if (creator) {
      query.where({ createdBy: creator });
    }

    return await query.exec();
  }

  async getAllQuizes(teachers, filter, token) {
    const query = {};
    appLogger.info("filter argument", filter);
    if (filter === "my") {
      const user = await teachers.findByAccessToken(token);
      if (user) {
        query.createdBy = user;
      }
    }
    if (filter && !["all", "my"].includes(filter)) {
      const user = await teachers.findById(filter);
      if (user) {
        query.createdBy = user;
      }
    }
    appLogger.info("getting quizes with filter", query);
    return await this.model.find(query).sort({ createdAt: -1 }).exec();
  }

  async getTeacherQuizes(teacherId) {
    return await this.model.find({ createdBy: teacherId }).exec();
  }

  async adminUpdateQuiz(quizId, name, questions) {
    return await this.model
      .findByIdAndUpdate(quizId, { name, questions }, { new: true })
      .exec();
  }

  async updateQuiz(user, quizId, name, questions) {
    return await this.model
      .findByIdAndUpdate(quizId, { name, questions }, { new: true })
      .where({ createdBy: user })
      .exec();
  }

  async adminRemoveQuiz(quizId) {
    return await this.model.findByIdAndRemove(quizId).exec();
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
