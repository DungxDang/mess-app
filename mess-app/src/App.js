import React from 'react';
import SocketIoClient from 'socket.io-client';
import './App.css';
import ChatRoom from './chat-room';
import FriendList from './FriendList';

class App extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			roomID:null,
			chatFriend:null,
			socket:null,
		};
	}

	componentDidMount(){
		this.setState({
				socket:SocketIoClient('http://127.0.0.1:3002')
			});
		
	}

	setRoom(friend){
    
		let roomId = '';
		if(friend.userId>this.props.userId){
			roomId='room'+this.props.userId+''+friend.userId;
		}else{
			roomId='room'+friend.userId+''+this.props.userId;
		}
		if(this.state.roomId !== roomId){
			if(this.state.roomId){
				this.state.socket.emit('leaveRoom', this.state.roomId, this.props.userId);
			}

			if(this.setState.chatFriend)
				this.state.chatFriend.setSeen_chatting = null;

			this.setState({
				roomId : roomId,
				chatFriend : friend,
			});

			this.state.socket.emit('joinRoom',this.state.roomId, this.props.userId);
		}
	}

	render(){
		this.setRoom = this.setRoom.bind(this);

		var chatRoom = null;
		if(this.state.chatFriend)
			chatRoom = (
			     	<ChatRoom roomId={this.state.roomId}
			     			  chatFriend={this.state.chatFriend}
			     			  userName={this.props.userName}
			     			  userId={this.props.userId}
							  socket={this.state.socket}
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
									socket={this.state.socket}
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
