const http = require('http').createServer();
const io = require('socket.io')(http);

/*io.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Headers', 'Content-Type,X-Requested-With');
    next();
});*/

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
		console.log(roomId, userId);
		socket.join(roomId);
		socket.to(roomId).emit('joinRoom', userId);
	});

	socket.on('leaveRoom',(roomId, userId) => {
		socket.to(roomId).emit('leaveChat', userId);
		socket.leave(roomId);
	});

	socket.on('message', (mess, roomId, messId, userName) => {
		console.log(mess,roomId, messId, userName);
		io.to(roomId).emit('message', messId, userName, mess);
	});


	socket.on('online-notRead', (userId, friendId) => {
		socket.to(friendId+'').emit('online-notRead', userId);
	});

	socket.on('online-seen', (userId, friendId) => {
		socket.to(friendId+"").emit('online-seen', userId);
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