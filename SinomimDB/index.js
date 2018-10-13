var express = require('express');
var path = require('path');
var steamCollect = require('./public/script.js')

var app = express();
app.use(express.static(path.join(__dirname+'/public')));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'OPTIONS,GET,PUT,POST,DELETE');
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
  next();
});

app.get('/', function(req, res) {
  res.send({
    results: steamCollect.methods.findUser(198000000000)
  });
});

app.listen(3000);