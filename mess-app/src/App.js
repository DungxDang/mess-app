import React from 'react';
import SocketIoClient from 'socket.io-client';
import './App.css';
import ChatRoom from './chat-room';
import FriendList from './FriendList';

const socket = SocketIoClient('http://127.0.0.1:3002');

class App extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			roomID:null,
			chatFriend:null,
			messages:[],
		};

	}

	componentDidMount(){
		
	}

	setRoom(friend){
		var roomId = '';
		if(friend.id>this.props.userId){
			roomId='room'+this.props.userId+''+friend.id;
		}else{
			roomId='room'+friend.id+''+this.props.userId;
		}
		if(this.state.roomId !== roomId){
			if(this.state.roomId){
				socket.emit('leaveRoom', this.state.roomId, this.props.userId);
			}

			if(this.setState.chatFriend)
				this.state.chatFriend.setSeen_chatting = null;

			fetch('http://localhost:3001/messages',
			{
	            "method": 'POST',
	            //"mode": 'no-cors', 
	            "headers": {
	              'Content-Type':'application/json',
	            },
	            "body": JSON.stringify({collection:roomId})
	        })
				.then(data => data.json())
				.then(data =>{
					console.log('first load messages', data);
					this.setState({
						roomId : roomId,
						chatFriend : friend,
						messages : data,
					});
				});
			socket.emit('joinRoom', roomId, this.props.userId);
		}
	}

	render(){
		this.setRoom = this.setRoom.bind(this);

  		var friendListIds = this.props.friends.map((friend) => friend.id);

		var chatRoom = null;
		if(this.state.chatFriend)
			chatRoom = (
			     	<ChatRoom roomId={this.state.roomId}
			     			  chatFriend={this.state.chatFriend}
			     			  messages={this.state.messages}
			     			  userName={this.props.userName}
			     			  userId={this.props.userId}
							  socket={socket}
			     	/>
				);

		return (
			<div>
				<div><h2>{this.props.userName}</h2></div>
				
				<div style={{width:"100%"}}>
					<div style={{width:"30%"}}>
					
				    	<FriendList setRoom={this.setRoom}
									userId={this.props.userId}
									friends={this.props.friends}
									friendListIds={friendListIds}
									socket={socket}
						/>
					</div>
					<div style={{width:"70%"}}>
						{chatRoom}
					</div>
				</div>
				
			</div>
  		);
	};
  
}

export default App;
