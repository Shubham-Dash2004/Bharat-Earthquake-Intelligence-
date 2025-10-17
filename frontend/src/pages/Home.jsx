import React from 'react';
import Map from '../components/Map';
import AnalyzeTextForm from '../components/AnalyzeTextForm';
import AdminControls from '../components/AdminControls';
import SafetyHub from '../components/SafetyHub'; // <-- Import the new component
// Note: We need to pass the alerts and the fetchAlerts function down
const Home = ({ alerts, fetchAlerts }) => {
  return (
    <>
      <AnalyzeTextForm />
      <AdminControls onNewAlerts={fetchAlerts} />
      <SafetyHub /> {/* <-- Add the component here */}
      <Map alerts={alerts} />
    </>
  );
};

export default Home;