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
		res.json();
	});

	app.get('/login', (req, res) => {
		res.redirect('/auth');
	});

	app.get('/auth', passport.auth());

	app.get('/auth/callback', passport.auth(), (req, res) => {
		res.redirect('/api/photos');
		// res.redirect('http://127.0.0.1:3000');
	});

	app.get('/logout', (req, res) => {
		req.logout();
		res.redirect('http://127.0.0.1:3000');
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