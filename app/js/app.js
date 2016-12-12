const {ipcRenderer} = require('electron');
const fs = require('fs');

const DARKSKY = 'https://api.darksky.net/forecast/';
const API_KEY = fs.readFileSync('app/js/apiKey.txt', 'utf8');
const lat = 47.6062;
const lng = -122.3321;

var getData = function() {

	$.get(DARKSKY + '' + API_KEY + '/' + lat + ',' + lng).then(function(data) {
		console.log(data);
		parseWeatherData(data);
	})
	.fail(function() {
		console.log('Failed');
		parseWeatherData(null);
	});
}

var renderWeatherData = function(data) {
	$('.weather-main').empty();
	if (data == null) {
		$('.weather-main').append($('<h1>Weather Connection Error</h1>'));
		return;
	}

	
	
	for (let i = 0; i < data.length; i++) {
		let highE = $('<p>High: ' + data[i].max + '&deg;</p>');
		let lowE = $('<p>Low: ' + data[i].min + '&deg;</p>');
		let windE = $('<p>Wind: ' + data[i].wind + 'mph</p>');
		let rainE = $('<p>Rain: ' + (data[i].rain * 100).toFixed(0) + '%</p>');

		let newWrapperTemplate = $('<div class="col-xs-3"></div>');
		let newRow = $('<div class="row"></div>');
		newRow.append(newWrapperTemplate.clone().append(highE));
		newRow.append(newWrapperTemplate.clone().append(lowE));
		newRow.append(newWrapperTemplate.clone().append(windE));
		newRow.append(newWrapperTemplate.clone().append(rainE));
		$('.weather-main').append(newRow);
	}
}

var parseWeatherData = function(data) {
	let daily = data.daily.data;
	let formattedData = [];
	for (let i = 0; i < daily.length; i++) {
		let dataObject = {};
		dataObject.min = daily[i].temperatureMin;
		dataObject.max = daily[i].temperatureMax;
		dataObject.wind = daily[i].windSpeed;
		dataObject.rain = daily[i].precipProbability;
		formattedData[i] = dataObject;
	}
	renderWeatherData(formattedData);
}

getData();
setInterval(getData, 600000);

// document.addEventListener('keydown', function(e) {
// 	console.log(e);
// 	if (e.key == 'q') {
// 		ipcRenderer.send('asynchronous-message', 'test');
// 	}
// });