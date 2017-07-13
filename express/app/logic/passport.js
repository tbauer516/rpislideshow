const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const fs = require('fs');

const environments = {
	development: 0,
	production: 0
};

const userStorePath = './app/userStore/';
const userStoreFile = 'users.json';

let environment = process.env.ENVIRONMENT || 'production';

const users = {};
const authUsers = JSON.parse(fs.readFileSync('./app/config/auth-users.json', 'utf8')).authorized;

let storeUser = (id, user) => {
	if (!fs.existsSync(userStorePath))
		fs.mkdirSync(userStorePath);

	let userData = {};
	if (fs.existsSync(userStorePath + userStoreFile))
		userData = JSON.parse(fs.readFileSync(userStorePath + userStoreFile));
	userData[id] = user;
	fs.writeFileSync(userStorePath + userStoreFile, JSON.stringify(userData));
}

let getUser = (id) => {
	if (fs.existsSync(userStorePath + userStoreFile))
		return JSON.parse(fs.readFileSync(userStorePath + userStoreFile))[id];
	return {};
}

let getSecret = () => {
	let secret = fs.readFileSync('./app/config/client-secret.json', 'utf8');
	return JSON.parse(secret);
};

let verify = (accessToken, refreshToken, profile, done) => {
	if (profile && isUserAuth(profile.id)) {
		profile.accessToken = accessToken;
		profile.refreshToken = refreshToken;
		return done(null, profile);
	}
	return done(null, false);
};

let getStrategy = (secret) => {
	if (!secret)
		throw('Secret was not initialized');

	return new GoogleStrategy(
		{
			clientID: secret.web.client_id,
			clientSecret: secret.web.client_secret,
			callbackURL: secret.web.redirect_uris[environments[environment]]
		},
		verify
	);
};

passport.serializeUser((user, done) => {
	storeUser(user.id, user);
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	let user = getUser(id);
	done(null, user);
});

passport.use(getStrategy(getSecret()));

let isUserAuth = module.exports.isUserAuth = (userID) => {
	for (let i = 0; i < authUsers.length; i++) {
		if (userID === authUsers[i])
			return true;
	}
	return false;
};

module.exports.isLoggedIn = (req, res, next) => {
	if (req.isAuthenticated()) {
		let userID = req.user.id;
		if (isUserAuth(userID))
			return next();
	}

	return res.redirect('/error?message=' + encodeURIComponent('you are not logged in'));
};

module.exports.initialize = () => {
	return passport.initialize();
};

module.exports.session = () => {
	return passport.session();
};

module.exports.auth = () => {
	let message = 'Login attempt failed.';
	return passport.authenticate('google', {
		access_type: 'offline',
		scope: [
			'https://www.googleapis.com/auth/plus.login',
			'https://www.googleapis.com/auth/drive'
		],
		failureRedirect: '/error?message=' + encodeURIComponent(message)
	});
};

module.exports.authCallback = () => {
	let message = 'Login attempt failed.';
	return passport.authenticate('google', { failureRedirect: '/error?message=' + encodeURIComponent(message) });
};