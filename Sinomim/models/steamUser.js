const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const SteamUser = new Schema({
  id: ObjectId,
  owner: String,
  nickname: String,
  platform: String,
  platformID: Number,
  lastActivity: Number,
  buy: Boolean,
  price: Number,
  minRaise: Number,
  highBid: Number,
  bargains: Array
  //buyer: reference to user
});

module.exports = mongoose.model('SteamUserData', SteamUser);