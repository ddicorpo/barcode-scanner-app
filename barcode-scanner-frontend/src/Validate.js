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
  const html5QrCodeRef = useRef(null);
  const scannerRunningRef = useRef(false); // Track if scanner is actually running

  const handleValidate = async e => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const res = await axios.post(`${API}/validate`, { barcode }, {
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
    } else {
      html5QrCodeRef.current = null;
      scannerRunningRef.current = false;
    }
    setShowScanner(false);
    setIsScanning(false);
  };

  // Start scanner after DOM is ready
  useEffect(() => {
    if (showScanner && isScanning && !scannerRunningRef.current) {
      const initScanner = async () => {
        try {
          const html5QrCode = new Html5Qrcode("qr-reader");
          html5QrCodeRef.current = html5QrCode;

          await html5QrCode.start(
            { facingMode: "user" },
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
        html5QrCodeRef.current = null;
      }
    };
  }, [showScanner, isScanning]);

  return (
    <div className="card">
      <h2 style={{ textAlign: 'center' }}>Validate Barcode</h2>

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
        <button type="submit" style={{ width: '100%' }}>Validate</button>
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