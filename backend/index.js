require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // <-- 1. Import the cors middleware

const alertRoutes = require('./routes/alertRoutes');
const usgsJob = require('./jobs/usgsScheduler');
const { fetchAndSaveEarthquakes } = require('./services/usgsService');

const app = express();

// --- 2. THE CRITICAL FIX ---
// We tell our app to USE the cors middleware.
// This will allow all cross-origin requests by default.
app.use(cors());
// --------------------------

app.use(express.json());
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB'))
  .catch(err => console.error('Connection error', err));

app.get('/', (req, res) => res.send('Bharat Earthquake Intelligence Backend is Running!'));
app.use('/api/alerts', alertRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  usgsJob.start();
  console.log('USGS earthquake fetch job scheduled to run daily at 2 AM.');

  console.log('Performing initial USGS data fetch on server startup...');
  fetchAndSaveEarthquakes();
});