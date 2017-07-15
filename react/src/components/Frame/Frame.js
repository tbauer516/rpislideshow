import React, { Component } from 'react';
import './Frame.css';
import * as photos from '../../logic/photos.js';

class Frame extends Component {
constructor(props) {
	super(props);
	this.state = {
		img: ''
	};
}

componentDidMount() {
	this.update();
	this.sync();
	this.syncID = setInterval(
		() => { this.sync() },
		86400000 // 24 hours
	);
	this.updateID = setInterval(
		() => { this.update() },
		300000 // 5 mins
	);
}

componentWillUnmount() {
	clearInterval(this.syncID);
	clearInterval(this.updateID);
}

sync() {
	photos.syncDrive();
}

update() {
	photos.getNewPhoto()
	.then(data => {
		console.log(data);
		this.setState({
			img: data
		});
	});
}

render() {
return (
	<div className="Frame" style={{backgroundImage: "url(" + this.state.img + ")"}}></div>
);
}
}

export default Frame;