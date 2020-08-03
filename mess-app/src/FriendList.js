import React, {useState, useEffect} from 'react';

function FriendList(props) {
  const [friendList, setFriendList] = useState();

  useEffect(() => {
              fetch('http://localhost:3001/friendList', {friendListIds:props.friendListIds})
              .then(data => data.json())
              .then(users =>{
                setFriendList(users);
              });

              let whoOn = (userId) =>{
                let newFriendList = friendList.map((user) =>{
                  if(user.userId===userId){
                    user.isOnline = true;
                  }
                  return user
                });
                setFriendList(newFriendList);
              };

              props.socket.emit('online', props.userID, props.friendListIds);
              props.socket.on('I\'m online', (friendId)=>{
                whoOn(friendId);
                props.socket.emit('I\'m online', props.userId, friendId);
              });
              props.socket.on('friend online', (friendId) =>{
                whoOn(friendId);
              });

            },[]);

  function handleClick(userId, userName) {
    props.setRoom(userId, userName);
  }

  const list = friendList.map((user) =>{
    return(
      <div key={user.id} onClick={() => handleClick(userId, userName)}>
        <h6>{user.userName}</h6>{user.isOnline? 'Online':''}
      </div>
    ):
  });

  return (
    <div style={{width:"30%"}}>
      <div> <h4>{FriendList}</h4> </div>
      <div>{list}</div>
    </div>
  );
}

export default FriendList;