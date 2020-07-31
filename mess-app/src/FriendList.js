import React, {useState, useEffect} from 'react';

function FriendList(props) {
  const [friendList, setFriendList] = useState();

  useEffect(() => {
              fetch('http://localhost:3001/friendList', {friendListIds:props.friendListIds})
              .then(data => data.json())
              .then(users =>{
                setFriendList(listing(users));
              });
            },[]);

  function handleClick(userId, userName) {
    props.setRoom(userId, userName);
  }

  function listing(friendList) {
    const list = friendList.map((user) =>{
      return(
        <div key={user.id} onClick={() => handleClick(userId, userName)}><h6>user.userName</h6></div>
      ):
    });
    return list
  }

  return (
    <div style={{width:"30%"}}>
      <div> <h4>FriendList</h4> </div>
      <div>friendList</div>
    </div>
  );
}

export default FriendList;