import React from 'react';
import './App.css';
import ChatRoom from './chat-room';
import FriendList from './FriendList';

class App() extends React.Component{
	constructor(props){
		super(props);
		this.state({
			roomID:null,
			chatFriend:null;
			socket:null
		});
	}

	componentDidMount(){
		this.setState({
			socket:SocketIoClient('http://127.0.0.1:3002');
		});
	}


	setRoom(friend){
    
		let roomId = '';
		if(friend.userId>this.props.userId){
			roomId=this.props.userId+''+friend.userId;
		}else{
			roomId=friend.userId+''+this.props.userId;
		}
		if(this.state.roomId !== roomId){
			if(this.state.roomId){
				this.state.socket.emit('leaveRoom', this.state.roomId, this.props.userId);
			}

			this.setState({
				roomId : roomId,
				chatFriend : friend,
			});

			this.state.socket.emit('joinRoom',this.state.roomId, this.props.userId);
		}
	}

	render(){



		return (
			<div><h2>{this.props.userName}</h2></div>
		    <div className="App">
		    	<FriendList setRoom={this.setRoom)}
							userId={this.props.userId}
							friendListIds={this.props.friends}
							socket={this.state.socket}
				/>
		     	<ChatRoom roomId={this.state.roomId}
		     			  chatFriend={this.state.chatFriend}
		     			  seen={this.state.seen}
		     			  userName={this.props.userName}
		     			  userId={this.props.userId}
						  socket={this.state.socket}
		     	/>
		      
		    </div>
  		);
	};
  
}

export default App;
