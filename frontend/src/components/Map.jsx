import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';
// ... (imports)
import { lowSeverityIcon, mediumSeverityIcon, highSeverityIcon, criticalSeverityIcon, unverifiedIcon } from '../utils/leafletIcons';

const getIcon = (alert) => {
  // The most important rule: if it's not verified, use the unverified icon.
  if (!alert.verified) {
    return unverifiedIcon;
  }
  // Otherwise, use severity.
  switch (alert.severity) {
    case 'Low': return lowSeverityIcon;
    case 'Medium': return mediumSeverityIcon;
    case 'High': return highSeverityIcon;
    case 'Critical': return criticalSeverityIcon;
    default: return mediumSeverityIcon;
  }
};

// ... (imports and getIcon function are correct) ...

const Map = ({ alerts }) => {
  return (
    <MapContainer center={[20, 0]} zoom={3} scrollWheelZoom={true} className="map-container">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {alerts.map(alert => (
        <Marker
          key={alert._id}
          position={[alert.location.coordinates[1], alert.location.coordinates[0]]}
          icon={getIcon(alert)}
        >
          <Popup>
            <> {/* <-- Add opening fragment tag */}
              {!alert.verified && <strong style={{color: '#dc3545'}}>UNVERIFIED REPORT</strong>}
              <strong>{alert.title}</strong><br />
              {alert.description}<br />
              <small>Severity: {alert.severity}</small>
            </> {/* <-- Add closing fragment tag */}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;


