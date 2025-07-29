import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Rules({ token }) {
  const [rules, setRules] = useState([]);
  const [type, setType] = useState('length');
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // New state for success messages
  const [loading, setLoading] = useState(false); // New state for loading
  const API = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchRules = async () => {
      setLoading(true); // Start loading
      setError(''); // Clear previous errors
      try {
        const res = await axios.get(`${API}/rules`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRules(res.data);
      } catch (err) {
        setError('Failed to fetch rules');
      } finally {
        setLoading(false); // End loading
      }
    };
    fetchRules();
  }, [token]);

  const addRule = async e => {
    e.preventDefault();
    setError('');
    setSuccess(''); // Clear previous success messages
    try {
      await axios.post(`${API}/rules`, { type, value }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setValue('');
      setSuccess('Rule added successfully!'); // Set success message
      // Refresh rules after adding
      const res = await axios.get(`${API}/rules`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRules(res.data);
      setTimeout(() => setSuccess(''), 3000); // Clear success message after 3 seconds
    } catch (err) {
      setError('Failed to add rule');
    }
  };

  const deleteRule = async id => {
    setError('');
    setSuccess(''); // Clear previous success messages
    try {
      await axios.delete(`${API}/rules/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Rule deleted successfully!'); // Set success message
      // Refresh rules after deleting
      const res = await axios.get(`${API}/rules`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRules(res.data);
      setTimeout(() => setSuccess(''), 3000); // Clear success message after 3 seconds
    } catch (err) {
      setError('Failed to delete rule');
    }
  };

  return (
    <div className="card"> {/* Added .card class */}
      <h2 style={{ textAlign: 'center' }}>Your Rules</h2>
      <form onSubmit={addRule}>
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="length">Length</option>
          <option value="startsWith">Starts With</option>
          <option value="regex">Regex</option>
        </select>
        <input
          placeholder="Value"
          value={value}
          onChange={e => setValue(e.target.value)}
        />
        <button type="submit">Add Rule</button>
      </form>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginTop: 8 }}>{success}</div>} {/* Display success message */}

      {loading ? (
        <div style={{ textAlign: 'center', color: '#1976d2', marginTop: 20 }}>Loading rules...</div>
      ) : (
        <ul>
          {rules.length === 0 && !error ? (
            <p style={{ textAlign: 'center', color: '#555' }}>No rules added yet.</p>
          ) : (
            rules.map(rule => (
              <li key={rule._id}>
                <b>{rule.type}</b>: {rule.value}
                <button onClick={() => deleteRule(rule._id)}>Delete</button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}