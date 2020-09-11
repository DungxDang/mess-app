import React from 'react';

class Groups extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      groups : [],
    }
  }

  loadMembers(groups){

    groups.forEach((group) =>{
        fetch('http://localhost:3001/members',
          {
            "method": 'POST',
            //"mode": 'no-cors', 
            "headers": {
              'Content-Type':'application/json',
            },
            "body": JSON.stringify({memberIds:group.memberIds}),
          })
            .then(data => data.json())
            .then(members =>{
              group.members = members;
            })
            .catch(err =>{
              console.log(err);
            });

    });
  }

  componentDidUpdate(preProps){
    if(preProps.groups!==this.props.groups)
    {
        fetch('http://localhost:3001/groups',
          {
            "method": 'POST',
            //"mode": 'no-cors', 
            "headers": {
              'Content-Type':'application/json',
            },
            "body": JSON.stringify({groupIds:this.props.groupIds}),
          })
            .then(data => data.json())
            .then(groups =>{

              this.props.socket.emit('online', this.props.userId, this.props.groupsIds);//here

              this.props.groups.forEach((group) =>{
                groups.forEach((g) =>{
                  if(g.id===group.id){
                    g.notRead = group.notRead;
                    g.seen = group.seen;
                  }
                });
              });

              console.log(groups);
              this.setState({
                groups:groups
              });

              this.props.socket.emit('groups-identity',
                {
                  userId:this.props.userId,
                  groups:this.props.groups
                }
              );

              this.loadMembers(groups);

              var currentChatFriend = this.props.getChatFriend();
              if(currentChatFriend){
                var exist = false;
                groups.forEach((group) =>{
                  if(group.id===currentChatFriend.id){
                    exist = true;
                    console.log('groups-refresh-didupdate');
                    this.handleClick(group, true);
                  }
                });
                if(!exist)
                  this.props.setStateApp({
                    roomID:null,
                    chatFriend:null,
                    messages:[],
                  });
              }
            })
            .catch(err =>{
              console.log(err);
            });

    }
  }

  componentDidMount(){
              fetch('http://localhost:3001/groups',{
                "method": 'POST',
                //"mode": 'no-cors', 
                "headers": {
                  'Content-Type':'application/json',
                },
                "body": JSON.stringify({groupsIds:this.props.groupsIds}),
              })
              .then(data => data.json())
              .then(groups =>{

                this.props.socket.emit('online', this.props.userId, this.props.groupsIds);

                this.props.groups.forEach((group) =>{
                  groups.forEach((g) =>{
                    if(g.id===group.id){
                      g.notRead = group.notRead;
                      g.seen = group.seen;
                    }
                  });
                });

                console.log(groups);
                this.setState({
                  groups:groups
                });

                this.loadMembers(groups);

                this.props.socket.emit('groups-identity',
                  {
                    userId:this.props.userId,
                    groups:this.props.groups;
                  }
                );

              })
              .catch(err =>{
                console.log(err);
              });

              let whoOn = (friendId) =>{
                console.log('whoOn', friendId);
                let newgroups = this.state.groups.map((user) =>{
                  if(user.id===friendId){
                    user.isOnline = true;
                    console.log('fonline',friendId);
                  }
                  return user;
                });
                this.setState({
                  groups:newgroups
                });
              };

              this.props.socket.on('I\'m online', (friendId)=>{
                console.log('fonline',friendId);
                whoOn(friendId);
                this.props.socket.emit('I\'m online too', this.props.userId, friendId);
              });

              this.props.socket.on('friend online too', (friendId) =>{
                console.log('fonline too', friendId);
                whoOn(friendId);
              });

              this.props.socket.on('joinRoom', (friendId, roomId) =>{
                console.log('fjoinroom', friendId);
                this.state.groups.forEach((friend) =>{
                  if(friend.id===friendId){

                console.log('fjoinedroom', friendId);
                    friend.chatting = true;
                    this.props.socket.emit('iJoinedRoomToo', this.props.userId, roomId);
                  }
                });
              });

              this.props.socket.on('iJoinedRoomToo', (friendId) =>{
                console.log('iJoinedRoomToo', friendId);
                this.state.groups.forEach((friend) =>{
                  if(friend.id===friendId){

                console.log('iJoinedRoomToocor', friendId);
                    friend.chatting = true;
                  }
                });
              });

              this.props.socket.on('online-notRead', (friendId) =>{
                let newgroups = this.state.groups.map((user) =>{
                  if(user.id===friendId){
                    user.notRead = user.notRead+1;
                  }
                  return user;
                });
                this.setState({
                  groups:newgroups
                });

              });

              this.props.socket.on('online-seen', (friendId) =>{
                      console.log('online-seen1', friendId);
                this.state.groups.forEach((friend) =>{
                  if(friend.id===friendId){
                    friend.seen = 1;
                      console.log('online-seen2',friend);
                    if(friend.setSeen_chatting){
                      console.log('online-seen3',friendId);
                      friend.setSeen_chatting(friendId);
                    }
                  }
                });
              });

              this.props.socket.on('leaveChat', (friendId) =>{
                this.state.groups.forEach((friend) =>{
                  if(friend.id===friendId){
                    friend.chatting = false;
                  }
                });
              });

              this.props.socket.on('offline', (friendId) =>{
                console.log('foffline', friendId);
                let newgroups = this.state.groups.map((user) =>{
                  if(user.id===friendId){
                console.log('foffline', friendId);
                    user.isOnline = false;
                    user.chatting = false;
                  }
                  return user;
                });
                this.setState({
                  groups:newgroups
                });
              });

              this.props.socket.on('group-offline', (groupId, memberId) =>{
                console.log('group-offline', groupId);
                let isUpdate = false;

                let newgroups = this.state.groups.map((group) =>{

                  if(group.id===groupId){
                    console.log('goffline', groupId);
                    let isOnline = 0;
                    let current = false;

                    group.members.forEach(member =>{
                      
                      if(member.id===memberId)
                        if(member.isOnline){
                          current = true;
                          member.isOnline = false;
                        }
                      else
                        if(member.isOnline)
                          isOnline = isOnline + 1;
                    });

                    if(isOnline===0 && current){
                      group.isOnline = false;
                      isUpdate = true;
                    }
                  }
                  
                  return group;
                });

                if(isUpdate)
                  this.setState({
                    groups:newgroups
                  });
              });

              /*this.props.socket.once('disconnect', (sth) =>{
                  console.log('oncedis', this.props.userId);
                  this.props.socket.emit('offline', this.props.userId, this.props.groupsIds);
              });*/

              this.props.socket.on('reconnect', (attemptNumber) => {

                console.log('reconnect', this.props.userId, attemptNumber);
                this.props.socket.emit('identity',
                  {userId:this.props.userId, groupsIds:this.props.groupsIds}
                );

                this.props.refresh();
              });

              this.props.socket.on('reconnecting', (attemptNumber) => {
                console.log('reconnecting', this.props.userId, attemptNumber);
              });

              this.props.socket.on('disconnect',(reason) => {
                if (reason === 'io client disconnect') {
                  console.log('io client disconnect', this.props.userId);
                }
                if (reason === 'io server disconnect') {
                  console.log('io server disconnect', this.props.userId);
                }
                if (reason === 'ping timeout') {
                  console.log('ping timeout', this.props.userId);
                }

                if (reason === 'transport close') {
                  console.log('transport close', this.props.userId);
                }
                  console.log('disconnect', this.props.userId, reason);
              });
  }
            

  handleClick(friend, isRefresh) {
    console.log('click',friend.userName);
    if(friend.notRead>0){

      let condition = {id:friend.id, 'friends.id':this.props.userId};
      let update = {'$set':{'friends.$.seen':1}};
      fetch('http://localhost:3001/seen',
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
            console.log('seen',res);

              if(res)
                if(res.nModified)
                  console.log('seen-userid:'+friend.id);
                else
                  console.log('conditionless-seen-userid:'+friend.id);
              else{
                console.log('err-seen-userid:'+friend.id);
              }

            })
            .catch((err) =>{
              console.log(err);
            });
      condition = {id:this.props.userId, 'friends.id':friend.id};
      update = {'$set':{'friends.$.notRead':0}};
      fetch('http://localhost:3001/removeNotRead',
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
            console.log('not',res);

              
              if(res)
                if(res.nModified)
                  console.log('removeNotRead-userid:'+this.props.userId);
                else
                  console.log('conditionless-removeNotRead-userid:'+this.props.userId);
              else{
                console.log('err-removeNotRead-userid:'+this.props.userId);
              }

            })
            .catch((err) =>{
              console.log(err);
            });

      friend.notRead = 0;
      this.setState({
        groups: this.state.groups.slice()
      });

      if(friend.isOnline)
        this.props.socket.emit('online-seen', this.props.userId, friend.id);

      if(friend.seen){
        friend.seen = 0;
        fetch('http://localhost:3001/removeSeen',
          {
                    "method": 'POST',
                    //"mode": 'no-cors', 
                    "headers": {
                      'Content-Type':'application/json',
                    },
                    "body": JSON.stringify({friendId:friend.id, userId:this.props.userId})
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
      }
    }

    this.props.setRoom(friend, isRefresh);
  }

  render(){

    this.handleClick = this.handleClick.bind(this);

    const list = this.state.groups.map((friend) =>{
      return(
        <div key={friend.id} onClick={() => this.handleClick(friend, false)}>
          <h4>
            {friend.userName}
          </h4>
          <h6>
            {friend.notRead>0? '('+friend.notRead+')' : ''}
          </h6>
          <h6>{friend.isOnline? 'Online':''}</h6>
        </div>
      );
    });

    return (
      <div style={{marginLeft:'8px'}}>
        <div> <h3>Friend List</h3> </div>
        <div>{list}</div>
      </div>
    );
  }
}

export default Groups;