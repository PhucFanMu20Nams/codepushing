import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Reset form mỗi khi vào lại trang login
  useEffect(() => {
    setUsername('');
    setPassword('');
    setError('');
    setIsLoading(false);
    console.log('Reset login form');
  }, [location.pathname]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Save token to localStorage
        localStorage.setItem('adminToken', data.data.token);
        localStorage.setItem('adminUsername', data.data.admin.username);
        setError('');
        navigate('/admin/dashboard');
      } else {
        setError(data.error?.message || 'Login failed');
        setPassword(''); // Clear password field after wrong attempt
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Connection error. Please try again.');
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-container">
        <h2 className="login-title">Textura</h2>
        <h3 className="login-subtitle">Welcome back</h3>
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="login-field">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="login-field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="off"
            />
          </div>
          {error && <div className="login-error">{error}</div>}
          <button type="submit" className="login-btn">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;