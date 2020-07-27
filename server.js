const app = require('express')();
const http = require('http').createServer(app);

var MongoClient = require('mongodb').MongoClient;
var mongodbUrl = 'mongodb://localhost:27017/';

app.get('/user', function(req, res){
	MongoClient.connect(mongodbUrl, (err, db) => {
		if(err) throw err;
		var dbo = db.db('mess-app');
		dbo.collection('users').find({_id : req._id}, (err, data) => {
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