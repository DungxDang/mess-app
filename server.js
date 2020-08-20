const app = require('./mess-app/node_modules/express')();
const http = require('http').createServer(app);

var MongoClient = require('mongodb').MongoClient;
var mongodbUrl = 'mongodb://localhost:27017/';

app.get('/login', function(req, res){
	console.log('dsdfsds');
	console.log(req);//this

	console.log('dsdfsdsdddddddddddd\n');
	MongoClient.connect(mongodbUrl, {useNewUrlParser: true, useUnifiedTopology: true}, (err, db) => {
		if(err) throw err;
		var dbo = db.db('mess-app');
		dbo.collection('users').find({}, (err, data) => {//this
			//if(err) throw err;

				console.log('eeeeeeeeeeee'+data);
			if(err)
				console.log(err);
			else 
				console.log(data);
				//res.send(data);
			db.close();
		});
	});

});

app.get('/friendList', function(req, res){
	MongoClient.connect(mongodbUrl, (err, db) => {
		if(err) throw err;
		var dbo = db.db('mess-app');
		dbo.collection('users').find({id : {$in:req.friendListIds}}, {_id:0, friends:0}, (err, data) => {
			if(err) throw err;
			res.send(data);
			db.close();
		});//check
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

app.get('/message', (req, res) => {
	MongoClient.connect(mongoUrl, (err, db) => {
		if(err)
			res.send({messId:''});
		else{
			let dbo = db.db('mess-app');
			dbo.collection(req.collection).insertOne(req.newMess, (err, mRes) =>{
				if(err)
					res.send({messId:''});
				else
					res.send({messId:mRes._id});
				console.log('a message added: '+mRes);//check this res
			});
		}
		db.close();	
	});
});

app.get('/incNotRead', (req, res) => {
	MongoClient.connect(mongoUrl, (err, db) => {
		if(err)
			res.send({success:0});
		else{
			let dbo = db.db('mess-app');
			dbo.collection('users').updateOne(req.condition, req.update, (err, mRes) =>{
				if(err)
					res.send({success:0});
				else
					res.send({success:1});
				console.log('updatenotread: '+mRes);//check this res
			});
		}
		db.close();	
	});
});



app.get('/seen', (req, res) => {
	MongoClient.connect(mongodbUrl, (err, db) => {
		if(err) throw err;
		var dbo = db.db('mess-app');
		let condition = {id:req.friendId, 'friends.id':req.userId};
		let update = {'$set':{'friends.$.seen':1}};
		dbo.collection('users').updateOne(condition, update, (err, res) =>{
			if(err) throw err;
		});

		condition = {id:req.userId, 'friends.id':req.friendId};
		update = {'$set':{'friends.$.notRead':0}};//test
		dbo.collection('users').updateOne(condition, update, (err, res) =>{
			if(err) throw err;
		});

		db.close();

	});
});
app.get('/removeSeen', (req, res) => {
	MongoClient.connect(mongodbUrl, (err, db) => {
		if(err) throw err;
		var dbo = db.db('mess-app');
		let condition = {id:req.userId, 'friends.id':req.friendId};
		let update = {'$set':{'friends.$.seen':0}};
		dbo.collection('users').updateOne(condition, update, (err, res) =>{
			if(err) throw err;
			db.close();
		});

	});
});

http.listen('3001', () => {
	console.log('Listening on 3001');
});
/*db.users.insertMany([
{ id:1, userName:'user1', password:'1234', friends: [ {id:2,notRead:0,seen:0}, {id:3,notRead:0,seen:0}, {id:4,notRead:0,seen:0}, {id:5,notRead:0,seen:0}, {id:6,notRead:0,seen:0} ] },
{ id:2, userName:'user2', password:'1234', friends: [ {id:1,notRead:0,seen:0}, {id:3,notRead:0,seen:0}, {id:4,notRead:0,seen:0}, {id:5,notRead:0,seen:0}, {id:6,notRead:0,seen:0} ] },
{ id:3, userName:'user3', password:'1234', friends: [ {id:2,notRead:0,seen:0}, {id:1,notRead:0,seen:0}, {id:4,notRead:0,seen:0}, {id:5,notRead:0,seen:0}, {id:6,notRead:0,seen:0} ] },
{ id:4, userName:'user4', password:'1234', friends: [ {id:2,notRead:0,seen:0}, {id:3,notRead:0,seen:0}, {id:1,notRead:0,seen:0}, {id:5,notRead:0,seen:0}, {id:6,notRead:0,seen:0} ] },
{ id:5, userName:'user5', password:'1234', friends: [ {id:2,notRead:0,seen:0}, {id:3,notRead:0,seen:0}, {id:4,notRead:0,seen:0}, {id:1,notRead:0,seen:0}, {id:6,notRead:0,seen:0} ] },
{ id:6, userName:'user6', password:'1234', friends: [ {id:2,notRead:0,seen:0}, {id:3,notRead:0,seen:0}, {id:4,notRead:0,seen:0}, {id:5,notRead:0,seen:0}, {id:1,notRead:0,seen:0} ] },
]);
db.users.updateOne(
   { id: 4, "friends.id": 2 },
   { $inc: { "friends.$.notRead" : 1 } }
)
db.users.updateOne(
   { id: 4, "friends.id": 2 },
   { $set: { "friends.$.notRead" : 0 } }
)
db.users.find({id:4})
*/