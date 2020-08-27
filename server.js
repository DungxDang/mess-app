const app = require('./mess-app/node_modules/express')();
//const http = require('http').createServer(app);
const bodyParser = require('./mess-app/node_modules/body-parser');
//app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// create application/json parser
var jsonParser = bodyParser.json();

var MongoClient = require('mongodb').MongoClient;
var mongodbUrl = 'mongodb://localhost:27017/';

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Headers', 'Content-Type,X-Requested-With');
    next();
});

app.post('/login', jsonParser, function(req, res){
	MongoClient.connect(mongodbUrl, {useUnifiedTopology: true}, (err, db) => {
		if(err) console.log(err);
		else{

			db.db('mess-app').collection('users')
				.findOne({userName:req.body.userName},{_id:0})
				.then((data) => {
					console.log(data);
					res.json(data);
					db.close();
				})
				.catch((err =>{
					console.log(err);
				}));
				
		}
		
	});

});

app.post('/friendList', function(req, res){
	MongoClient.connect(mongodbUrl, {useUnifiedTopology: true}, (err, db) => {
		if(err) console.log(err);
		else{
			var dbo = db.db('mess-app');
			dbo.collection('users').find({id : {$in:req.body.friendListIds}}, {_id:0, friends:0})
				.toArray((err, data) => {
					if(err)
						console.log(err);
					else
						res.send(data);
					db.close();
				});
		}
	});

});

app.post('/messages', (req, res) => {
	MongoClient.connect(mongodbUrl, {useUnifiedTopology: true}, (err, db) => {
		if(err) throw err;
		var dbo = db.db('mess-app');
		dbo.collection(req.body.collection).find({})
			.toArray((err, data) => {
				if(err) throw err;
				res.send(data);
				db.close();
			});
	});
});

app.post('/saveMessage', (req, res) => {
	MongoClient.connect(mongodbUrl, {useUnifiedTopology: true}, (err, db) => {
		if(err)
			console.log(err);
		else{
			db.db('mess-app').collection(req.body.collection).insertOne(req.body.newMess)
			.then((mRes) =>{
				res.send(mRes.insertedId);
				db.close();
			})
			.catch((err)=>{
				res.send(0);
				console.log(err);
			});
		}	
	});
});

app.post('/incNotRead', (req, res) => {
	MongoClient.connect(mongodbUrl, {useUnifiedTopology: true}, (err, db) => {
		if(err)
			res.send({success:0});
		else{
			let dbo = db.db('mess-app');
			dbo.collection('users').updateOne(req.body.condition, req.body.update)
			.then((mRes) =>{
				res.send(mRes);
				db.close();	
			})
			.catch((err)=>{
				res.send(0);
				console.log(err);
			});
		}
	});
});



app.post('/seen', (req, res) => {
	MongoClient.connect(mongodbUrl, {useUnifiedTopology: true}, (err, db) => {
		if(err) throw err;
		var dbo = db.db('mess-app');

		let condition = {id:req.body.friendId, 'friends.id':req.body.userId};
		let update = {'$set':{'friends.$.seen':1}};
		dbo.collection('users').updateOne(condition, update)
			.then((mRes) =>{
				res.send(mRes);
				db.close();
			})
			.catch((err)=>{
				res.send(0);
				console.log(err);
			});

	});
});

app.post('/seen', (req, res) => {
	MongoClient.connect(mongodbUrl, {useUnifiedTopology: true}, (err, db) => {
		if(err) throw err;
		var dbo = db.db('mess-app');

		condition = {id:req.body.userId, 'friends.id':req.body.friendId};
		update = {'$set':{'friends.$.notRead':0}};
		dbo.collection('users').updateOne(condition, update)
			.then((mRes) =>{
				res.send(mRes);
				db.close();
			})
			.catch((err)=>{
				res.send(0);
				console.log(err);
			});

	});
});


app.post('/removeSeen', (req, res) => {
	MongoClient.connect(mongodbUrl, {useUnifiedTopology: true}, (err, db) => {
		if(err) throw err;
		var dbo = db.db('mess-app');
		let condition = {id:req.body.userId, 'friends.id':req.body.friendId};
		let update = {'$set':{'friends.$.seen':0}};
		dbo.collection('users').updateOne(condition, update)
			.then((mRes) =>{
				res.send(mRes);
				db.close();
			})
			.catch((err)=>{
				res.send(0);
				console.log(err);
			});

	});
});

//http.listen('3001', () => {
	app.listen('3001', () => {
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