const root = './app/';
const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const fs = require('fs');
const passport = require('./logic/passport.js');
const darknet = require('./logic/darknet.js');
const photos = require('./logic/googlephotos.js');

module.exports = (app) => {

	app.use(passport.initialize());
	app.use(passport.session());

	let env = app.get('environment');

	app.get('/api/weather', passport.isLoggedIn, (req, res) => {
		let type = req.query.type;
		if (!type)
			res.redirect('/error');

		darknet.getWeather(type)
		.then((data) => {
			res.json(data);
		});
		
	});

	app.get('/api/photos', passport.isLoggedIn, (req, res) => {
		photos.syncImages(req.user);
		res.end();
	});

	app.get('/api/photo', passport.isLoggedIn, (req, res) => {
		let photoPath = photos.getNextLocalImage();
	
		if (photoPath) {
			res.sendFile(photoPath, { root: './'}, (err) => {
				if (err) console.log(err);
			});
		} else {
			res.status(403).send('no files available');
		}
	});

	app.get('/login', (req, res) => {
		res.redirect('/auth');
	});

	app.get('/auth', passport.auth());

	app.get('/auth/callback', passport.auth(), (req, res) => {
		let home = 'http://localhost:3001';
		if (env === 'development')
			home = 'http://localhost:3000';
		
		res.redirect(home);
	});

	app.get('/logout', (req, res) => {
		req.logout();
		res.redirect('/login');
	});

	
	// ============================================
	// 404 in case a path is wrong ================
	// ============================================

	app.get('/error', (req, res) => {
		res.json({
			message: req.query.message
		});
	});

	app.get('*', (req, res) => {
		res.status(404);
	});
};