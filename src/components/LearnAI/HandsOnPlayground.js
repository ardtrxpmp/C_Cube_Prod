import React from 'react';

const HandsOnPlayground = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
      color: 'white',
      padding: '2rem'
    }}>
      <h1 style={{
        fontSize: '3rem',
        textAlign: 'center',
        marginBottom: '2rem',
        background: 'linear-gradient(45deg, #4CAF50, #8BC34A)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        Educational Learning Hub
      </h1>
      
      <div style={{
        background: '#1a1a2e',
        padding: '2rem',
        borderRadius: '10px',
        textAlign: 'center'
      }}>
        <h2>Interactive Blockchain Education</h2>
        <p>Learn blockchain concepts through educational content and examples.</p>
        <p>All content is designed for educational purposes only.</p>
        
        <div style={{ marginTop: '2rem', textAlign: 'left' }}>
          <h3>Available Learning Topics:</h3>
          <ul>
            <li>Blockchain fundamentals and structure</li>
            <li>Cryptocurrency and digital assets</li>
            <li>Wallet concepts and security</li>
            <li>Cryptographic principles</li>
            <li>Decentralized networks</li>
            <li>Smart contracts (conceptual)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HandsOnPlayground;
