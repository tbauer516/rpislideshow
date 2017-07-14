const request = {
	headers: {
		'Content-Type': 'application/json'
	},
	method: 'get',
	credentials: 'include',
	mode: 'cors'
};

const getWeather = (type) => {
	return new Promise((resolve, reject) => {
		fetch('/api/weather?type=' + type, request)
		.then((response) => {
			return response.json();
		})
		.then((data) => {
			resolve(JSON.parse(data));
		})
		.catch((err) => {
			console.log(err);
		});
	});
};

export const getCurrentWeather = () => {
	return getWeather('current')
	.then(data => {
		return parseCurrent(data);
	});
}

export const getForecast = () => {
	return getWeather('forecast')
	.then(data => {
		return parseForecast(data);
	});
};

const parseCurrent = (data) => {
	let current = data.currently;
	let dataObject = {};

	// let tempTime = ensureTime(current.time);
	// let currentDate = new Date(tempTime);
	// let currMin = currentDate.getMinutes();
	// if (currMin < 10) {
	// 	currMin = '0' + currMin;
	// }
	// let currHour = currentDate.getHours() % 12;
	// if (currHour == 0) {
	// 	currHour = 12;
	// }
	// let currHalf = 'AM';
	// if (currentDate.getHours() > 11) {
	// 	currHalf = 'PM';
	// }
	// let currTime = '' + currHour + ':' + currMin + ' ' + currHalf;

	// dataObject.time = currTime;
	dataObject.icon = current.icon;
	dataObject.temp = Math.round(current.temperature);
	dataObject.wind = Math.round(current.windSpeed);
	dataObject.rain = (current.precipProbability * 100).toFixed(0);
	return dataObject;
};

const parseForecast = (data) => {
	const dayArray = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	let daily = data.daily.data;
	let formattedData = [];
	for (let i = 0; i < daily.length; i++) {
		let time = ensureTime(daily[i].time);
		let dataObject = {};
		dataObject.min = Math.round(daily[i].temperatureMin);
		dataObject.max = Math.round(daily[i].temperatureMax);
		dataObject.wind = Math.round(daily[i].windSpeed);
		dataObject.rain = (daily[i].precipProbability * 100).toFixed(0);
		dataObject.day = dayArray[new Date(time).getDay()];
		dataObject.icon = daily[i].icon;
		formattedData.push(dataObject);
	}
	return formattedData;
}

const ensureTime = (time) => {
	time += '';
	if (time.length < 13) {
		for (let i = time.length; i < 13; i++) {
			time += '0';
		}
	}
	return parseInt(time, 10);
};