const {app, BrowserWindow, ipcMain, globalShortcut} = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');

let keys = fs.readFileSync('app/js/googleApi.txt', 'utf8');
process.env.GOOGLE_API_KEY = keys.split('\n')[0];
process.env.GOOGLE_DEFAULT_CLIENT_ID = keys.split('\n')[1];
process.env.GOOGLE_DEFAULT_CLIENT_SECRET = keys.split('\n')[2];
// fs.readFileSync('app/js/googleApi.txt', 'utf8');

let win;

let createWindow = function() {
	win = new BrowserWindow({width: 1238, height: 1080, backgroundColor: '#000000', alwaysOnTop: false, frame: true}); //frame: false for production

	win.loadURL(url.format({
		pathname: path.join(__dirname, 'app/index.html'),
		protocol: 'file:',
		slashes: true
	}), {"extraHeaders" : "pragma: no-cache\n"});

	win.webContents.openDevTools();
	// win.setFullScreen(true);

	win.on('closed', () => {
		win = null
	});
		
}

app.on('ready', function() {
	globalShortcut.register('CommandOrControl+Q', () => {
		app.quit();
	});
	createWindow();
});

app.on('window-all-closed', () => {
	// For Mac OSX
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (win === null) {
		createWindow();
	}
});

// ipcMain.on('asynchronous-message', (event, arg) => {
// 	if (arg == 'quit') {
// 		app.quit();
// 	}
// });