import React from 'react'
import { Router, Route, hashHistory, IndexRoute, Link } from 'react-router'

const LoggedOutNav = (props) => {

  return (
    <div className="mainNav">
      <Link to="/" className="logo">ReTok</Link>

      <form id= "loginForm" onSubmit={(event)=>{event.preventDefault(); props.loggingIn(document.getElementById('usernameLogIn').value, document.getElementById('passwordLogIn').value);}}>
        <input id ="usernameLogIn" className="NavInputForm" placeholder="username"/>
        <input id= "passwordLogIn" className="NavInputForm" placeholder="password"/>
        <button className = "loginButton">
          Log In!
        </button>
      </form>
    </div>
  )
}

export default LoggedOutNav