const express = require('express');
const router = express.Router();
const { getAlerts, createAlert, analyzeText, triggerUsgsFetch } = require('../controllers/alertController');

router.route('/')
  .get(getAlerts)
  .post(createAlert); // Add the POST handler


router.route('/analyze')
      .post(analyzeText); // Add the new route



router.route('/fetch-usgs')
      .post(triggerUsgsFetch); // Add the new trigger route

module.exports = router;