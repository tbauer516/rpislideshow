const fs = require('fs');

class SessionStore {
	constructor() {
		this.storePath = './app/store/session.json';
	}

	checkFile() {
		let exist = fs.exists(this.storePath);
		if (exist)
			return exist;
		throw new Exception('File does not exist');
	}

	read () {
		if (checkFile()) {
			let store = fs.readFileSync(this.storePath);
			store = JSON.parse(store);
			return store;
		}
	}

	write (store) {
		if (checkFile()) {
			fs.writeFileSync(this.storePath, store);
		}
	}

	destroy (sid, callback) {
		let store = this.read();
		if (store[sid] !== undefined) {
			delete store[sid];
		}
		this.write(store);
		callback(null);
	}

	get (sid, callback) {
		let store = this.read();
		if (store[sid] !== undefined)
			callback(null, store[sid]);
		callback(null, null);
	}

	set (sid, session, callback) {
		let store = this.read();
		store[sid] = session;
		callback(null);
	}
}
module.exports = SessionStore;