var express = require('express');
var path = require('path');
var pug = require('pug');

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

app.get('/', function(req, res) {
  res.render('index');
});
app.get('/nameList', function(req, res) {
  res.render('nameList');
});
app.get('/about', function(req, res) {
  res.render('about');
});
app.get('/nameDetails/:nameID', function(req, res) {
  res.render('nameDetails', {
    nameID: req.params.nameID
    //Stripe API, Traversy Media
  });
});
app.get('/profile/:profileID?', function(req, res) {
  res.render('profileDetails', {
    profileID: req.params.profileID
  });
});

app.listen(3000);