const request = {
	headers: {
		'Content-Type': 'application/json'
	},
	method: 'get',
	credentials: 'include',
	mode: 'cors'
};

const getPhoto = () => {
	return fetch('/api/photo', request)
	.then(response => {
		return response.json();
	})
	.then(data => {
		data.name = window.location.origin + '/images/' + data.name;
		return data;
	})
	.catch(err => {
		console.log(err);
	});
};

export const getNewPhoto = () => {
	return getPhoto();
}