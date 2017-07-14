import React, { Component } from 'react';
import './Frame.css';
import * as photos from '../../logic/photos.js';

class Frame extends Component {
constructor(props) {
	super(props);
	this.state = {
		img: {
			name: ""
		}
	};
}

componentDidMount() {
	this.update();
	this.timerID = setInterval(
		() => { this.update() },
		86400000 // 24 hours
	);
}

componentWillUnmount() {
	clearInterval(this.timerID);
}

update() {
	photos.getNewPhoto()
	.then(data => {
		this.setState({
			img: data
		});
	});
}

render() {
return (
	<div className="Frame" style={{backgroundImage: "url(" + this.state.img.name + ")"}}></div>
);
}
}

export default Frame;