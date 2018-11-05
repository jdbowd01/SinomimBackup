const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const ProfileCreateModel = new Schema({
  id: ObjectId,
  dateCreated: Date,
  username: String,
  email: String,
  password: String
});

module.exports = mongoose.model('ProfileCreate', ProfileCreateModel);