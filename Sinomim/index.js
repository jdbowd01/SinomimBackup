const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator/check');
const SteamUser = require('./models/profileCreate.js').SteamUser;
const ProfileCreate = require('./models/profileCreate.js').ProfileCreate;
const TokenCreate = require('./models/profileCreate.js').TokenCreate;
const sensitive = require('./models/sensitive.js');

const keyPublishable = sensitive.key;
const keySecret = sensitive.skey;
const stripe = require("stripe")(keySecret);

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
  res.render('index');
});
app.get('/nameList', function(req, res) {
  mongoose.connect(`mongodb://${sensitive.username}:${sensitive.pass}@ds251622.mlab.com:51622/steam_user_data`, { useNewUrlParser: true, bufferCommands: false});
  SteamUser.find(function (err, steamUsers) {
    if (err) {
      return console.error(err);
    }
    res.render('nameList', { users: steamUsers });
  }).then(function() { mongoose.disconnect() });
});
app.get('/about', function(req, res) {
  res.render('about');
});
app.get('/nameDetails/:nameID', function(req, res) {
  mongoose.connect(`mongodb://${sensitive.username}:${sensitive.pass}@ds251622.mlab.com:51622/steam_user_data`, { useNewUrlParser: true, bufferCommands: false });
  SteamUser.findById(req.params.nameID).populate({path: 'owner', model: ProfileCreate}).lean().exec(function (err, steamUser) {
    if (err) {
      //not valid ID page
      console.log(err);
    } else {
      if(steamUser.owner == undefined) {
        steamUser.owner = { username: '[Sinomim]' };
      }
      res.render('nameDetails', { user : steamUser });
    }
  });
  //Stripe API, Traversy Media
});
app.get('/namePurchase/:nameID', function(req, res) {
  mongoose.connect(`mongodb://${sensitive.username}:${sensitive.pass}@ds251622.mlab.com:51622/steam_user_data`, { useNewUrlParser: true, bufferCommands: false });
  SteamUser.findById(req.params.nameID, function(err, user) {
    if (err) {
      //not valid ID page
      console.log(err);
    } else {
      if(user.buy) {
        res.render('namePurchase', { keyPublishable, user: user });
      } else {
        res.render('nameBid', { user: user });
      }
    }
  });
});
app.get('/login', function(req, res) {
  if(req.session.loggedIn != null) {
    res.redirect(`profile/${req.session.loggedIn.user}`)
  } else {
    res.render('login');
  }
});
app.get('/signup', function(req, res) {
  res.render('signup');
});
app.get('/profile/:profileID?', function(req, res) {
  mongoose.connect(`mongodb://${sensitive.username}:${sensitive.pass}@ds251622.mlab.com:51622/steam_user_data`, { useNewUrlParser: true, bufferCommands: false });
  ProfileCreate.findById(req.params.profileID).populate({ path: 'names' }).exec(function(err, profile) {
    if (err) {
      return console.error(err);
    } else {
      var editVar = false;
      if(req.session.loggedIn != undefined) {
        if(req.session.loggedIn.user == req.params.profileID) {
          editVar = true;
        }
      }
      res.render('profileDetails', {
        profileData: profile,
        edit: editVar
      });
    }
  });
});

app.post('/login', [
  check('user').not().isEmpty().withMessage('Username is empty.'),
  check('pass').not().isEmpty().withMessage('Password is empty.')
], function(req, res) {
  var errors = validationResult(req);
  if(errors.isEmpty()) {
    mongoose.connect(`mongodb://${sensitive.username}:${sensitive.pass}@ds251622.mlab.com:51622/steam_user_data`, { useNewUrlParser: true, bufferCommands: false });
    ProfileCreate.findOne({$or:[{username: req.body.user}, {email: req.body.user}]}).then(user => {
      if(user != null) {
        var same = bcrypt.compareSync(req.body.pass, user.password);
        if(same) {
          if(user.isVerified) {
            req.session.loggedIn = { user: user._id };
            res.redirect('/profile/'+user._id);
          } else {
            res.render('login', { error: [{ msg: 'Please verify your account.'}]});
          }
        } else {
          res.render('login', { error: [{ msg: 'Password is incorrect.'}]});
        }
      } else {
        res.render('login', { error: [{ msg: 'No user found.'}]});
      }
    });
  } else {
    res.render('login', { error: errors.array() });
  }
})
app.post('/signup', [
  check('user').not().isEmpty().withMessage('Username is empty.'),
  check('user').custom(value => !/\s/.test(value)).withMessage('No spaces are allowed in the username'),
  check('email').isEmail().withMessage('Email is not valid.'),
  check('pass').not().isEmpty().withMessage('Password is empty.'),
  check('confirm').not().isEmpty().withMessage('Password confirm is empty.')
], function(req, res) {
  var errors = validationResult(req);
  if(errors.isEmpty()) {
    mongoose.connect(`mongodb://${sensitive.username}:${sensitive.pass}@ds251622.mlab.com:51622/steam_user_data`, { useNewUrlParser: true, bufferCommands: false });
    ProfileCreate.findOne({$or:[{username: req.body.user}, {email: req.body.user}]}).then(user => {
      if(user == null) {
        if(req.body.pass == req.body.confirm) {
          var profile = new ProfileCreate ({
            dateCreated: new Date(),
            username: req.body.user,
            email: req.body.email,
            isVerified: false,
            password: bcrypt.hashSync(req.body.pass, bcrypt.genSaltSync(6)),
          });
          req.session.loggedIn = { user: profile._id };
          profile.save();
          //email confirmation
          res.redirect('/profile/'+profile._id);
        } else {
          res.render('signup', { error: [{ msg: 'Passwords do not match.'}]});
        }
      } else {
        res.render('signup', { error: [{ msg: 'Username already in use.'}]});
      }
    });
  } else {
    res.render('signup', { error: errors.array() });
  }
});
app.post('/emailConfirm');
app.post('/resendConfirm');
app.post('/emailChange', [
  check('newPass').not().isEmail().withMessage('New passsword is empty.')
], function(req, res) {
  var errors = validationResult(req);
  if(errors.isEmpty()) {
    mongoose.connect(`mongodb://${sensitive.username}:${sensitive.pass}@ds251622.mlab.com:51622/steam_user_data`, { useNewUrlParser: true, bufferCommands: false });
    ProfileCreate.findOneAndUpdate({ _id : req.params.profileID }, { $set : {email: req.body.email } }, function(err, result) {
      if(err) {
        console.log(err);
      }
      res.redirect('/profile/'+req.params.profileID);
    });
  }
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
app.post('/purchase/:nameID', function(req, res) {
  mongoose.connect(`mongodb://${sensitive.username}:${sensitive.pass}@ds251622.mlab.com:51622/steam_user_data`, { useNewUrlParser: true, bufferCommands: false });
  SteamUser.findById(req.params.nameID, function(err, user) {
    if(err) {
      console.log(err)
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
  });
  SteamUser.findByIdAndDelete(req.params.nameID, function(err, steam) {
    if(err) {
      console.log(err);
    }
    res.redirect('../nameList');
  });
});

app.listen(3000);