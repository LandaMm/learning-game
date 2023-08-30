const mongoose = require('mongoose');
require('dotenv').config();


console.log("process.env.MONGODB_URI", process.env.MONGODB_URI);
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB connected successfully.");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);  // Exit process with failure
    }
}

module.exports = connectDB;
