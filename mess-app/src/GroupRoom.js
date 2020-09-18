import React, {useState} from 'react';



function NewMess(props){
	const [text, setText] = useState('');

	function handleSubmit(event) {
		setText('');
		props.group.members.forEach(mem =>{

			if(!mem.chatting){
				console.log('memchatting', mem);
				let condition = {_id:mem._id, 'groups._id':props.group._id};
				let update = {'$inc':{'groups.$.notRead':1}};//test
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
								console.log('incnotread-groupid:'+props.group._id);
							else
								console.log('conditionless-incnotread-groupid:'+props.group._id);
						else{
							console.log('err-incnotread-groupid:'+props.group._id);
						}
					});
				if(mem.isOnline)
					props.socket.emit('gonline-notRead', props.group._id, mem._id);
			}

		});

		let newMess = {memberId:props.userId, memberName:props.userName, message:text};
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
						props.socket.emit('gmessage', text, props.roomId, messId, props.userName, props.userId);
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
			messages:[],
			seen:[],
		}
		this.messageEnd = null;
		this.missMess = [];
		this.on = 1;
	}

	scrollToBottom(){
		//this.messageEnd.scrollIntoView({behavior:'smooth'});
		this.messageEnd.scrollTop = this.messageEnd.scrollHeight;
	}


	componentDidUpdate(prevProps){
		if(this.props.messages!==prevProps.messages){
			this.setState({
				messages:this.addMess(this.props.messages),
				seen:this.props.group.seen
			}, this.scrollToBottom);

			this.props.group.setSeen_chatting = this.setSeen_chatting.bind(this);
			this.props.group.missingOn = this.missingOn.bind(this);
		}

	}

	setSeen_chatting(group) {
		if(this.props.group._id===group._id){
			this.setState({seen:group.seen.slice()});
		}
	}

	missingOn() {
		this.on = 1;
	}

	addMess(messages){

		let mess100 = messages;
		if(messages.length>20)
			mess100 = messages.slice(messages.length-20, messages.length);
		this.missMess.forEach(message =>{
			let repeat = false;
			for(let i=mess100.length; i>=0; i--){
				if(mess100[i]._id===messages._id){
					repeat = true;
					break;
				}
			}
			if(!repeat)
				messages.push(message);
		});
		this.on = 0;
		if(this.props.group.setupGroup)
			this.props.group.setupGroup(this.props.group, messages[messages.length-1]);
		return messages;
	}

	componentDidMount(){
		this.setState({
			messages:this.addMess(this.props.messages),
			seen:this.props.group.seen,
		}, this.scrollToBottom);
		this.props.group.setSeen_chatting = this.setSeen_chatting.bind(this);
		this.props.group.missingOn = this.missingOn.bind(this);

		this.props.socket.on('gmessage', (_id, memberId, memberName, mess) =>{
			if(this.props.group.seen.length){
		        let condition = {_id:this.props.userId, 'groups._id':this.props.group._id};
		        let update = {'$set':{'groups.$.seen':[]}};
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
				      console.log('gremoveSeen-userid:'+this.props.userId);
				    else
				      console.log('conditionless-gremoveSeen-userid:'+this.props.userId);
				  else{
				    console.log('err-gremoveSeen-userid:'+this.props.userId);
				  }

				})
				.catch((err) =>{
				  console.log(err);
				});
				this.setState({seen:[]}, this.scrollToBottom);
				this.props.group.seen = [];
			}

			let message = {_id:_id, memberId:memberId, memberName:memberName, message:mess}
			if(this.on)
				this.missMess.push(message);
			else
				this.setState({
					messages:[...this.state.messages, message]
				}, this.scrollToBottom);
		});

	}
	
	render(){
		var userId = this.props.userId;
		var repeat = '';
		const list = this.state.messages.map((e) =>{
			if(repeat!==e.memberId){
				repeat = e.memberId;
				if(userId!==e.memberId){
					let det = 
						(
							
							<div key={e._id}  style={{clear:'both'}}>
								<dt style={{marginBottom:'2px'}}><b>{e.memberName}</b></dt> 
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
								<dt style={{marginBottom:'2px',float:'right', clear:'right'}}>
									<b>{e.memberName}</b>
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
				if(userId!==e.memberId){
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
		let seen = '';
		if(this.state.seen.length){
			this.state.seen.forEach(memberName =>{
				seen = seen + memberName + ', ';
			});
			if(this.state.seen.length>1)
				seen = seen.slice(0,seen.length-2) + ' have seen';
			else
				seen = seen.slice(0,seen.length-2) + ' has seen';
		}

		return(
			<div>
				<div style={{overflow:'scroll', height:'400px'}}
						ref={(el) =>{this.messageEnd=el}}>
					{list}
				</div>
				<div>{seen}</div>
			</div>
		);
	}
}

function GroupRoom(props) {

	return (
	    <div style={{marginLeft:'8px'}}>
	    	<div><h3>{props.group.groupName}</h3></div>
	    	<Room roomId={props.roomId}
	    		  socket={props.socket}
	    		  group={props.group}
	    		  userId={props.userId}
	    		  messages={props.messages}
	    	/>
	    	<NewMess socket={props.socket}
	    			 roomId={props.roomId}
	    			 userName={props.userName}
	    			 userId={props.userId}
	    			 group={props.group}
	    	/>
	    </div>
	);
}

export default GroupRoom;
