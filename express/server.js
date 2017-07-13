const express = require('express');
const session = require('express-session');
// const fs = require('fs');
const compression = require('compression');
const bodyParser = require('body-parser');
const app = express();
const FileStore = require('session-file-store')(session);

const oneDay = 86400000;
const port = process.env.PORT || 3001;

let environment = process.env.ENVIRONMENT || 'production';
app.set('environment', environment);

app.use(compression());
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({
	extended: true
}));

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "http://127.0.0.1");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.header("Access-Control-Allow-Credentials", true);
	next();
});

if (app.get('environment') === 'production')
	app.use('/', express.static(__dirname + '/../react/build', { maxAge: 0 }));

app.use(session({
	secret: 'password',
	name: 'rpislideshow',
	resave: true,
	saveUninitialized: false,
	maxAge: 600000,
	cookie: { httpOnly: false, secure: false },
	store: new FileStore({ path: './app/sessStore/' })
}));

require('./app/routes.js')(app);

app.listen(port, function () {
	console.log(`The magic happens on port: ${port}`);
});