# Email Setup Guide

## Overview
The video conferencing feature includes automatic email notifications to interviewers. This guide explains how to set up the email functionality.

## Email Configuration

### 1. Gmail Setup
To send emails automatically, you need to configure Gmail SMTP:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. **Add to your .env file**:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-character-app-password
   ```

### 2. Environment Variables
Add these to your `server/.env` file:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 3. Email Templates
The system sends two types of emails:

#### Interview Notification Email
- **To**: logeshofficial333@gmail.com (interviewer)
- **Subject**: "New Mock Interview Session - Action Required"
- **Content**: Interview details and room link

#### Completion Email
- **To**: User's email
- **Subject**: "Mock Interview Completed - Feedback Available"
- **Content**: Completion confirmation and feedback availability

## Features

### Automatic Email Sending
- ✅ Interviewer notification when interview is booked
- ✅ Room link included in email
- ✅ Interview details (job role, experience, etc.)
- ✅ Professional email template

### Email Content
The emails include:
- Interview room link
- Job role and experience details
- Professional formatting
- Clear instructions for interviewers

## Testing Email Setup

1. **Start the server** with email configuration
2. **Book a live interview** through the UI
3. **Check the console** for email sending logs
4. **Verify email delivery** to the interviewer

## Troubleshooting

### Common Issues:
1. **"Authentication failed"**: Check your app password
2. **"Invalid email"**: Verify EMAIL_USER format
3. **"Connection timeout"**: Check internet connection

### Debug Steps:
1. Check server console for email logs
2. Verify .env file configuration
3. Test with a simple email first
4. Check Gmail security settings

## Security Notes

- ✅ App passwords are more secure than regular passwords
- ✅ Emails are sent only when interviews are booked
- ✅ No sensitive data in email content
- ✅ Professional templates used

## Future Enhancements

1. **Email Templates**: Customizable email templates
2. **Multiple Interviewers**: Support for multiple interviewer emails
3. **Email Preferences**: User-configurable email settings
4. **Email Tracking**: Track email delivery and opens
5. **SMS Notifications**: Add SMS notifications as backup

This setup ensures reliable communication between candidates and interviewers for the live mock interview feature.