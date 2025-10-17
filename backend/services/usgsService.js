const axios = require('axios');
const { v4: uuidv4 } = require('uuid'); // Import the ID generator
const Alert = require('../models/Alert');

const USGS_API_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson';
const fetchAndSaveEarthquakes = async () => {
  // Generate a unique ID for this specific synchronization run.
  const syncId = uuidv4();

  try {
    const response = await axios.get(USGS_API_URL);
    const features = response.data.features;
    let newAlertsCount = 0;
    let updatedAlertsCount = 0;

    for (const feature of features) {
      const { mag, place, url } = feature.properties;
      const [longitude, latitude] = feature.geometry.coordinates;

      // Upsert the document and TAG it with the current syncId.
      const result = await Alert.findOneAndUpdate(
        { source: url },
        {
          $set: {
            title: `Magnitude ${mag} Earthquake`,
            description: `${place}.`,
            location: { type: 'Point', coordinates: [longitude, latitude] },
            severity: mag > 6 ? 'High' : 'Medium',
            verified: true,
            syncId: syncId // Tag with the current run's ID
          }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      if (result.createdAt.getTime() === result.updatedAt.getTime()) {
        newAlertsCount++;
      } else {
        updatedAlertsCount++;
      }
    }

    // After tagging all fresh documents, delete any USGS documents
    // that DO NOT have the current syncId. These are the stale ones.
    const deleteResult = await Alert.deleteMany({
      source: { $regex: /^https:\/\/earthquake\.usgs\.gov/ },
      syncId: { $ne: syncId } // $ne means "not equal to"
    });
    
    console.log(`USGS Sync Complete. New: ${newAlertsCount}, Updated: ${updatedAlertsCount}, Removed: ${deleteResult.deletedCount}`);
    return { success: true, new: newAlertsCount, updated: updatedAlertsCount, removed: deleteResult.deletedCount };

  } catch (error) {
    console.error('Error during USGS data synchronization:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { fetchAndSaveEarthquakes };