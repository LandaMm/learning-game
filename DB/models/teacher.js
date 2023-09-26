const mongoose = require("mongoose");

const TeacherSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: String,
    password: { type: String, select: false },
    refreshToken: { type: String, default: null, select: false },
  },
  { timestamps: true },
);

const Teacher = mongoose.model("teacher", TeacherSchema);

module.exports = Teacher;
