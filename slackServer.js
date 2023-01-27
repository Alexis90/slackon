const express = require('express');
const app = express();
const socketio = require('socket.io');

let namespaces = require('./data/namespaces');

/////////////////////////////////////////////
app.use(express.static(__dirname + '/public'));

const expressServer = app.listen(5000, () => {
	console.log('Express server is on port 5000');
});

const io = socketio(expressServer);

io.on('connection', (socket) => {
	// build an array to send back with the img and endpoint for each ns
	let nsData = namespaces.map((ns) => {
		return {
			img: ns.img,
			endpoint: ns.endpoint,
		};
	});
	// send nsData back to client
	socket.emit('nsList', nsData);
});

// loop thru namespaces
namespaces.forEach((ns) => {
	io.of(ns.endpoint).on('connection', (nsSocket) => {
		console.log(ns.nsTitle, nsSocket.id);

		nsSocket.emit('nsRoomLoad', ns.rooms);

		nsSocket.on('joinRoom', async (roomToJoin) => {
			const roomToLeave = [...nsSocket.rooms][1];
			if (roomToLeave) nsSocket.leave(roomToLeave);

			updateNUsers(ns, roomToLeave);

			nsSocket.join(roomToJoin);
			updateNUsers(ns, roomToJoin);

			// deal with history
			const curRoom = ns.rooms.find((room) => room.roomTitle === roomToJoin);

			io.of(ns.endpoint).to(roomToJoin).emit('loadHistory', curRoom.history);
		});

		nsSocket.on('msgFromClient', async (data) => {

			console.log(data)

			const roomTitle = [...nsSocket.rooms][1];


			const curRoom = ns.rooms.find((room) => room.roomTitle === roomTitle);


			const msgInfo = {
				text: data.msg,
				time: Date.now(),
				username: 'rbunch',
				avatar: 'https://via.placeholder.com/30.png',
			};

			curRoom.addMessage(msgInfo);

			io.of(ns.endpoint).to(roomTitle).emit('msgToClients', msgInfo);
		});

	});
});

async function updateNUsers(ns, room) {
	// number of users in this room
	const allSockets = Array.from(await io.of(ns.endpoint).in(room).allSockets());
	io.of(ns.endpoint).in(room).emit('updateMemebrs', allSockets.length);
}
