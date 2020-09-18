import React from 'react';

class Groups extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      groups : [],
    }
  }

  loadMembers(groups, currentChatGroupId){

    var exist = false;
    var count = 0;
    var m = (isAll, exist) => {
      if(isAll && !exist)
        this.props.setStateApp({
          roomID:null,
          chatFriend:null,
          messages:[],
        });
    }

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

              group.members = members.filter(mem => mem._id!==this.props.userId);
              if(currentChatGroupId){
                if(group._id===currentChatGroupId){
                  exist = true;
                  console.log('groups-refresh-didupdate');
                  this.handleClick(group, true);
                }
                count = count+1;
                m(count===groups.length, exist);
              }

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
                  if(g._id===group._id){
                    g.notRead = group.notRead;
                    g.seen = group.seen;
                  }
                });
              });

              console.log(groups);
              this.setState({
                groups:groups
              });

              var currentChatGroup = this.props.getChatFriend();
              if(currentChatGroup)
                if(currentChatGroup.groupName)
                  this.loadMembers(groups, currentChatGroup._id);
                else
                  this.loadMembers(groups, false);
              else
                this.loadMembers(groups, false);

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
                "body": JSON.stringify({groupIds:this.props.groupIds}),
              })
              .then(data => data.json())
              .then(groups =>{

                //groups.memberIds = groups.memberIds.filter(id => id!==this.props.userId);
                this.props.socket.emit('m-online', this.props.userId, groups);

                this.props.socket.emit('groups-identity',
                  {
                    userId:this.props.userId,
                    groups:groups
                  }
                );

                this.props.groups.forEach((group) =>{
                  groups.forEach((g) =>{
                    if(g._id===group._id){
                      g.notRead = group.notRead;
                      g.seen = group.seen;
                    }
                  });
                });

                console.log('gorup',groups);
                this.setState({
                  groups:groups
                });

                this.loadMembers(groups, false);

              })
              .catch(err =>{
                console.log(err);
              });

              let whoOn = (groupId, memberId) =>{

                console.log('whoOn', groupId, memberId);

                let isUpdate = false;
                let newgroups = this.state.groups.map((group) =>{

                  if(group._id===groupId){
                    console.log('gmonline', groupId);
                    let isOnline = 0;

                    group.members.forEach(member =>{
                      
                      if(member._id===memberId)
                          member.isOnline = true;
                      else
                        if(member.isOnline)
                          isOnline = isOnline + 1;
                    });

                    if(isOnline===0){
                      group.isOnline = true;
                      isUpdate = true;
                    }
                  }

                  return group;
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

              this.props.socket.on('joinRoom-g', (memberId, groupId) =>{
                console.log('gfjoinroom', groupId, memberId);
                var group = this.props.isChatting(groupId);
                console.log('gfjoinroom', group);
                if(group){
                  group.members.forEach(mem=>{
                    if(mem._id===memberId)
                      mem.chatting = true;
                  });

                  this.props.socket.emit('iJoinedRoomToo-g', this.props.userId, memberId, groupId);
                }
              });

              this.props.socket.on('iJoinedRoomToo-g', (groupId, memberId) =>{
                console.log('iJoinedRoomToog', groupId, memberId);
                var group = this.props.isChatting(groupId);
                console.log('iJoinedRoomToog-g', group);
                if(group){
                  group.members.forEach(mem =>{
                    if(mem._id===memberId)
                      mem.chatting = true;
                  });
                }
              });

              this.props.socket.on('gonline-notRead', (groupId) =>{
                let newgroups = this.state.groups.map((group) =>{
                  if(group._id===groupId)
                    group.notRead = group.notRead+1;
                  
                  return group;
                });
                this.setState({
                  groups:newgroups
                });

              });

              this.props.socket.on('online-seen-g', (groupId, memberName) =>{
                      console.log('online-seen1-g', groupId, memberName);
                this.state.groups.forEach((group) =>{
                  if(group._id===groupId){
                    group.seen.push(memberName);
                      console.log('online-seen2-g',groupId, memberName, group.seen);
                    if(group.setSeen_chatting){
                      console.log('online-seen3-g',groupId, memberName);
                      group.setSeen_chatting(group);
                    }
                  }
                });
              });

              this.props.socket.on('leaveChat-g', (groupId, memberId) =>{
                var group = this.props.isChatting(groupId)
                if(group){
                  group.members.forEach(mem=>{
                    if(mem._id===memberId)
                      mem.chatting = false;
                  });
                }
              });

              this.props.socket.on('group-offline', (groupId, memberId) =>{
                console.log('group-offline', groupId);
                let isUpdate = false;

                let newgroups = this.state.groups.map((group) =>{

                  if(group._id===groupId){
                    console.log('goffline', groupId);
                    let isOnline = 0;

                    group.members.forEach(member =>{
                      
                      if(member._id===memberId)
                        member.isOnline = false;
                      else
                        if(member.isOnline)
                          isOnline = isOnline + 1;
                    });

                    if(isOnline===0){
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
            
  setupGroup(group, lastMemberMessage){

    if(group.notRead>0){
      console.log('lastMemberMessage', lastMemberMessage);
      let condition = {_id:lastMemberMessage.memberId, 'groups._id':group._id};
      let update = {'$push':{'groups.$.seen':this.props.userName}};
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
                  console.log('gseen-userid:'+group._id);
                else
                  console.log('conditionless-gseen-userid:'+group._id);
              else{
                console.log('err-gseen-userid:'+group._id);
              }

            })
              .catch((err) =>{
                console.log(err);
              });

      condition = {_id:this.props.userId, 'groups._id':group._id};
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
        group.members.forEach(mem =>{
          if(mem._id===lastMemberMessage.memberId && mem.isOnline)
            this.props.socket.emit('online-seen-g', this.props.userName , group._id, mem._id);
        });

      if(group.seen.length){
        group.seen = [];

        let condition = {_id:this.props.userId, 'groups._id':group._id};
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
            if(res.nModified){
              console.log('gremoveSeen-userid:'+this.props.userId);
            }
            else
              console.log('conditionless-gremoveSeen-userid:'+this.props.userId);
          else{
            console.log('err-gremoveSeen-userid:'+this.props.userId);
          }

        })
        .catch((err) =>{
          console.log(err);//._id
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
        <div key={group._id} onClick={() => this.handleClick(group, false)}>
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