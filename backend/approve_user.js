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

async function approve() {
    try {
        console.log('Connecting to MongoDB (velvorax DB)...');
        await mongoose.connect(mongoUri);

        const email = 'madhavibojja678@gmail.com';
        console.log(`Searching for user: ${email}`);

        const user = await User.findOne({ email }).populate('companyId');

        if (!user) {
            console.log('❌ User not found in "velvorax" database.');
            const allUsers = await User.find({}, 'email');
            console.log('Available users in this DB:', allUsers.map(u => u.email));
            process.exit(1);
        }

        if (!user.companyId) {
            console.log('❌ User is not linked to a company.');
            process.exit(1);
        }

        console.log(`Found Company: ${user.companyId.name}`);
        console.log(`Current Status: ${user.companyId.approvalStatus}`);

        user.companyId.approvalStatus = 'Approved';
        await user.companyId.save();

        console.log('✅ SUCCESS: Company has been APPROVED.');
        console.log(`You can now log in with: ${email}`);

        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

approve();
