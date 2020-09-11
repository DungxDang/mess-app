import React from 'react';
import SocketIoClient from 'socket.io-client';
import './App.css';
import ChatRoom from './chat-room';
import FriendList from './FriendList';
import Groups from './Groups';

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

	getChatFriend(){
		return this.state.chatFriend;
	}

	setRoom(friend, isRefresh){
		var roomId = '';
		if(friend.id>this.props.userId){
			roomId='room'+this.props.userId+''+friend.id;
		}else{
			roomId='room'+friend.id+''+this.props.userId;
		}
		if(isRefresh || this.state.roomId !== roomId){
			if(isRefresh || this.state.roomId){
				socket.emit('leaveRoom', this.state.roomId, this.props.userId);
			}

			if(this.state.chatFriend)
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

					socket.emit('joinRoom', roomId, this.props.userId);
				});
		}
	}

	setStateApp(state){
		this.setState(state);
	}

	render(){
		this.setRoom = this.setRoom.bind(this);
		this.getChatFriend = this.getChatFriend.bind(this);
		this.setStateApp = this.setStateApp.bind(this);

  		var friendListIds = this.props.friends.map((friend) => friend.id);
  		var groupIds = this.props.groups.map((group) => group.id);

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
				<div style={{borderBottom: '2px solid #496D9C', paddingLeft:'8px'}}>
					<h2>{this.props.userName}</h2>
				</div>
				
				<div style={{width:"100%",  display: 'table'}}>
					<div style={this.state.chatFriend? {width:"30%", display: 'table-cell',
														borderRight: '2px solid #496D9C'} 
														: 
														{width:"30%", display: 'table-cell'}}>
					
				    	<FriendList setRoom={this.setRoom}
									userId={this.props.userId}
									friends={this.props.friends}
									friendListIds={friendListIds}
									getChatFriend={this.getChatFriend}
									setSatesetStateApp={this.setStateApp}
									refresh={this.props.refresh}
									socket={socket}
						/>

				    	<Groups 	setRoom={this.setRoom}
									userId={this.props.userId}
									groups={this.props.groups}
									groupIds={groupIds}
									getChatFriend={this.getChatFriend}
									setStateApp={this.setStateApp}
									refresh={this.props.refresh}
									socket={socket}
						/>

					</div>

					<div style={{width:"70%", display: 'table-cell'}}>
						{chatRoom}
					</div>
				</div>
				
			</div>
  		);
	};
  
}

export default App;
