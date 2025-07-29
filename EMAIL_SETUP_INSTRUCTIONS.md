# Email Setup Instructions

## Problem: Email Not Being Received

The email is not being received because the email credentials are not configured. Here's how to fix it:

## Step 1: Create .env File

Create a file named `.env` in the `server` directory with the following content:

```bash
# MongoDB Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Email Configuration (REQUIRED for email functionality)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Server Configuration
PORT=5000
NODE_ENV=development
```

## Step 2: Gmail Setup

### 1. Enable 2-Factor Authentication
- Go to your Google Account settings
- Security → 2-Step Verification → Turn it ON

### 2. Generate App Password
- Go to Google Account settings
- Security → 2-Step Verification → App passwords
- Select "Mail" and generate a password
- Copy the 16-character password

### 3. Update .env File
Replace the placeholder values:
```bash
EMAIL_USER=your-actual-gmail@gmail.com
EMAIL_PASS=your-16-character-app-password
```

## Step 3: Test Email Functionality

### Option 1: Test via API
Send a POST request to test the email:
```bash
curl -X POST http://localhost:5000/api/email/test-email
```

### Option 2: Test via Browser
Visit: `http://localhost:5000/api/email/test-email`

### Option 3: Test via Frontend
Book a live interview and check the server console for email logs.

## Step 4: Verify Configuration

The server will show these messages:

✅ **If configured correctly:**
```
✅ Email sent successfully: <message-id>
```

❌ **If not configured:**
```
⚠️ Email credentials not configured. Using console fallback.
📧 Email not configured. Logging email content instead:
```

## Troubleshooting

### Common Issues:

1. **"Authentication failed"**
   - Check your app password is correct
   - Verify 2-factor authentication is enabled

2. **"Invalid email"**
   - Make sure EMAIL_USER is a valid Gmail address
   - Check for typos in the .env file

3. **"Connection timeout"**
   - Check internet connection
   - Verify Gmail SMTP settings

### Debug Steps:

1. **Check .env file exists** in server directory
2. **Verify credentials** are correct
3. **Restart server** after making changes
4. **Check server console** for error messages
5. **Test with simple email** first

## Current Status

The system will now:
- ✅ Log email content to console if not configured
- ✅ Send actual emails when properly configured
- ✅ Provide clear error messages
- ✅ Include setup instructions

## Quick Fix

If you want to test the feature without email setup:

1. Book a live interview
2. Check the server console
3. You'll see the email content logged
4. Copy the room link manually

The interview functionality will work perfectly - only the automatic email notification needs configuration.

## Next Steps

1. Create the `.env` file with your Gmail credentials
2. Restart the server
3. Test the email functionality
4. Book a live interview to verify everything works

The email will be sent to `logeshofficial333@gmail.com` with the interview room link and details.