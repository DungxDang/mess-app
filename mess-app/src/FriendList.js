import React from 'react';

class FriendList extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      friendList : [],
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
              })
              .catch(err =>{
                console.log(err);
              });

              let whoOn = (friendId) =>{
                let newFriendList = this.state.friendList.map((user) =>{
                  if(user.userId===friendId){
                    user.isOnline = true;
                  }
                  return user;
                });
                this.setState({
                  friendList:newFriendList
                });
              };

              
              this.props.socket.emit('online', this.props.userID, this.props.friendListIds);

              this.props.socket.on('I\'m online', (friendId)=>{
                whoOn(friendId);
                this.props.socket.emit('I\'m online', this.props.userId, friendId);
              });

              this.props.socket.on('friend online too', (friendId) =>{
                whoOn(friendId);
              });

              this.props.socket.on('joinRoom', (friendId) =>{
                this.state.friendList.forEach((friend) =>{
                  if(friend.id===friendId){
                    friend.chatting = true;
                  }
                });
              });

              this.props.socket.on('online-notRead', (friendId) =>{
                let newFriendList = this.state.friendList.map((user) =>{
                  if(user.userId===friendId){
                    user.notRead = user.notRead+1;
                  }
                  return user;
                });
                this.setState({
                  friendList:newFriendList
                });

              });

              this.props.socket.on('online-seen', (friendId) =>{
                this.state.friendList.forEach((friend) =>{
                  if(friend.id===friendId){
                    friend.seen = 1;
                    if(friend.setSeen_chatting)
                      friend.setSeen_chatting(friendId);//is it
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
                let newFriendList = this.state.friendList.map((user) =>{
                  if(user.userId===friendId){
                    user.isOnline = false;
                    user.chatting = false;
                  }
                  return user;
                });
                this.setState({
                  friendList:newFriendList
                });
              });

              this.props.socket.on('disconnect',() =>{
                this.props.socket.emit('offline', this.props.userId, this.props.friendListIds);
              });
  }
            

  handleClick(friend) {
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

    this.props.setRoom(friend);
  }

  render(){

    this.handleClick = this.handleClick.bind(this);

    const list = this.state.friendList.map((friend) =>{
      return(
        <div key={friend.id} onClick={() => this.handleClick(friend)}>
          <h6>
            {friend.userName}
            {friend.notRead>0? '('+friend.notRead+')' : ''}

          </h6>
          {friend.isOnline? 'Online':''}
        </div>
      );
    });

    return (
      <div>
        <div> <h4>FriendList</h4> </div>
        <div>{list}</div>
      </div>
    );
  }
}

export default FriendList;