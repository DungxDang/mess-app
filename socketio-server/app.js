const http = require('http').createServer();
const io = require('socket.io')(http);

var MongoClient = require('../mongodb').MongoClient;
var mongoUrl = 'mongodb://localhost:27017/';

io.on('connection', (socket) => {
	console.log('a user connected:'+socket.id);

	socket.on('online', (userId, friendListIds) =>{
		socket.join(userId+"");
		friendListIds.map((friendId) =>{
			socket.to(friendId+'').emit('I\'m online', userId);
		});
	});

	socket.on('I\'m online', (userId, friendId) =>{
		socket.to(friendId+'').emit('friend online', userId);
	});

	socket.on('joinRoom', (roomId, userId) =>{
		socket.join(roomId);
		socket.to(roomId).emit('joinRoom', userId);
	});

	socket.on('leaveRoom',(roomId, userId) => {
		socket.to(roomId).emit('leaveChat', userId);
		socket.leave(roomId);
	});

	socket.on('message', (mess, roomId, messId, userName) => {
		io.to(roomId).emit('message', messId, userName, mess);
	});


	socket.on('online-notRead', (userId) => {
		socket.to(roomId).emit('online-notRead', userId);
	});

	socket.on('offline', (userId, friendListIds) =>{
		friendListIds.map((friendId) =>{
			socket.to(friendId+'').emit('offline', userId);
		});
	});

	socket.on('disconnect', () =>{
		console.log('user disconnect: '+ socket.id);
	});
});

http.listen('3002', () => {
	console.log('socket.io listening on 3002');
});