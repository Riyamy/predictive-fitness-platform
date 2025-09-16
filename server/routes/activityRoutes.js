const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');

router.get('/', async (req, res) => {
  const activities = await Activity.find();
  res.json(activities);
});

router.post('/', async (req, res) => {
  const activity = new Activity(req.body);
  await activity.save();
  res.json(activity);
});

module.exports = router;
