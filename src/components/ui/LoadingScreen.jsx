import React from 'react';
import './LoadingScreen.css';

export default function LoadingScreen({ message = 'Loading…' }) {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-logo">🔥</div>
        <div className="loading-brand">BarkahFlow</div>
        <div className="loading-spinner">
          <span /><span /><span />
        </div>
        <div className="loading-msg">{message}</div>
      </div>
    </div>
  );
}
