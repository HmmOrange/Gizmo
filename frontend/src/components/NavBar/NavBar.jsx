import React, { useContext } from 'react';
import { useNavigate } from "react-router-dom";
import './NavBar.css';
import { AuthContext } from "../../context/AuthContext";
import logo from '../../assets/logo.png';

export default function NavBar() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => navigate("/")}>
        <img src={logo} alt="Logo" />
        <span>Gizmo</span> 
      </div>

      <div className="navbar-actions">
        {!user && (
          <>
            <button className="btn-login" onClick={() => navigate("/login")}>
              Log in
            </button>
            <button className="btn-signup" onClick={() => navigate("/signup")}>
              Sign up
            </button>
          </>
        )}

        {user && (
          <>
            <span className="navbar-username">Hello, {user.username}</span>
            <button className="btn-logout" onClick={logout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
