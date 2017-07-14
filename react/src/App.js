import React, { Component } from 'react';
import './App.css';
import WHead from './components/WHead/WHead.js';
import WBody from './components/WBody/WBody.js';
import Frame from './components/Frame/Frame.js';

class App extends Component {

render() {
	return (
		<div className="App">
			<div className="picture">
				<Frame />
			</div>
			<div className="weather">
				<WHead />
				<WBody />
			</div>
		</div>
	);
}

}

export default App;