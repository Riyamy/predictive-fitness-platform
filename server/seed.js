require('dotenv').config();
const mongoose = require('mongoose');
const Activity = require('./models/Activity');

const seedData = [
  { workout: 'run', nutrition: 'balanced', sleep: 7, performance: 12.5, date: new Date() },
  { workout: 'strength', nutrition: 'high-protein', sleep: 6, performance: 14.8 },
  { workout: 'cycle', nutrition: 'balanced', sleep: 7.5, performance: 11.2 },
  // add more rows as you like (copy/paste to ~20 entries)
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fitness');
    await Activity.deleteMany({});
    await Activity.insertMany(seedData);
    console.log('DB seeded ✅');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
