import React, {useState, useEffect} from 'react';



function NewMess(props){
	const [text, setText] = useState('');

	function handleSubmit(event) {
		setText('');
		if(!props.chatFriend.chatting){
			let condition = {_id:props.chatFriend._id, 'friends._id':props.userId};
			let update = {'$inc':{'friends.$.notRead':1}};//test
			fetch('http://localhost:3001/incNotRead',
			{
                "method": 'POST',
                //"mode": 'no-cors', 
                "headers": {
                  'Content-Type':'application/json',
                },
                "body": JSON.stringify({condition:condition, update:update}),
            })
			.then(res => res.json())
				.then(res =>{
					if(res)
						if(res.nModified)
							console.log('incnotread-userid:'+props.chatFriend._id);
						else
							console.log('conditionless-incnotread-userid:'+props.chatFriend._id);
					else{
						console.log('err-incnotread-userid:'+props.chatFriend._id);
					}
				});
			if(props.chatFriend.isOnline)
				props.socket.emit('online-notRead', props.userId, props.chatFriend._id);
		}
		let newMess = {userName:props.userName, message:text};
		fetch('http://localhost:3001/saveMessage',
			{
                "method": 'POST',
                //"mode": 'no-cors', 
                "headers": {
                  'Content-Type':'application/json',
                },
                "body": JSON.stringify({newMess:newMess, collection:props.roomId})
            })
			.then(res => res.json())
				.then(messId =>{
					if(messId)
						props.socket.emit('message', text, props.roomId, messId, props.userName);
					else{
						//
					}
				});
        
		//event.target.value = '';
		event.preventDefault();
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

class Room extends React.Component{
	
	constructor(props){
		super(props);
		this.state = {
			messages:this.props.messages,
			seen:this.props.chatFriend.seen,
			messageEnd:null
		}
		this.props.chatFriend.setSeen_chatting = this.setSeen_chatting.bind(this);
	}

	scrollToBottom(){
		//this.state.messageEnd.scrollIntoView({behavior:'smooth'});
		this.state.messageEnd.scrollTop = this.state.messageEnd.scrollHeight;
	}


	componentDidUpdate(prevProps){
		if(this.props.messages!==prevProps.messages){
			this.setState({
				messages:this.props.messages,
				seen:this.props.chatFriend.seen
			}, this.scrollToBottom);

			this.props.chatFriend.setSeen_chatting = this.setSeen_chatting.bind(this);
		}

	}

	setSeen_chatting(id) {
		if(this.props.chatFriend._id===id)
			this.setState({seen:1});//._id
	}

	componentDidMount(){

		this.props.socket.on('message', (_id, userName, mess) =>{
			if(this.props.chatFriend.seen){
		        let condition = {_id:this.props.userId, 'friends._id':this.props.chatFriend._id};
		        let update = {'$set':{'friends.$.seen':0}};
				fetch('http://localhost:3001/removeSeen',
				{
	                "method": 'POST',
	                //"mode": 'no-cors', 
	                "headers": {
	                  'Content-Type':'application/json',
	                },
                    "body": JSON.stringify({condition:condition, update:update})
	            })
				.then(res => res.json())
				.then(res =>{

				  if(res)
				    if(res.nModified)
				      console.log('removeSeen-userid:'+this.props.userId);
				    else
				      console.log('conditionless-removeSeen-userid:'+this.props.userId);
				  else{
				    console.log('err-removeSeen-userid:'+this.props.userId);
				  }

				})
				.catch((err) =>{
				  console.log(err);
				});
				console.log('seeennn', this.state.seen);
				this.setState({seen:0}, this.scrollToBottom);
				this.props.chatFriend.seen = 0;
			}

			let message = {_id:_id, userName:userName, message:mess}
			this.setState({
				messages:[...this.state.messages, message]
			}, this.scrollToBottom);
		});
		this.scrollToBottom();

	}
	
	render(){
		var friendName = this.props.chatFriend.userName;
		var repeat = '';
		const list = this.state.messages.map((e) =>{
			if(repeat!==e.userName){
				repeat = e.userName;
				if(friendName===e.userName){
					let det = 
						(
							
							<div key={e._id}  style={{clear:'both'}}>
								<dt style={{margin:'5px 0px 2px'}}><b>{e.userName}</b></dt> 
								<dd style={{
												float:'left',
												clear:'both',
												margin:'5px 40px 2px',
												borderRadius:'2px / 5px',
												background:'#CADEEB',
												padding:'4px 16px'
											}}>
									{e.message}
								</dd>
							</div>
						);
					
					return det;
				}else{
					let det = 
						(
							
							<div key={e._id} style={{clear:'both'}}>
								<dt style={{margin:'5px 0px 2px',float:'right', clear:'right'}}>
									<b>{e.userName}</b>
								</dt> 
								<dd style={{
												float:'right',
												clear:'right',
												margin:'5px 40px 2px',
												borderRadius:'2px / 5px',
												background:'#CADEEB',
												padding:'4px 16px'
											}}>
									{e.message}
								</dd>
							</div>
						);
					return det;
				}
			}else{
				if(friendName===e.userName){
					let det = 
						(
							
							<div key={e._id}  style={{clear:'both'}}>
								<dd style={{
												float:'left',
												clear:'both',
												margin:'5px 40px 2px',
												borderRadius:'2px / 5px',
												background:'#CADEEB',
												padding:'4px 16px'
											}}>
									{e.message}
								</dd>
							</div>
						);
					return det;
				}else{
					let det =
						(
							
							<div key={e._id} style={{clear:'both'}}>
								<dd style={{
												float:'right',
												clear:'right',
												margin:'5px 40px 2px',
												borderRadius:'2px / 5px',
												background:'#CADEEB',
												padding:'4px 16px'
											}}>
									{e.message}
								</dd>
							</div>
						);
					return det;
				}

			}
		});

		console.log('seeen', this.state.seen);
		return(
			<div>
				<div style={{overflow:'scroll', height:'400px'}}
						ref={(el) =>{this.state.messageEnd=el}}>
					{list}
				</div>
				<div>{this.state.seen? 'seen' : ''}</div>
			</div>
		);
	}
}

/*function Room(props){

	const [messages, setMessages] = useState(props.messages);
	const [seen, setSeen] = useState(props.chatFriend.seen);

	useEffect((privMessages) => {
		console.log('privMessages',privMessages, props.messages)
		if(props.messages!==privMessages){
			setMessages(props.messages);
		console.log('privMessages',privMessages, props.messages)
		}

	},[props.messages]);
		console.log('room', messages);

	function listing() {
		if(messages)
			return 	messages.map((e) =>{
						return(
							<dl key={e._id}>
								<dt>{e.userName}</dt> 
								<dd>{e.message}</dd>
							</dl>
						);
					});
		else
			return null;//nonsen
	}

	function setSeen_chatting(id) {
		if(props.chatFriend._id===id)
			setSeen(1);
	}
	props.chatFriend.setSeen_chatting = setSeen_chatting;
	console.log('this',Room.messages);

	useEffect(() => {

			props.socket.on('message', (_id, userName, mess) =>{
				if(props.chatFriend.seen){
					fetch('http://localhost:3001/removeSeen',
					{
		                "method": 'POST',
		                //"mode": 'no-cors', 
		                "headers": {
		                  'Content-Type':'application/json',
		                },
		                "body": JSON.stringify( {friendId:props.chatFriend._id, userId:props.userId})
		            });
					setSeen(0);
					props.chatFriend.seen = 0;
				}
				console.log('newmess',mess,userName);
				let message = {_id:_id, userName:userName, message:mess}

				setMessages([...messages, message]);
			});
		

	},[]);
	


	return(
		<div>
			<div>{listing()}</div>
			<div>{seen? 'seen' : ''}</div>
		</div>
	);
}*/

function ChatRoom(props) {

	return (
	    <div style={{marginLeft:'8px'}}>
	    	<div><h3>{props.chatFriend.userName}</h3></div>
	    	<Room roomId={props.roomId}
	    		  socket={props.socket}
	    		  chatFriend={props.chatFriend}
	    		  userId={props.userId}
	    		  messages={props.messages}
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
