const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

const seed = async () => {
  try {
    if (!mongoUri) {
      throw new Error('Missing MONGO_URI.');
    }

    await mongoose.connect(mongoUri);
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
      usersLimit: 10,
      approvalStatus: 'Approved'
    });
    await company.save();
    console.log('Default Company created (Approved).');

    // 2. Create Default Admin User
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin123', salt);

    const admin = new User({
      companyId: company._id,
      name: 'Super Admin',
      email: 'admin@velvorax.com',
      password: hashedPassword,
      role: 'super_admin'
    });
    await admin.save();
    console.log('Default Super Admin created (admin@velvorax.com / Admin123).');

    console.log('Seeding completed successfully.');
    process.exit();
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seed();
