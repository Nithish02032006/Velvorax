const mongoose = require('mongoose');
const { Lead } = require('./models');
require('dotenv').config();

async function clearLeads() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/velvorax');
    await Lead.deleteMany({});
    console.log('Leads collection cleared successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error clearing leads:', err);
    process.exit(1);
  }
}

clearLeads();
