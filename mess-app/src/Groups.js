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

              this.props.socket.emit('m-online', this.props.userId, groups);//here

              this.props.socket.emit('groups-identity',
                {
                  userId:this.props.userId,
                  groups:groups
                }
              );

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

                this.props.socket.emit('m-online', this.props.userId, groups);

                this.props.socket.emit('groups-identity',
                  {
                    userId:this.props.userId,
                    groups:groups;
                  }
                );

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

              })
              .catch(err =>{
                console.log(err);
              });

              let whoOn = (groupId, memberId) =>{

                console.log('whoOn', groupId, memberId);

                let isUpdate = false;
                let newgroups = this.state.groups.map((group) =>{

                  if(group.id===groupId){
                    console.log('gmonline', groupId);
                    let isOnline = 0;

                    group.members.forEach(member =>{
                      
                      if(member.id===memberId)
                        if(member.isOnline)
                          member.isOnline = false;
                        
                      else
                        if(member.isOnline)
                          isOnline = isOnline + 1;
                    });

                    if(isOnline===0){
                      group.isOnline = true;
                      isUpdate = true;
                    }
                  }

                  return user;
                });

                if(isUpdate)
                  this.setState({
                    groups:newgroups
                  });

              };

              this.props.socket.on('I\'m online-g', (groupId, memberId)=>{
                console.log('gmonline',groupId, memberId);
                whoOn(groupId, memberId);
                this.props.socket.emit('I\'m online-g too', groupId, memberId, this.props.userId);
              });

              this.props.socket.on('member online-g too', (groupId, memberId) =>{
                console.log('monline too', groupId, memberId);
                whoOn(groupId, memberId);
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
  }
            
  setupGroup(groups, lastMemberMessage){

    if(group.notRead>0){

      let condition = {id:lastMemberMessage.id, 'groups.id':group.id};
      let update = {'$push':{'groups.$.seen':lastMemberMessage.userName}};
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
                  console.log('gseen-userid:'+group.id);
                else
                  console.log('conditionless-gseen-userid:'+group.id);
              else{
                console.log('err-gseen-userid:'+group.id);
              }

            })
              .catch((err) =>{
                console.log(err);
              });

      condition = {id:this.props.userId, 'groups.id':group.id};
      update = {'$set':{'groups.$.notRead':0}};
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
                  console.log('gremoveNotRead-userid:'+this.props.userId);
                else
                  console.log('conditionless-gremoveNotRead-userid:'+this.props.userId);
              else{
                console.log('err-gremoveNotRead-userid:'+this.props.userId);
              }

            })
            .catch((err) =>{
              console.log(err);
            });

      group.notRead = 0;
      this.setState({
        groups: this.state.groups.slice()
      });

      if(group.isOnline)
        this.props.socket.emit('online-seen', this.props.userId, group.id);

      if(group.seen.length){
        group.seen = [];

        let condition = {id:this.props.userId, 'groups.id':group.id};
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
      }
    }
  }

  handleClick(group, isRefresh) {
    console.log('click',group.groupName);

    this.setupGroup = this.setupGroup.bind(this);
    group.setupGroup = this.setupGroup;


    this.props.setRoom(group, isRefresh);
  }

  render(){

    this.handleClick = this.handleClick.bind(this);

    const list = this.state.groups.map((group) =>{
      return(
        <div key={group.id} onClick={() => this.handleClick(group, false)}>
          <h4>
            {group.groupName}
          </h4>
          <h6>
            {group.notRead>0? '('+group.notRead+')' : ''}
          </h6>
          <h6>{group.isOnline? 'Online':''}</h6>
        </div>
      );
    });

    return (
      <div style={{marginLeft:'8px'}}>
        <div> <h3>Group List</h3> </div>
        <div>{list}</div>
      </div>
    );
  }
}

export default Groups;