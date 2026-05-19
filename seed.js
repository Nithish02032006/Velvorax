const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const { Company, User } = require('./backend/models');

dotenv.config({ path: path.join(__dirname, 'backend/.env') });

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear all existing data
    const collections = Object.keys(mongoose.connection.collections);
    for (const collectionName of collections) {
      await mongoose.connection.collections[collectionName].deleteMany({});
      console.log(`Cleared ${collectionName}`);
    }

    // 1. Create Default Company
    const company = new Company({
      name: 'Velvorax Demo',
      subscriptionPlan: 'pro',
      usersLimit: 10
    });
    await company.save();
    console.log('Default Company created.');

    // 2. Create Super Admin Users
    const salt = await bcrypt.genSalt(10);
    
    const rarajuPass = await bcrypt.hash('Admin@123', salt);
    const nithishPass = await bcrypt.hash('Nithish@236', salt);

    const raraju = new User({
      companyId: company._id,
      name: 'Raraju',
      email: 'raraju@velvorax.tech',
      password: rarajuPass,
      role: 'super_admin'
    });
    await raraju.save();

    const nithish = new User({
      companyId: company._id,
      name: 'Nithish',
      email: 'nithish020306@gmail.com',
      password: nithishPass,
      role: 'super_admin'
    });
    await nithish.save();

    console.log('Super Admin Users created:');
    console.log('- raraju@velvorax.tech');
    console.log('- nithish020306@gmail.com');

    console.log('Seeding completed successfully.');
    process.exit();
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seed();
