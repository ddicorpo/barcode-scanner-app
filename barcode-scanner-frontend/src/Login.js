import React, { useState } from 'react';
import Login from './Login';
import Rules from './Rules';
import Validate from './Validate';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [page, setPage] = useState('rules');

  const handleSetToken = t => {
    setToken(t);
    localStorage.setItem('token', t);
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('token');
  };

  if (!token) return <Login setToken={handleSetToken} />;

  return (
    <div className="app-container">
      <h1 style={{ textAlign: 'center', color: '#1976d2', marginBottom: 24 }}>Barcode Rule Checker</h1>
      <nav>
        <button onClick={() => setPage('rules')}>Rules</button>
        <button onClick={() => setPage('validate')}>Validate Barcode</button>
        <button onClick={handleLogout}>Logout</button>
      </nav>
      {page === 'rules' && <Rules token={token} />}
      {page === 'validate' && <Validate token={token} />}
    </div>
  );
}

export default App;