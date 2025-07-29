import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Rules({ token }) {
  const [rules, setRules] = useState([]);
  const [type, setType] = useState('length');
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/rules', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRules(res.data);
      } catch (err) {
        setError('Failed to fetch rules');
      }
    };
    fetchRules();
  }, [token]);

  const addRule = async e => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('http://localhost:5000/api/rules', { type, value }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setValue('');
      // Refresh rules
      const res = await axios.get('http://localhost:5000/api/rules', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRules(res.data);
    } catch (err) {
      setError('Failed to add rule');
    }
  };

  const deleteRule = async id => {
    try {
      await axios.delete(`http://localhost:5000/api/rules/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh rules
      const res = await axios.get('http://localhost:5000/api/rules', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRules(res.data);
    } catch (err) {
      setError('Failed to delete rule');
    }
  };

  return (
    <div>
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
      <ul>
        {rules.map(rule => (
          <li key={rule._id}>
            <b>{rule.type}</b>: {rule.value}
            <button onClick={() => deleteRule(rule._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}