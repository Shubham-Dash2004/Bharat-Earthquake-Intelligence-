const cron = require('node-cron');
const { fetchAndSaveEarthquakes } = require('../services/usgsService');

// Schedule the task to run every 15 minutes
// Cron expression: '*/15 * * * *'
//  - Once a week (Sunday at 2 AM): '0 2 * * 0'
// more details in planning.txt file 
//// Runs every day at 2:00 AM
//'0 2 * * *'
const usgsJob = cron.schedule('0 2 * * *', () => {
  console.log('Running scheduled job: Fetching USGS earthquake data...');
  fetchAndSaveEarthquakes();
}, {
  scheduled: false // We will start it manually in index.js
});

module.exports = usgsJob;


