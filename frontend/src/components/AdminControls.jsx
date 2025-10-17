import React, { useState } from 'react';
import axios from 'axios';
import './AdminControls.css';

const AdminControls = ({ onNewAlerts }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // New state for success feedback

  const handleRefresh = async () => {
    setIsLoading(true);
    setIsSuccess(false); // Reset success state on new click
    
    try {
      // We still call the backend, but we no longer need to read the response details here.
      await axios.post('/api/alerts/fetch-usgs');
      
      // Call the function to refresh the map data in the parent component.
      onNewAlerts(); 
      
      // Set success state to true to give user feedback.
      setIsSuccess(true);
    } catch (error) {
      console.error('Refresh error:', error);
      // We can add an error state later if desired, but for now, we just log it.
    }
    
    setIsLoading(false);

    // After a successful refresh, revert the button back to its normal state after 2 seconds.
    setTimeout(() => {
      setIsSuccess(false);
    }, 2000);
  };

  return (
    <div className="admin-controls-container">
      <h4>Data Sources</h4>
      <button 
        onClick={handleRefresh} 
        disabled={isLoading || isSuccess}
        // Dynamically change the button's style based on its state
        className={`refresh-button ${isSuccess ? 'success-state' : ''}`}
      >
        {isLoading && 'Refreshing...'}
        {isSuccess && 'Refreshed!'}
        {!isLoading && !isSuccess && 'Refresh Data'}
      </button>
    </div>
  );
};

export default AdminControls;