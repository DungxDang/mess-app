const http = require('http').createServer();
const io = require('socket.io')(http);

var MongoClient = require('../mongodb').MongoClient;
var mongoUrl = 'mongodb://localhost:27017/';

io.on('connection', (socket) => {
	console.log('a user connected:'+socket.id);

	socket.on('joinRoom', (room, id, userName) =>{
		socket.join(room);
		socket.to(room).emit('joinRoom', id, userName);
	});

	socket.on('message', (mess, collection, userName) => {
		MongoClient.connect(mongoUrl, (err, db) => {
			if(err) throw err;
			var dbo = db.db('mess-app');
			var newMess = {userName:userName, message:mess};
			dbo.collection(collection).insertOne(newMess, (err, res) =>{
				if(err) throw err;
				io.to(collection).emit('message', res._id, userName, mess);
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