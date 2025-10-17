require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');


const alertRoutes = require('./routes/alertRoutes');
const usgsJob = require('./jobs/usgsScheduler'); // Import the job
const { fetchAndSaveEarthquakes } = require('./services/usgsService'); // Import the service

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB'))
  .catch(err => console.error('Connection error', err));

app.get('/', (req, res) => res.send('Smart Disaster Alert Agent Backend is Running!'));
app.use('/api/alerts', alertRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Start the scheduled job
  usgsJob.start();
  console.log('USGS earthquake fetch job scheduled to run every Day at 2 AM.');

  // Optional: Run once immediately on server start for fresh data
  console.log('Performing initial USGS data fetch on server startup...');
  fetchAndSaveEarthquakes();
});