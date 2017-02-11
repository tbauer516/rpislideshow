const https = require('https');
const express = require('express');
const compression = require('compression');
const app = express();
const fs = require('fs');

const oneDay = 86400000;

const API_KEY = fs.readFileSync('app/resources/darknet.txt', 'utf8');

const port = 8108;

const options = {
    key: fs.readFileSync('cert/selfsigned.key'),
    cert: fs.readFileSync('cert/selfsigned.crt'),
    requestCert: false,
    rejectUnauthorized: false
};

app.all('*', function(req, res, next){
    if (req.secure) {
        return next();
    };
    res.redirect('https://localhost:' + port + req.url);
    // res.redirect('https://' + req.hostname + ':' + port + req.url);
});

app.use(compression());

app.use('/', express.static(__dirname /*+ '/app'*/, {maxAge: oneDay}));

app.get('/API', function(req, res, next) {
    res.send(API_KEY);
});

app.get('/ICON', function(req, res, next) {
    let name = req.params.name;
    let icon = fs.readFileSync('app/assets/weather/' + name + '.svg', 'utf8');
    res.send(icon);
});

app.get('/')

const server = https.createServer(options, app).listen(port, function() {
    console.log(`Application worker ${process.pid} started on port ${port}...`);
});
