const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const fs = require('fs');

const userStorePath = './app/userStore/';
const userStoreFile = 'users.json';

const users = {};
const authUsers = JSON.parse(fs.readFileSync('./app/config/auth-users.json', 'utf8')).authorized;

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

const getSecret = () => {
	const secret = fs.readFileSync('./app/config/client-secret.json', 'utf8');
	return JSON.parse(secret);
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

const verify = (accessToken, refreshToken, profile, done) => {
	if (profile && isUserAuth(profile.id)) {
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

passport.serializeUser((user, done) => {
	storeUser(user.id, user);
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	let user = getUser(id);
	done(null, user);
});

passport.use(getStrategy(getSecret()));

const isUserAuth = module.exports.isUserAuth = (userID) => {
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