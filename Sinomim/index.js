var express = require('express');
var path = require('path');

var app = express();
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname+'/views');
app.use(express.static(path.join(__dirname+'/public')));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'OPTIONS,GET,PUT,POST,DELETE');
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
  next();
});

app.get('/', function(req, res) {
  res.render('index', {

  });
});
app.get('/nameList', function(req, res) {
  res.sendFile(__dirname + '/views/nameList.html');
});
app.get('/nameDetails/:nameID', function(req, res) {
  res.sendFile(__dirname + '/views/nameDetails.html');
});
app.get('/profile/:profileID?', function(req, res) {
  res.sendFile(__dirname + '/views/profile.html');
});

app.listen(3000);