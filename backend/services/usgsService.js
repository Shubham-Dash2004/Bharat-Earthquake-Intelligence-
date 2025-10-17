const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const Alert = require('../models/Alert');

const USGS_API_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson';

const fetchAndSaveEarthquakes = async () => {
  const syncId = uuidv4();
  try {
    const response = await axios.get(USGS_API_URL);
    const features = response.data.features;
    let newAlertsCount = 0;
    let updatedAlertsCount = 0;
    const newAlertsData = []; // <-- Array to hold the new alert objects

    for (const feature of features) {
      const { mag, place, url } = feature.properties;
      const [longitude, latitude] = feature.geometry.coordinates;

      const result = await Alert.findOneAndUpdate(
        { source: url },
        {
          $set: {
            title: `Magnitude ${mag} Earthquake`,
            description: `${place}.`,
            location: { type: 'Point', coordinates: [longitude, latitude] },
            severity: mag > 6 ? 'High' : 'Medium',
            verified: true,
            syncId: syncId
          }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Check if the document was newly created (upserted)
      if (result.createdAt.getTime() === result.updatedAt.getTime()) {
        newAlertsCount++;
        newAlertsData.push(result); // <-- Add the full new alert to our array
      } else {
        updatedAlertsCount++;
      }
    }

    const deleteResult = await Alert.deleteMany({
      source: { $regex: /^https:\/\/earthquake\.usgs\.gov/ },
      syncId: { $ne: syncId }
    });
    
    console.log(`USGS Sync Complete. New: ${newAlertsCount}, Updated: ${updatedAlertsCount}, Removed: ${deleteResult.deletedCount}`);
    
    // Return the new array along with the counts
    return { 
      success: true, 
      new: newAlertsCount, 
      updated: updatedAlertsCount, 
      removed: deleteResult.deletedCount,
      newAlertsData: newAlertsData // <-- Include the new data in the response
    };

  } catch (error) {
    console.error('Error during USGS data synchronization:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { fetchAndSaveEarthquakes };