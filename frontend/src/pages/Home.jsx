import React from 'react';
import Map from '../components/Map';
import AnalyzeTextForm from '../components/AnalyzeTextForm';
import AdminControls from '../components/AdminControls';
import SafetyHub from '../components/SafetyHub';

// The props are now simpler
const Home = ({ alerts, refreshData }) => {
  return (
    <>
      <AnalyzeTextForm />
      {/* Just pass the refreshData function to the button */}
      <AdminControls onRefresh={refreshData} />
      <SafetyHub />
      <Map alerts={alerts} />
    </>
  );
};

export default Home;