import React, { PureComponent } from 'react';
import { Link, Redirect } from 'react-router-dom';
import axios from 'axios';
import {Helmet} from "react-helmet";
import { updateToken } from  './store.js'
import './App.css';

const API_ROOT = "http://ec2-13-53-32-89.eu-north-1.compute.amazonaws.com:3000";


class Login extends PureComponent {
    constructor(props){
      super(props);
      this.state = {email: "", password: "", isLoggdIn: false, errorMess: ""};
    }

onChangeEmail = (e) =>{
 this.setState({email: e.target.value});
}
onChangePassword = (e) =>{
  this.setState({password: e.target.value});
}
getData = () =>{
  this.source = axios.CancelToken.source();
  const newData = {
    email: this.state.email,
    password: this.state.password
};

axios.post(API_ROOT + "/auth", newData, {  headers: {  cancelToken: this.source.token,  },
})
 .then(response => {
   if (response.status === 200){
    const token = response.data.token;
    updateToken(token);
    this.setState({isLoggdIn: true});
   }
})
.catch(error =>{
  if (axios.isCancel(error)){
    return;
  }
  if(error.response && error.response.status === 401){
      this.setState({errorMess: "Wrong e-mail or password!"});
  }
})

}

componentWillUnmount(){
  if (this.source){
    this.source.cancel();
  }
}
  render() {
    
    if (this.state.isLoggdIn === true){
      return(
          <Redirect to="/profile"/>
      );
  }
    return (
       <>
       <Helmet>
       <title>ToDo Login</title>
     </Helmet>
     
     <div className="loginMain">
     <h2 style={{textAlign:"center"}}>ToDo AvJS Lab3</h2>
       <label><b>Email:</b> </label><br/>
       <input maxLength="50" className="mainInput" onChange={this.onChangeEmail} type="email"/><br/><br/>
       <label><b>Password:</b> </label><br/>
       <input maxLength="20" className="mainInput" onChange={this.onChangePassword} type="password"/><br/>
       <button className="mainBtn" onClick={this.getData}>Login</button><br/><br/>
       <div className="loginErrorMess">{this.state.errorMess}</div>
       <hr/>
       <label><b>Register new user:</b> </label><br/>
       <Link to="/register"><button className="mainBtn">Register</button></Link>
      </div> 
       </>
    );
  }
}
export default Login;