require("dotenv").config();
const mongoose = require("mongoose");

const dbUrl =
  "mongodb+srv://" +
  process.env.DB_USERNAME +
  ":" +
  process.env.DB_PASSWORD +
  "@learnmongodb.aipfl.mongodb.net/?retryWrites=true&w=majority&appName=learnMongoDB";

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("db connected...");
  })
  .catch((error) => {
    console.log("faild db connection", error);
  });
