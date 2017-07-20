const express = require('express');
const session = require('express-session');
const compression = require('compression');
const bodyParser = require('body-parser');
const app = express();
const FileStore = require('session-file-store')(session);
const passport = require('./app/logic/passport.js');

const oneDay = 86400000;
const port = 3001;

let environment = process.env.ENVIRONMENT || 'production';
app.set('environment', environment);

app.use(compression());
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({
	extended: true
}));

app.use(session({
	secret: 'password',
	name: 'rpislideshow',
	resave: true,
	saveUninitialized: false,
	// maxAge: 60000,
	maxAge: Number.MAX_SAFE_INTEGER,
	cookie: { httpOnly: false, secure: false, maxAge: Number.MAX_SAFE_INTEGER },
	store: new FileStore({ path: './app/sessStore/' })
}));

require('./app/routes.js')(app);

app.listen(port, function () {
	console.log(`The magic happens on port: ${port}`);
});