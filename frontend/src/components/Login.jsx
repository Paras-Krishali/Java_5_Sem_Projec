import React from 'react';
import { API_BASE_URL } from '../services/api';

const Login = ({ user }) => {
  const handleLogin = () => {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
  };

  const handleLogout = () => {
    window.location.href = `${API_BASE_URL}/logout`;
  };

  return (
    <div className="user-section">
      {user ? (
        <div className="user-profile">
          <div className="avatar">
            {user.name ? user.name.charAt(0) : 'U'}
          </div>
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-email">{user.email}</div>
          </div>
          <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <button className="btn btn-primary" onClick={handleLogin}>Login with Google</button>
      )}
    </div>
  );
};

export default Login;
