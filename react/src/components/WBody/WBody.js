import React, { Component } from 'react';
import './WBody.css';
import Icon from '../Icon/Icon.js';
import * as weather from '../../logic/weather.js';

class WBody extends Component {
constructor(props) {
	super(props);
	this.state = {
		days: []
	};
}

componentDidMount() {
	this.update();
	this.timerID = setInterval(
		() => { this.update() },
		21600000 // 6 hours
	);
}

componentWillUnmount() {
	clearInterval(this.timerID);
}

update() {
	weather.getForecast()
	.then((data) => {
		this.setState({
			days: data
		});
	});
}

render() {
return (
	<div className="WBody">
		{this.state.days.map((day, i) => {
			return (
				<div className="row">
					<div className="column">
						<div className="icon"><Icon name={day.icon} /></div>
						<div className="day">{day.day}</div>
					</div>
					<div className="column">
						<div>{day.max}&deg; F</div>
						<div>{day.wind} MPH</div>
						<div>{day.min}&deg; F</div>
						<div>{day.rain}%</div>
					</div>
					{this.state.days.length - 1 > i &&
						<hr />
					}
				</div>
			);
		})}
	</div>
);
}
}

export default WBody;