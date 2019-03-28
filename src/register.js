import React, { PureComponent } from 'react';
import { Link, Redirect } from 'react-router-dom';
import axios from 'axios';
import {Helmet} from "react-helmet";
import './App.css';

const API_ROOT = "http://ec2-13-53-32-89.eu-north-1.compute.amazonaws.com:3000";


class Register extends PureComponent{
    constructor(props){
      super(props);
      this.state = {email: "", password: "", isReg: false, regErrorMess: ""};
    }
    
    onChangeEmail = (e) =>{
      this.setState({email: e.target.value});
    }
    onChangePassword = (e) =>{
      this.setState({password: e.target.value});
    }
    sendData = () =>{
      const newData = {
        email: this.state.email,
        password: this.state.password
    };
      axios.post(API_ROOT + "/register", newData )
   .then(response => {
       if (response.status === 201){
        this.setState({isReg: true});
       }      
  })
  .catch(error =>{
      if (error.response && error.response.status === 400){
        this.setState({regErrorMess: "E-mail already exists! or Field empty!"})
      }
  })
    }
    render(){
        
      if (this.state.isReg === true){
        return <Redirect to="/"/>
      }
      return(
        <>
        <Helmet>
          <title>ToDo Register</title>
        </Helmet>
        <div className="regMain">
        <label><b>Email:</b> </label>
        <input maxLength="50" placeholder="Type in E-mail" className="regInput" onChange={this.onChangeEmail} type="email"/><br/><br/>
        <label><b>Password:</b> </label>
        <input maxLength="20" placeholder="Type in Password" autoComplete="new-password" className="regInput" onChange={this.onChangePassword} type="password"/>
        <button className="regBtn" onClick={this.sendData}>Register</button><br/><br/>
        <div className="regErrorMess">{this.state.regErrorMess}</div>
        <hr/>
        <label><b>Back to Login:</b> </label><br/>
        <Link to="/"><button className="regBtn">Login</button></Link>
        </div>
        </>
      );
    }
  }
  export default Register;