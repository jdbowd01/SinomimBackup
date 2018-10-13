const SteamAPI = require('steamapi');
const SteamRep = require('steamrep');
const steam = new SteamAPI('7BF5A70EF5D81C6EA35C603E6588C469');
const steamIDs = ['76561198079619100', '76561198073436665', '76561198193251941', '76561198204709051'];

const mongoose = require('mongoose');
mongoose.connect('mongodb://bubblycrayon:g00b3RZz@ds251622.mlab.com:51622/steam_user_data', { useNewUrlParser: true });
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const SteamUser = new Schema({
  id: ObjectId,
  nickname: String,
  steamID: Number,
  lastActivity: Number
});
const UserModel = mongoose.model('SteamUserData', SteamUser);

var foundUsers = [];

methods = {
  findUser: function(steamUser) {
    // lastLogOff * 1000 is mulliseconds from 1970/1/1
    // steamIDs.forEach(steamID => {
    //   steam.getUserSummary(steamID).then(sum => {
    //     var user = new UserModel ({
    //       nickname: sum.nickname,
    //       steamID: sum.steamID,
    //       lastActivity: sum.lastLogOff * 1000
    //     });
    //     methods.findActivity(user);
    //   });
    // });

    //100,000 calls per day, use 10,000 just to be safe, and only run this one every day or every other day
    var longNum = '76561' + steamUser.toString();
    SteamRep.getProfile(longNum, function(error, result) {
      if(error === null) {
        steam.getUserSummary(longNum.toString()).then(sum => {
          var user = new UserModel ({
            nickname: sum.nickname,
            steamID: sum.steamID,
            lastActivity: sum.lastLogOff * 1000
          });
          console.log(user + "\n");
          methods.findActivity(user);
        });
        methods.findUser(steamUser + 1);
      } else {
        methods.findUser(steamUser + 1);
      }
    });
  },
  findActivity: function(user) {
    var now = new Date().getTime();
    //should check if user has been inactive for over a month.
    if(user.lastActivity < now - 2592000000) {
      // console.log(new Date(user.lastActivity));
      foundUsers.push(user);
      // user.save();
    }
  }
}

exports.methods = methods;