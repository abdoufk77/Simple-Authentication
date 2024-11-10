const { Schema, model } = require("mongoose");

const UsersSchema = new Schema({
  username: String,
  password: String,
});

const Users = model("users", UsersSchema);

module.exports = Users;
