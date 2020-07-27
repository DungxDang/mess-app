const app = require('express')();
const http = require('http').createServer(app);

var MongoClient = require('mongodb').MongoClient;
var mongodbUrl = 'mongodb://localhost:27017/';

app.get('/friendList', function(req, res){
	MongoClient.connect(mongodbUrl, (err, db) => {
		if(err) throw err;
		var dbo = db.db('mess-app');
		dbo.collection('users').find({id : req.id}, (err, data) => {
			if(err) throw err;
			res.send(data);
			da.close();
		});
	});

});

app.get('/messages', (req, res) => {
	MongoClient.connect(mongodbUrl, (err, db) => {
		if(err) throw err;
		var dbo = db.db('mess-app');
		dbo.collection(req.collection).find({},(err, data) => {
			if(err) throw err;
			res.send(data);
			db.close();
		});
	});
});

http.listen('3001', () => {
	console.log('Listening on 3001');
});
/*db.users.insertMany([
   { id:1, userName:'user1', password:'1234', friends: [ 2, 3, 4, 5, 6 ] },
   { id:2, userName:'user2', password:'1234', friends: [ 1, 3, 5, 4, 7 ] },
   { id:3, userName:'user3', password:'1234', friends: [ 1, 2, 5, 4, 7 ] },
   { id:4, userName:'user4', password:'1234', friends: [ 1, 3, 5, 6, 7 ] },
   { id:5, userName:'user5', password:'1234', friends: [ 1, 3, 4, 7 ] },
   { id:6, userName:'user6', password:'1234', friends: [ 1, 3, 5, 4, 7 ] },
   { id:7, userName:'user7', password:'1234', friends: [ 1, 3, 5, 4 ] },
]);

*/