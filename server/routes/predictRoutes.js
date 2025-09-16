const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const mlUrl = `${process.env.ML_API_URL.replace(/\/$/, '')}/predict`;
    const resp = await axios.post(mlUrl, req.body, { timeout: 15000 });
    res.json(resp.data);
  } catch (err) {
    console.error('Predict error:', err?.message || err);
    res.status(500).json({ error: 'Prediction service error' });
  }
});

module.exports = router;
