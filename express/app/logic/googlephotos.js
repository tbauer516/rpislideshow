const fs = require('fs');
const google = require('googleapis');
const googleAuth = require('google-auth-library');
const request = require('request');

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
				if (localImages[i].name === driveImages[j].name) {
					driveImages.splice(j, 1);
					matched = true;
				}
			}
			if (!matched) {
				localDelete.push(localImages[i].name);
			}
		}

		console.log(localDelete);
		deleteImageBatch(localDelete);
		
		downloadImageBatch(driveImages);
	})
	.catch(err => { console.log(err); });
};

const getAllDriveImages = (user) => {
	return new Promise((resolve, reject) => {
		oauth2Client.credentials.access_token = user.accessToken;
		driveOptions.auth = oauth2Client;
		service.files.list(driveOptions , (err, response) => {
			if (err) {
				return reject(err);
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
			return resolve(images);
		});
	});
};

const getNextLocalImage = module.exports.getNextLocalImage = () => {
	const imagesLength = localImages.length;
	if (imagesLength == 0)
		return { name: "", rot: 0 };

	imageIndex++;
	if (imageIndex >= imagesLength) {
		shuffle(localImages);
		imageIndex = 0;
	}
	return localImages[imageIndex];
};



// const getAllLocalImages = () => {
// 	return new Promise((resolve, reject) => {
// 		if (!fs.existsSync(mediaDir))
// 			fs.mkdirSync(mediaDir);

// 		fs.readdir(mediaDir, (err, files) => {
// 			if (err) reject(err);
// 			resolve(files);
// 		});
// 	})
// 	.then(images => {
// 		localImages = images;
// 	});
// };

const restoreImageArray = () => {
	if (!fs.existsSync(mediaDataDir))
		fs.mkdirSync(mediaDataDir);

	if (!fs.existsSync(mediaDataDir + mediaDataName))
		return;

	const images = fs.readFileSync(mediaDataDir + mediaDataName);
	localImages = JSON.parse(images);
};

const storeLocalImageData = () => {
	if (!fs.existsSync(mediaDataDir))
		fs.mkdirSync(mediaDataDir);

	fs.writeFileSync(mediaDataDir + mediaDataName, JSON.stringify(localImages));
};

const downloadImageBatch = (files) => {
	Promise.resolve()
	.then(() => {
		let downloads = [];
		for (let i = 0; i < files.length; i++) {
			downloads.push(downloadImage(files[i], false));
		}
		return downloads;
	})
	.then(downloads => {
		Promise.all(downloads)
		.then(() => {
			storeLocalImageData();
		});
	});
};

const downloadImage = (file, update = true) => {
	return new Promise((resolve, reject) => {
		if (!fs.existsSync(mediaDir))
			fs.mkdirSync(mediaDir);

		if (fs.existsSync(mediaDir + file.name))
			resolve();

		let dest = fs.createWriteStream(mediaDir + file.name);
		let temp = service.files.get({
			auth: oauth2Client,
			fileId: file.id,
			alt: 'media'
		})
		.on('end', function() {
			resolve(file);
		})
		.on('error', function(err) {
			reject(err);
		})
		.pipe(dest);
		// console.log(temp);
	})
	.then(file => {
		localImages.push({ name: file.name, rot: file.imageMediaMetadata.rotation });
		lastModified = file.name;

		if (update)
			storeLocalImageData();
	});
};

const deleteImageBatch = (names) => {
	for (let i = names.length - 1; i >= 0; i--) {
		deleteImage(names[i], false);
	}
	storeLocalImageData();
};

const deleteImageByIndex = (index, update = true) => {
	if (index < 0 || index >= localImages.length)
		return;

	fs.unlinkSync(mediaDir + localImages[index].name);
	removeByIndex(localImages, index);

	if (update)
		storeLocalImageData();
};

const deleteImage = (name, update = true) => {
	let index = indexOf(localImages, name);
	if (index === -1)
		return;

	fs.unlinkSync(mediaDir + name);
	removeByIndex(localImages, index);
	
	if (update)
		storeLocalImageData();
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