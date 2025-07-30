const path = require('path');
const dotenv = require('dotenv');

// ✅ Explicitly load .env from the current directory (server/.env)
dotenv.config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// ✅ Debug: Check if the MONGO_URI is loading properly
console.log("✅ Current Working Directory:", process.cwd());
console.log("✅ Loaded MONGO_URI:", process.env.MONGO_URI);

// Check for required environment variables
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI is not set in environment variables');
  console.error('Please create a .env file in the server directory with your MongoDB connection string');
  console.error('Example: MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is not set in environment variables');
  console.error('Please add JWT_SECRET=your_secret_key to your .env file');
  process.exit(1);
}

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Allow client origin
  credentials: true
}));
app.use(express.json());

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('Please check your MongoDB connection string and network connection');
    process.exit(1);
  });

// ✅ Routes with error handling
try {
  console.log('📁 Loading routes...');
  app.use('/api/auth', require('./routes/auth'));
  console.log('✅ Auth routes loaded');
  
  app.use('/api/interviews', require('./routes/interviews'));
  console.log('✅ Interview routes loaded');
  
  app.use('/api/questions', require('./routes/questions'));
  console.log('✅ Question routes loaded');
  
  app.use('/api/contacts', require('./routes/contacts'));
  console.log('✅ Contact routes loaded');
  
  app.use('/api/email', require('./routes/email'));
  console.log('✅ Email routes loaded');
  
  app.use('/api/profile', require('./routes/profile'));
  console.log('✅ Profile routes loaded');
  
  // Serve uploaded files statically
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  console.log('✅ Uploads directory served');
} catch (error) {
  console.error('❌ Error loading routes:', error);
  process.exit(1);
}

// ✅ Basic route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'AI Mock Interview API is running!',
    timestamp: new Date().toISOString(),
    routes: ['/api/auth', '/api/interviews', '/api/questions', '/api/contacts', '/api/email', '/api/profile']
  });
});

// Test uploads directory
app.get('/test-uploads', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const uploadsDir = path.join(__dirname, 'uploads');
  
  try {
    const files = fs.readdirSync(uploadsDir);
    res.json({ 
      message: 'Uploads directory accessible',
      files: files,
      uploadsPath: uploadsDir
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Uploads directory error',
      error: error.message 
    });
  }
});

// ✅ Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// ✅ Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 API Documentation: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});
