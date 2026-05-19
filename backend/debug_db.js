const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

const envPath = path.join(__dirname, '.env');
dotenv.config({ path: envPath });
if (!process.env.MONGO_URI) {
    dotenv.config({ path: path.join(__dirname, '../.env') });
}

const mongoUri = process.env.MONGO_URI || 'mongodb+srv://nithish020306_db_user:Nithish%40236@cluster0.duzlpo7.mongodb.net/?appName=Cluster0';

async function debug() {
    try {
        console.log('Connecting to:', mongoUri.split('@')[1]); // Log host only for security
        await mongoose.connect(mongoUri);
        console.log('Connected successfully.\n');

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('--- DATABASE COLLECTIONS ---');

        if (collections.length === 0) {
            console.log('The database is completely empty (no collections found).');
        }

        for (const col of collections) {
            const count = await mongoose.connection.db.collection(col.name).countDocuments();
            console.log(`- ${col.name}: ${count} documents`);
        }

        console.log('\n--- SYSTEM CHECK ---');
        const User = mongoose.model('User', new mongoose.Schema({}));
        const userCount = await User.countDocuments();
        console.log(`Verified User Count: ${userCount}`);

        process.exit(0);
    } catch (err) {
        console.error('Debug failed:', err.message);
        process.exit(1);
    }
}

debug();
