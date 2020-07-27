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
		});
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
				/>
		     	<ChatRoom roomName={'user2'}
		     			  roomId={'12'}
		     	/>
		      
		    </div>
  		);
	};
  
}

export default App;
