const express = require('express');
const compression = require('compression');
const app = express();
const fs = require('fs');

const oneDay = 86400000;

const port = 8108;

const API_KEY = fs.readFileSync('app/resources/darknet.txt', 'utf8');

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

app.get('/');

app.listen(port, function() {
  console.log(`Application worker ${process.pid} started...`);
});
