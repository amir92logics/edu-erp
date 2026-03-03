const mongoose = require('mongoose');
require('dotenv').config();

(async () => {
    console.log("Connecting to MongoDB:", process.env.MONGODB_URI);
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log("MongoDB connected successfully!");
        await mongoose.disconnect();
        console.log("MongoDB disconnected.");
    } catch (err) {
        console.error("MongoDB connection failed:", err);
    }
})();
