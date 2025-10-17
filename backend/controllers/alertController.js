require('dotenv').config(); // <-- ADD THIS LINE AT THE VERY TOP
// ... rest of the file is the same
const Alert = require('../models/Alert');
const { extractClaimFromText   } = require('../services/groqService'); // Import the service
const { fetchAndSaveEarthquakes } = require('../services/usgsService'); // Import the new service
const { verifyEarthquakeClaim } = require('../services/verificationService'); // Import the new service

// @desc    Get all alerts
// @route   GET /api/alerts
// @access  Public
const getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({});
    res.status(200).json({ success: true, count: alerts.length, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Create a new alert
// @route   POST /api/alerts
// @access  Public (for now)
const createAlert = async (req, res) => {
  try {
    const alert = await Alert.create(req.body);
    res.status(201).json({ success: true, data: alert });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Analyze text to create a structured alert
// @route   POST /api/alerts/analyze
// @access  Public
// This function will soon become the master verification function.
// For this step, it just extracts the claim.
const analyzeText = async (req, res) => {
  try {
    const { text } = req.body;
     if (!text) {
      return res.status(400).json({ success: false, error: 'Text is required' });
    }

    // Step 1: Extract the user's claim into a structured object.
      const claimResult = await extractClaimFromText(text);
    if (!claimResult.claim) {
      return res.status(400).json({ success: false, error: 'Could not understand the claim.' });
    }
    const userClaim = claimResult.claim;

 // --- DIAGNOSTIC LOGS ---
    // This is the most important step. We will now see what the AI is actually sending.
    console.log("--- RECEIVED CLAIM FROM AI ---");
    console.log(userClaim);
    console.log("----------------------------");
    // --- END DIAGNOSTIC LOGS ---

     // --- RESILIENT DATA NORMALIZATION ---
    // Handle the AI's inconsistency with the location key.
    userClaim.location = userClaim.location || userClaim.primary_location;
    // ------------------------------------


    // Step 2: Pass the structured claim to the verification service.
    // (For now, we only handle earthquakes)
     let verificationVerdict;
    
    // --- RESILIENT LOGIC CHECK ---
    // We check for the key we want ('event_type'), a key it might use ('disaster_type'),
    // AND the user's original text as the final, most reliable backup.
    const isEarthquakeClaim = userClaim.event_type === 'earthquake' ||
                              userClaim.disaster_type === 'earthquake' ||
                              text.toLowerCase().includes('earthquake');

    if (isEarthquakeClaim) {
      verificationVerdict = await verifyEarthquakeClaim(userClaim);
    } else {
      verificationVerdict = { verdict: "Unsupported", reason: "Currently, only earthquake claims can be verified." };
    }
    // Step 3: Return the final verdict to the user.
    res.status(200).json({ 
      success: true, 
      extractedClaim: userClaim,
      verification: verificationVerdict 
    });

  } catch (error) {
    console.error('Error in analyzeText controller:', error);
    res.status(500).json({ success: false, error: 'An internal error occurred during verification.' });
  }
};

// @desc    Trigger USGS earthquake data fetch
// @route   POST /api/alerts/fetch-usgs
// @access  Public (for now, could be protected later)
const triggerUsgsFetch = async (req, res) => {
  const result = await fetchAndSaveEarthquakes();
  if (result.success) {
    res.status(200).json({ success: true, message: `Fetch complete. ${result.newAlerts} new alerts added.` });
  } else {
    res.status(500).json({ success: false, error: 'Failed to fetch data from USGS.' });
  }
};

module.exports = {
  getAlerts,
  createAlert, // Export the new function
  analyzeText,
  triggerUsgsFetch, // Export the new function
};