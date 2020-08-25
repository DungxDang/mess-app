import React, {useState, useEffect} from 'react';

function FriendList(props) {
  const [friendList, setFriendList] = useState([]);
  const friendListIds = props.friends.map((friend) => friend.id);

  useEffect(() => {
              fetch('http://localhost:3001/friendList',{
                "method": 'POST',
                //"mode": 'no-cors', 
                "headers": {
                  'Content-Type':'application/json',
                },
                "body": JSON.stringify({friendListIds:friendListIds}),
              })
              .then(data => data.json())
              .then(users =>{
                props.friends.forEach((friend) =>{
                  users.forEach((user) =>{
                    if(user.id===friend.id){
                      user.notRead = friend.notRead;
                      user.seen = friend.seen;
                    }
                  });
                })
                .catch(err =>{
                  console.log(err);
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
                friendList.forEach((friend) =>{
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
                friendList.forEach((friend) =>{
                  if(friend.id===friendId){
                    friend.seen = 1;
                    if(friend.setSeen_chatting)
                      friend.setSeen_chatting(friendId);//is it
                  }
                });
              });

              props.socket.on('leaveChat', (friendId) =>{
                friendList.forEach((friend) =>{
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
      fetch('http://localhost:3001/seen',
          {
                    "method": 'POST',
                    //"mode": 'no-cors', 
                    "headers": {
                      'Content-Type':'application/json',
                    },
                    "body": JSON.stringify({friendId:friend.id, userId:props.userId})
          })
          .then(res => res.json())
            .then(res =>{
              
              if(res.notRead.err)
                if(res.notRead.nModified)
                  console.log('notread-userid:'+props.userId);
                else
                  console.log('conditionless-notread-userid:'+props.userId);
              else{
                console.log('err-notread-userid:'+props.userId);
              }

              if(res.seen.err)
                if(res.seen.nModified)
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

      friend.notRead = 0;

      if(friend.isOnline)
        props.socket.emit('online-seen', props.userId, friend.id);

      if(friend.seen){
        friend.seen = 0;
        fetch('http://localhost:3001/removeSeen',
          {
                    "method": 'POST',
                    //"mode": 'no-cors', 
                    "headers": {
                      'Content-Type':'application/json',
                    },
                    "body": JSON.stringify({friendId:friend.id, userId:props.userId})
          });
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
          ({friend.notRead>0? friend.notRead : ''})
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

export default FriendList;