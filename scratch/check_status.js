const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { Company, User } = require('./backend/models');

dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

async function checkStatus() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
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
