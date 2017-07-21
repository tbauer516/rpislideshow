const root = './app/';
const fs = require('fs');
const express = require('express');
const passport = require('./logic/passport.js');
const darksky = require('./logic/darksky.js');
const photos = require('./logic/googlephotos.js');

const oneDay = 86400000;

module.exports = (app) => {

	app.use(passport.initialize());
	app.use(passport.session());

	let env = app.get('environment');

	app.get('/api/weather', (req, res) => {
		let type = req.query.type;
		if (!type)
			res.redirect('/error');

		darksky.getWeather(type)
		.then((data) => {
			res.json(data);
		});
		
	});

	app.get('/api/photos', passport.ajaxLoggedIn, (req, res) => {
		console.log('request to sync drive received');
		photos.syncImages(req.user)
		.then(() => {
			res.end();
		});
	});

	app.get('/api/photo', (req, res) => {
		let photo = photos.getNextLocalImage();
	
		if (photo) {
			res.send(photo);
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

	if (app.get('environment') === 'production')
		app.use('/', passport.isLoggedIn, express.static(__dirname + '/../../react/build', { maxAge: oneDay, redirect: false }));

	app.use('/images', express.static(__dirname + '/media', {maxAge: oneDay }));
	
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