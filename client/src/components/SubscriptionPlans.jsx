import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LiveInterviewRoom from './LiveInterviewRoom';
import InterviewRoomLink from './InterviewRoomLink';
import API from '../api';

const planDetails = {
  Single: {
    price: 49,
    discount: '50% OFF',
    validity: '1 day',
    tests: 1,
    description: 'Special offer: 50% discount for a limited time!',
    color: 'blue',
    features: [
      'Take up to 2 live mock interviews within 1 day',
      'Real-time interviews with experienced industrial Professionals',
      'Personalized, actionable feedback on your answers and communication',
      'AI-powered analysis of your performance',
      'Downloadable interview reports',
      'Flexible scheduling and instant booking',
      'Secure and private interview environment',
      'Support for multiple job roles and domains',
    ],
  },
};

// PaymentModal: onBack should navigate to the previous popup (e.g., HumanInterviewBookingModal)
const PaymentModal = ({ open, plan, onClose, onBack, interviewData }) => {
  const details = planDetails[plan] || planDetails.Single;
  const [form, setForm] = useState({ name: '', email: '', card: '', expiry: '', cvv: '' });
  const [success, setSuccess] = useState(false);
  const [showVideoRoom, setShowVideoRoom] = useState(false);
  const [roomName, setRoomName] = useState('');
  const navigate = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  
  const sendInterviewerEmail = async (roomName) => {
    try {
      // Fix: Use the correct Jitsi Meet URL format without authentication
      const roomUrl = `https://meet.jit.si/${roomName}#config.startWithAudioMuted=false&config.startWithVideoMuted=false&config.prejoinPageEnabled=false&config.requireDisplayName=false&config.disableModeratorIndicator=true&config.enableClosePage=false&config.enableWelcomePage=false&config.enableLobbyChat=false&config.enableKnocking=false&config.enablePrejoinPage=false`;
      
      // Set interviewer display name
      const interviewerName = `${interviewData?.jobRole || 'Interview'} Specialist`;
      
      const emailData = {
        to: 'logeshofficial333@gmail.com',
        subject: '🚨 URGENT: New Mock Interview Session - Join Now',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #2563eb; border-radius: 10px;">
            <div style="background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">🎯 NEW MOCK INTERVIEW SESSION</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Action Required - Interviewer Needed</p>
            </div>
            
            <div style="padding: 20px; background: #f8fafc;">
              <h2 style="color: #1e40af; margin-top: 0;">📋 Interview Details:</h2>
              <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <p><strong>👤 Candidate Name:</strong> ${interviewData?.userName || 'Not specified'}</p>
                <p><strong>📝 Job Role:</strong> ${interviewData?.jobRole || 'Not specified'}</p>
                <p><strong>🔧 Job Description:</strong> ${interviewData?.jobDesc || 'Not specified'}</p>
                <p><strong>⏱️ Experience:</strong> ${interviewData?.experience || 'Not specified'} years</p>
                <p><strong>🏠 Room Name:</strong> <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${roomName}</code></p>
                <p><strong>👨‍💼 Your Display Name:</strong> <code style="background: #dbeafe; padding: 2px 6px; border-radius: 4px; color: #1e40af;">${interviewerName}</code></p>
              </div>
              
              <div style="background: #dbeafe; border: 2px solid #2563eb; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                <h3 style="color: #1e40af; margin-top: 0;">🎥 JOIN INTERVIEW ROOM</h3>
                <p style="font-size: 16px; margin-bottom: 15px;"><strong>Click the button below to join the interview:</strong></p>
                <a href="${roomUrl}" target="_blank" style="display: inline-block; background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; margin: 10px;">
                  🚀 JOIN INTERVIEW NOW
                </a>
                <p style="font-size: 12px; color: #6b7280; margin-top: 10px;">
                  Or copy this link: <a href="${roomUrl}" target="_blank" style="color: #2563eb;">${roomUrl}</a>
                </p>
              </div>
              
              <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 15px 0;">
                <h4 style="color: #92400e; margin-top: 0;">📋 Interview Instructions:</h4>
                <ol style="margin: 10px 0; padding-left: 20px;">
                  <li>Click the "JOIN INTERVIEW NOW" button above</li>
                  <li>Allow camera and microphone access when prompted</li>
                  <li>Wait for the candidate to join the room</li>
                  <li>Conduct the interview using professional standards</li>
                  <li>Provide constructive feedback after the interview</li>
                </ol>
              </div>
              
              <div style="background: #dcfce7; border: 1px solid #22c55e; border-radius: 8px; padding: 15px; margin: 15px 0;">
                <h4 style="color: #166534; margin-top: 0;">⏰ Important Notes:</h4>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>This is a live mock interview session</li>
                  <li>The candidate has already paid and is waiting</li>
                  <li>Please join within 5-10 minutes of receiving this email</li>
                  <li>If you cannot conduct this interview, please respond immediately</li>
                  <li><strong>Your display name will be: ${interviewerName}</strong></li>
                  <li><strong>Candidate's display name will be: ${interviewData?.userName || 'Candidate'}</strong></li>
                </ul>
              </div>
            </div>
            
            <div style="background: #f3f4f6; padding: 15px; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Best regards,<br>
                <strong>AI-PREPIFY Team</strong><br>
                <em>Professional Mock Interview Platform</em>
              </p>
            </div>
          </div>
        `
      };
      
      await API.post('/email/send-interviewer-email', emailData);
      console.log('Interviewer email sent successfully');
    } catch (error) {
      console.error('Failed to send interviewer email:', error);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSuccess(true);
    
    // Generate a unique room name for the interview
    const uniqueRoomName = `MockInterview-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setRoomName(uniqueRoomName);
    
    // Send email to interviewer
    await sendInterviewerEmail(uniqueRoomName);
    
    // Store interview data in backend
    try {
      const interviewRecord = {
        title: interviewData?.jobRole || 'Live Mock Interview',
        role: interviewData?.jobDesc || '',
        company: '',
        notes: '',
        questions: [],
        yearsOfExperience: interviewData?.experience || 0,
        skills: [],
        specialist: true,
        humanSpecialist: true,
        roomName: uniqueRoomName,
        status: 'scheduled',
        scheduledAt: new Date().toISOString()
      };
      
      const response = await API.post('/interviews', interviewRecord);
      console.log('Interview record created:', response.data);
      
      // Navigate directly to video room after 2 seconds
      setTimeout(() => {
        navigate(`/live-interview/${uniqueRoomName}`, {
          state: {
            userDisplayName: interviewData?.userName || 'Candidate',
            jobRole: interviewData?.jobRole || 'Interview',
            isInterviewer: false
          }
        });
      }, 2000);
    } catch (error) {
      console.error('Failed to create interview record:', error);
      // Still navigate to video room even if record creation fails
      setTimeout(() => {
        navigate(`/live-interview/${uniqueRoomName}`, {
          state: {
            userDisplayName: interviewData?.userName || 'Candidate',
            jobRole: interviewData?.jobRole || 'Interview',
            isInterviewer: false
          }
        });
      }, 2000);
    }
  };

  const handleEndInterview = () => {
    setShowVideoRoom(false);
    onClose();
  };

  if (showVideoRoom) {
    return <LiveInterviewRoom roomName={roomName} onEndInterview={handleEndInterview} />;
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in">
        <button className="absolute top-3 left-3 text-2xl text-gray-400 hover:text-gray-700" onClick={onBack} title="Back">
          <span aria-hidden="true">&#8592;</span>
        </button>
        <button className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-gray-700" onClick={onClose} title="Close">&times;</button>
        <h2 className={`text-2xl font-extrabold mb-2 text-blue-600 text-center`}>Payment for Interview</h2>
        <div className="mb-4 p-4 rounded-lg bg-gray-50 border">
          <div className="font-bold text-lg mb-1">Special Offer Plan</div>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>Price: <span className={`font-bold text-blue-600`}>₹{details.price}</span> <span className="ml-2 text-green-600 font-semibold">({details.discount})</span></li>
            <li>Validity: {details.validity}</li>
            <li>Can take <span className="font-bold">{details.tests} live tests</span> within the time limit</li>
          </ul>
        </div>
        {success ? (
          <div className="text-center py-8">
            <div className="text-green-600 font-bold mb-4">Payment Successful!</div>
            <div className="text-gray-600 mb-4">Preparing your live interview room...</div>
            <div className="text-sm text-gray-500 mb-4">Interviewer will be notified automatically</div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input name="name" value={form.name} onChange={handleChange} required placeholder="Name on Card" className="w-full border rounded px-3 py-2" />
            <input name="email" value={form.email} onChange={handleChange} required type="email" placeholder="Email" className="w-full border rounded px-3 py-2" />
            <input name="card" value={form.card} onChange={handleChange} required placeholder="Card Number" className="w-full border rounded px-3 py-2" maxLength={16} />
            <div className="flex gap-2">
              <input name="expiry" value={form.expiry} onChange={handleChange} required placeholder="MM/YY" className="w-1/2 border rounded px-3 py-2" maxLength={5} />
              <input name="cvv" value={form.cvv} onChange={handleChange} required placeholder="CVV" className="w-1/2 border rounded px-3 py-2" maxLength={4} />
            </div>
            <div className="flex gap-2">
              <button type="submit" className={`w-1/2 py-2 rounded font-bold text-white bg-blue-500 hover:bg-blue-700 transition`}>Pay ₹{details.price}</button>
              <button type="button" className="w-1/2 py-2 rounded font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition" onClick={onClose}>Cancel</button>
            </div>
          </form>
        )}
      </div>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.7s ease-in; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

// SubscriptionPlans: accept an optional onBack prop to control back navigation
const SubscriptionPlans = ({ open, onClose, onBack, interviewData }) => {
  const [paymentPlan, setPaymentPlan] = useState(null);
  if (!open) return null;
  const details = planDetails.Single;
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg max-h-[80vh] overflow-y-auto relative animate-fade-in">
          <button className="absolute top-3 left-3 text-2xl text-gray-400 hover:text-gray-700" onClick={onBack || onClose} title="Back">
            <span aria-hidden="true">&#8592;</span>
          </button>
          <button className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-gray-700" onClick={onClose} title="Close">&times;</button>
          <h2 className="text-2xl font-extrabold text-[#3b3bb3] mb-1 text-center">Purchase Interview</h2>
          <p className="text-gray-600 mb-3 text-center">Book your appointment with an industrial Professional for a live mock interview</p>
          <div className="border-2 border-blue-200 rounded-xl p-6 flex flex-col items-center bg-blue-50 mb-4">
            <div className="text-2xl font-bold text-blue-600 mb-1">Special Offer</div>
            <div className="text-lg font-extrabold text-blue-600 mb-0.5">₹49 <span className="text-base font-normal ml-2 text-green-600 font-semibold">({details.discount})</span></div>
            <ul className="text-gray-700 text-sm mb-3 space-y-1 text-left w-full">
              <li>✓ Validity: {details.validity}</li>
              <li>✓ Can take {details.tests} live tests within the time limit</li>
              <li>✓ Pay only for what you use</li>
            </ul>
            <button className="bg-blue-500 text-white font-bold px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition text-base mt-2" onClick={() => setPaymentPlan('Single')}>Purchase</button>
          </div>
          <h3 className="text-base font-bold mb-1 mt-2 text-center">Features</h3>
          <ul className="bg-gray-50 rounded-xl p-4 text-gray-700 text-sm space-y-1">
            {details.features.map((feature, idx) => (
              <li key={idx}>• {feature}</li>
            ))}
          </ul>
        </div>
        <style>{`
          .animate-fade-in { animation: fadeIn 0.7s ease-in; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
      <PaymentModal
        open={!!paymentPlan}
        plan={paymentPlan}
        onClose={() => setPaymentPlan(null)}
        onBack={onBack ? () => { setPaymentPlan(null); onBack(); } : () => setPaymentPlan(null)}
        interviewData={interviewData}
      />
    </>
  );
};

export default SubscriptionPlans; 