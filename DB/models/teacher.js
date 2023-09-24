const mongoose = require("mongoose");

const TeacherSchema = new mongoose.Schema(
  {
    email: String,
    password: String,
  },
  { timestamps: true },
);

const Teacher = mongoose.model("teacher", TeacherSchema);

module.exports = Teacher;
