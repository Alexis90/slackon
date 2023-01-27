import JoinRoom from './joinRoom.js';

let nsSocket = '';

export default function joinNs(endpoint) {
	if (nsSocket) {
		nsSocket.disconnect();
		document
			.querySelector('#user-input')
			.removeEventListener('submit', submitHandler);
	}

	nsSocket = io(`http://localhost:5000${endpoint}`);

	nsSocket.on('nsRoomLoad', (nsRooms) => {
		const roomList = document.querySelector('.room-list');
		roomList.innerHTML = '';
		nsRooms.forEach((room) => {
			roomList.innerHTML += `<li class="room">
        <span class="glyphicon glyphicon-${
					room.privateRoom ? 'lock' : 'globe'
				}"></span>${room.roomTitle}</li>`;
		});
		Array.from(document.getElementsByClassName('room')).forEach((el) => {
			el.addEventListener('click', (e) => {
				const roomName = e.target.innerText;
				JoinRoom(nsSocket, roomName);
			});
		});

		// add user to the first room automatically
		const topRoom = document.querySelector('.room').innerText;
		JoinRoom(nsSocket, topRoom);

		// send message
		document
			.querySelector('#user-input')
			.addEventListener('submit', submitHandler);

		// receive message from server
		nsSocket.on('msgToClients', (data) => {
			const formattedTime = new Date(data.time).toLocaleString();
			document.querySelector('#messages').innerHTML += `
            <li>
							<div class="user-image">
								<img src=${data.avatar} />
							</div>
							<div class="user-message">
								<div class="user-name-time">${data.username} <span>${formattedTime}</span></div>
								<div class="message-text">${data.text}</div>
							</div>
						</li>`;
		});
	});
}

const submitHandler = (e) => {
	e.preventDefault();
	const msg = document.querySelector('#user-message');
	nsSocket.emit('msgFromClient', { msg: msg.value });
};
