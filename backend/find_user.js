const mongoose = require('mongoose');
const { User, Company } = require('./models');
const dotenv = require('dotenv');
const path = require('path');

const envPath = path.join(__dirname, '.env');
dotenv.config({ path: envPath });
if (!process.env.MONGO_URI) {
    dotenv.config({ path: path.join(__dirname, '../.env') });
}

const mongoUri = process.env.MONGO_URI || 'mongodb+srv://nithish020306_db_user:Nithish%40236@cluster0.duzlpo7.mongodb.net/?appName=Cluster0';

async function find() {
    try {
        await mongoose.connect(mongoUri);
        const email = 'madhavibojja15@gmail.com';
        const user = await User.findOne({ email }).populate('companyId');

        if (user) {
            console.log('USER_FOUND');
            console.log('Email:', user.email);
            console.log('Role:', user.role);
            console.log('Company:', user.companyId ? user.companyId.name : 'None');
            console.log('Approval Status:', user.companyId ? user.companyId.approvalStatus : 'N/A');
        } else {
            console.log('USER_NOT_FOUND');
            const allUsers = await User.find({}, 'email');
            console.log('All available users:', allUsers.map(u => u.email));
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

find();
