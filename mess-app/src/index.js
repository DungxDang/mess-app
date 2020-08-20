import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Login from './Login';


function Start(props){
	const [user, setUser] = useState();


	//return !user? (<Login setUser={setUser} />) : (<App userId={user.id} userName={user.userName} friends={user.friends}/>);
	if(!user)
		return (<Login setUser={setUser} />)
	else
		return (<App userId={user.id} userName={user.userName} friends={user.friends}/>);
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
