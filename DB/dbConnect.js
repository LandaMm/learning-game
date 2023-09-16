const mongoose = require("mongoose");
const { appLogger } = require("../logger");
require("dotenv").config();

const connectDB = async () => {
  appLogger.info("connecting to " + process.env.MONGODB_URI);
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    appLogger.info("MongoDB connected successfully.");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
