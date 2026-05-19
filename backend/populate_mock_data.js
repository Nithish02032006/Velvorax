const mongoose = require('mongoose');
const { Company, User, Lead, Deal, Task, Invoice } = require('./models');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
const envPath = path.join(__dirname, '.env');
const envResult = dotenv.config({ path: envPath });
if (envResult.error) {
  dotenv.config({ path: path.join(__dirname, '../.env') });
}

const mongoUri = process.env.MONGO_URI || 'mongodb+srv://nithish020306_db_user:Nithish%40236@cluster0.duzlpo7.mongodb.net/?appName=Cluster0';

const populateMockData = async () => {
    try {
        if (!mongoUri) {
          throw new Error('Missing MONGO_URI.');
        }
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB for mock data population...');

        const company = await Company.findOne({ name: 'Velvorax Demo' });
        const admin = await User.findOne({ email: 'admin@velvorax.com' });

        if (!company || !admin) {
            console.error('Seed the database first!');
            process.exit(1);
        }

        // 1. Add some leads
        const leadData = [
            { name: 'John Smith', email: 'john@example.com', phone: '1234567890', status: 'New', source: 'Email', company: 'Global Tech' },
            { name: 'Sarah Connor', email: 'sarah@skynet.com', phone: '9876543210', status: 'Assigned', source: 'Call', company: 'Cyberdyne' },
            { name: 'Bruce Wayne', email: 'bruce@wayne.com', phone: '0000000000', status: 'In Process', source: 'Existing Customer', company: 'Wayne Enterprises' },
            { name: 'Peter Parker', email: 'peter@dailybugle.com', phone: '1112223333', status: 'New', source: 'Other', company: 'Daily Bugle' }
        ];

        await Lead.insertMany(leadData);
        console.log('Mock Leads added.');

        // 2. Add some deals
        const dealData = [
            { name: 'Cloud Migration', amount: 50000, stage: 'Negotiation', companyId: company._id, assignedTo: admin._id, region: 'North America' },
            { name: 'AI Integration', amount: 120000, stage: 'Closed Won', companyId: company._id, assignedTo: admin._id, region: 'Asia Pacific' },
            { name: 'Security Audit', amount: 15000, stage: 'Proposal', companyId: company._id, assignedTo: admin._id, region: 'Europe' },
            { name: 'CRM Customization', amount: 25000, stage: 'Closed Won', companyId: company._id, assignedTo: admin._id, region: 'Latin America' }
        ];

        await Deal.insertMany(dealData);
        console.log('Mock Deals added.');

        // 3. Add some tasks
        const taskData = [
            { title: 'Call John Smith', status: 'Pending', priority: 'High', dueDate: new Date(), companyId: company._id, assignedTo: admin._id },
            { title: 'Send Proposal to Sarah', status: 'Pending', priority: 'Medium', dueDate: new Date(Date.now() + 86400000), companyId: company._id, assignedTo: admin._id }
        ];

        await Task.insertMany(taskData);
        console.log('Mock Tasks added.');

        // 4. Add some invoices
        const invoiceData = [
            { invoiceNumber: 'INV-001', amount: 120000, status: 'Paid', companyId: company._id, clientName: 'Cyberdyne' },
            { invoiceNumber: 'INV-002', amount: 25000, status: 'Sent', companyId: company._id, clientName: 'Wayne Enterprises' }
        ];

        await Invoice.insertMany(invoiceData);
        console.log('Mock Invoices added.');

        console.log('Full mock data population complete!');
        mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

populateMockData();
