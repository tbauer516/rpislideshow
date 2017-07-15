const request = {
	headers: {
		'Content-Type': 'application/json'
	},
	method: 'get',
	credentials: 'include',
	mode: 'cors'
};

export const getNewPhoto = () => {
	return fetch('/api/photo', request)
	.then(response => {
		return response.text();
	})
	.then(data => {
		data = 'http://localhost:3001/images/' + data;
		return data;
	})
	.catch(err => {
		console.log(err);
	});
};

export const syncDrive = () => {
	return fetch('/api/photos', request)
	.then(response => {
		return response.text();
	})
	.catch(err => {
		console.log(err);
	});
};