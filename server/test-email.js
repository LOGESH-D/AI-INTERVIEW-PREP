const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('🧪 Testing Email Configuration...\n');

// Check if email credentials are configured
const isEmailConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASS && 
                         process.env.EMAIL_USER !== 'your-email@gmail.com' && 
                         process.env.EMAIL_PASS !== 'your-app-password';

if (!isEmailConfigured) {
  console.log('❌ Email not configured!');
  console.log('\n📋 Current .env values:');
  console.log('EMAIL_USER:', process.env.EMAIL_USER || 'NOT SET');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***SET***' : 'NOT SET');
  
  console.log('\n🔧 To fix this:');
  console.log('1. Create a .env file in the server directory');
  console.log('2. Add your Gmail credentials:');
  console.log('   EMAIL_USER=your-email@gmail.com');
  console.log('   EMAIL_PASS=your-app-password');
  console.log('3. Restart the server');
  
  process.exit(1);
}

console.log('✅ Email credentials found!');
console.log('📧 EMAIL_USER:', process.env.EMAIL_USER);

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Test email
const testEmail = async () => {
  try {
    console.log('\n📤 Sending test email...');
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'logeshofficial333@gmail.com',
      subject: 'Test Email from AI-PREPIFY',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email to verify email functionality.</p>
        <p>If you receive this, email is working correctly!</p>
        <p>Best regards,<br>AI-PREPIFY Team</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📬 Check logeshofficial333@gmail.com for the test email');
    
  } catch (error) {
    console.log('❌ Test email failed!');
    console.log('🔍 Error:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 This usually means:');
      console.log('1. Gmail app password is incorrect');
      console.log('2. 2-factor authentication is not enabled');
      console.log('3. Email credentials are wrong');
    }
  }
};

// Run the test
testEmail();