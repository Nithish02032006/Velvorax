const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { Pricing } = require('./models');

dotenv.config({ path: path.join(__dirname, '.env') });

const updatePricing = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for updating pricing plans...');

    const updates = [
      { 
        tier: 'Basic', 
        usd: 120,
        inr: 10000,
        features: ['Basic CRM Access', 'Lead Management', 'Email Automation', 'Basic Reporting', 'Email Support', '1 GB Storage'],
        setupInr: '2,50,000',
        setupUsd: '3,000'
      },
      { 
        tier: 'Growth', 
        usd: 181,
        inr: 15000,
        features: ['Advanced CRM Access', 'Lead Management & Scoring', 'WhatsApp + Email Automation', 'Advanced Reporting', 'Priority Support', '5 GB Storage', 'API Access'],
        setupInr: '2,50,000',
        setupUsd: '3,000'
      },
      { 
        tier: 'Pro', 
        usd: 301,
        inr: 25000,
        features: ['Full CRM Access', 'Advanced Automation Flows', 'Multi-Channel Integration', 'Custom Reporting Dashboard', 'Dedicated Support', '10 GB Storage', 'Custom Integrations', 'Employee Tracking'],
        setupInr: '5,00,000',
        setupUsd: '6,000'
      }
    ];

    for (const u of updates) {
      await Pricing.findOneAndUpdate(
        { tier: u.tier },
        { 
          $set: { 
            usd: u.usd,
            inr: u.inr,
            features: u.features, 
            setupInr: u.setupInr, 
            setupUsd: u.setupUsd, 
            updatedAt: Date.now() 
          } 
        }
      );
      console.log(`Updated features, prices, and setup costs for ${u.tier} tier.`);
    }

    console.log('Pricing plans update completed successfully.');
    process.exit();
  } catch (err) {
    console.error('Update error:', err);
    process.exit(1);
  }
};

updatePricing();
