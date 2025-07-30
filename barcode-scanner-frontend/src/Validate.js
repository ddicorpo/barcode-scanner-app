import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';

const API = process.env.REACT_APP_API_URL;

export default function Validate({ token }) {
  const [barcode, setBarcode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [rules, setRules] = useState([]);
  const [selectedRuleIds, setSelectedRuleIds] = useState([]);
  const html5QrCodeRef = useRef(null);
  const scannerRunningRef = useRef(false);

  // Fetch rules on mount
  useEffect(() => {
    axios.get(`${API}/rules`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setRules(res.data);
        // Select all rules by default
        setSelectedRuleIds(res.data.map(rule => rule._id));
      })
      .catch(() => setRules([]));
  }, [token]);

  const handleRuleChange = (ruleId) => {
    setSelectedRuleIds(prev =>
      prev.includes(ruleId)
        ? prev.filter(id => id !== ruleId)
        : [...prev, ruleId]
    );
  };

  const selectAllRules = () => {
    setSelectedRuleIds(rules.map(rule => rule._id));
  };

  const deselectAllRules = () => {
    setSelectedRuleIds([]);
  };

  const handleValidate = async e => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const payload = { barcode };
      if (selectedRuleIds.length > 0) {
        payload.ruleIds = selectedRuleIds;
      }
      const res = await axios.post(`${API}/validate`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(res.data);
    } catch (err) {
      setError('Validation failed. Please check the barcode or rules.');
    } finally {
      setLoading(false);
    }
  };

  const startScanner = () => {
    setError('');
    setShowScanner(true);
    setIsScanning(true);
  };

  const stopScanner = () => {
    if (html5QrCodeRef.current && scannerRunningRef.current) {
      try {
        html5QrCodeRef.current.stop()
          .then(() => {
            scannerRunningRef.current = false;
            if (html5QrCodeRef.current) {
              html5QrCodeRef.current.clear();
              html5QrCodeRef.current = null;
            }
          })
          .catch(() => {
            scannerRunningRef.current = false;
            html5QrCodeRef.current = null;
          });
      } catch (err) {
        // Swallow synchronous errors
        scannerRunningRef.current = false;
        html5QrCodeRef.current = null;
      }
    } else {
      html5QrCodeRef.current = null;
      scannerRunningRef.current = false;
    }
    setShowScanner(false);
    setIsScanning(false);
  };

  useEffect(() => {
    if (showScanner && isScanning && !scannerRunningRef.current) {
      const initScanner = async () => {
        try {
          const html5QrCode = new Html5Qrcode("qr-reader");
          html5QrCodeRef.current = html5QrCode;

          await html5QrCode.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 }
            },
            (decodedText) => {
              setBarcode(decodedText);
              stopScanner();
            },
            (errorMessage) => {
              // Don't show these as errors to user
            }
          );
          scannerRunningRef.current = true;
        } catch (err) {
          console.error('Scanner start error:', err);
          setError('Camera access failed. Please check permissions.');
          setShowScanner(false);
          setIsScanning(false);
          scannerRunningRef.current = false;
        }
      };

      initScanner();
    }

    return () => {
      if (html5QrCodeRef.current && scannerRunningRef.current) {
        try {
          html5QrCodeRef.current.stop()
            .then(() => {
              scannerRunningRef.current = false;
              if (html5QrCodeRef.current) {
                html5QrCodeRef.current.clear();
              }
            })
            .catch(() => {
              scannerRunningRef.current = false;
            });
        } catch (err) {
          // Swallow synchronous errors in cleanup
          scannerRunningRef.current = false;
          html5QrCodeRef.current = null;
        }
        html5QrCodeRef.current = null;
      } else {
        html5QrCodeRef.current = null;
        scannerRunningRef.current = false;
      }
    };
  }, [showScanner, isScanning]);

  return (
    <div className="card">
      <h2 style={{ textAlign: 'center' }}>Validate Barcode</h2>

      {/* Rule Selection Section */}
      <div style={{ marginBottom: 16, border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <b>Select rules to validate against:</b>
          <div>
            <button 
              type="button" 
              onClick={selectAllRules}
              style={{ fontSize: '12px', padding: '4px 8px', marginRight: 4, background: '#4CAF50' }}
            >
              All
            </button>
            <button 
              type="button" 
              onClick={deselectAllRules}
              style={{ fontSize: '12px', padding: '4px 8px', background: '#f44336' }}
            >
              None
            </button>
          </div>
        </div>
        
        {rules.length === 0 ? (
          <div style={{ color: '#666', fontStyle: 'italic' }}>No rules found. Create some rules first.</div>
        ) : (
          <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
            {rules.map(rule => (
              <label key={rule._id} style={{ display: 'block', margin: '4px 0', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selectedRuleIds.includes(rule._id)}
                  onChange={() => handleRuleChange(rule._id)}
                  style={{ marginRight: 8 }}
                />
                <span style={{ fontSize: '14px' }}>
                  <b>{rule.type}</b>: {rule.value}
                </span>
              </label>
            ))}
          </div>
        )}
        
        <div style={{ fontSize: '12px', color: '#666', marginTop: 8 }}>
          {selectedRuleIds.length} of {rules.length} rules selected
        </div>
      </div>

      {showScanner ? (
        <div style={{ marginBottom: 16 }}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <button
              onClick={stopScanner}
              style={{ background: '#f44336', marginBottom: 8 }}
            >
              Close Scanner
            </button>
          </div>
          <div 
            id="qr-reader" 
            style={{ 
              width: '100%', 
              border: '1px solid #ddd',
              borderRadius: '8px'
            }}
          ></div>
          <p style={{ textAlign: 'center', fontSize: '14px', color: '#666', marginTop: 8 }}>
            Point your camera at a barcode or QR code
          </p>
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <button
            onClick={startScanner}
            style={{ background: '#4CAF50', marginBottom: 8 }}
          >
            📷 Scan Barcode
          </button>
        </div>
      )}

      <form onSubmit={handleValidate}>
        <input
          placeholder="Enter barcode or scan above"
          value={barcode}
          onChange={e => setBarcode(e.target.value)}
        />
        <button 
          type="submit" 
          style={{ width: '100%' }}
          disabled={selectedRuleIds.length === 0}
        >
          Validate Against {selectedRuleIds.length} Rule{selectedRuleIds.length !== 1 ? 's' : ''}
        </button>
      </form>

      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', color: '#1976d2', marginTop: 20 }}>
          Validating barcode...
        </div>
      ) : (
        result && (
          <div style={{ marginTop: 16 }}>
            <h3>Result: {result.allPassed ? '✅ Valid' : '❌ Invalid'}</h3>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>
              Tested against {result.totalRules || result.results.length} rule{(result.totalRules || result.results.length) !== 1 ? 's' : ''}
            </div>
            <ul>
              {result.results.map((r, i) => (
                <li key={i}>
                  <b>{r.rule.type}</b> ({r.rule.value}): {r.passed ? '✅' : '❌'}
                </li>
              ))}
            </ul>
          </div>
        )
      )}
    </div>
  );
}