const axios = require('axios');
const { getDistance } = require('geolib');

const GEOCODING_API_URL = 'https://nominatim.openstreetmap.org/search?format=json&q=';
// We will search the 7-day feed to ensure we find a match, even if our daily sync is off.
const USGS_API_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson';

// --- SEARCH PARAMETERS ---
// We define our search tolerances here for easy adjustment.
const SEARCH_PASSES = [
  // Pass 1: "Perfect Match" - Very close and very similar magnitude.
  { radiusKm: 150, magnitudeTolerance: 0.3, name: 'a precise' },
  // Pass 2: "Likely Match" - Wider area, more flexible magnitude.
  { radiusKm: 300, magnitudeTolerance: 0.6, name: 'a likely' },
  // Pass 3: "Possible Match" - Very wide area, for very generic locations.
  { radiusKm: 500, magnitudeTolerance: 1.0, name: 'a possible' }
];

async function verifyEarthquakeClaim(claim) {
  const { location, magnitude } = claim;

  // Step 1: Geocode the claimed location (same as before).
  let claimCoords;
  try {
    const geoResponse = await axios.get(`${GEOCODING_API_URL}${encodeURIComponent(location)}`);
    if (geoResponse.data.length === 0) {
      return { verdict: "Inconclusive", reason: `Could not find geographic coordinates for "${location}".` };
    }
    claimCoords = { latitude: parseFloat(geoResponse.data[0].lat), longitude: parseFloat(geoResponse.data[0].lon) };
  } catch (error) {
    return { verdict: "Inconclusive", reason: "Failed to geocode the location." };
  }

  // Step 2: Fetch official data (same as before).
  let officialEvents;
  try {
    const usgsResponse = await axios.get(USGS_API_URL);
    officialEvents = usgsResponse.data.features;
  } catch (error) {
    return { verdict: "Inconclusive", reason: "Could not fetch latest data from official sources (USGS)." };
  }

  // Step 3: The new Multi-Pass Search Logic.
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

  // Step 4: If no match is found after all passes.
  return {
    verdict: "Not Found",
    reason: `No official earthquake matching the claim (Magnitude ~${magnitude} near ${location}) was found in the records for the past 7 days.`
  };
}

module.exports = { verifyEarthquakeClaim };