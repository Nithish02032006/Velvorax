const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const { User, Company } = require('./models');

// Load environment variables
const envPath = path.join(__dirname, '.env');
const envResult = dotenv.config({ path: envPath });
if (envResult.error) {
  dotenv.config({ path: path.join(__dirname, '../.env') });
}

const mongoUri = process.env.MONGO_URI || 'mongodb+srv://nithish020306_db_user:Nithish%40236@cluster0.duzlpo7.mongodb.net/?appName=Cluster0';

const addAdmins = async () => {
  try {
    if (!mongoUri) {
      throw new Error('Missing MONGO_URI.');
    }
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas...');

    // 1. Ensure the Velvorax Company exists
    let velvorax = await Company.findOne({ name: 'Velvorax Software Solutions' });
    if (!velvorax) {
      velvorax = new Company({
        name: 'Velvorax Software Solutions',
        industry: 'Technology',
        subscriptionPlan: 'pro',
        usersLimit: 100,
        approvalStatus: 'Approved'
      });
      await velvorax.save();
      console.log('Created Velvorax Company record.');
    }

    // 2. The admins you requested
    const adminsToAdd = [
      { 
        name: 'R.A. Raju', 
        email: 'raraju@velvorax.tech', 
        password: 'Velvorax@2026' 
      },
      { 
        name: 'Nithish', 
        email: 'nithish020306@gmail.com', 
        password: 'Velvorax@2026' 
      }
    ];

    for (const adminData of adminsToAdd) {
      // Check if user exists
      let user = await User.findOne({ email: adminData.email });
      if (user) {
        console.log(`User with email ${adminData.email} already exists. Updating role to super_admin.`);
        user.role = 'super_admin';
        user.companyId = velvorax._id;
        await user.save();
        continue;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminData.password, salt);

      // Create Super Admin
      user = new User({
        companyId: velvorax._id,
        name: adminData.name,
        email: adminData.email,
        password: hashedPassword,
        role: 'super_admin'
      });

      await user.save();
      console.log(`Successfully added Super Admin: ${adminData.name} (${adminData.email})`);
    }

    console.log('Successfully updated Super Admins on MongoDB Atlas!');
    process.exit();
  } catch (err) {
    console.error('Error adding admins:', err.message);
    process.exit(1);
  }
};

addAdmins();
