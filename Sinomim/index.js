const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator/check');
const SteamUser = require('./models/steamUser.js');
const ProfileCreate = require('./models/profile.js');

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
  mongoose.connect('mongodb://bubblycrayon:g00b3RZz@ds251622.mlab.com:51622/steam_user_data', { useNewUrlParser: true, bufferCommands: false});
  SteamUser.find(function (err, steamUsers) {
    if (err) {
      return console.error(err);
    }
    res.render('nameList', { users: steamUsers, paginate: 5 });
  });
});
app.get('/about', function(req, res) {
  res.render('about');
});
app.get('/nameDetails/:nameID', function(req, res) {
  SteamUser.findById(req.params.nameID, function (err, steamUser) {
    if (err) {
      return console.error(err);
      //redirect somewhere
    } else {
      res.render('nameDetails', { user : steamUser, success: req.session.success });
    }
  });
  //Stripe API, Traversy Media
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
  if(req.session.loggedIn == null) {
    res.redirect('/login');
  } else {
    ProfileCreate.findById(req.session.loggedIn.user, function(err, profile) {
      if (err) {
        return console.error(err);
      } else {
        SteamUser.find({owner: profile._id}, function(err, names) {
          if (err) {
            return console.error(err);
          } else {
            res.render('profileDetails', {
              profile: profile,
              names: names
            });
          }
        });
      }
    });
  }
});
app.post('/login', [
  check('user').not().isEmpty().withMessage('Username is empty.'),
  check('pass').not().isEmpty().withMessage('Password is empty.')
], function(req, res) {
  var errors = validationResult(req);
  mongoose.connect('mongodb://bubblycrayon:g00b3RZz@ds251622.mlab.com:51622/steam_user_data', { useNewUrlParser: true, bufferCommands: false });
  if(errors.isEmpty()) {
    ProfileCreate.findOne({$or:[{username: req.body.user}, {email: req.body.user}]}).then(user => {
      if(user != null) {
        var same = bcrypt.compareSync(req.body.pass, user.password);
        if(same) {
          req.session.loggedIn = { user: user._id };
          res.redirect('nameList');
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
  mongoose.connect('mongodb://bubblycrayon:g00b3RZz@ds251622.mlab.com:51622/steam_user_data', { useNewUrlParser: true, bufferCommands: false });
    if(errors.isEmpty()) {
      ProfileCreate.findOne({username: req.body.user}).then(user => {
        if(user == null) {
          ProfileCreate.findOne({email: req.body.user}).then(user1 => {
            if(user1 == null) {
              if(req.body.pass == req.body.confirm) {
                var profile = new ProfileCreate ({
                  dateCreated: new Date(),
                  username: req.body.user,
                  email: req.body.email,
                  password: bcrypt.hashSync(req.body.pass, bcrypt.genSaltSync(6)),
                });
                req.session.loggedIn = { user: profile._id };
                profile.save();
                //email confirmation or log in
                res.redirect('nameList');
              } else {
                res.render('signup', { error: [{ msg: 'Passwords do not match.'}]});
              }
            } else {
              res.render('signup', { error: [{ msg: 'Email already in use.'}]});
            }
          });
        } else {
          res.render('signup', { error: [{ msg: 'Username already in use.'}]});
        }
      });
    } else {
      res.render('signup', { error: errors.array() });
  }
});

app.listen(3000);