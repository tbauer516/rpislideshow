const fs = require('fs');
const google = require('googleapis');
const googleAuth = require('google-auth-library');
const request = require('request');

const service = google.drive('v3');
const auth = new googleAuth();

const mediaDir = './app/media/';
const mimeTypes = {
	folder: ['application/vnd.google-apps.folder'],
	image: ['image/jpeg']
};

const driveOptions = {
	pageSize: 1000,
	fields: "files(id, kind, mimeType, name, parents, webContentLink), kind",
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
			let matched = true;
			for (let j = driveImages.length - 1; j >= 0; j--) {
				if (localImages[i] === driveImages[j].name) {
					driveImages.splice(j, 1);
					matched = false;
				}
			}
			if (!matched) {
				localDelete.push(localImages[i]);
				localImages.splice(i, 1);
			}
		}
		for (let i = 0; i < localDelete.length; i++) {
			deleteImage(localDelete[i]);
		}
		for (let j = 0; j < driveImages.length; j++) {
			downloadImage(driveImages[j]);
			localImages.push(driveImages[j].name);
		}
	})
	.catch(err => { console.log(err); });
};

const getAllDriveImages = (user) => {
	return new Promise((resolve, reject) => {
		oauth2Client.credentials.access_token = user.accessToken;
		driveOptions.auth = oauth2Client;
		service.files.list(driveOptions , (err, response) => {
			if (err) {
				reject(err);
			}
			let files = response.files;
			let images = [];
			if (files[0] === lastModified)
				resolve(images);

			if (files.length > 0) {
				for (let i = 0; i < files.length; i++) {
					let file = files[i];
					if (mimeTypes.image.indexOf(file.mimeType) > -1)
						images.push(file);
				}
			}
			lastModified = images[0].name;
			resolve(images);
		});
	});
};

const getNextLocalImage = module.exports.getNextLocalImage = () => {
	const imagesLength = localImages.length;
	if (imagesLength == 0)
		return undefined;

	imageIndex++;
	if (imageIndex >= imagesLength) {
		shuffle(localImages);
		imageIndex = 0;
	}
	return mediaDir + localImages[imageIndex];
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
	return array;
}

const getAllLocalImages = () => {
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

const downloadImage = (file) => {
	return new Promise((resolve, reject) => {
		if (!fs.existsSync(mediaDir))
			fs.mkdirSync(mediaDir);

		if (fs.existsSync(mediaDir + file.name))
			resolve();

		let dest = fs.createWriteStream(mediaDir + file.name);
		service.files.get({
			auth: oauth2Client,
			fileId: file.id,
			alt: 'media'
		})
		.on('end', function() {
			resolve();
		})
		.on('error', function(err) {
			reject(err);
		})
		.pipe(dest);
	});
};

const deleteImage = (file) => {
	return new Promise((resolve, reject) => {
		if (!fs.existsSync(mediaDir) || !fs.existsSync(mediaDir + file))
			resolve();

		fs.unlink(mediaDir + file, (err) => {
			if (err) reject(err);
			resolve();
		});
	});
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
getAllLocalImages();