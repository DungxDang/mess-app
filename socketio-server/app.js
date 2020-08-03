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

	socket.on('joinRoom', (room, userId, userName) =>{
		socket.join(room);
		socket.to(room).emit('joinRoom', userId, userName);
	});

	socket.on('leaveRoom',(roomId) => {
		socket.leave('roomId');
	});

	socket.on('message', (mess, roomId, userName) => {
		MongoClient.connect(mongoUrl, (err, db) => {
			if(err) throw err;
			var dbo = db.db('mess-app');
			var newMess = {userName:userName, message:mess};
			dbo.collection(roomId).insertOne(newMess, (err, res) =>{
				if(err) throw err;
				io.to(roomId).emit('message', res._id, userName, mess);
				console.log('a message added: '+res);//check this res
				db.close();
			});
		});
	});

	socket.on('disconnect', () =>{
		console.log('user disconnect: '+ socket.id);
	});
});

http.listen('3002', () => {
	console.log('socket.io listening on 3002');
});