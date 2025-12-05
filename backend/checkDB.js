// checkDB.js
require("dotenv").config();
const mongoose = require("mongoose");

const uri = process.env.MONGO_URI; // ✅ read from .env

if (!uri) {
  console.error("❌ MONGO_URI is not defined in .env");
  process.exit(1);
}

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("✅ Database is connected!");
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ Database connection error:", err.message);
    process.exit(1);
  });
