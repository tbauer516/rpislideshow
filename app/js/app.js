const DARKSKY = 'https://api.darksky.net/forecast/';
const LAT = 47.6062;
const LNG = -122.3321;
const EXCLUDE = '?exclude=minutely,hourly,alerts,flags';
var  API_KEY;

$.get('http://localhost:8108/API', function(data) {
	API_KEY = data;
	$.ajaxSetup({
		dataType:  'jsonp'
	});
	getCurrentData();
	getForecastData();
});

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
	// let iconE = fs.readFileSync('app/assets/weather/' + data.icon + '.svg', 'utf8');
	// let iconE = .load('../assets/weather/' + data.icon + '.svg');
	// iconE = $(iconE);
	let rainE = $('<p class="block">' + data.precip + '%</p>');

	// head.append(divTemplate.clone().addClass('weather-main-time').append(timeE);
	$('.weather-main-icon').empty().load('/app/assets/weather/' + data.icon + '.svg');
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

		// let iconE = fs.readFileSync('app/assets/weather/' + data[i].icon + '.svg', 'utf8');
		// iconE = $(iconE);

		weather.append(divTemplate.clone().load('/app/assets/weather/' + data[i].icon + '.svg'));
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

let weatherDisplay = $('.weather');
let infoDisplays = [weatherDisplay];
var displayOn = false;
var toggleDisplay = function(turnOn) {
	let weather = $('.weather');
	if ((turnOn != undefined && !turnOn) || displayOn) {
		weather.removeClass('visible');
		weather.addClass('hidden');
		displayOn = false;
	} else if ((turnOn != undefined && turnOn) || !displayOn) {
		weather.removeClass('hidden');
		weather.addClass('visible');
		displayOn = true;
	}
}

var closeAll = function() {
	for (let i = 0; i < infoDisplays.length; i++) {
		infoDisplays[i].removeClass('visible');
		infoDisplays[i].addClass('hidden');
	}
}

var openWeather = function() {
	closeAll();
	displayOn = true;
	weatherDisplay.removeClass('hidden');
	weatherDisplay.addClass('visible');
}

renderTime();
setInterval(renderTime, 1000);

//300000 in 5 min
setInterval(getCurrentData, 300000);

setInterval(getForecastData, 21600000); // Refresh every 6 hours

// let recognition;
// startRecognition();

String.prototype.MC = function(commandStr) {
	console.log(this);
	let commands = / +(?=[^()]*(\(|$))/;
	let chunks = commandStr.split(commands);
	if (this.split(commands).length < chunks.length)
		return false;
	console.log('chunks:');
	console.log(chunks);
	for (let i = 0; i < chunks.length; i++) {
		let chunk = chunks[i].trim();
		if (chunk != '') {
			let bits;
			if (chunk.indexOf(' ') != -1) {
				bits = chunk.split(/\s+/);
				bits[0] = bits[0].slice(1);
				bits[bits.length - 1] = bits[bits.length - 1].slice(0, bits[bits.length - 1].length - 1);

			} else {
				bits = [chunk];
			}
			console.log('bits:');
			console.log(bits);
			let found = false;
			for (let j = 0; j < bits.length; j++) {
				if (this.indexOf(bits[j]) !== -1) {
					found = true;
					console.log('found ' + bits[j]);
					console.log(this.indexOf(bits[j]));
				}
			}
			if (!found) {
				console.log('returned false');
				return false;
			}
		}
	}
	console.log('returned true');
	return true;
}



document.addEventListener('keydown', function(e) {
	console.log(e);
	if (e.key == 't') {
		toggleDisplay();
	}
});
openWeather();

// ##############################################

console.log(artyom);

artyom.on(["Weather Display", "Whether Display"]).then(function(i){
    console.log("Triggered");
	toggleDisplay();
});

artyom.initialize({
    lang:"en-US",
	continuous: true,
    debug:true, // Show what recognizes in the Console
    listen:true, // Start listening after this
    speed:0.9, // Talk a little bit slow
    mode:"normal" // This parameter is not required as it will be normal by default
});
