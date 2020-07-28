import React, {useState, useEffect} from 'react';
import SocketIoClient from 'socket.io-client';



function newMess(props){



	return();
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
		fetch('http://localhost:3001/messages',{collection:this.props.roomId})//check
			.then(data => data.json())
			.then(data =>{
				console.log(data);
				setMessages(listing(data));
			});

		const socket = SocketIoClient('http://127.0.0.1:3002');

		socket.on('joinRoom', (id, userName) =>{
			let element = (<dl key={id}><dd>{userName+' has joined'}</dd></dl>);
			setMessageList([...messageList, element]);
		});

		socket.on('message', (_id, userName, mess) =>{
			setMessageList([...messageList, (<dl key={_id}><dt>userName</dt> <dd>mess</dd></dl>)]);
		});
	},[]);
	

	return(
		<div>messageList</div>
	);
}

function ChatRoom(props) {




	return (
	    <div style={{width:"70%"}}>
	    	<div><h4>this.props.roomName</h4></div>
	    	<Room roomId={this,props.roomId}/>
	    	<newMess/>
	    </div>
	);
}

export default ChatRoom;
