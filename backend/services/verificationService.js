
const axios = require('axios');
const { getDistance } = require('geolib');

const GEOCODING_API_URL = 'https://nominatim.openstreetmap.org/search?format=json&q=';
// We will search the 7-day feed to ensure we find a match, even if our daily sync is off.
const USGS_API_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson';

const SEARCH_PASSES = [
  { radiusKm: 150, magnitudeTolerance: 0.3, name: 'a precise' },
  { radiusKm: 300, magnitudeTolerance: 0.6, name: 'a likely' },
  { radiusKm: 500, magnitudeTolerance: 1.0, name: 'a possible' }
];

async function verifyEarthquakeClaim(claim) {
  const { location, magnitude } = claim;

  let claimCoords;
  try {
    // --- THIS IS THE CRITICAL FIX ---
    // We are adding a 'headers' object to the Axios request to identify our application.
    const geoResponse = await axios.get(`${GEOCODING_API_URL}${encodeURIComponent(location)}`, {
      headers: {
        'User-Agent': 'Bharat Earthquake Intelligence (BEI)/1.0 (your-email@example.com)' // Replace with your email if you wish
      }
    });
    // ------------------------------------

    if (geoResponse.data.length === 0) {
      return { verdict: "Inconclusive", reason: `Could not find geographic coordinates for "${location}".` };
    }
    claimCoords = { latitude: parseFloat(geoResponse.data[0].lat), longitude: parseFloat(geoResponse.data[0].lon) };
  } catch (error) {
    console.error("Geocoding API Error:", error.message); // Add more detailed logging for the server
    return { verdict: "Inconclusive", reason: "Failed to geocode the location due to an external service error." };
  }

  // The rest of the function is already correct.
  let officialEvents;
  try {
    const usgsResponse = await axios.get(USGS_API_URL);
    officialEvents = usgsResponse.data.features;
  } catch (error) {
    return { verdict: "Inconclusive", reason: "Could not fetch latest data from official sources (USGS)." };
  }

  for (const pass of SEARCH_PASSES) {
    for (const event of officialEvents) {
      const eventCoords = {
        latitude: event.geometry.coordinates[1],
        longitude: event.geometry.coordinates[0],
      };
      const eventMagnitude = event.properties.mag;

      const distanceInKm = getDistance(claimCoords, eventCoords) / 1000;
      
      const isNearby = distanceInKm <= pass.radiusKm;
      const isSimilarMagnitude = Math.abs(magnitude - eventMagnitude) <= pass.magnitudeTolerance;

      if (isNearby && isSimilarMagnitude) {
        return {
          verdict: "Confirmed",
          details: `Found ${pass.name} match: An official event of magnitude ${eventMagnitude} was reported ${Math.round(distanceInKm)} km away.`,
          source: event.properties.url
        };
      }
    }
  }

  return {
    verdict: "Not Found",
    reason: `No official earthquake matching the claim (Magnitude ~${magnitude} near ${location}) was found in the records for the past 7 days.`
  };
}

module.exports = { verifyEarthquakeClaim };