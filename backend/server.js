const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dns').setDefaultResultOrder('ipv4first');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');
const dealRoutes = require('./routes/deals');

// Load environment variables
const loadEnv = () => {
  const paths = [
    path.join(__dirname, '.env'),
    path.join(__dirname, '.env.txt'),
    path.join(__dirname, '../.env'),
    path.join(__dirname, '../.env.txt')
  ];

  for (const envPath of paths) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
      console.log(`Loaded environment variables from: ${envPath}`);
      return true;
    }
  }
  return false;
};

if (!loadEnv()) {
  console.warn('No .env or .env.txt file found. Using default/system environment variables.');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Set default JWT Secret if not in .env to prevent registration crash
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'velvorax_secret_key_2024';
}

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

// Increase limit for logo uploads (Base64 strings can be large)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from the frontend folder
app.use(express.static(path.join(__dirname, '../frontend'), { extensions: ['html'] }));

// Database connection - SPECIFYING VELVORAX DB
const mongoUri = process.env.MONGO_URI || 'mongodb+srv://nithish020306_db_user:Nithish%40236@cluster0.duzlpo7.mongodb.net/velvorax?appName=Cluster0';
if (!mongoUri) {
  console.error('Missing MONGO_URI. Create a backend/.env or ../.env with MONGO_URI set.');
  process.exit(1);
}

mongoose.connect(mongoUri)
.then(() => console.log('MongoDB connected successfully to VELVORAX database'))
.catch(err => console.error('MongoDB connection error:', err));

// Basic route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Import and use routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/pricing', require('./routes/pricing'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/deals', dealRoutes);
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/cases', require('./routes/cases'));
app.use('/api/user-auth', require('./routes/userAuth'));
app.use('/api/admin', require('./routes/admin-users'));
const accountsRoute = require('./routes/accounts');
app.use('/api/accounts', accountsRoute);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ msg: 'Internal Server Error', error: err.message });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
