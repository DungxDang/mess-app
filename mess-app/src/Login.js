import React, {useState} from 'react';


class Login extends React.Component{
	constructor(props){
		super(props);
		this.state({
			userName:null,
			password:null,
			infor:null
		});
	}

	handleChangeUSerName(event){
		this.setSate({
			userName : event.target.value,
		});
	}

	handleChangePassword(event){
		this.setSate({
			password : event.target.value,
		});
	}

	handleSubmit(event){
		if(!this.state.userName)
			this.setSate({
				infor:'User name please!',
			});
		else
			if(!this.state.password)
				this.setSate({
					infor:'Password please!',
				});
			else
				fetch('http://localhost:3001/login',{userName:this.state.userName})
				.then(res => res.json())
					.then(res =>{

						console.log('qqq');
						console.log(res);
						console.log('qqq');
						if(res.password)
							if(res.password===this.state.password){
								console.log(res);
								this.props.setUser(res);
							}else
								this.setSate({
									infor:'User name or password incorrect',
									password:''
								});
						else
							this.setSate({
								infor:'User name or password incorrect',
								password:''
							});
					});

		event.preventlDefault();
	}

	render(){

		return(
			<form onSubmit={this.handleSubmit}>
				<input type='text' value={this.state.userName} onChange={this.handleChangeUSerName} />
				<input type='text' value={this.state.password} onChange={this.handleChangePassword} />
				<input type='submit' value='login' />
				<div>{this.state.infor}</div>
			</form>

		);
	}
}
export default Login;