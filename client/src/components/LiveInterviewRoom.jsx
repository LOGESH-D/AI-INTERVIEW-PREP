import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaVideo, FaMicrophone, FaMicrophoneSlash, FaVideoSlash, FaPhoneSlash, FaComments, FaCog } from 'react-icons/fa';
import API from '../api';

const LiveInterviewRoom = ({ roomName: propRoomName, onEndInterview }) => {
  const { roomName: urlRoomName } = useParams();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [interviewTime, setInterviewTime] = useState(0);
  const [isInterviewCompleted, setIsInterviewCompleted] = useState(false);
  const navigate = useNavigate();

  // Use roomName from props, URL params, or generate a new one
  const uniqueRoomName = propRoomName || urlRoomName || `MockInterview-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Fix: Use the correct Jitsi Meet URL format without any authentication
  const jitsiUrl = `https://meet.jit.si/${uniqueRoomName}#config.startWithAudioMuted=false&config.startWithVideoMuted=false&config.prejoinPageEnabled=false&config.requireDisplayName=false&config.disableModeratorIndicator=true&config.enableClosePage=false&config.enableWelcomePage=false&config.enableLobbyChat=false&config.enableKnocking=false&config.enablePrejoinPage=false`;

  // Timer for interview duration
  useEffect(() => {
    const timer = setInterval(() => {
      setInterviewTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const updateInterviewStatus = async (status) => {
    try {
      // Find the interview record by room name and update its status
      const response = await API.get('/interviews');
      const interviews = response.data;
      const interviewRecord = interviews.find(interview => interview.roomName === uniqueRoomName);
      
      if (interviewRecord) {
        await API.patch(`/interviews/${interviewRecord._id}`, {
          status: status,
          completedAt: status === 'completed' ? new Date().toISOString() : null,
          duration: status === 'completed' ? interviewTime : null
        });
        console.log(`Interview status updated to: ${status}`);
      }
    } catch (error) {
      console.error('Failed to update interview status:', error);
    }
  };

  const handleEndInterview = async () => {
    if (window.confirm('Are you sure you want to end this interview? This action cannot be undone.')) {
      setIsInterviewCompleted(true);
      
      // Update interview status to completed
      await updateInterviewStatus('completed');
      
      // Show completion message
      alert('Interview completed successfully! You will be redirected to the interviews page.');
      
      // Call the onEndInterview callback if provided
      if (onEndInterview) {
        onEndInterview();
      } else {
        // Navigate to interviews page
        navigate('/interviews');
      }
    }
  };

  const handleLeaveInterview = async () => {
    if (window.confirm('Are you sure you want to leave this interview? Your progress will be saved.')) {
      // Update interview status to in-progress
      await updateInterviewStatus('in-progress');
      
      navigate('/interviews');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-lg px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-semibold text-gray-800">Live Interview</span>
          </div>
          <div className="text-sm text-gray-600">
            Room: {uniqueRoomName}
          </div>
          <div className="text-sm text-gray-600">
            Duration: {formatTime(interviewTime)}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowChat(!showChat)}
            className={`p-2 rounded-lg transition-colors ${
              showChat ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Chat"
          >
            <FaComments />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-colors ${
              showSettings ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Settings"
          >
            <FaCog />
          </button>
          <button
            onClick={handleEndInterview}
            className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center space-x-2"
          >
            <FaPhoneSlash />
            <span>End Interview</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Conference Area */}
        <div className="flex-1 relative">
          <iframe
            title="Jitsi Meet"
            src={jitsiUrl}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            className="bg-black"
            frameBorder="0"
            allowFullScreen
          />
        </div>

        {/* Sidebar */}
        {(showChat || showSettings) && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            {showChat && (
              <div className="flex-1 p-4">
                <h3 className="font-semibold text-gray-800 mb-4">Interview Chat</h3>
                <div className="bg-gray-50 rounded-lg p-3 mb-4 h-64 overflow-y-auto">
                  <div className="text-sm text-gray-600">
                    <p className="mb-2"><strong>System:</strong> Welcome to your mock interview! The interviewer will join shortly.</p>
                    <p className="mb-2"><strong>System:</strong> Please ensure your camera and microphone are working properly.</p>
                    <p className="mb-2"><strong>System:</strong> You can use the chat to communicate with the interviewer during the session.</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                  <button className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600">
                    Send
                  </button>
                </div>
              </div>
            )}

            {showSettings && (
              <div className="flex-1 p-4">
                <h3 className="font-semibold text-gray-800 mb-4">Interview Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Microphone</span>
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`p-2 rounded-lg transition-colors ${
                        isMuted ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                      }`}
                    >
                      {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Camera</span>
                    <button
                      onClick={() => setIsVideoOff(!isVideoOff)}
                      className={`p-2 rounded-lg transition-colors ${
                        isVideoOff ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                      }`}
                    >
                      {isVideoOff ? <FaVideoSlash /> : <FaVideo />}
                    </button>
                  </div>
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Interview Tips</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Maintain eye contact with the camera</li>
                      <li>• Speak clearly and at a moderate pace</li>
                      <li>• Use the STAR method for behavioral questions</li>
                      <li>• Be honest about your experience</li>
                      <li>• Ask thoughtful questions at the end</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
            <span>{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>
          
          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isVideoOff ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isVideoOff ? <FaVideoSlash /> : <FaVideo />}
            <span>{isVideoOff ? 'Start Video' : 'Stop Video'}</span>
          </button>
          
          <button
            onClick={() => setShowChat(!showChat)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              showChat ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FaComments />
            <span>Chat</span>
          </button>
          
          <button
            onClick={handleLeaveInterview}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition-colors"
          >
            <FaPhoneSlash />
            <span>Leave Interview</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveInterviewRoom;