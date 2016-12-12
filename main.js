const {app, BrowserWindow, ipcMain, globalShortcut} = require('electron');
const path = require('path');
const url = require('url');

let win;

let createWindow = function() {
	win = new BrowserWindow({width: 1000, height: 500, frame: true}); //frame: false for production

	win.loadURL(url.format({
		pathname: path.join(__dirname, 'app/index.html'),
		protocol: 'file:',
		slashes: true
	}));

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