import React, {useState, useEffect} from 'react';

function FriendList(props) {
  const [friendList, setFriendList] = useState();



	//props.socket.emit('joinRoom',this.state.roomId, this.props.userID, this.props.userName);
	//leave room

  useEffect(() => {
              fetch('http://localhost:3001/friendList', {friendListIds:props.friendListIds})
              .then(data => data.json())
              .then(users =>{
                setFriendList(listing(users));
              });
            },[]);

  function handleClick(userID, userName) {
    props.setRoom();//?????
  }

  function listing(friendList) {
    const list = friendList.map((user) =>{
      return(
        <div key={user.id} onClick={() => handleClick(userID, userName)}><h6>user.userName</h6></div>
      ):
    });
    return list
  }

  return (
    <div style={{width:"30%"}}>
      <div > <h4>FriendList</h4>
      </div>friendList
      <div>
      </div>
    </div>
  );
}

export default FriendList;