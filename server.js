const express = require('express');
const compression = require('compression');
const app = express();

const oneDay = 86400000;

const fs = require('fs');

const API_KEY = fs.readFileSync('app/js/darknet.txt', 'utf8');

app.use(compression());

app.use('/', express.static(__dirname + '/app', {maxAge: oneDay}));

app.get('/API', function(req, res, next) {
    res.send(API_KEY);
});

app.get('/ICON', function(req, res, next) {
    let name = req.params.name;
    let icon = fs.readFileSync('app/assets/weather/' + name + '.svg', 'utf8');
    res.send(icon);
});

app.get('/')

var port = 8108;

app.listen(port, function() {
  console.log(`Application worker ${process.pid} started...`);
});
