# Video Conferencing Feature Integration

## Overview
This project now includes a comprehensive live video conferencing feature using Jitsi Meet, enabling real-time mock interviews with industry professionals. The feature is seamlessly integrated into the payment flow and provides a complete interview experience with automatic email notifications and data storage.

## Features Implemented

### 1. Live Interview Room (`LiveInterviewRoom.jsx`)
- **Jitsi Meet Integration**: Uses Jitsi Meet's free, open-source video conferencing solution
- **Dynamic Room Generation**: Creates unique, secure meeting links for each session
- **Real-time Communication**: Supports audio, video, and screen sharing
- **Professional Interface**: Clean, modern UI with interview-specific controls
- **Dedicated Page**: Full-screen video conferencing experience
- **Interview Tracking**: Automatic status updates and completion tracking

#### Key Features:
- **Timer**: Tracks interview duration
- **Controls**: Mute/unmute, camera on/off, chat functionality
- **Settings Panel**: Interview tips and device controls
- **Chat System**: Built-in messaging for communication
- **Responsive Design**: Works on desktop and mobile devices
- **Status Management**: Automatic interview status updates

### 2. Payment Integration (`SubscriptionPlans.jsx`)
- **Seamless Flow**: Payment → Direct Video Conference (no popup)
- **Automatic Room Creation**: Generates unique room names
- **Email Notifications**: Auto-sends room link to interviewer
- **Data Storage**: Creates interview records automatically
- **User Experience**: Smooth transitions between payment and interview

### 3. Email System (`server/routes/email.js`)
- **Automatic Notifications**: Sends emails to interviewers automatically
- **Professional Templates**: Well-formatted email content
- **Interview Details**: Includes job role, experience, and room link
- **Gmail SMTP**: Reliable email delivery using Gmail

### 4. Enhanced Database (`server/models/Interview.js`)
- **Live Interview Fields**: Room names, specialist flags, completion data
- **Status Tracking**: Scheduled, in-progress, completed states
- **Duration Tracking**: Interview duration in seconds
- **Feedback System**: Interviewer feedback and ratings

## Technical Implementation

### Jitsi Meet Integration
```javascript
// Simple iframe integration - no npm packages required
const jitsiUrl = `https://meet.jit.si/${uniqueRoomName}`;

<iframe
  title="Jitsi Meet"
  src={jitsiUrl}
  allow="camera; microphone; fullscreen; display-capture"
  width="100%"
  height="100%"
  style={{ border: 0 }}
/>
```

### Room Name Generation
```javascript
const uniqueRoomName = `MockInterview-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
```

### Email Integration
```javascript
// Automatic email sending to interviewer
const emailData = {
  to: 'logeshofficial333@gmail.com',
  subject: 'New Mock Interview Session - Action Required',
  html: `Interview details and room link...`
};
await API.post('/email/send-interviewer-email', emailData);
```

### Routing
```javascript
<Route path="/live-interview/:roomName?" element={<PrivateRoute><LiveInterviewRoom /></PrivateRoute>} />
```

## User Flow

1. **Booking Process**:
   - User fills interview booking form
   - Clicks "Book Now" to proceed to payment
   - Completes payment for interview session

2. **Payment & Setup**:
   - User completes payment form
   - System generates unique room name
   - **Automatic email sent to interviewer** (logeshofficial333@gmail.com)
   - Interview record created in database
   - User redirected directly to video room

3. **Interview Session**:
   - User enters full-screen video conference
   - Can control audio/video, chat, and settings
   - Timer tracks interview duration
   - Professional interview environment

4. **Session Completion**:
   - User can end interview anytime
   - Interview status updated to "completed"
   - Data stored in "Previous Mock Interview With Recruitment Specialist" section
   - Returns to interviews page

## Email System

### Automatic Email Notifications
- **Interviewer Email**: Sent immediately after payment
- **Email Content**: Professional template with interview details
- **Room Link**: Direct link to join the interview
- **Interview Details**: Job role, experience, and scheduling info

### Email Configuration
```javascript
// Gmail SMTP Configuration
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## Database Enhancements

### New Interview Fields
```javascript
// Live interview specific fields
specialist: Boolean,           // AI specialist interview
humanSpecialist: Boolean,      // Human specialist interview
roomName: String,             // Jitsi room name
scheduledAt: Date,            // Interview scheduling
completedAt: Date,            // Interview completion
duration: Number,             // Duration in seconds
interviewerFeedback: String,  // Interviewer comments
overallRating: Number         // 1-5 rating
```

### Status Management
- **scheduled**: Interview booked, waiting to start
- **in-progress**: Interview currently happening
- **completed**: Interview finished with data stored

## Security & Privacy

- **Unique Room Names**: Each session gets a unique identifier
- **No Data Storage**: Jitsi Meet handles all video data
- **Secure Communication**: End-to-end encryption via Jitsi
- **Privacy Controls**: Users control their camera/microphone
- **Email Security**: Gmail SMTP with app passwords

## Benefits

### For Candidates:
- **Realistic Experience**: Simulates actual interview environment
- **Professional Feedback**: Live interaction with industry experts
- **Convenient Scheduling**: Instant booking and flexible timing
- **Cost-Effective**: Pay-per-interview model
- **No Popups**: Direct navigation to video room

### For Interviewers:
- **Easy Access**: Simple link sharing via email
- **Professional Tools**: Full video conferencing capabilities
- **Flexible Scheduling**: Can join from anywhere
- **No Installation**: Works in any modern browser
- **Automatic Notifications**: Receive emails for new interviews

## Browser Compatibility

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile Browsers**: Responsive design

## Setup Requirements

### Frontend
- No additional npm packages required
- Uses Jitsi Meet's hosted service
- React Router for navigation

### Backend
- **Nodemailer**: For email functionality
- **Gmail SMTP**: For reliable email delivery
- **Environment Variables**: Email configuration
- **Database Updates**: New interview fields

### Environment Configuration
```bash
# Add to server/.env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## Future Enhancements

1. **Recording Feature**: Option to record interviews for review
2. **Analytics Dashboard**: Track interview performance metrics
3. **Multi-language Support**: International interview support
4. **Advanced Scheduling**: Calendar integration for booking
5. **Interview Templates**: Pre-defined question sets
6. **Feedback System**: Post-interview rating and comments
7. **Multiple Interviewers**: Support for different specialist types
8. **SMS Notifications**: Backup notification system

## Installation & Setup

1. **Install Dependencies**: `npm install nodemailer` (server)
2. **Configure Email**: Add Gmail credentials to .env
3. **Update Database**: New interview fields automatically added
4. **Test Flow**: Book an interview to verify email sending

## Usage Instructions

1. **For Candidates**:
   - Fill interview booking form
   - Complete payment process
   - Automatically redirected to video room
   - Use controls to manage audio/video
   - End interview when complete

2. **For Interviewers**:
   - Receive automatic email notifications
   - Click room link to join interview
   - Conduct interview using Jitsi tools
   - Provide real-time feedback

## Technical Notes

- **No Backend Changes**: All video processing handled by Jitsi
- **Scalable**: Can handle multiple concurrent interviews
- **Reliable**: Uses Jitsi's proven infrastructure
- **Free**: No additional costs for video conferencing
- **Email Integration**: Automatic notifications for seamless workflow
- **Data Persistence**: Interview records stored with completion status

This integration provides a complete, professional-grade video interviewing solution that enhances the mock interview experience while maintaining simplicity and reliability. The automatic email system ensures smooth communication between candidates and interviewers.