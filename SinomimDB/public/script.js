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

var pageAmount = 10;
var foundUsers = [];
var checkNum = 76561198000000000;

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

    // console.log(steamUser);
    SteamRep.getProfile(steamUser.toString(), function(error, result) {
      if(error === null) {
        steam.getUserSummary(steamUser.toString()).then(sum => {
          var user = new UserModel ({
            nickname: sum.nickname,
            steamID: sum.steamID,
            lastActivity: sum.lastLogOff * 1000
          });
          methods.findActivity(user);
        });
        // THIS IS THE LINE THAT NEEDS TO BE LOOKED AT, DOESN'T EVER MOVE ON
        // methods.findUser(steamUser + 1);
      } else {
        // methods.findUser(steamUser + 1);
      }
    });

    // while(foundUsers.length < pageAmount) {
    //   try {
    //     steam.getUserSummary(checkNum.toString()).then(sum => {
    //       var user = new UserModel ({
    //         nickname: sum.nickname,
    //         steamID: sum.steamID,
    //         lastActivity: sum.lastLogOff * 1000
    //       });
    //       methods.findActivity(user);
    //     }).catch(e => console.log(e));
    //   } catch (e) { 
    //     console.log("error: " + e) 
    //   } 
    //   finally {
    //     console.log(checkNum + ' checked')
    //   }
    // }
    
    // while(foundUsers.length < pageAmount) {
    //   console.log(checkNum);
    //   steam.getUserSummary(checkNum.toString()).then(sum => {
    //     var user = new UserModel ({
    //       nickname: sum.nickname,
    //       steamID: sum.steamID,
    //       lastActivity: sum.lastLogOff * 1000
    //     });
    //     methods.findActivity(user);
    //   }).catch(e => console.log(e));
    // }
    // console.log(foundUsers);
  },
  findActivity: function(user) {
    var now = new Date().getTime();
    //should check if user has been inactive for over a month.
    console.log('checking: ' + user.lastActivity);
    if(user.lastActivity < now - 2592000000) {
      console.log(new Date(user.lastActivity));
      foundUsers.push(user);
      // user.save();
    }
  }
}

exports.methods = methods;