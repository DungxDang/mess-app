import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Login from './Login';


function Start(props){
	const [user, setUser] = useState(
//{ id:1, userName:'user1', password:'1234', friends: [ {id:2,notRead:0,seen:0}, {id:3,notRead:0,seen:0}, {id:4,notRead:0,seen:0}, {id:5,notRead:0,seen:0}, {id:6,notRead:0,seen:0} ] },

		);

	//return !user? (<Login setUser={setUser} />) : (<App userId={user.id} userName={user.userName} friends={user.friends}/>);
	if(!user)
		return (<Login setUser={setUser} />)
	else{
		
		return (<App userId={user.id} userName={user.userName} friends={user.friends}/>);
	}
}


ReactDOM.render(
  <React.StrictMode>
    <Start/>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
