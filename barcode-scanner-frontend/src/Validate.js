import React, { useState } from 'react';
import axios from 'axios';

export default function Validate({ token }) {
  const [barcode, setBarcode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleValidate = async e => {
    e.preventDefault();
    setError('');
    setResult(null);
    try {
      const res = await axios.post('http://localhost:5000/api/validate', { barcode }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(res.data);
    } catch (err) {
      setError('Validation failed');
    }
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center' }}>Validate Barcode</h2>
      <form onSubmit={handleValidate}>
        <input
          placeholder="Enter barcode"
          value={barcode}
          onChange={e => setBarcode(e.target.value)}
        />
        <button type="submit" style={{ width: '100%' }}>Validate</button>
      </form>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      {result && (
        <div style={{ marginTop: 16 }}>
          <h3>Result: {result.allPassed ? '✅ Valid' : '❌ Invalid'}</h3>
          <ul>
            {result.results.map((r, i) => (
              <li key={i}>
                <b>{r.rule.type}</b> ({r.rule.value}): {r.passed ? '✅' : '❌'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}