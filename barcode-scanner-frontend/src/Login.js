import React, { useState } from 'react';
import axios from 'axios';

export default function Login({ setToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const API = process.env.REACT_APP_API_URL;

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const url = isRegister
        ? `${API}/auth/register`
        : `${API}/auth/login`;
      const res = await axios.post(url, { username, password });
      if (!isRegister) setToken(res.data.token);
      else setIsRegister(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error');
    }
  };

  return (
    <div className="card"> {/* Added .card class */}
      <h2 style={{ textAlign: 'center' }}>{isRegister ? 'Register' : 'Login'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button type="submit" style={{ width: '100%' }}>
          {isRegister ? 'Register' : 'Login'}
        </button>
      </form>
      <button
        onClick={() => setIsRegister(!isRegister)}
        style={{
          background: '#eee',
          color: '#1976d2',
          width: '100%',
          marginTop: 8,
          border: '1px solid #1976d2'
        }}
      >
        {isRegister ? 'Have an account? Login' : 'No account? Register'}
      </button>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </div>
  );
}