import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Make sure Link is imported here
import './AnalyzeTextForm.css';

const AnalyzeTextForm = () => {
  const [text, setText] = useState('');
  // State to hold the full verification object { verdict: "...", reason: "..." }
  const [verification, setVerification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setVerification(null); // Reset previous results

    try {
      // The backend now returns { success, extractedClaim, verification }
      const response = await axios.post('/api/alerts/analyze', { text });
      setVerification(response.data.verification); // Store the final verdict
    } catch (err) {
      setError(err.response?.data?.error || 'An internal error occurred.');
      console.error(err);
    }
    setIsLoading(false);
  };

  // Helper function to determine the CSS class for the verdict
  const getVerdictClass = () => {
    if (!verification) return '';
    switch (verification.verdict) {
      case 'Confirmed':
        return 'verdict-confirmed';
      case 'Not Found':
        return 'verdict-not-found';
      default:
        return 'verdict-inconclusive';
    }
  };

  return (
    <div className="analysis-form-container">
      <h3>Bharat Earthquake Intelligence (BEI)</h3>
      <p className="form-description">Paste a rumor or news from social media. Our agent will investigate it against official sources.</p>
      <form onSubmit={handleAnalyze}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g., I heard there was an earthquake in Surat..."
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Investigating...' : 'Investigate Claim'}
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}

      {verification && !error && (
        <div className="results-container">
          <h4 className="verdict-title">Investigation Result</h4>
          <div className={`verdict-box ${getVerdictClass()}`}>
            <span className="verdict-status">{verification.verdict}</span>
            <p className="verdict-reason">
              {verification.details || verification.reason}
            </p>
            {verification.source && (
              <a href={verification.source} target="_blank" rel="noopener noreferrer" className="source-link">
                View Official Source
              </a>
            )}
          </div>
        </div>
      )}
     
    </div>
  );
};

export default AnalyzeTextForm;