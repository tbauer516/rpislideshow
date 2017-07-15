const fs = require('fs');
const google = require('googleapis');
const googleAuth = require('google-auth-library');
const gm = require('gm').subClass({imageMagick: true});
const passport = require('./passport.js');

const service = google.drive('v3');
const auth = new googleAuth();

const mediaDir = './app/media/';
const mediaDataDir = './app/mediaData/';
const mediaDataName = 'imageData.json';
const mimeTypes = {
	folder: ['application/vnd.google-apps.folder'],
	image: ['image/jpeg']
};

const driveOptions = {
	pageSize: 1000,
	fields: "files(id, kind, mimeType, name, parents, webContentLink, imageMediaMetadata(rotation)), kind",
	corpora: 'user',
	spaces: 'drive',
	orderBy: 'modifiedTime desc'
};

const getSecret = () => {
	let secret = fs.readFileSync('./app/config/client-secret.json', 'utf8');
	return JSON.parse(secret);
};

const syncImages = module.exports.syncImages = (user) => {
	if (!fs.existsSync(mediaDir))
			fs.mkdirSync(mediaDir);

	getAllDriveImages(user)
	.then(driveImages => {
		if (driveImages.length === 0)
			return;

		const localDelete = [];
		for (let i = localImages.length - 1; i >= 0; i--) {
			let matched = false;
			for (let j = driveImages.length - 1; j >= 0; j--) {
				if (localImages[i] === driveImages[j].name) {
					driveImages.splice(j, 1);
					matched = true;
				}
			}
			if (!matched) {
				localDelete.push(localImages[i]);
			}
		}

		deleteImageBatch(localDelete);
		
		downloadImageBatch(driveImages);
	})
	.catch(err => { console.log(err); });
};

const getAllDriveImages = (user) => {
	return tryGetAllDriveImages(user)
	.catch(err => {
		return getAllDriveImages(user);
	});
};

const tryGetAllDriveImages = (user) => {
	return new Promise((resolve, reject) => {
		oauth2Client.credentials.access_token = user.accessToken;
		oauth2Client.credentials.refresh_token = user.refreshToken;
		driveOptions.auth = oauth2Client;
		service.files.list(driveOptions , (err, response) => {
			if (err) {
				return refreshTokens(user, oauth2Client)
				.then(() => {
					console.log('refreshed tokens');
					reject(err);
				});
			}
			if (!response || !response.files || response.files[0].name === lastModified)
				return resolve([]);

			let files = response.files;
			let images = [];

			if (files.length > 0) {
				for (let i = 0; i < files.length; i++) {
					let file = files[i];
					if (mimeTypes.image.indexOf(file.mimeType) > -1)
						images.push(file);
				}
			}
			console.log('resolved');
			return resolve(images);
		});
	});
};

const getNextLocalImage = module.exports.getNextLocalImage = () => {
	const imagesLength = localImages.length;
	if (imagesLength == 0)
		return '';

	imageIndex++;
	if (imageIndex >= imagesLength) {
		shuffle(localImages);
		imageIndex = 0;
	}
	return localImages[imageIndex];
};

const restoreImageArray = () => {
	return new Promise((resolve, reject) => {
		if (!fs.existsSync(mediaDir))
			fs.mkdirSync(mediaDir);

		fs.readdir(mediaDir, (err, files) => {
			if (err) reject(err);
			resolve(files);
		});
	})
	.then(images => {
		localImages = images;
	});
};

const downloadImageBatch = (files) => {
	Promise.resolve()
	.then(() => {
		let downloads = [];
		for (let i = 0; i < files.length; i++) {
			downloads.push(downloadImage(files[i], false));
		}
		return downloads;
	});
};

const downloadImage = (file, update = true) => {
	return new Promise((resolve, reject) => {
		if (!fs.existsSync(mediaDir))
			fs.mkdirSync(mediaDir);

		if (fs.existsSync(mediaDir + file.name))
			return resolve();

		let temp = service.files.get({
			auth: oauth2Client,
			fileId: file.id,
			alt: 'media'
		})
		.on('end', function() {
			return resolve(file);
		})
		.on('error', function(err) {
			return reject(err);
		});

		gm(temp, file.name)
		.rotate('white', 90 * file.imageMediaMetadata.rotation)
		.write(mediaDir + file.name, (err) => {
			if (err) console.log('photo write error: ' + err);
		});
	})
	.then(file => {
		localImages.push(file.name);
		lastModified = file.name;
	});
};

const deleteImageBatch = (names) => {
	for (let i = names.length - 1; i >= 0; i--) {
		deleteImage(names[i], false);
	}
};

const deleteImageByIndex = (index, update = true) => {
	if (index < 0 || index >= localImages.length)
		return;

	fs.unlinkSync(mediaDir + localImages[index].name);
	removeByIndex(localImages, index);
};

const deleteImage = (name, update = true) => {
	let index = indexOf(localImages, name);
	if (index === -1)
		return;

	fs.unlinkSync(mediaDir + name);
	removeByIndex(localImages, index);
};

// Durstenfeld shuffle
const shuffle = (array) => {
	let j, temp;
	for (let i = array.length - 1; i > 0; i--) {
		j = Math.floor(Math.random() * (i + 1));
		temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
};

const removeByName = (array, imageName) => {
	for (let i = array.length - 1; i >= 0; i--) {
		if (array[i].name === imageName)
			array.splice(i, 1);
	}
};

const removeByIndex = (array, index) => {
	array.splice(index, 1);
}

const indexOf = (array, imageName) => {
	for (let i = array.length - 1; i >= 0; i--) {
		if (array[i].name === imageName)
			return i;
	}
	return -1;
};

const secret = getSecret();
let oauth2Client = new auth.OAuth2(
	secret.web.client_id,
	secret.web.client_secret,
	secret.web.redirect_uris[0]
);

let lastModified = '';
let localImages = [];
let imageIndex = 0;
restoreImageArray();