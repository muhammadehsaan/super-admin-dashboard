const mongoose = require("mongoose");

async function connectDb() {
  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) {
    throw new Error("MONGO_URL not configured");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUrl);
}

module.exports = { connectDb };
