import React from 'react';

const Loader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px' }}>
    <div className="loader" style={{
      border: '8px solid #f3f3f3',
      borderTop: '8px solid #3498db',
      borderRadius: '50%',
      width: '48px',
      height: '48px',
      animation: 'spin 1s linear infinite'
    }} />
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

export default Loader; 