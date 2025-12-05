import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import logo from '../assets/OIP-removebg-preview.png';

export default function Login({ onLoggedIn }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();


  const submit = async e => {
    e.preventDefault();
    setMsg('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email: username, password });
      
      // Call onLoggedIn to handle routing logic in App.jsx
      if (onLoggedIn) {
        onLoggedIn(res.data.user, res.data.token);
      } else {
        // Fallback: Store user data and token, then navigate to user dashboard
        localStorage.setItem('user', JSON.stringify(res.data.user));
        localStorage.setItem('token', res.data.token);
        navigate('/user', { 
          state: { 
            flash: `Welcome back, ${res.data.user.fullName || res.data.user.username}!`,
            user: res.data.user 
          } 
        });
      }
    } catch (err) {
      setMsg(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: '#ffffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
    }}>
      {/* Static Background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(45deg, rgba(0, 38, 255, 0.05) 0%, rgba(0, 38, 255, 0.08) 25%, rgba(0, 38, 255, 0.05) 50%, rgba(0, 38, 255, 0.08) 75%, rgba(0, 38, 255, 0.05) 100%)',
        zIndex: 1,
        pointerEvents: 'none',
      }}></div>
      <div style={{
        width: '500px',
        padding: '20px',
        background: '#ffffffff',
        border: '1px solid #004cffff',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        textAlign: 'center',
      }}>
        <img src={logo} alt="Logo" style={{ width: '100px', height: '100px', marginBottom: '10px' }} />
        <h2 style={{ fontSize: '24px', color: '#333', marginBottom: '10px' }}>Welcome to LeaveLink</h2>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
          "Streameline Your Time Off: Effortless Leave Management"
        </p>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontWeight: 'bold', fontSize: '16px', color: '#333', textAlign: 'left' }}>Email</label>
          <input
            type="email"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Enter your email"
            style={{
              padding: '10px',
              fontSize: '16px',
              background: '#fff',
              color: '#111',
              border: '1px solid #010101ff',
              borderRadius: '4px',
              marginBottom: '10px',
            }}
          />
          <label style={{ fontWeight: 'bold', fontSize: '16px', color: '#333', textAlign: 'left' }}>Password</label>
          <div style={{ position: 'relative', marginBottom: '10px' }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                padding: '10px 40px 10px 10px',
                fontSize: '16px',
                background: '#fff',
                color: '#111',
                border: '1px solid #010101ff',
                borderRadius: '4px',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '0',
                color: '#666',
              }}
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
          <button
            disabled={loading}
            style={{
              padding: '10px',
              background: '#0040ffff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginBottom: '10px',
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          {msg && <div style={{ color: '#ff0000', fontSize: '14px', marginBottom: '10px' }}>{msg}</div>}
        </form>
        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          <a href="#" style={{ fontSize: '14px', color: '#000000ff', textDecoration: 'underline' }}>Forgot Password?</a>
        </div>
      </div>
    </div>
  );
}