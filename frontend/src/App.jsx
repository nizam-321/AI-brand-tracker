import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Signup from './components/Signup';

const API_URL = 'http://localhost:5000/api';
let socket;

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login'); // 'login', 'signup', 'dashboard'

  useEffect(() => {
    if (token) {
      // Get user data
      axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setUser(res.data);
        setView('dashboard');
        
        // Connect socket
        socket = io('http://localhost:5000');
        
        // Subscribe to user's brands
        if (res.data.brands && res.data.brands.length > 0) {
          res.data.brands.forEach(brand => {
            socket.emit('subscribe_brand', brand);
          });
        }
      })
      .catch(err => {
        console.error('Auth error:', err);
        localStorage.removeItem('token');
        setToken(null);
        setView('login');
      });
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [token]);

  const handleLogin = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setView('dashboard');
    } catch (error) {
      throw error;
    }
  };

  const handleSignup = async (name, email, password, company, brands) => {
    try {
      const res = await axios.post(`${API_URL}/auth/signup`, { 
        name, email, password, company, brands 
      });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setView('dashboard');
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setView('login');
    if (socket) socket.disconnect();
  };

  if (!token || view === 'login') {
    return (
      <Login 
        onLogin={handleLogin} 
        onSwitchToSignup={() => setView('signup')} 
      />
    );
  }

  if (view === 'signup') {
    return (
      <Signup 
        onSignup={handleSignup} 
        onSwitchToLogin={() => setView('login')} 
      />
    );
  }

  return (
    <Dashboard 
      user={user} 
      token={token} 
      socket={socket} 
      onLogout={handleLogout} 
    />
  );
}

export default App;