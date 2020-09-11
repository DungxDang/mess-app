import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Login from './Login';


class Start extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			user : null,
		}
	}
//{ id:1, userName:'user1', password:'1234', friends: [ {id:2,notRead:0,seen:0}, {id:3,notRead:0,seen:0}, {id:4,notRead:0,seen:0}, {id:5,notRead:0,seen:0}, {id:6,notRead:0,seen:0} ] },
	setUser(user){
		this.setState({
			user:user
		});
	}

	refresh(){
		fetch('http://localhost:3001/login',{
					"method": 'POST',
					//"mode": 'no-cors', 
					"headers": {
						'Content-Type':'application/json',
					},
					"body": JSON.stringify({ userName : this.state.user.userName }),
				}).then(res => res.json())
					.then(res =>{
						console.log('refresh user',res);

						if(res)
							this.setState({
								user:res
							});
						else
							if(res===0)
								console.log('refresh user error');
							else
								console.log('refresh user : if it can happen at least one time!');
					})
	                .catch(err =>{
	                  console.log(err);
	                });
	}

	render(){
		this.refresh = this.refresh.bind(this);
		this.setUser = this.setUser.bind(this);

		if(!this.state.user)
			return (<Login setUser={this.setUser} />)
		else{
			return (<App userId={this.state.user.id} userName={this.state.user.userName}
						 friends={this.state.user.friends} refresh={this.refresh}
						 groups={this.state.user.groups}/>);
		}
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
