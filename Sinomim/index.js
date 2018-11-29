const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const crypto = require('crypto');
const mailer = require('nodemailer');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator/check');
const SteamUser = require('./models/profileCreate.js').SteamUser;
const ProfileCreate = require('./models/profileCreate.js').ProfileCreate;
const TokenCreate = require('./models/profileCreate.js').TokenCreate;
const sensitive = require('./models/sensitive.js');

const keyPublishable = sensitive.key;
const keySecret = sensitive.skey;
const stripe = require("stripe")(keySecret);

const SteamAPI = require('steamapi');
const steam = new SteamAPI('7BF5A70EF5D81C6EA35C603E6588C469');

var app = express();
app.set('view engine', 'pug');
app.set('views', __dirname+'/views');
app.use(express.static(path.join(__dirname+'/public')));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'OPTIONS,GET,PUT,POST,DELETE');
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
  next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  name: 'logged-in',
  cookie: {
    maxAge: 1800000
  },
  secret: 'ibrokemyarmonaninflatable', 
  saveUninitialized: true, 
  resave: true
}));

app.get('/', function(req, res) {
  res.render('index', { title: 'Sinomim Home' });
});
app.get('/nameList', function(req, res) {
  mongoose.connect(`mongodb://${sensitive.username}:${sensitive.pass}@ds251622.mlab.com:51622/steam_user_data`, { useNewUrlParser: true, bufferCommands: false});
  SteamUser.find(function (err, steamUsers) {
    if (err) {
      return console.error(err);
    }
    res.render('nameList', { users: steamUsers, title: 'Sinomim Market' });
  }).then(function() { mongoose.disconnect() });
});
app.get('/bargains', function(req, res) {
  if(req.session.loggedIn != undefined) {
    res.redirect(`../bargains/${req.session.loggedIn.user}`);
  } else {
    res.render('bargains', { names: null, title: 'No user bargains' });
  }
});
app.get('/nameDetails/:nameID', function(req, res) {
  mongoose.connect(`mongodb://${sensitive.username}:${sensitive.pass}@ds251622.mlab.com:51622/steam_user_data`, { useNewUrlParser: true, bufferCommands: false });
  SteamUser.findById(req.params.nameID).populate({path: 'owner', model: ProfileCreate}).lean().exec(function (err, steamUser) {
    if (err) {
      console.log(err);
      res.redirect('/nameList');
    } else {
      if(steamUser.owner == undefined) {
        steamUser.owner = { username: '[Sinomim]' };
      }
      var loggedIn = ((req.session.loggedIn != undefined) ? true : false);
      if(loggedIn) var owned = ((req.session.loggedIn.user == steamUser.owner._id) ? true : false);
      res.render('nameDetails', { user : steamUser, loggedIn: loggedIn, ownedName: owned, title: steamUser.nickname + "'s Details" });
    }
  });
});
app.get('/namePurchase/:nameID', function(req, res) {
  mongoose.connect(`mongodb://${sensitive.username}:${sensitive.pass}@ds251622.mlab.com:51622/steam_user_data`, { useNewUrlParser: true, bufferCommands: false });
  SteamUser.findById(req.params.nameID, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect('/nameList');
    } else {
      if(user.buy) {
        res.render('namePurchase', { keyPublishable, user: user, title: 'Purchase of ' + user.nickname });
      } else {
        res.render('nameBid', { user: user, title: 'Auction of ' + user.nickname });
      }
    }
  });
});
app.get('/nameBargain/:nameID', function(req, res) {
  mongoose.connect(`mongodb://${sensitive.username}:${sensitive.pass}@ds251622.mlab.com:51622/steam_user_data`, { useNewUrlParser: true, bufferCommands: false });
  SteamUser.findById(req.params.nameID, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect('/nameList');
    } else {
      if(req.session.loggedIn != undefined) {
        res.render('nameBargain', { user: user, title: 'Bargain on ' + user.nickname });
      } else {
        //not logged in
      }
    }
  });
});
app.get('/login', function(req, res) {
  if(req.session.loggedIn != null) {
    res.redirect(`profile/${req.session.loggedIn.user}`)
  } else {
    res.render('login', { end: `?${Object.keys(req.query)[0]}=` + req.query[Object.keys(req.query)[0]], title: 'Sinomim Login' });
  }
});
app.get('/signup', function(req, res) {
  res.render('signup', { title: 'Sinomim Signup' });
});
app.get('/profile/:profileID?', function(req, res) {
  mongoose.connect(`mongodb://${sensitive.username}:${sensitive.pass}@ds251622.mlab.com:51622/steam_user_data`, { useNewUrlParser: true, bufferCommands: false });
  ProfileCreate.findById(req.params.profileID).populate({ path: 'names' }).exec(function(err, profile) {
    if (err) {
      return console.error(err);
    } else {
      var editVar = false;
      var sendNote = false;
      if(req.session.loggedIn != undefined) {
        if(req.session.loggedIn.user == req.params.profileID) {
          editVar = true;
          for(var i = 0; i < profile.names.length; i++) {
            for(var j = 0; j < profile.names[i].bargains.length; j++) {
              if(profile.names[i].bargains[j].status == null) {
                sendNote = true;
              }
            }
          }
        }
      }
      res.render('profileDetails', { profileData: profile, edit: editVar, headBlue: sendNote, title: profile.username + ' Details' });
    }
  });
});
app.get('/bargains/:profileID', function(req, res) {
  mongoose.connect(`mongodb://${sensitive.username}:${sensitive.pass}@ds251622.mlab.com:51622/steam_user_data`, { useNewUrlParser: true, bufferCommands: false });
  ProfileCreate.findById(req.params.profileID).populate({ path: 'names' }).exec(function(err, profile) {
    if (err) {
      return console.error(err);
    } else {
      var editVar = false;
      var bargains = [];
      if(req.session.loggedIn != undefined) {
        if(req.session.loggedIn.user == req.params.profileID) {
          editVar = true;
          res.render('bargains', { names: profile.names, edit: editVar, title: profile.username + ' Bargains', userID: req.params.profileID });
        }
      } else {
        res.render('bargains', { names: null, title: 'No user bargains' });
      }
    }
  });
});
app.get('/logout', function(req, res) {
  req.session.destroy();
  res.redirect('login');
});

app.post('/login', function(req, res) {
  mongoose.connect(`mongodb://${sensitive.username}:${sensitive.pass}@ds251622.mlab.com:51622/steam_user_data`, { useNewUrlParser: true, bufferCommands: false });
  ProfileCreate.findOne({$or:[{username: req.body.user}, {email: req.body.user}]}).then(user => {
    if(user != null) {
      var same = bcrypt.compareSync(req.body.pass, user.password);
      if(same) {
        req.session.loggedIn = { user: user._id };
        if(Object.keys(req.query)[0] != 'undefined') {
          if(Object.keys(req.query)[0] == undefined) {
            res.redirect('/profile/'+user._id);
          } else {
            if(Object.keys(req.query)[0] == 'bargains') {
              res.redirect(`/${Object.keys(req.query)[0]}/` + user._id);
            } else {
              res.redirect(`/${Object.keys(req.query)[0]}/` + req.query[Object.keys(req.query)[0]]);
            }
          }
        } else {
          res.redirect('/profile/'+user._id);
        }
      } else {
        res.render('login', { error: [{ msg: 'Password is incorrect.'}], end: '', title: 'Sinomim Login'});
      }
    } else {
      res.render('login', { error: [{ msg: 'No user found.'}], end: '', title: 'Sinomim Login' });
    }
  }).then({ function() { mongoose.disconnect() }});
})
app.post('/signup', function(req, res) {
  mongoose.connect(`mongodb://${sensitive.username}:${sensitive.pass}@ds251622.mlab.com:51622/steam_user_data`, { useNewUrlParser: true, bufferCommands: false });
  ProfileCreate.findOne({$or:[{username: req.body.user}, {email: req.body.user}]}).then(user => {
    if(user == null) {
      if(req.body.pass == req.body.confirm) {
        var profile = new ProfileCreate({
          dateCreated: new Date(),
          username: req.body.user,
          email: req.body.email,
          isVerified: true,
          password: bcrypt.hashSync(req.body.pass, bcrypt.genSaltSync(6)),
        });
        req.session.loggedIn = { user: profile._id };
        profile.save();
        res.redirect('nameList');
      } else {
        res.render('signup', { error: [{ msg: 'Passwords do not match.'}]});
      }
    } else {
      res.render('signup', { error: [{ msg: 'Username already in use.'}]});
    }
  });
});
app.post('/bargainConfirm/:userID', function(req, res) {
  mongoose.connect(`mongodb://${sensitive.username}:${sensitive.pass}@ds251622.mlab.com:51622/steam_user_data`, { useNewUrlParser: true, bufferCommands: false });
  ProfileCreate.findById(req.params.userID).populate({ path: 'names' }).exec(function(err, profile) {
    for(var i = 0; i < profile.names.length; i++) {
      for(var j = 0; j < profile.names[i].bargains.length; j++) {
        if(req.body[`bargain${i}status${j}`] == 'a') {
          SteamUser.findById({_id: profile.names[i]._id}, function(err, raw) {
            if(err) {
              console.log(err);
            }
            var transactionSeller = {
              sell: true,
              name: raw.nickname,
              platform: raw.platform,
              price: raw.bargains[j - 1].offer
            }
            var transactionBuyer = {
              sell: false,
              name: raw.nickname,
              platform: raw.platform,
              price: raw.bargains[j - 1].offer
            }

            ProfileCreate.findByIdAndUpdate(raw.bargains[j - 1].user, { $push: { transactions: transactionBuyer }}, function(err, doc) {
              if(err) {
                console.log(err);
              }
            });
            ProfileCreate.findByIdAndUpdate(req.params.userID, { $push: { transactions: transactionSeller }}, function(err, doc) {
              if(err) {
                console.log(err);
              }
            });
            ProfileCreate.findByIdAndUpdate(req.params.userID, { $pull: { names: raw._id }}, function(err, doc) {
              if(err) {
                console.log(err);
              }
            }); //"5be1bd74c01ce83aacb0f61f"
        
            // user.remove(); THIS NEEDS TO BE COMMENTED IN BEFORE DEMO
          });
        } else if(req.body[`bargain${i}status${j}`] == 'd') {
          var obj = {};
          var setVar = `bargains.${j}.status`;
          obj[setVar] = false;
          SteamUser.updateOne({_id: profile.names[i]}, {$set: obj}, function(err, raw) { 
            if(err) {
              console.log(err);
            } 
          });
        }
      }
    }
  });
  res.redirect(`/profile/${req.params.userID}`);
});
app.post('/emailChange/:profileID', function(req, res) {
  mongoose.connect(`mongodb://${sensitive.username}:${sensitive.pass}@ds251622.mlab.com:51622/steam_user_data`, { useNewUrlParser: true, bufferCommands: false });
  ProfileCreate.findByIdAndUpdate(req.params.profileID, { $set : {email: req.body.email } }, function(err, result) {
    if(err) {
      console.log(err);
    }
    res.redirect('/profile/'+req.params.profileID);
  });
});
app.post('/passChange', [
  check('oldPass').isEmpty().withMessage('Old password field is empty.'),
  check('newPass').isEmpty().withMessage('New password field is empty.'),
], function(req, res) {
  var errors = validationResult(req);
  if(errors.isEmpty()) {
    mongoose.connect(`mongodb://${sensitive.username}:${sensitive.pass}@ds251622.mlab.com:51622/steam_user_data`, { useNewUrlParser: true, bufferCommands: false });
    ProfileCreate.findOneAndUpdate({ _id : req.params.profileID }, { $set : {email: req.body.email } }, function(err, result) {
      if(err) {
        console.log(err);
      }
    });
    res.redirect('/profile/'+req.params.profileID);
  }
});
app.post('/newName/:profileID', function(req, res) {
  if(req.body.platform == 'steam') {
    steam.getUserSummary(req.body.platformID).then(sum => { 
      var buyVar = ((req.body.buyBid == 'sell') ? true : false);
      var priceNum = ((req.body.buyBid == 'sell') ? 0 : 1);
      var minRaise = ((req.body.buyBid == 'sell') ? null : req.body.raise);
      var highBid = ((req.body.buyBid == 'sell') ? null : 0.00);
      var user = new SteamUser ({
        nickname: sum.nickname,
        platform: req.body.platform,
        platformID: req.body.platformID,
        owner: req.params.profileID,
        lastActivity: sum.lastLogOff * 1000,
        buy: buyVar,
        price: req.body.price[priceNum],
        minRaise: minRaise,
        highBid: highBid
      });
      user.save();
      return user;
    }).then(user => {
      console.log(user + "\n");
      ProfileCreate.findOneAndUpdate({ _id : req.params.profileID }, { $push : { names: user._id }}, function(err, result) {
        if(err) {
          console.log(err);
        }
      });
    }).then(
      res.redirect('/profile/'+req.params.profileID)
    ).catch(err => {
      console.log(err);
    });
  }
});
app.post('/purchase/:nameID', function(req, res) {
  //MAKE SURE LOGGED IN
  mongoose.connect(`mongodb://${sensitive.username}:${sensitive.pass}@ds251622.mlab.com:51622/steam_user_data`, { useNewUrlParser: true, bufferCommands: false });
  SteamUser.findById(req.params.nameID, function(err, user) {
    if(err) {
      console.log(err);
    } else {
      var amount = user.price * 100;
      stripe.customers.create({
        email: req.body.stripeEmail,
        source: req.body.stripeToken
      }).then(customer =>
      stripe.charges.create({
        amount,
        description: "Sample Charge",
          currency: "usd",
          customer: customer.id
      }));
    }
    
    var transactionSeller = {
      sell: true,
      name: user.nickname,
      platform: user.platform,
      price: user.price
    }
    var transactionBuyer = {
      sell: false,
      name: user.nickname,
      platform: user.platform,
      price: user.price
    }

    ProfileCreate.findByIdAndUpdate(req.session.loggedIn.user, { $push: { transactions: transactionBuyer }}, function(err, doc) {
      if(err) {
        console.log(err);
      }
    });
    ProfileCreate.findOneAndUpdate({ _id: { $in: req.params.nameID }}, { $push: { transactions: transactionSeller }}, function(err, doc) {
      if(err) {
        console.log(err);
      }
    });
    ProfileCreate.findOneAndUpdate({ _id: { $in: req.params.nameID }}, { $pull: { names: req.params.nameID }}, function(err, doc) {
      if(err) {
        console.log(err);
      }
    });

    user.remove().then(res.redirect('../nameList'));
  });
});
app.post('/bargainOffer/:nameID', function(req, res) {
  //MAKE SURE LOGGED IN
  if(req.session.loggedIn != undefined) {
    var bargain = {
      "offer": req.body.bargain,
      "date": new Date(),
      "user": req.session.loggedIn.user,
      "status": null
    }
    mongoose.connect(`mongodb://${sensitive.username}:${sensitive.pass}@ds251622.mlab.com:51622/steam_user_data`, { useNewUrlParser: true, bufferCommands: false });
    SteamUser.findByIdAndUpdate(req.params.nameID, {$push: {"bargains": bargain }}, function(err, result) {
      if (err) console.log(err);
    });
    res.redirect('../nameList');
  } else {
    res.redirect('../login?name=' + req.params.nameID);
  }
});

app.listen(3000);