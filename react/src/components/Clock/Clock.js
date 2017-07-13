import React, { Component } from 'react';

class Clock extends Component {
constructor(props) {
	super(props);
    this.state = {
        time: new Date()
    };
}

componentDidMount() {
	this.timerID = setInterval(
		() => this.tick(),
		1000
	);
}

componentWillUnmount() {
	clearInterval(this.timerID);
}

formatTime(time) {
	let mins = time.getMinutes();
    if (mins < 10)
        mins = '0' + mins;
	let hrs = time.getHours();
	let post = 'AM';
	if (hrs >= 12)
		post = 'PM';
	hrs = hrs  % 12;
	if (hrs === 0)
		hrs = 12;
    if (hrs < 10)
        hrs = '0' + hrs;
	
	return '' + hrs + ':' + mins + ' ' + post;
}

tick() {
	this.setState({time: new Date()});
}


render() {
    return (
        <div>
            {this.formatTime(this.state.time)}
        </div>
    );
}

}

export default Clock;