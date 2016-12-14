const {ipcRenderer} = require('electron');
const fs = require('fs');

const DARKSKY = 'https://api.darksky.net/forecast/';
const API_KEY = fs.readFileSync('app/js/apiKey.txt', 'utf8');
const LAT = 47.6062;
const LNG = -122.3321;
const EXCLUDE = '?exclude=minutely,hourly,alerts,flags';



var ensureTime = function(time) {
	time += '';
	if (time.length < 13) {
		for (let i = time.length; i < 13; i++) {
			time += '0';
		}
	}
	return parseInt(time);
}

var renderCurrentData  = function(data) {
	let head = $('.weather-head');
	let divTemplate = $('<div class="weather-item"></div>');
	// head.empty();

	if (data == null) {
		head.append($('<h1>Weather Connection Error</h1>'));
		return;
	}

	let timeE = $('<p class="block">' + data.time + '</p>');
	let tempE = $('<p class="block">' + data.temp + '&deg;</p>');
	let windE = $('<p class="block">' + data.wind + 'mph</p>');
	let iconE = fs.readFileSync('app/assets/weather/' + data.icon + '.svg', 'utf8');
	iconE = $(iconE);
	let rainE = $('<p class="block">' + data.precip + '%</p>');

	// head.append(divTemplate.clone().addClass('weather-main-time').append(timeE);
	$('.weather-main-icon').empty().append(iconE);
	$('.weather-main-stats').empty().append(tempE).append(windE).append(rainE);
}

var renderForecastData = function(data) {
	let dayStrings = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	let weather = $('.weather-main');
	let divTemplate = $('<div class="weather-item"></div>');
	weather.empty();
	
	if (data == null) {
		weather.append($('<h1>Weather Connection Error</h1>'));
		return;
	}
	
	for (let i = 0; i < data.length; i++) {
		let forecastDate = new Date(data[i].time);

		let highE = $('<p class="block">' + data[i].max + '&deg;</p>');
		let lowE = $('<p class="block">' + data[i].min + '&deg;</p>');
		let windE = $('<p class="block">' + data[i].wind + 'mph</p>');
		let rainE = $('<p class="block">' + data[i].rain + '%</p>');
		let dayE = $('<p class="block">' + dayStrings[forecastDate.getDay()] + '</p>');

		let iconE = fs.readFileSync('app/assets/weather/' + data[i].icon + '.svg', 'utf8');
		iconE = $(iconE);

		weather.append(divTemplate.clone().append(iconE));
		weather.append(divTemplate.clone().append(dayE));
		weather.append(divTemplate.clone().append(highE).append(lowE));
		weather.append(divTemplate.clone().append(windE).append(rainE));
	}
}

var parseCurrentData = function(data) {
	let current = data.currently;
	console.log(current);
	let dataObject = {};

	let tempTime = ensureTime(current.time);
	let currentDate = new Date(tempTime);
	let currMin = currentDate.getMinutes();
	if (currMin < 10) {
		currMin = '0' + currMin;
	}
	let currHour = currentDate.getHours() % 12;
	if (currHour == 0) {
		currHour = 12;
	}
	let currHalf = 'AM';
	if (currentDate.getHours() > 11) {
		currHalf = 'PM';
	}
	let currTime = '' + currHour + ':' + currMin + ' ' + currHalf;

	dataObject.time = currTime;
	dataObject.icon = current.icon;
	dataObject.temp = Math.round(current.temperature);
	dataObject.wind = Math.round(current.windSpeed);
	dataObject.precip = (current.precipProbability * 100).toFixed(0);
	renderCurrentData(dataObject);
}

var parseForecastData = function(data) {
	// Parsing for forecast only, not current date
	let daily = data.daily.data;
	let formattedData = [];
	for (let i = 0; i < daily.length; i++) {
		let dataObject = {};
		dataObject.min = Math.round(daily[i].temperatureMin);
		dataObject.max = Math.round(daily[i].temperatureMax);
		dataObject.wind = Math.round(daily[i].windSpeed);
		dataObject.rain = (daily[i].precipProbability * 100).toFixed(0);
		dataObject.time = ensureTime(daily[i].time);
		dataObject.icon = daily[i].icon;
		formattedData.push(dataObject);
	}
	renderForecastData(formattedData);
}

var getCurrentData = function() {
	$.get(DARKSKY + '' + API_KEY + '/' + LAT + ',' + LNG + '' + EXCLUDE + ',daily',
	function(data) {
		console.log(DARKSKY + '' + API_KEY + '/' + LAT + ',' + LNG + '' + EXCLUDE + ',daily');
		console.log(data);
		parseCurrentData(data);
	})
	.fail(function() {
		console.log('Failed');
		parseCurrentData(null);
	});
}

var getForecastData = function() {
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

var getTime = function() {
	let currentDate = new Date();
	let currMin = currentDate.getMinutes();
	if (currMin < 10) {
		currMin = '0' + currMin;
	}
	let currHour = currentDate.getHours() % 12;
	if (currHour == 0) {
		currHour = 12;
	}
	let currHalf = 'AM';
	if (currentDate.getHours() > 11) {
		currHalf = 'PM';
	}
	let currTime = '' + currHour + ':' + currMin + ' ' + currHalf;
	return currTime;
}

var renderTime = function() {
	let timeE = $('.weather-main-time');
	timeE.empty();
	timeE.append($('<p class="block">' + getTime() + '</p>'));
}

renderTime();
setInterval(renderTime, 1000);

//300000 in 5 min
getCurrentData();
setInterval(getCurrentData, 300000);

getForecastData();
setInterval(getForecastData, 21600000); // Refresh every 6 hours

// document.addEventListener('keydown', function(e) {
// 	console.log(e);
// 	if (e.key == 'q') {
// 		ipcRenderer.send('asynchronous-message', 'test');
// 	}
// });