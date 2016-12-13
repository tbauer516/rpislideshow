const {ipcRenderer} = require('electron');
const fs = require('fs');

const DARKSKY = 'https://api.darksky.net/forecast/';
const API_KEY = fs.readFileSync('app/js/apiKey.txt', 'utf8');
const LAT = 47.6062;
const LNG = -122.3321;
const EXCLUDE = '?exclude=minutely,hourly,alerts,flags';



var renderCurrentData  = function(data) {
	
}

var renderForecastData = function(data) {
	let dayStrings = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	let weather = $('.weather-main');
	weather.empty();
	if (data == null) {
		weather.append($('<h1>Weather Connection Error</h1>'));
		return;
	}

	// weather.append($('<p class="weather-item"></p>'));
	// weather.append($('<p class="weather-item"></p>'));
	// weather.append($('<p class="weather-item">High Temp:</p>'));
	// weather.append($('<p class="weather-item">Low Temp:</p>'));
	// weather.append($('<p class="weather-item">Wind Speed:</p>'));
	// weather.append($('<p class="weather-item">Rain Chance:</p>'));
	
	for (let i = 0; i < data.length; i++) {
		let forecastDate = new Date(data[i].time);

		let highE = $('<p class="block">' + data[i].max + '&deg;</p>');
		let lowE = $('<p class="block">' + data[i].min + '&deg;</p>');
		let windE = $('<p class="block">' + data[i].wind + 'mph</p>');
		let rainE = $('<p class="block">' + (data[i].rain * 100).toFixed(0) + '%</p>');
		let day = $('<p class="weather-item">' + dayStrings[forecastDate.getDay()] + '</p>');

		let icon = fs.readFileSync('app/assets/weather/' + data[i].icon + '.svg', 'utf8');
		icon = $(icon);

		let divTemplate = $('<div class="weather-item"></div>');
		weather.append(divTemplate.clone().append(day));
		weather.append(divTemplate.clone().append(icon));
		weather.append(divTemplate.clone().append(highE).append(lowE));
		weather.append(divTemplate.clone().append(windE).append(rainE));
	}
}

var parseCurrentData = function(data) {

}

var parseForecastData = function(data) {
	// Parsing for forecast only, not current date
	let daily = data.daily.data;
	console.log(daily);
	let formattedData = [];
	for (let i = 1; i < daily.length; i++) {
		let dataObject = {};
		dataObject.min = daily[i].temperatureMin;
		dataObject.max = daily[i].temperatureMax;
		dataObject.wind = daily[i].windSpeed;
		dataObject.rain = daily[i].precipProbability;

		let dateMillis = daily[i].time + '';
		if (dateMillis.length < 13) {
			for (let i = dateMillis.length; i < 13; i++) {
				dateMillis += '0';
			}
		}

		dataObject.time = parseInt(dateMillis);
		dataObject.icon = daily[i].icon;
		formattedData.push(dataObject);
	}
	console.log(formattedData);
	renderForecastData(formattedData);
}

var getCurrentData = function() {
	console.log('forecast called');
	$.get(DARKSKY + '' + API_KEY + '/' + LAT + ',' + LNG + '' + EXCLUDE + ',daily',
	function(data) {
		console.log(data);
		parseCurrentData(data);
	})
	.fail(function() {
		console.log('Failed');
		parseCurrentData(null);
	});
}

var getForecastData = function() {
	console.log('forecast called');
	$.get(DARKSKY + '' + API_KEY + '/' + LAT + ',' + LNG + '' + EXCLUDE + ',currently',
	function(data) {
		console.log(data);
		parseForecastData(data);
	})
	.fail(function() {
		console.log('Failed');
		parseForecastData(null);
	});
}

//300000 in 5 min
// getCurrentData();
// setInterval(getCurrentData, 300000);

getForecastData();
setInterval(getForecastData, 21600000); // Refresh every 6 hours

// document.addEventListener('keydown', function(e) {
// 	console.log(e);
// 	if (e.key == 'q') {
// 		ipcRenderer.send('asynchronous-message', 'test');
// 	}
// });