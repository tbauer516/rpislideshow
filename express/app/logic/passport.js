const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const fs = require('fs');
const secret = require('../config/client-secret.json');

const userStorePath = './app/userStore/';
const userStoreFile = 'users.json';

const users = {};

const storeUser = (id, user) => {
	if (!fs.existsSync(userStorePath))
		fs.mkdirSync(userStorePath);

	let userData = {};
	if (fs.existsSync(userStorePath + userStoreFile))
		userData = JSON.parse(fs.readFileSync(userStorePath + userStoreFile));
	userData[id] = user;
	fs.writeFileSync(userStorePath + userStoreFile, JSON.stringify(userData));
}

const getUser = (id) => {
	if (fs.existsSync(userStorePath + userStoreFile))
		return JSON.parse(fs.readFileSync(userStorePath + userStoreFile))[id];
	return {};
}

const verify = (accessToken, refreshToken, profile, done) => {
	if (profile) {
		profile.accessToken = accessToken;
		profile.refreshToken = refreshToken;
		return done(null, profile);
	}
	return done(null, false);
};

const getStrategy = (secret) => {
	if (!secret)
		throw('Secret was not initialized');

	return new GoogleStrategy(
		{
			clientID: secret.web.client_id,
			clientSecret: secret.web.client_secret,
			callbackURL: secret.web.redirect_uris[0]
		},
		verify
	);
};

module.exports.refreshTokens = (user, oauth2Client) => {
	return new Promise((resolve, reject) => {
		oauth2Client.refreshAccessToken((err, tokens) => {
			if (err) return reject(err);
			return resolve(tokens);
		});
	})
	.then(tokens => {
		let userData = getUser(user.id);
		userData.accessToken = tokens.access_token;
		userData.refreshToken = tokens.refresh_token;
		oauth2Client.credentials.access_token = tokens.access_token;
		oauth2Client.credentials.refresh_token = tokens.refresh_token;
		storeUser(user.id, userData);
	});
};

module.exports.isLoggedIn = (req, res, next) => {
	if (req.isAuthenticated()) {
		let userID = req.user.id;
		return next();
	}

	// return res.redirect('/error?message=' + encodeURIComponent('you are not logged in'));
	return res.redirect('/login');
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
		accessType: 'offline',
		prompt: 'consent',
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

passport.serializeUser((user, done) => {
	storeUser(user.id, user);
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	let user = getUser(id);
	done(null, user);
});

passport.use(getStrategy(secret));