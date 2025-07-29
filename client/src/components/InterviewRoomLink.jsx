import React, { useState } from 'react';
import { FaCopy, FaShare, FaWhatsapp, FaEnvelope } from 'react-icons/fa';
import { toast } from 'react-toastify';

const InterviewRoomLink = ({ roomName, onJoinInterview }) => {
  const [copied, setCopied] = useState(false);
  const roomUrl = `https://meet.jit.si/${roomName}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(roomUrl);
      setCopied(true);
      toast.success('Room link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const shareViaWhatsApp = () => {
    const message = `Join my mock interview session: ${roomUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareViaEmail = () => {
    const subject = 'Mock Interview Session Link';
    const body = `Please join my mock interview session using this link: ${roomUrl}`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in">
        <h2 className="text-2xl font-extrabold text-[#3b3bb3] mb-4 text-center">Interview Room Ready!</h2>
        
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">Room Information</h3>
          <p className="text-sm text-blue-700 mb-2">Room Name: <span className="font-mono bg-white px-2 py-1 rounded">{roomName}</span></p>
          <p className="text-sm text-blue-700">Share this link with your interviewer to start the session.</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Interview Room Link</label>
          <div className="flex">
            <input
              type="text"
              value={roomUrl}
              readOnly
              className="flex-1 border-2 border-[#6366f1] rounded-l-lg px-4 py-2 bg-gray-50 text-gray-700"
            />
            <button
              onClick={copyToClipboard}
              className={`px-4 py-2 rounded-r-lg border-2 border-l-0 border-[#6366f1] transition-colors ${
                copied ? 'bg-green-500 text-white' : 'bg-[#6366f1] text-white hover:bg-[#3b3bb3]'
              }`}
            >
              <FaCopy />
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-semibold text-gray-700 mb-3">Share via:</h4>
          <div className="flex gap-3">
            <button
              onClick={shareViaWhatsApp}
              className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              <FaWhatsapp />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={shareViaEmail}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <FaEnvelope />
              <span>Email</span>
            </button>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-yellow-800 mb-2">Instructions:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Share the room link with your interviewer</li>
            <li>• Wait for the interviewer to join the room</li>
            <li>• Ensure your camera and microphone are working</li>
            <li>• Click "Join Interview" when ready to start</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onJoinInterview}
            className="flex-1 bg-[#3b3bb3] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#23237a] transition-colors"
          >
            Join Interview
          </button>
          <button
            onClick={() => window.close()}
            className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.7s ease-in; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default InterviewRoomLink;