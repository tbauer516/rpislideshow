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

let getSecret = () => {
	let secret = fs.readFileSync('./app/config/client-secret.json', 'utf8');
	return JSON.parse(secret);
};

const secret = getSecret();
let oauth2Client = new auth.OAuth2(
	secret.web.client_id,
	secret.web.client_secret,
	secret.web.redirect_uris[0]
);

let lastModified = '';

let driveOptions = {
	pageSize: 1000,
	fields: "files(id, kind, mimeType, name, parents, webContentLink), kind",
	corpora: 'user',
	spaces: 'drive',
	orderBy: 'modifiedTime desc'
};

module.exports.syncImages = (user) => {
	if (!fs.existsSync(mediaDir))
			fs.mkdirSync(mediaDir);

	Promise.all([getAllDriveImages(user), getAllLocalImages()])
	.then(([driveImages, localImages]) => {
		if (driveImages.length === 0)
			return;

		for (let i = localImages.length - 1; i >= 0; i--) {
			let matched = true;
			for (let j = driveImages.length - 1; j >= 0; j--) {
				if (localImages[i] === driveImages[j].name) {
					driveImages.splice(j, 1);
					matched = false;
				}
			}
			if (!matched) {
				localImages.splice(i, 1);
			}
		}
		for (let i = 0; i < localImages.length; i++) {
			deleteImage(localImages[i]);
		}
		for (let j = 0; j < driveImages.length; j++) {
			downloadImage(driveImages[j]);
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

const getAllLocalImages = () => {
	return new Promise((resolve, reject) => {
		fs.readdir(mediaDir, (err, files) => {
			if (err) reject(err);
			resolve(files);
		});
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