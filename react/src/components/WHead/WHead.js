import React, { Component } from 'react';
import './WHead.css';
import Icon from '../Icon/Icon.js';
import Clock from '../Clock/Clock.js';
import * as weather from '../../logic/weather.js';

class WHead extends Component {
constructor(props) {
	super(props);
	this.state = {
		icon: 'default',
		rain: 0,
		temp: 0,
		wind: 0
	}
}

componentDidMount() {
	this.update();
	this.timerID = setInterval(
		() => this.update(),
		300000 // 5 mins
	);
}

componentWillUnmount() {
	clearInterval(this.timerID);
}

update() {
	weather.getCurrentWeather()
	.then((data) => {
		this.setState(data);
	});
}

render() {
return (
	<div className="WHead">
		<div className="time">
			<Clock />
		</div>
		<div className="icon">
			<Icon name={this.state.icon} />
		</div>
		<div>
			<div className="temp">
				{this.state.temp}&deg; F
			</div>
			<div className="rain">
				{this.state.rain}%
			</div>
			<div className="wind">
				{this.state.wind} MPH
			</div>
		</div>
		<hr />
	</div>
);
}
}

export default WHead;