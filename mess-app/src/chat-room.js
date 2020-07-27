import React, {useState, useEffect} from 'react';
import SocketIoClient from 'socket.io-client';



function newMess(props){



	return();
}

function Room(props){

	const [messages, setMessages] = useState();

	useEffect(() => {
		fetch('http://localhost:3001/messages')
			.then(data => data.json())
			.then(data =>{
				console.log(data);
				setMessages(data);
			});

		const socket = SocketIoClient('http://127.0.0.1:3002');
		socket.on('message', (mess,userName) =>{
			setMessages([...messages, {userName:userName, message:mess}]);
		});
	},[]);
	
	const messageList = messages.map();//here

	return(
		<div>messageList</div>
	);
}

function ChatRoom(props) {




	return (
	    <div style={{width:"70%"}}>
	    	<div><h4>this.props.roomName</h4></div>
	    	<Room messages={messages}/>
	    	<newMess/>
	    </div>
	);
}

export default ChatRoom;
