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
	$('.weather-main-icon').empty().load('../assets/weather/' + data.icon + '.svg');
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

		weather.append(divTemplate.clone().load('../assets/weather/' + data[i].icon + '.svg'));
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
	weatherDisplay.removeClass('hidden');
	weatherDisplay.addClass('visible');
}

renderTime();
setInterval(renderTime, 1000);

//300000 in 5 min
setInterval(getCurrentData, 300000);

setInterval(getForecastData, 21600000); // Refresh every 6 hours


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


// These will be initialized later
var recognizer, recorder, callbackManager, audioContext, outputContainer;
// Only when both recorder and recognizer do we have a ready application
var isRecorderReady = isRecognizerReady = false;

// A convenience function to post a message to the recognizer and associate
// a callback to its response
function postRecognizerJob(message, callback) {
	var msg = message || {};
	if (callbackManager) msg.callbackId = callbackManager.add(callback);
	if (recognizer) recognizer.postMessage(msg);
};

// This function initializes an instance of the recorder
// it posts a message right away and calls onReady when it
// is ready so that onmessage can be properly set
function spawnWorker(workerURL, onReady) {
	recognizer = new Worker(workerURL);
	recognizer.onmessage = function(event) {
		onReady(recognizer);
	};
	recognizer.postMessage('');
};

// To display the hypothesis sent by the recognizer
function updateCount(count) {
	if (outputContainer) outputContainer.innerHTML = count;
};

// This updates the UI when the app might get ready
// Only when both recorder and recognizer are ready do we enable the buttons
function updateUI() {
	if (isRecorderReady && isRecognizerReady) startRecording();
};

// This is just a logging window where we display the status
function updateStatus(newStatus) {
	document.getElementsByClassName('current-status')[0].innerHTML += '<br/>' + newStatus;
};

// A not-so-great recording indicator
function displayRecording(display) {
	if (display) document.getElementById('recording-indicator').innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
	else document.getElementById('recording-indicator').innerHTML = '';
};

// Callback function once the user authorises access to the microphone
// in it, we instanciate the recorder
function startUserMedia(stream) {
	var input = audioContext.createMediaStreamSource(stream);
	// Firefox hack https://support.mozilla.org/en-US/questions/984179
	window.firefox_audio_hack = input;
	var audioRecorderConfig = {errorCallback: function(x) {updateStatus('Error from recorder: ' + x);}};
	recorder = new AudioRecorder(input, audioRecorderConfig);
	// If a recognizer is ready, we pass it to the recorder
	if (recognizer) recorder.consumers = [recognizer];
	isRecorderReady = true;
	updateUI();
	updateStatus('Audio recorder ready');
};

// This starts recording. We first need to get the id of the keyword search to use
var startRecording = function() {
	var id = document.getElementById('keyword').value;
	if (recorder && recorder.start(id)) displayRecording(true);
};

// Stops recording
var stopRecording = function() {
	recorder && recorder.stop();
	displayRecording(false);
};

// Called once the recognizer is ready
// We then add the grammars to the input select tag and update the UI
var recognizerReady = function() {
	// updateKeywords();
	isRecognizerReady = true;
	updateUI();
	updateStatus('Recognizer ready');
};

// We get the grammars defined below and fill in the input select tag
// var updateKeywords = function() {
// 	var selectTag = document.getElementById('keyword');
// 	for (var i = 0 ; i < keywordIds.length ; i++) {
// 		var newElt = document.createElement('option');
// 		newElt.value=keywordIds[i].id;
// 		newElt.innerHTML = keywordIds[i].title;
// 		selectTag.appendChild(newElt);
// 	}
// };

// This adds a keyword search from the array
// We add them one by one and call it again as
// a callback.
// Once we are done adding all grammars, we can call
// recognizerReady()
var feedKeyword = function(g, index, id) {
	if (id && (keywordIds.length > 0)) keywordIds[0].id = id.id;
	if (index < g.length) {
		keywordIds.unshift({title: g[index].title})
		postRecognizerJob({command: 'addKeyword', data: g[index].g},
				function(id) {feedKeyword(keywords, index + 1, {id:id});});
	} else {
		recognizerReady();
	}
};

// This adds words to the recognizer. When it calls back, we add grammars
var feedWords = function(words) {
	postRecognizerJob({command: 'addWords', data: words},
			function() {feedKeyword(keywords, 0);});
};

// This initializes the recognizer. When it calls back, we add words
var initRecognizer = function() {
	// You can pass parameters to the recognizer, such as : {command: 'initialize', data: [['-hmm', 'my_model'], ['-fwdflat', 'no']]}
	postRecognizerJob({command: 'initialize', data: [['-kws_threshold', '1e-35']]},
			function() {
				if (recorder) recorder.consumers = [recognizer];
				feedWords(wordList);
			}
	);
};

// When the page is loaded, we spawn a new recognizer worker and call getUserMedia to
// request access to the microphone
window.onload = function() {
	outputContainer = document.getElementsByClassName('output')[0];
	updateStatus('Initializing web audio and speech recognizer, waiting for approval to access the microphone');
	callbackManager = new CallbackManager();
	spawnWorker('js/recognizer.js', function(worker) {
		// This is the onmessage function, once the worker is fully loaded
		worker.onmessage = function(e) {
			// This is the case when we have a callback id to be called
			if (e.data.hasOwnProperty('id')) {
				var clb = callbackManager.get(e.data['id']);
				var data = {};
				if ( e.data.hasOwnProperty('data')) data = e.data.data;
				if(clb) clb(data);
			}
			// This is a case when the recognizer has a new count number
			if (e.data.hasOwnProperty('hyp')) {
				console.log(e.data);
				var newCount = e.data.hyp;
				// TODO: logic for recognition here
				if (e.data.hasOwnProperty('final') &&  e.data.final) {
					newCount = 'Final: ' + newCount;
					if (e.data.hyp == 'MAGIC CLOSE')
						closeAll();
					else if (e.data.hyp == 'MAGIC WEATHER')
						openWeather();
				}
				if (e.data.hyp != '') {
					updateCount(newCount);
					stopRecording();
					startRecording();
				}
			}
			// This is the case when we have an error
			if (e.data.hasOwnProperty('status') && (e.data.status == 'error')) {
				updateStatus('Error in ' + e.data.command + ' with code ' + e.data.code);
			}
		};
		// Once the worker is fully loaded, we can call the initialize function
		initRecognizer();
	});

	// The following is to initialize Web Audio
	try {
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
		window.URL = window.URL || window.webkitURL;
		audioContext = new AudioContext();
	} catch (e) {
		updateStatus('Error initializing Web Audio browser');
	}
	if (navigator.getUserMedia) navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
		updateStatus('No live audio input in this browser');
	});
	else updateStatus('No web audio support in this browser');

	// Wiring JavaScript to the UI
	var startBtn = document.getElementById('startBtn');
	var stopBtn = document.getElementById('stopBtn');
	startBtn.disabled = true;
	stopBtn.disabled = true;
	startBtn.addEventListener('click', startRecording);
	stopBtn.addEventListener('click', stopRecording);
};

// This is the list of words that need to be added to the recognizer
// This follows the CMU dictionary format
var wordList = [['MAGIC', 'M AE JH IH K'], ['WEATHER', 'W EH DH ER'], ['WEATHER(2)', 'W EH TH ER'], ['CLOSE', 'K L OW ZH']];
var keywords = [{title: 'Open Weather', g: 'MAGIC WEATHER'}, {title: 'Close All', g: 'MAGIC CLOSE'}];
var keywordIds = [];
