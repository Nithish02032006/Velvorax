const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { Company, User, Lead, Deal, Invoice } = require('./models');
const path = require('path');

// Load environment variables
const envPath = path.join(__dirname, '.env');
const envResult = dotenv.config({ path: envPath });
if (envResult.error) {
  dotenv.config({ path: path.join(__dirname, '../.env') });
}

const mongoUri = process.env.MONGO_URI || 'mongodb+srv://nithish020306_db_user:Nithish%40236@cluster0.duzlpo7.mongodb.net/?appName=Cluster0';

async function wipe() {
  try {
    console.log('Connecting to MongoDB...');
    if (!mongoUri) {
      throw new Error('Missing MONGO_URI.');
    }
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('Connected.');

    console.log('Wiping collections...');
    await Lead.deleteMany({});
    await Deal.deleteMany({});
    await Invoice.deleteMany({});
    console.log('Leads, Deals, and Invoices cleared.');

    console.log('Gross Revenue is now $0.');
    process.exit(0);
  } catch (err) {
    console.error('Wipe failed:', err.message);
    process.exit(1);
  }
}

wipe();
