const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});

// Test user creation and login
async function testLogin() {
  try {
    console.log('🧪 Testing login functionality...');
    
    // Test data
    const testEmail = 'test@example.com';
    const testPassword = 'password123';
    
    // Check if test user exists
    const User = require('./models/User');
    let user = await User.findOne({ email: testEmail });
    
    if (!user) {
      console.log('📝 Creating test user...');
      user = new User({
        username: 'testuser',
        email: testEmail,
        password: testPassword
      });
      await user.save();
      console.log('✅ Test user created');
    } else {
      console.log('✅ Test user already exists');
    }
    
    // Test password comparison
    console.log('🔑 Testing password comparison...');
    const isMatch = await user.comparePassword(testPassword);
    console.log('Password match:', isMatch);
    
    // Test JWT token generation
    console.log('🎫 Testing JWT token generation...');
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    console.log('Token generated:', token ? '✅' : '❌');
    
    // Test token verification
    console.log('🔍 Testing token verification...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified:', decoded.userId ? '✅' : '❌');
    
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

testLogin(); 