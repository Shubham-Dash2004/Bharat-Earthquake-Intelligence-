import React from 'react';
import api from './api'; // <-- ADD THIS
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SafetyTips from './pages/SafetyTips';
import AlertManager from './components/AlertManager';
import './App.css';

// Key for storing seen alerts in the browser's memory
const SEEN_ALERTS_KEY = 'seenEarthquakeAlerts';

function App() {
  const [alerts, setAlerts] = React.useState([]);
  const [newAlertsForQueue, setNewAlertsForQueue] = React.useState([]);

  // --- Speech Synthesis Engine Warm-Up ---
  // This code runs once to handle browser security rules for audio.
  React.useEffect(() => {
    const primeSpeechSynthesis = () => {
      if ('speechSynthesis' in window) {
        const primeUtterance = new SpeechSynthesisUtterance('');
        window.speechSynthesis.speak(primeUtterance);
        window.speechSynthesis.cancel();
      }
    };

    const resumeSpeechOnClick = () => {
      if ('speechSynthesis' in window && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.removeEventListener('click', resumeSpeechOnClick);
    };

    primeSpeechSynthesis();
    window.addEventListener('click', resumeSpeechOnClick);

    return () => {
      window.removeEventListener('click', resumeSpeechOnClick);
    };
  }, []);


  // --- Main Data Fetching and Processing Logic ---
  const fetchAndProcessAlerts = async () => {
    try {
      const seenAlerts = JSON.parse(localStorage.getItem(SEEN_ALERTS_KEY)) || [];
      
      const response = await api.get('/alerts'); // <-- TO THIS
      const allRecentAlerts = response.data.data;

      const newDiscoveredAlerts = allRecentAlerts.filter(
        alert => !seenAlerts.includes(alert.source)
      );

      if (newDiscoveredAlerts.length > 0) {
        setNewAlertsForQueue(newDiscoveredAlerts);
      }

      setAlerts(allRecentAlerts);
      
      const allCurrentAlertIds = allRecentAlerts.map(alert => alert.source);
      localStorage.setItem(SEEN_ALERTS_KEY, JSON.stringify(allCurrentAlertIds));

    } catch (error) {
      console.error("Error fetching and processing alerts:", error);
    }
  };

  // This hook runs the main data function once when the app first loads.
  React.useEffect(() => {
    fetchAndProcessAlerts();
  }, []);

  return (
    <div className="App">
      <AlertManager newAlerts={newAlertsForQueue} />
      <BrowserRouter>
        <Routes>
          <Route 
            path="/" 
            element={<Home alerts={alerts} refreshData={fetchAndProcessAlerts} />} 
          />
          <Route path="/safety-tips" element={<SafetyTips />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;