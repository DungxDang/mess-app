import React, {useState, useEffect} from 'react';



function NewMess(props){
	const [text, setText] = useState('');

	function handleSubmit(event) {
		setText('');
		if(!props.chatFriend.chatting){
			let condition = {id:props.chatFriend.id, 'friends.id':props.userId};
			let update = {'$inc':{'friends.$.notRead':1}};//test
			fetch('http://localhost:3001/incNotRead',{condition:condition, update:update})
			.then(res => res.json())
				.then(res =>{
					//
				});
			if(props.chatFriend.isOnline)
				props.socket.emit('online-notRead', props.userId, props.chatFriend.id);
		}
		let newMess = {userName:props.userName, message:text};
		fetch('http://localhost:3001/saveMessage',{newMess:newMess, collection:props.roomId})
			.then(res => res.json())
				.then(res =>{
					if(!res.messId)
						if(props.chatFriend.chatting)
							props.socket.emit('message', text, props.roomId, res.messId, props.userName);
					else{
						//
					}
				});
        
		//event.target.value = '';
		event.preventlDefault();
	}

	function handleChange(event) {
		setText(event.target.value);//does the screen rerender twice!
	}

	return(
		<form onSubmit={handleSubmit}>
			<input type='text' value={text} onChange={handleChange} />
			<input type='submit' value='send' />
		</form>
	);
}

function Room(props){

	const [messages, setMessages] = useState();
	const [seen, setSeen] = useState(props.chatFriend.seen);

	function listing() {
		let list = messages.map((e) =>{
			return(
				<dl key={e._id}>
					<dt>e.userName</dt> 
					<dd>e.message</dd>
				</dl>
			);
		});
		return list;
	}

	function setSeen_chatting(id) {
		if(props.chatFriend.id===id)
			setSeen(1);
	}

	useEffect(() => {

		if(props.roomId){
			fetch('http://localhost:3001/messages',{collection:props.roomId})//check
				.then(data => data.json())
				.then(data =>{
					console.log(data);
					setMessages(data);
				});

			props.chatFriend.setSeen_chatting = setSeen_chatting;

			props.socket.on('message', (_id, userName, mess) =>{
				if(props.chatFriend.seen){
					fetch('http://localhost:3001/removeSeen', {friendId:props.chatFriend.id, userId:props.userId});
					setSeen(0);
					props.chatFriend.seen = 0;
				}
				let message = {_id:_id, userName:userName, message:mess}
				setMessages([...messages, message]);
			});
		}
	},[]);
	

	return(
		<div>
			<div>{listing()}</div>
			<div>{seen? 'seen' : ''}</div>
		</div>
	);
}

function ChatRoom(props) {
	return (
	    <div style={{width:"70%"}}>
	    	<div><h4>{props.chatFriend.userName}</h4></div>
	    	<Room roomId={props.roomId}
	    		  socket={props.socket}
	    		  chatFriend={props.chatFriend}
	    		  userId={props.userId}
	    	/>
	    	<NewMess socket={props.socket}
	    			 roomId={props.roomId}
	    			 userName={props.userName}
	    			 userId={props.userId}
	    			 chatFriend={props.chatFriend}
	    	/>
	    </div>
	);
}

export default ChatRoom;
