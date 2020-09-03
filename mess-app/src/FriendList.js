import React from 'react';

class FriendList extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      friendList : [],
    }
  }

  componentDidUpdate(preProps){
    if(preProps.friends!==this.props.friends)
    {
        fetch('http://localhost:3001/friendList',
          {
            "method": 'POST',
            //"mode": 'no-cors', 
            "headers": {
              'Content-Type':'application/json',
            },
            "body": JSON.stringify({friendListIds:this.props.friendListIds}),
          })
            .then(data => data.json())
            .then(users =>{
              this.props.friends.forEach((friend) =>{
                users.forEach((user) =>{
                  if(user.id===friend.id){
                    user.notRead = friend.notRead;
                    user.seen = friend.seen;
                  }
                });
              });

              console.log(users);
              this.setState({
                friendList:users
              });

              this.props.socket.emit('online', this.props.userId, this.props.friendListIds);

              var currentChatFriend = this.props.getChatFriend();
              if(currentChatFriend){
                var exist = false;
                users.forEach((friend) =>{
                  if(friend.id===currentChatFriend.id){
                    exist = true;
                    console.log('refresh-didupdate');
                    this.handleClick(friend, true);
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
              fetch('http://localhost:3001/friendList',{
                "method": 'POST',
                //"mode": 'no-cors', 
                "headers": {
                  'Content-Type':'application/json',
                },
                "body": JSON.stringify({friendListIds:this.props.friendListIds}),
              })
              .then(data => data.json())
              .then(users =>{
                this.props.friends.forEach((friend) =>{
                  users.forEach((user) =>{
                    if(user.id===friend.id){
                      user.notRead = friend.notRead;
                      user.seen = friend.seen;
                    }
                  });
                });

                console.log(users);
                this.setState({
                  friendList:users
                });

                this.props.socket.emit('identity',
                  {
                    userId:this.props.userId,
                    friendListIds:this.props.friendListIds
                  }
                );

                this.props.socket.emit('online', this.props.userId, this.props.friendListIds);
                })
                .catch(err =>{
                  console.log(err);
                });

              let whoOn = (friendId) =>{
                console.log('whoOn', friendId);
                let newFriendList = this.state.friendList.map((user) =>{
                  if(user.id===friendId){
                    user.isOnline = true;
                    console.log('fonline',friendId);
                  }
                  return user;
                });
                this.setState({
                  friendList:newFriendList
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
                this.state.friendList.forEach((friend) =>{
                  if(friend.id===friendId){

                console.log('fjoinedroom', friendId);
                    friend.chatting = true;
                    this.props.socket.emit('iJoinedRoomToo', this.props.userId, roomId);
                  }
                });
              });

              this.props.socket.on('iJoinedRoomToo', (friendId) =>{
                console.log('iJoinedRoomToo', friendId);
                this.state.friendList.forEach((friend) =>{
                  if(friend.id===friendId){

                console.log('iJoinedRoomToocor', friendId);
                    friend.chatting = true;
                  }
                });
              });

              this.props.socket.on('online-notRead', (friendId) =>{
                let newFriendList = this.state.friendList.map((user) =>{
                  if(user.id===friendId){
                    user.notRead = user.notRead+1;
                  }
                  return user;
                });
                this.setState({
                  friendList:newFriendList
                });

              });

              this.props.socket.on('online-seen', (friendId) =>{
                      console.log('online-seen1', friendId);
                this.state.friendList.forEach((friend) =>{
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
                this.state.friendList.forEach((friend) =>{
                  if(friend.id===friendId){
                    friend.chatting = false;
                  }
                });
              });

              this.props.socket.on('offline', (friendId) =>{
                console.log('foffline', friendId);
                let newFriendList = this.state.friendList.map((user) =>{
                  if(user.id===friendId){
                console.log('foffline', friendId);
                    user.isOnline = false;
                    user.chatting = false;
                  }
                  return user;
                });
                this.setState({
                  friendList:newFriendList
                });
              });

              /*this.props.socket.once('disconnect', (sth) =>{
                  console.log('oncedis', this.props.userId);
                  this.props.socket.emit('offline', this.props.userId, this.props.friendListIds);
              });*/

              this.props.socket.on('reconnect', (attemptNumber) => {

                console.log('reconnect', this.props.userId, attemptNumber);
                this.props.socket.emit('identity',
                  {userId:this.props.userId, friendListIds:this.props.friendListIds}
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
        friendList: this.state.friendList.slice()
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

    const list = this.state.friendList.map((friend) =>{
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

export default FriendList;