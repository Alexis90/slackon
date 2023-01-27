export default function JoinRoom(nsSocket, roomName) {
	//send roomName to server
	nsSocket.emit('joinRoom', roomName);

	nsSocket.on('updateMemebrs', (data) => {
		document.querySelector(
			'.curr-room-num-users'
		).innerHTML = `${data} <span class="glyphicon glyphicon-user"></span>`;

		document.querySelector('.curr-room-text').innerText = roomName;
	});

	// load history
	nsSocket.on('loadHistory', (data) => {
		if (data.length === 0) return;
		const messageUI = document.querySelector('#messages');
		messageUI.innerHTML = '';
		data.forEach((history) => {
			const formattedTime = new Date(history.time).toLocaleString();
			messageUI.innerHTML += `
            <li>
							<div class="user-image">
								<img src=${history.avatar} />
							</div>
							<div class="user-message">
								<div class="user-name-time">${history.username} <span>${formattedTime}</span></div>
								<div class="message-text">${history.text}</div>
							</div>
						</li>`;
			messageUI.scrollTo(0, messageUI.scrollHeight);
		});
	});

	// send message
	const submitHandler = (e) => {
		e.preventDefault();
		const msg = document.querySelector('#user-message');
		nsSocket.emit('msgFromClient', { msg: msg.value, roomName });
		msg.value = '';
	};

	document
		.querySelector('#user-input')
		.addEventListener('submit', submitHandler);
}
