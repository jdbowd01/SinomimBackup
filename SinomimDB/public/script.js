const SteamAPI = require('steamapi');
const SteamRep = require('steamrep');
const steam = new SteamAPI('7BF5A70EF5D81C6EA35C603E6588C469');
const steamIDs = ['76561198079619100', '76561198073436665', '76561198193251941', '76561198204709051'];

const mongoose = require('mongoose');
const sensitive = require('./sensitive.js');
mongoose.connect(`mongodb://${sensitive.username}:${sensitive.pass}@ds251622.mlab.com:51622/steam_user_data`, { useNewUrlParser: true });
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
  bargains: []
  //buyer: reference to user
});
const UserModel = mongoose.model('SteamUserData', SteamUser);

methods = {
  startUser: function() {
    var helpme = 198000000000;
    finding = setInterval(function() {
      methods.findUser(helpme);
    }, 500);
    counting = setInterval(function() {
      helpme = helpme + 1;
    }, 500)
  },
  findUser: function(steamUser) {
    // lastLogOff * 1000 is mulliseconds from 1970/1/1
    //100,000 calls per day, use 1,000 just to be safe, and only run this one every day or every other day
    var longNum = '76561' + steamUser.toString();
    SteamRep.getProfile(longNum, function(error, result) {
      if(error === null) {
        steam.getUserSummary(longNum.toString()).then(sum => {
          var buyVar = true;
          var priceVar = (Math.random() * 10).toFixed(2);
          var minRaiseVar = null;
          var highBidVar = null;
          if(Math.floor(Math.random() * 5) == 4) {
            buyVar = false;
            minRaiseVar = Math.random().toFixed(2);
            do {
              highBidVar = (Math.random() * 10).toFixed(2);
            } while(priceVar == highBidVar);
            if(priceVar < highBidVar) {
              var temp = priceVar;
              priceVar = highBidVar;
              highBidVar = temp;
            }
          }
          var user = new UserModel ({
            nickname: sum.nickname,
            platform: 'Steam',
            platformID: sum.steamID,
            lastActivity: sum.lastLogOff * 1000,
            buy: buyVar,
            price: priceVar,
            minRaise: minRaiseVar,
            highBid: highBidVar
          });
          console.log(user + "\n"); 
          methods.findActivity(user);
        }).catch(e => {});
        if(steamUser > 198000001000) {
          clearInterval(finding);
          clearInterval(counting);
        }
      } 
      else {
        if(steamUser > 198000001000) {
          clearInterval(finding);
          clearInterval(counting);
        }
      }
    });
  },
  findActivity: function(user) {
    var now = new Date().getTime();
    //should check if user has been inactive for over a month.
    if(user.lastActivity < now - 2592000000) {
      UserModel.findOne({'nickname':user.nickname},function(e,r){
        if(r!=null)
        { 
          UserModel.update({'nickname':user.nickname},user,{upsert:true}); 
        }
        else
        {
            var usertemp=new UserModel(user);
            usertemp.save();
        }
      });
    }
  }
}

exports.methods = methods;

// startUser: function() {
  //   var helpme = 198000000000;
  //   finding = setInterval(function() {
  //     methods.findUser(helpme);
  //   }, 2000);
  //   counting = setInterval(function() {
  //     helpme = helpme + 1;
  //   }, 2000)
  // },
  // findUser: function(steamUser) {
  //   // lastLogOff * 1000 is mulliseconds from 1970/1/1
  //   //100,000 calls per day, use 1,000 just to be safe, and only run this one every day or every other day
  //   var longNum = '76561' + steamUser.toString();
  //   SteamRep.getProfile(longNum, function(error, result) {
  //     if(error === null) {
  //       steam.getUserSummary(longNum.toString()).then(sum => {
  //         var user = new UserModel ({
  //           nickname: sum.nickname,
  //           steamID: result.steamrep.steamID64,
  //           lastActivity: sum.lastLogOff * 1000
  //         });
  //         console.log(user + "\n"); 
  //         methods.findActivity(user);
  //       }).catch(e => {});
  //       if(steamUser > 198000001000) {
  //         clearInterval(finding);
  //         clearInterval(counting);
  //       }
  //     } 
  //     else {
  //       if(steamUser > 198000001000) {
  //         clearInterval(finding);
  //         clearInterval(counting);
  //       }
  //     }
  //   });
  // }