const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Check if email credentials are configured
const isEmailConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASS && 
                         process.env.EMAIL_USER !== 'your-email@gmail.com' && 
                         process.env.EMAIL_PASS !== 'your-app-password';

// Create a transporter using Gmail SMTP with better error handling
let transporter = null;

if (isEmailConfigured) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    // Add additional options for better compatibility
    secure: false,
    tls: {
      rejectUnauthorized: false
    }
  });

  // Verify the transporter configuration
  transporter.verify(function(error, success) {
    if (error) {
      console.log('❌ Email transporter verification failed:', error.message);
      console.log('💡 This usually means:');
      console.log('   1. Gmail app password is incorrect');
      console.log('   2. 2-factor authentication is not enabled');
      console.log('   3. Less secure app access is disabled');
      console.log('   4. Email credentials are wrong');
    } else {
      console.log('✅ Email transporter is ready to send messages');
    }
  });
} else {
  console.log('⚠️ Email credentials not configured. Using console fallback.');
  // Create a test transporter for development
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: 'test@example.com',
      pass: 'test'
    }
  });
}

// Test email route with detailed error handling
router.post('/test-email', async (req, res) => {
  try {
    if (!isEmailConfigured) {
      return res.status(400).json({
        success: false,
        message: 'Email not configured. Please add EMAIL_USER and EMAIL_PASS to your .env file',
        instructions: [
          '1. Create a .env file in the server directory',
          '2. Add your Gmail credentials:',
          '   EMAIL_USER=your-email@gmail.com',
          '   EMAIL_PASS=your-app-password',
          '3. Restart the server'
        ]
      });
    }

    const testMailOptions = {
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

    const info = await transporter.sendMail(testMailOptions);
    
    console.log('✅ Test email sent successfully:', info.messageId);
    res.json({ 
      success: true, 
      message: 'Test email sent successfully',
      messageId: info.messageId 
    });

  } catch (error) {
    console.error('❌ Test email error:', error);
    
    let errorMessage = 'Failed to send test email';
    let instructions = [];
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Gmail authentication failed';
      instructions = [
        '1. Enable 2-Factor Authentication on your Gmail account',
        '2. Generate an App Password:',
        '   - Go to Google Account → Security → 2-Step Verification',
        '   - Click "App passwords"',
        '   - Select "Mail" and generate password',
        '   - Copy the 16-character password',
        '3. Update your .env file with the app password',
        '4. Restart the server'
      ];
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Connection to Gmail failed';
      instructions = [
        '1. Check your internet connection',
        '2. Verify Gmail SMTP settings',
        '3. Try again in a few minutes'
      ];
    } else {
      instructions = [
        '1. Check your Gmail app password',
        '2. Verify 2-factor authentication is enabled',
        '3. Check your .env file configuration'
      ];
    }
    
    res.status(500).json({ 
      success: false, 
      message: errorMessage,
      error: error.message,
      instructions: instructions
    });
  }
});

// Route to send interviewer email
router.post('/send-interviewer-email', async (req, res) => {
  try {
    const { to, subject, html } = req.body;

    if (!isEmailConfigured) {
      console.log('📧 Email not configured. Logging email content instead:');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('Content:', html);
      
      return res.json({ 
        success: true, 
        message: 'Email logged to console (not configured)',
        note: 'Configure EMAIL_USER and EMAIL_PASS in .env file to send actual emails'
      });
    }

    // Email configuration
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: html
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully:', info.messageId);
    res.json({ 
      success: true, 
      message: 'Email sent successfully',
      messageId: info.messageId 
    });

  } catch (error) {
    console.error('❌ Email sending error:', error);
    
    let errorMessage = 'Failed to send email';
    let instructions = [];
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Gmail authentication failed';
      instructions = [
        '1. Enable 2-Factor Authentication on your Gmail account',
        '2. Generate an App Password:',
        '   - Go to Google Account → Security → 2-Step Verification',
        '   - Click "App passwords"',
        '   - Select "Mail" and generate password',
        '   - Copy the 16-character password',
        '3. Update your .env file with the app password',
        '4. Restart the server'
      ];
    }
    
    res.status(500).json({ 
      success: false, 
      message: errorMessage,
      error: error.message,
      instructions: instructions
    });
  }
});

// Route to send interview completion notification
router.post('/send-completion-email', async (req, res) => {
  try {
    const { to, interviewData } = req.body;

    if (!isEmailConfigured) {
      console.log('📧 Completion email not configured. Logging instead:');
      console.log('To:', to);
      console.log('Interview Data:', interviewData);
      
      return res.json({ 
        success: true, 
        message: 'Completion email logged to console (not configured)'
      });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: 'Mock Interview Completed - Feedback Available',
      html: `
        <h2>Mock Interview Completed</h2>
        <p>Your mock interview session has been completed successfully.</p>
        <h3>Interview Details:</h3>
        <ul>
          <li><strong>Job Role:</strong> ${interviewData.jobRole || 'Not specified'}</li>
          <li><strong>Duration:</strong> ${interviewData.duration || 'Not recorded'}</li>
          <li><strong>Completed At:</strong> ${interviewData.completedAt || 'Not specified'}</li>
        </ul>
        <p>You can view your interview feedback and analysis in your dashboard.</p>
        <p>Best regards,<br>AI-PREPIFY Team</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Completion email sent successfully:', info.messageId);
    res.json({ 
      success: true, 
      message: 'Completion email sent successfully',
      messageId: info.messageId 
    });

  } catch (error) {
    console.error('❌ Completion email sending error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send completion email',
      error: error.message 
    });
  }
});

module.exports = router;