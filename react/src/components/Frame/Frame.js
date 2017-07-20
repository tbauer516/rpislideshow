import React, { Component } from 'react';
import './Frame.css';
import * as photos from '../../logic/photos.js';

class Frame extends Component {
constructor(props) {
	super(props);
	this.state = {
		img: ''
	};
	this.lastSync = 0;
}

componentDidMount() {
	this.update();
	this.updateID = setInterval(
		() => { this.update() },
		300000 // 5 mins
	);
}

componentWillUnmount() {
	clearInterval(this.updateID);
}

update() {
	let time = new Date().getTime();
	let prom = Promise.resolve();
	if (time - this.lastSync > 86400000) { // 24 hours
		prom = photos.syncDrive();
		this.lastSync = time;
	}

	prom
	.then(photos.getNewPhoto)
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