import React from 'react';
import { Link } from 'react-router-dom';
import './SafetyHub.css';

const SafetyHub = () => {
  return (
    <div className="safety-hub-container">
      <h4>Safety & Preparation</h4>
      <Link to="/safety-tips" className="safety-hub-button">
        View Safety Guidelines
      </Link>
    </div>
  );
};

export default SafetyHub;