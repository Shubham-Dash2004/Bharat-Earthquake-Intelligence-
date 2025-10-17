import {React, useState } from 'react';
import api from '../api'; // <-- ADD THIS (path is different)
import './AdminControls.css';

const AdminControls = ({ onRefresh }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRefresh = async () => {
    setIsLoading(true);
    setIsSuccess(false);
    
    try {
      // Step 1: Command the backend to run a new synchronization.
      // This is the command that will produce the log in your terminal.
      await api.post('/alerts/fetch-usgs'); // <-- TO THIS

      // Step 2: AFTER the sync is done, call the onRefresh function 
      // from App.jsx to fetch the results and update the UI.
      await onRefresh();
      
      setIsSuccess(true);
    } catch (error) {
      console.error('Refresh error:', error);
    }
    
    setIsLoading(false);

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