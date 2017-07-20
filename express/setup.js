const fs = require('fs');
const request = require('request');

const configFile = './app/config/user-config.json';

const checkForConfig = () => {
	return new Promise((resolve, reject) => {
		fs.readFile(configFile, (err, data) => {
			if (err) {
				fs.writeFile(configFile, '{}', (err) => {
					if (err) return reject('Config file does not exist at ' + configFile);
				})
			}
			return resolve(JSON.parse(data));
		});
	});
};

const checkLocation = (config) => {
	return new Promise((resolve, reject) => {
		if (config.lat && config.lng) {
			return resolve(config);
		} else if (config.address) {
			const path = 'http://maps.google.com/maps/api/geocode/json?address=';
			new Promise((resolve, reject) => {
				request(path + config.address, (err, resp, body) => {
					if (err) reject(err);
					resolve(JSON.parse(body));
				});
			})
			.then(body => {
				const loc = body.results[0].geometry.location;
				config.lat = loc.lat;
				config.lng = loc.lng;
			})
			.then(() => {
				this.configIsGood = false;
				return resolve(config);
			});
		} else {
			return reject('No location can be found for you');
		}
	});
};

const writeConfig = (config) => {
	return new Promise((resolve, reject) => {
		if (!this.configIsGood) {
			fs.writeFile(configFile, JSON.stringify(config), (err) => {
				if (err) return reject(err);
				return resolve(config);
			});
		}
		return resolve();
	});
};

const main = () => {
	this.configIsGood = true;
	let config;
	
	return Promise.resolve()
	.then(checkForConfig)
	.then(parsedConf => {
		config = parsedConf;
		return config;
	})
	.then(checkLocation)
	.then(writeConfig)
	.then(() => {
		if (this.configIsGood === true) {
			console.log('Config file is good');
		} else {
			console.log('Config file was configured for you. Please restart the application.');
		}
	})
	.catch(err => {
		throw(err);
	});
};

main();