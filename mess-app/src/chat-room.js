import React, {useState, useEffect} from 'react';
import SocketIoClient from 'socket.io-client';



function newMess(props){
	const [text, setText] = useState('');

	function handleSubmit(event) {
		props.socket.emit('message', text, props.roomId, props.userName);
		setText('');
		//event.target.value = '';
		event.cancelDefault();
	}

	function handleChange(event) {
		setText(event.target.value);//is the screen rerender twice!
	}

	return(
		<form onSubmit={handleSubmit}>
			<input type='text' value={text} onChange={handleChange} />
			<input type='submit' value='send' />
		</form>
	);
}

function Room(props){

	const [messageList, setMessageList] = useState();

	function listing(messages) {
		return messages.map((e) =>{
			return(
				<dl key={e._id}>
					<dt>e.userName</dt> 
					<dd>e.message</dd>
				</dl>
			);
		});
	}

	useEffect(() => {

		if(props.roomId){
			fetch('http://localhost:3001/messages',{collection:props.roomId})//check
				.then(data => data.json())
				.then(data =>{
					console.log(data);
					setMessageList(listing(data));
				});

			props.socket.on('joinRoom', (otherUserId, userName) =>{
				let element = (<dl key={otherUserId}><dd>{userName+' has joined'}</dd></dl>);
				setMessageList([...messageList, element]);
			});

			props.socket.on('message', (_id, userName, mess) =>{
				setMessageList([...messageList, (<dl key={_id}><dt>{userName}</dt> <dd>{mess}</dd></dl>)]);
			});
		}	
	},[]);
	

	return(
		<div>{messageList}</div>
	);
}

function ChatRoom(props) {

	return (
	    <div style={{width:"70%"}}>
	    	<div><h4>{props.roomName}</h4></div>
	    	<Room roomId={props.roomId}
	    		  socket={socket}
	    	/>
	    	<newMess socket={socket}
	    			 roomId={props.roomId}
	    	/>
	    </div>
	);
}

export default ChatRoom;
