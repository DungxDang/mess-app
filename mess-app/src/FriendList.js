import React, {useState, useEffect} from 'react';

function FriendList(props) {
  const [friendList, setFriendList] = useState();
  const friendListIds = props.friends.map((friends) => friendId.id);

  useEffect(() => {
              fetch('http://localhost:3001/friendList', {friendListIds:friendListIds})
              .then(data => data.json())
              .then(users =>{
                props.friends.map((friend) =>{
                  users.map((user) =>{
                    if(user.id===friend.id){
                      user.notRead = friend.notRead;
                      user.seen = friend.seen;
                    }
                  });
                });
                setFriendList(users);
              });

              let whoOn = (friendId) =>{
                let newFriendList = friendList.map((user) =>{
                  if(user.userId===friendId){
                    user.isOnline = true;
                  }
                  return user;
                });
                setFriendList(newFriendList);
              };

              props.socket.emit('online', props.userID, friendListIds);

              props.socket.on('I\'m online', (friendId)=>{
                whoOn(friendId);
                props.socket.emit('I\'m online', props.userId, friendId);
              });

              props.socket.on('friend online', (friendId) =>{
                whoOn(friendId);
              });

              props.socket.on('joinRoom', (friendId) =>{
                friendList.map((friend) =>{
                  if(friend.id===friendId){
                    friend.chatting = true;
                  }
                });
              });

              props.socket.on('online-notRead', (friendId) =>{
                let newFriendList = friendList.map((user) =>{
                  if(user.userId===friendId){
                    user.notRead = user.notRead+1;
                  }
                  return user;
                });
                setFriendList(newFriendList);

              });

              props.socket.on('online-seen', (friendId) =>{
                friendList.map((friend) =>{
                  if(friend.id===friendId){
                    friend.seen = 1;
                    if(friend.setSeen_chatting)
                      friend.setSeen_chatting(friendId);//is it
                  }
                });
              });

              props.socket.on('leaveChat', (friendId) =>{
                friendList.map((friend) =>{
                  if(friend.id===friendId){
                    friend.chatting = false;
                  }
                });
              });

              props.socket.on('offline', (friendId) =>{
                let newFriendList = friendList.map((user) =>{
                  if(user.userId===friendId){
                    user.isOnline = false;
                    user.chatting = false;
                  }
                  return user;
                });
                setFriendList(newFriendList);
              });

              props.socket.on('disconnect',() =>{
                props.socket.emit('offline', props.userId, friendListIds);
              });

            },[]);

  function handleClick(friend) {

    if(friend.notRead>0){
      fetch('http://localhost:3001/seen', {friendId:friend.id, userId:props.userId});
      friend.notRead = 0;

      if(friend.isOnline)
        props.socket.emit('online-seen', props.userId, friend.id);

      if(friend.seen){
        friend.seen = 0;
        fetch('http://localhost:3001/removeSeen', {friendId:friend.id, userId:props.userId});
      }
      setFriendList(friendList.slice());
    }

    props.setRoom(friend);
  }

  const list = friendList.map((friend) =>{
    return(
      <div key={friend.id} onClick={() => handleClick(friend)}>
        <h6>{friend.userName}</h6>
          {friend.isOnline? 'Online':''}
          ({friend.notRead>0 friend.notRead : ''})
      </div>
    ):
  });

  return (
    <div style={{width:"30%"}}>
      <div> <h4>FriendList</h4> </div>
      <div>{list}</div>
    </div>
  );
}

export default FriendList;