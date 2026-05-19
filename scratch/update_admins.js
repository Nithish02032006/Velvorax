const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const { User } = require('../backend/models');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

async function updateAdmins() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    const salt = await bcrypt.genSalt(10);

    const admins = [
      { email: 'raraju@velvorax.tech', password: 'Admin@123' },
      { email: 'nithish020306@gmail.com', password: 'Nithish@236' }
    ];

    for (const admin of admins) {
      const hashedPassword = await bcrypt.hash(admin.password, salt);
      const result = await User.findOneAndUpdate(
        { email: admin.email },
        { password: hashedPassword, role: 'super_admin' },
        { upsert: true, new: true }
      );
      console.log(`Updated/Created admin: ${admin.email}`);
    }

    console.log('Credentials updated successfully.');
    process.exit();
  } catch (err) {
    console.error('Update error:', err);
    process.exit(1);
  }
}

updateAdmins();
