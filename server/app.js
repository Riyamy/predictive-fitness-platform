require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fitness', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(()=>console.log('Mongo connected'))
  .catch(err => console.error('Mongo connection error', err));

app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/predict', require('./routes/predictRoutes'));

module.exports = app;
