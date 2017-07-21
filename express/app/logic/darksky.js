const fs = require('fs');
const request = require('request');
const key = require('../config/darksky.json').secret;
const config = require('../config/user-config.json');

const baseUrl = 'https://api.darksky.net/forecast/';
const lat = config.lat;
const lng = config.lng;
const exclude = '?exclude=minutely,hourly,alerts,flags';
const toExclude = {
	current: 'daily',
	forecast: 'currently'
};

// const key = fs.readFileSync('./app/config/darknet.txt', 'utf8');

module.exports.getWeather = (type) => {
	const path = baseUrl + key + '/' + lat + ',' + lng + exclude + ',' + type;
	return new Promise((resolve, reject) => {
		request(path, (err, resp, body) => {
			if (err) reject(err);
			resolve(body);
		});
	});
};