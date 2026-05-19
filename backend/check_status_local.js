const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { Company, User } = require('./models');

// Load environment variables
const envPath = path.join(__dirname, '.env');
const envResult = dotenv.config({ path: envPath });
if (envResult.error) {
  dotenv.config({ path: path.join(__dirname, '../.env') });
}

const mongoUri = process.env.MONGO_URI || 'mongodb+srv://nithish020306_db_user:Nithish%40236@cluster0.duzlpo7.mongodb.net/?appName=Cluster0';

async function checkStatus() {
  try {
    if (!mongoUri) {
      throw new Error('Missing MONGO_URI.');
    }
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const companies = await Company.find().sort({ createdAt: -1 }).limit(5);
    console.log('Recent Companies:');
    companies.forEach(c => {
      console.log(`- ${c.name} (${c.approvalStatus}) ID: ${c._id}`);
    });

    const users = await User.find({ email: /test/ }).populate('companyId');
    console.log('\nTest Users:');
    users.forEach(u => {
      console.log(`- ${u.name} (${u.email}) Role: ${u.role} Company: ${u.companyId ? u.companyId.name : 'None'} Status: ${u.companyId ? u.companyId.approvalStatus : 'N/A'}`);
    });

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkStatus();
