import React, {useState, useEffect} from 'react';



function NewMess(props){
	const [text, setText] = useState('');

	function handleSubmit(event) {
		setText('');
		props.group.members.forEach(mem =>{

			if(!mem.chatting){
				let condition = {id:mem.id, 'groups.id':props.group.id};
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
								console.log('incnotread-groupid:'+props.group.id);
							else
								console.log('conditionless-incnotread-groupid:'+props.group.id);
						else{
							console.log('err-incnotread-groupid:'+props.group.id);
						}
					});
				if(mem.isOnline)
					props.socket.emit('gonline-notRead', props.group.id, mem.id);
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
			messages:this.props.messages,
			seen:this.props.group.seen,
			messageEnd:null
		}
	}

	scrollToBottom(){
		//this.state.messageEnd.scrollIntoView({behavior:'smooth'});
		this.state.messageEnd.scrollTop = this.state.messageEnd.scrollHeight;
	}


	componentDidUpdate(prevProps){
		if(this.props.messages!==prevProps.messages){
			this.setState({
				messages:this.props.messages,
				seen:this.props.group.seen
			}, this.scrollToBottom);

			this.props.group.setSeen_chatting = this.setSeen_chatting.bind(this);
		}

	}

	setSeen_chatting(id) {
		if(this.props.group.id===id)
			this.setState({seen:1});
	}

	componentDidMount(){

		this.props.socket.on('message', (_id, memberId, memberName, mess) =>{
			if(this.props.group.seen.length){
		        let condition = {id:this.props.userId, 'groups.id':this.props.group.id};
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
			this.setState({
				messages:[...this.state.messages, message]
			}, this.scrollToBottom);
		});

	}
	
	render(){
		var userId = this.props.userId;
		var repeat = '';
		const list = this.state.messages.map((e) =>{
			if(repeat!==e.memberName){
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

function GroupRoom(props) {

	return (
	    <div style={{marginLeft:'8px'}}>
	    	<div><h3>{props.group.userName}</h3></div>
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
