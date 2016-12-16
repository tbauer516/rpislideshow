// const {ipcRenderer} = require('electron');
const fs = require('fs');
// const electronSpeech = require('electron-speech');

const DARKSKY = 'https://api.darksky.net/forecast/';
const API_KEY = fs.readFileSync('app/js/darknet.txt', 'utf8');
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

// var grammar = '#JSGF V1.0; grammar commands; public <command> = what is weather | close weather;'
// var speechRecognitionList = new webkitSpeechGrammarList();
// speechRecognitionList.addFromString(grammar, 1);

let startRecognition = function() {
	recognition = new webkitSpeechRecognition();
	// recognition.grammars = speechRecognitionList;
	// recognition.continuous = true;

	recognition.onstart = function(event) {
		respond('I\'m listening...');
		console.log('recording');
	};
	recognition.onresult = function(event) {
		recognition.onend = null;

		var text = "";
		for (var i = event.resultIndex; i < event.results.length; ++i) {
			text += event.results[i][0].transcript;
		}
		respond('You said: ' + text);
		setTimeout(function() {
			respond('I\'m listening...');
		}, 3000);
		stopRecognition();
		console.log(text);
		if (text.MC('what is weather')) {
			let weather = $('.weather');
			weather.removeClass('hidden');
			weather.addClass('visible');
		} else if (text.MC('(close clothes) weather')) {
			let weather = $('.weather');
			weather.removeClass('visible');
			weather.addClass('hidden');
		}
	};
	recognition.onend = function() {
		// respond('I couldn\'t hear you. Can you repeat that?');
		stopRecognition();
		console.log('end');
	};
	recognition.onerror = function(error) {
		console.log(error);
	};
	recognition.lang = "en-US";
	recognition.start();
}

let stopRecognition = function() {
	if (recognition) {
		recognition.stop();
		recognition = null;
		startRecognition();
	}
}

let switchRecognition = function() {
	if (recognition) {
		stopRecognition();
	} else {
		startRecognition();
	}
}

let respond = function(message) {
	$('.communication').empty().append($('<p></p>').text(message));
}

let recognition;
startRecognition();
// var recog = electronSpeech({
// 	lang: 'en-US',
// 	continuous: false
// })
//
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
//
// recog.on('text', function (text) {
// 	console.log(text)
	// if (text.MC('what is weather')) {
	// 	let weather = $('.weather');
	// 	weather.removeClass('hidden');
	// 	weather.addClass('visible');
	// } else if (text.MC('(close clothes) weather')) {
	// 	let weather = $('.weather');
	// 	weather.removeClass('visible');
	// 	weather.addClass('hidden');
	// }
// });
//
// recog.on('ready', function() {
// 	console.log('ready to listen');
// });
//
// recog.on('close', function() {
// 	console.log('listening closed');
// });
//
// recog.on('error', function(error) {
// 	console.log(error);
// });
//
// recog.listen()

// console.log('require-msr', MediaStreamRecorder);

// console.log('\n\n-------\n\n');

// var recorder = new MediaStreamRecorder({});
// console.log('MediaStreamRecorder', recorder);

// console.log('\n\n-------\n\n');

// var multiStreamRecorder = new MediaStreamRecorder.MultiStreamRecorder({});
// console.log('MultiStreamRecorder', multiStreamRecorder);

// var mediaConstraints = {
//     audio: true
// };


// function onMediaSuccess(stream) {
//     var mediaRecorder = new MediaStreamRecorder(stream);
//     mediaRecorder.mimeType = 'audio/wav'; // check this line for audio/wav
//     mediaRecorder.ondataavailable = function (blob) {
//         // POST/PUT "Blob" using FormData/XHR2
//         var blobURL = URL.createObjectURL(blob);
//         document.write('<a href="' + blobURL + '">' + blobURL + '</a>');
//         console.log(blobURL);
//     };
//     mediaRecorder.start(3000);
// }

// function onMediaError(e) {
//     console.error('media error', e);
// }

// navigator.getUserMedia(mediaConstraints, onMediaSuccess, onMediaError);


// [START speech_quickstart]
// Imports the Google Cloud client library
// const Sonus = require('sonus');
// const speech = require('@google-cloud/speech')({
// 	projectId: 'rpi-mirror-152523',
//   	keyFilename: '../rpimirror-f7e39e43cd34.json'
// });
//
// const hotwords = [{ file: '../resources/snowboy.umdl', hotword: 'snowboy' }];
// const sonus = Sonus.init({ hotwords }, speech);
//
// Sonus.start(sonus);
// sonus.on('hotword', (index, keyword) => console.log('You Spoke!'));
// sonus.on('final-result', console.log);

// // // The name of the audio file to transcribe
// const fileName = '../resources/audio.raw';

// // // The audio file's encoding and sample rate
// const options = {
//   encoding: 'LINEAR16',
//   sampleRate: 16000
// };

// // Detects speech in the audio file
// speech.recognize(fileName, options)
//   .then((results) => {
//     const transcription = results[0];
//     console.log(`Transcription: ${transcription}`);
//   });
// [END speech_quickstart]

// document.addEventListener('keydown', function(e) {
// 	console.log(e);
// 	if (e.key == 'q') {
// 		ipcRenderer.send('asynchronous-message', 'test');
// 	}
// });
