const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const SteamUserModel = new Schema({
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
var SteamUser = mongoose.model('SteamUserData', SteamUserModel);

const ProfileCreateModel = new Schema({
  id: ObjectId,
  dateCreated: Date,
  username: String,
  email: String,
  isVerified: Boolean,
  password: String,
  names: [{ type: String, ref: 'SteamUserData' }]
});
var ProfileCreate = mongoose.model('ProfileCreate', ProfileCreateModel);


const TokenCreateModel = new Schema({
  userID: { type: ObjectId, ref: 'SteamUserData' },
  token: String,
  createdAt: { type: Date, default: Date.now, expires: 43200 }
});
var TokenCreate = mongoose.model('TokenCreate', TokenCreateModel);

module.exports = {
  ProfileCreate: ProfileCreate,
  SteamUser: SteamUser,
  TokenCreate: TokenCreate
}