import React, { PureComponent } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import {Helmet} from "react-helmet";
import {token$} from './store.js'
import { updateToken } from  './store.js'
import './App.css';

const API_ROOT = "http://ec2-13-53-32-89.eu-north-1.compute.amazonaws.com:3000";



class Profile extends PureComponent{
    constructor(props){
      super(props);
      this.state = {email: "", todo: [], token: token$.value, newTodo: "", todoErrorMess: ""};
    }
  renderList =  (data, index) =>{
    let num = index + 1;
    
      return (
      <tr key={data.id}>
      <td className="todoText" style={{paddingLeft: "15px"}}>{num + ". " + data.content}</td>
      <td style={{width: "60px"}}><button className="profileBtn delBtn" data-id={data.id} onClick={this.deleteTodo}>Delete</button></td>
      </tr>
      )
     }  
    
  deleteTodo = (e) =>{
    const data = this.state.todo;
    const id = e.target.dataset.id;
    axios.delete(API_ROOT + "/todos/" + id, 
    {  headers: {  Authorization: "Bearer " + token$.value,cancelToken: this.source.token,  },
    })
    .then(response => {
     if (response.status === 204){
       const index = data.findIndex(x => x.id === id)
     
      if (index >= 0){
        const newData = [...data.slice(0, index), ...data.slice(index + 1)]
        this.setState({todo: newData});
      }
    }
     })
     .catch(error =>{
      if (axios.isCancel(error)){
        return;
      }
    });
  
  }
  componentDidMount () {
    this.source = axios.CancelToken.source();
    this.subscription = token$.subscribe((token) => {
      this.setState({ token });
  })
    if (!this.state.token){
      return <Redirect to="/"/>
    }
  
    const decoded = jwt.decode(this.state.token);
    this.setState({email: decoded.email});
  
    axios.get(API_ROOT + "/todos", 
     {  headers: {  Authorization: "Bearer " + token$.value,  },
     cancelToken: this.source.token,
     })
     .then(response => {
        if (response.status === 200){
         const todo = response.data.todos;
         this.setState({todo: todo});
        }
      })
      .catch(error =>{
        if (error.response && error.response.status === 404){
            this.setState({todoErrorMess: "Wrong Conection!"})
        }
        if (error.response && error.response.status === 401){
            this.setState({todoErrorMess: "Unauthorized!"})
        }    
        if (axios.isCancel(error)){
          return;
        }
      })
  }
  componentWillUnmount(){
    this.subscription.unsubscribe();
    if (this.source){
      this.source.cancel();
    } 
  } 
  logOut = () => {
    updateToken(null);
  }
  todoText = (e) =>{
   this.setState({newTodo: e.target.value})
  }
  addTodo = () =>{
    
    axios.post(API_ROOT + "/todos", { content: this.state.newTodo },
    {  headers: {  Authorization: "Bearer " + token$.value,  },cancelToken: this.source.token,} )
    .then(response =>{
   if (response.status === 201){
    this.setState({newTodo: ""})   
    this.refs.todoText.value = "";
    axios.get(API_ROOT + "/todos", 
    {  headers: {  Authorization: "Bearer " + token$.value,cancelToken: this.source.token,  },
    })
    .then(response => {
      if (response.status === 200){
        this.setState({todoErrorMess: ""});
        const todo = response.data.todos;
       this.setState({todo: todo});
      }
       
     })
     .catch(error =>{
      if (axios.isCancel(error)){
        return;
      }
      if (error.response && error.response.status === 404){
        this.setState({todoErrorMess: "Wrong Connection!"});
      }
      if (error.response && error.response.status === 401){
        this.setState({todoErrorMess: "Unauthorized!"})
    }   
    })
   }
    })
    .catch(error =>{
      if (axios.isCancel(error)){
        return;
      }
      if (error.response && error.response.status === 400){
            this.setState({todoErrorMess: "Must write todo text!"});
      }
    })
  
  }
  
    render(){
        let listData;
        if(this.state.todo.length < 1){
            listData = <tr><td style={{textAlign: "center"}} colSpan="2">The list is empty...</td></tr>
        }
        else{
            let newArr = [...this.state.todo]
            listData = newArr.reverse().map(this.renderList);
        }
      
      if (this.state.token === null){
        return <Redirect to="/"/>
      }
      return(
        <> 
        <Helmet>
         <title>Shopping List Profile: {this.state.email}</title>
       </Helmet>
       <div className="profileBack">
       <div className="profileLogin">
         <div className="logAs"><b>Logged in as:</b> <span className="redText">{this.state.email}</span></div>
         <button className="logOutBtn" onClick={this.logOut}>Logout</button> <br/>
         <input maxLength="20" placeholder="Fill The Fridge..." className="addTodoText" onChange={this.todoText} ref="todoText" type="text"/>
        <button className="addBtn" onClick={this.addTodo}>Add to list</button>
        <div className="todoErrorMess">{this.state.todoErrorMess}</div> 
       </div>
        
        <table className="rederTable" border="0">
            <thead>
                <tr>
                  <th style={{paddingLeft: "15px", borderRadius: '10px 0 0 0',}}>Shopping List:</th>
                  <th style={{borderRadius: '0 10px 0 0',}}>Delete:</th>  
                </tr>
            </thead>
            <tbody>
                   {listData} 
            </tbody>
            <tfoot>
                <tr>
                <td colSpan="2" style={{borderRadius: '0 0 10px 10px', backgroundColor: "#4747ff"}}/>
                </tr>
            </tfoot>
        </table>
        </div>
        </>
      )
    }
  }
  export default Profile;