const mongoose = require("mongoose");

const TeacherSchema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    socketId: { type: String, default: null },
    password: { type: String, select: false },
    refreshToken: { type: String, default: null, select: false },
  },
  { timestamps: true },
);

const Teacher = mongoose.model("teacher", TeacherSchema);

module.exports = Teacher;
