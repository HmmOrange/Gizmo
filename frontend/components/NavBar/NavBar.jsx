import React from 'react';
import { useNavigate } from "react-router-dom";
import './NavBar.css';

import logo from '../../assets/logo.png'; 

export default function NavBar() {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => navigate("/")}>
        <img src={logo} alt="Logo" />
        <span>Gizmo</span> 
      </div>

      <div className="navbar-actions">
        <button 
          className="btn-login" 
          onClick={() => navigate("/login")}
        >
          Log in
        </button>
        <button 
          className="btn-signup" 
          onClick={() => navigate("/signup")}
        >
          Sign up
        </button>
      </div>
    </nav>
  );
}