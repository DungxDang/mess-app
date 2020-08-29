import React from 'react';

class Login extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			userName:'',
			password:'',
			infor:''
		};
	}

	handleChangeUSerName(event){
		this.setState({
			userName : event.target.value,
		});
	}

	handleChangePassword(event){
		this.setState({
			password : event.target.value,
		});
	}

	handleSubmit(event){
		if(!this.state.userName)
			this.setState({
				infor:'User name please!',
			});
		else
			if(!this.state.password)
				this.setState({
					infor:'Password please!',
				});
			else
				fetch('http://localhost:3001/login',{
					"method": 'POST',
					//"mode": 'no-cors', 
					"headers": {
						'Content-Type':'application/json',
					},
					"body": JSON.stringify({ userName : this.state.userName }),
				}).then(res => res.json())
					.then(res =>{
						console.log(res);
						
						if(res)
							if(res.password===this.state.password){
								this.props.setUser(res);
							}else
								this.setState({
									infor:'User name or password incorrect',
									password:''
								});
						else
							this.setState({
								infor:'User name or password incorrect',
								password:''
							});
					})
	                .catch(err =>{
	                  console.log(err);
	                });
	             /*   {let condition = {id:3, 'friends.id':2};
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
            	console.log('res',res);
              if(res)
                if(res.nModified)
                  console.log('seen-userid:'+2);
                else
                  console.log('conditionless-seen-userid:'+2);
              else{
                console.log('err-seen-userid:'+2);
              }

            })
            .catch((err) =>{
              console.log(err);
            });}*/

		event.preventDefault();
	}

	render(){

		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleChangeUSerName = this.handleChangeUSerName.bind(this);
		this.handleChangePassword = this.handleChangePassword.bind(this);
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