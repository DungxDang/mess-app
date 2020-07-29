import React from 'react';
import './App.css';
import ChatRoom from './chat-room';
import FriendList from './FriendList';

class App() extends React.Component{
	constructor(props){
		super(props);
		this.state({
			roomID:null,
			roomName:null,
			socket:null
		});
	}

	componentDidMount(){
		this.setState({
			socket:SocketIoClient('http://127.0.0.1:3002')
		});
		//this.state.socket.emit('online', this.props.userID, this.props.friendListIds);//check if this array
	}


	setRoom(roomId, roomName){
		this.setState({
			roomName : roomName,
			roomId : roomId
		});
	}

	render(){



		return (
			<div><h2>this.props.userName</h2></div>
		    <div className="App">
		    	<FriendList setRoom={this.setRoom)}
							userID={this.props.userID}
							friendListIds={this.props.friendListIds}
							socket={this.state.socket}
				/>
		     	<ChatRoom roomName={'user2'}
		     			  roomId={'12'}
		     			  userName={this.props.userName}
						  socket={this.state.socket}
		     	/>
		      
		    </div>
  		);
	};
  
}

export default App;
