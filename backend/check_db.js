const mongoose = require('mongoose');
const { User, Company } = require('./models');
const dotenv = require('dotenv');
const path = require('path');

const envPath = path.join(__dirname, '.env');
dotenv.config({ path: envPath });
if (!process.env.MONGO_URI) {
    dotenv.config({ path: path.join(__dirname, '../.env') });
}

// Updated with /velvorax database suffix
const mongoUri = process.env.MONGO_URI || 'mongodb+srv://nithish020306_db_user:Nithish%40236@cluster0.duzlpo7.mongodb.net/velvorax?appName=Cluster0';

async function check() {
    try {
        console.log('Connecting to MongoDB (velvorax DB)...');
        await mongoose.connect(mongoUri);
        console.log('Connected.\n');

        const emailToFind = 'madhavibojja678@gmail.com';
        const user = await User.findOne({ email: emailToFind }).populate('companyId');

        if (user) {
            console.log('✅ USER FOUND IN DATABASE');
            console.log('---------------------------');
            console.log(`Email:   ${user.email}`);
            console.log(`Name:    ${user.name}`);
            console.log(`Role:    ${user.role}`);
            if (user.companyId) {
                console.log(`Company: ${user.companyId.name}`);
                console.log(`Status:  ${user.companyId.approvalStatus}`);

                if (user.companyId.approvalStatus !== 'Approved') {
                    console.log('\n⚠️ WARNING: This user cannot log in yet because the company status is NOT "Approved".');
                }
            } else {
                console.log('Company: NONE (User is not linked to a company)');
            }
        } else {
            console.log(`❌ USER NOT FOUND: ${emailToFind}`);
            console.log('\nAvailable users in DB:');
            const allUsers = await User.find({}, 'email');
            if (allUsers.length === 0) {
                console.log('No users found at all in the "velvorax" database.');
            } else {
                allUsers.forEach(u => console.log(`- ${u.email}`));
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('Error checking DB:', err.message);
        process.exit(1);
    }
}

check();
