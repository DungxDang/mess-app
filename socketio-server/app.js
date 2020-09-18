const http = require('http').createServer();
const io = require('socket.io')(http);

/*io.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Headers', 'Content-Type,X-Requested-With');
    next();
});*/

io.on('connection', (socket) => {
	console.log('a user connected:'+socket.id);

	socket.on('identity', (identity) =>{
		console.log('identity', identity);
		socket.identity = identity;
	});

	socket.on('groups-identity', (identity) =>{
		console.log('groups-identity', identity);
		socket.groupsIdentity = identity;
	});

	socket.on('online', (userId, friendListIds) =>{
		socket.join(userId+"");
		console.log('joinprivroom',userId);
		friendListIds.forEach((friendId) =>{
			socket.to(friendId+'').emit('I\'m online', userId);
		});
	});

	socket.on('m-online', (userId, groups) =>{
		//socket.join(userId+"");
		//console.log('joinprivroom',userId);
		groups.forEach((group) =>{
			group.memberIds.forEach(id =>{
				socket.to(id+'').emit('I\'m online-g', group._id, userId);
			});
		});
	});

	socket.on('I\'m online too', (userId, friendId) =>{
		console.log('connectonline', userId, friendId);
		socket.to(friendId+'').emit('friend online too', userId);
	});

	socket.on('I\'m online-g too', (groupId, memberId, userId) =>{
		console.log('gconnectonline', groupId, memberId, userId);
		socket.to(memberId+'').emit('member online-g too', groupId, userId);
	});

	socket.on('joinRoom', (roomId, userId) =>{
		console.log('joinroom',roomId, userId);
		socket.join(roomId);
		socket.to(roomId).emit('joinRoom', userId, roomId);
	});

	socket.on('iJoinedRoomToo', (userId, roomId) =>{
		console.log('iJoinedRoomToo',roomId, userId);
		socket.to(roomId).emit('iJoinedRoomToo', userId);
	});

	socket.on('joinRoom-g', (roomId, groupId, userId) =>{
		console.log('joinroom-g',roomId, userId);
		socket.join(roomId);
		socket.to(roomId).emit('joinRoom-g', userId, groupId);
	});

	socket.on('iJoinedRoomToo-g', (userId, memberId, groupId) =>{
		console.log('iJoinedRoomToo-g',groupId, userId);
		socket.to(memberId+"").emit('iJoinedRoomToo-g', groupId, userId);
	});

	socket.on('leaveRoom',(roomId, userId) => {
		socket.to(roomId).emit('leaveChat', userId);
		socket.leave(roomId);
	});

	socket.on('leaveRoom-g',(roomId, groupId, userId) => {
		socket.to(roomId).emit('leaveChat-g', groupId, userId);
		socket.leave(roomId);
	});

	socket.on('message', (mess, roomId, messId, userName) => {
		console.log(mess,roomId, messId, userName);
		io.to(roomId).emit('message', messId, userName, mess);
	});

	socket.on('gmessage', (mess, roomId, messId, memberName, memberId) => {
		console.log(mess,roomId, messId, memberName);
		io.to(roomId).emit('gmessage', messId, memberId, memberName, mess);
	});



	socket.on('online-notRead', (userId, friendId) => {
		socket.to(friendId+'').emit('online-notRead', userId);
	});

	socket.on('gonline-notRead', (groupId, memberId) => {
		socket.to(memberId+'').emit('gonline-notRead', groupId);
	});

	socket.on('online-seen', (userId, friendId) => {
		socket.to(friendId+"").emit('online-seen', userId);
	});

	socket.on('online-seen-g', (userName, groupId, memberId ) => {
		socket.to(memberId+"").emit('online-seen-g', groupId, userName);
	});


	socket.on('disconnecting', (reason) =>{
		if(reason){}///

        if(socket.identity){
            console.log('offline', socket.identity.userId);
			socket.identity.friendListIds.forEach((friendId) =>{
				socket.to(friendId+'').emit('offline', socket.identity.userId);
			});
		}else{
			console.log('identity undefined');
		}

        if(socket.groupsIdentity){
            console.log('group-offline', socket.identity.groups);
			socket.groupsIdentity.groups.forEach((group) =>{
				group.memberIds.forEach(memberId =>{
					socket.to(memberId+'').emit('group-offline', group._id, socket.identity.userId);
				});
			});
		}else{
			console.log('groups-identity undefined');
		}
	});

	socket.on('disconnect', (reason) =>{
		console.log('user disconnect: '+ socket.id);
	});
});

http.listen('3002', () => {
	console.log('socket.io listening on 3002');
});