import L from 'leaflet';

// This is a much simpler and more reliable way to create custom HTML icons.
const createDivIcon = (severity) => {
  return L.divIcon({
    html: `
      <div class="marker-pin"></div>
      <div class="marker-dot ${severity.toLowerCase()}"></div>
    `,
    className: 'custom-marker-icon', // A wrapper class
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -35]
  });
};

export const lowSeverityIcon = createDivIcon('Low');
export const mediumSeverityIcon = createDivIcon('Medium');
export const highSeverityIcon = createDivIcon('High');
export const criticalSeverityIcon = createDivIcon('Critical');
export const unverifiedIcon = createDivIcon('Unverified'); // Add this line

// This part is still necessary to fix the default shadow path issue.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/marker-icon-2x.png',
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
});