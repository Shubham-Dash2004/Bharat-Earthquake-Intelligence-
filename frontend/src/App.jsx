import React from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SafetyTips from './pages/SafetyTips';
import './App.css';

function App() {
  const [alerts, setAlerts] = React.useState([]);

  const fetchAlerts = async () => {
    try {
      const response = await axios.get('/api/alerts');
      setAlerts(response.data.data);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  };

  React.useEffect(() => {
    fetchAlerts();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home alerts={alerts} fetchAlerts={fetchAlerts} />} />
        <Route path="/safety-tips" element={<SafetyTips />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;