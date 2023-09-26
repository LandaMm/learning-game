const mongoose = require("mongoose");

const TeacherSchema = new mongoose.Schema(
  {
    email: String,
    password: String,
    refreshToken: { type: String, default: null, select: false },
  },
  { timestamps: true },
);

const Teacher = mongoose.model("teacher", TeacherSchema);

module.exports = Teacher;
