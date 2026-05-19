const mongoose = require('mongoose');
const { User } = require('./models');
const dotenv = require('dotenv');
const path = require('path');

const envPath = path.join(__dirname, '.env');
dotenv.config({ path: envPath });
const mongoUri = process.env.MONGO_URI || 'mongodb+srv://nithish020306_db_user:Nithish%40236@cluster0.duzlpo7.mongodb.net/velvorax?appName=Cluster0';

async function upgrade() {
    try {
        await mongoose.connect(mongoUri);
        const email = 'madhavibojja678@gmail.com';
        const user = await User.findOneAndUpdate({ email }, { role: 'super_admin' }, { new: true });

        if (user) {
            console.log(`✅ SUCCESS: ${email} is now a SUPER ADMIN.`);
            console.log('Please log out and log back in on the website to see admin features.');
        } else {
            console.log('❌ User not found.');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
upgrade();
