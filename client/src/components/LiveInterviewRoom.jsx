import React, { useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import API from '../api';

const LiveInterviewRoom = ({ 
  roomName: propRoomName, 
  isInterviewer = false, 
  userDisplayName = 'Candidate',
  jobRole = 'Interview'
}) => {
  const { roomName: urlRoomName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const jitsiContainerRef = useRef(null);
  const apiRef = useRef(null);

  // Get state from navigation or use props
  const state = location.state || {};
  const finalUserDisplayName = state.userDisplayName || userDisplayName;
  const finalJobRole = state.jobRole || jobRole;
  const finalIsInterviewer = state.isInterviewer || isInterviewer;

  // Use roomName from props, URL params, or generate a new one
  const uniqueRoomName =
    propRoomName ||
    urlRoomName ||
    `MockInterview-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Set display names based on role
  const interviewerDisplayName = `${finalJobRole} Specialist`;
  const candidateDisplayName = finalUserDisplayName;

  useEffect(() => {
    if (apiRef.current) {
      apiRef.current.dispose();
    }
    const domain = 'meet.jit.si';
    const options = {
      roomName: uniqueRoomName,
      parentNode: jitsiContainerRef.current,
      width: '100%',
      height: 600,
      userInfo: {
        displayName: finalIsInterviewer ? interviewerDisplayName : candidateDisplayName,
      },
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        prejoinPageEnabled: false,
        requireDisplayName: false,
        disableModeratorIndicator: true,
        enableClosePage: false,
        enableWelcomePage: false,
        enableLobbyChat: false,
        enableKnocking: false,
        enablePrejoinPage: false,
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_POWERED_BY: false,
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
          'fodeviceselection', 'hangup', 'chat', 'recording',
          'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
          'videoquality', 'filmstrip', 'feedback', 'stats', 'shortcuts',
          'tileview', 'select-background', 'download', 'help', 'mute-everyone', 'security'
        ],
      },
    };
    apiRef.current = new window.JitsiMeetExternalAPI(domain, options);
    apiRef.current.addListener('readyToClose', () => {
      if (finalIsInterviewer) {
        apiRef.current.executeCommand('hangup');
      }
      navigate('/interviews');
    });
    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
      }
    };
    // eslint-disable-next-line
  }, [uniqueRoomName, finalIsInterviewer, finalUserDisplayName, finalJobRole]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
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
            You are: {finalIsInterviewer ? interviewerDisplayName : candidateDisplayName}
          </div>
        </div>
      </div>
      {finalIsInterviewer && (
        <div className="bg-yellow-100 text-yellow-800 p-2 rounded mb-2 text-center">
          Please allow <b>microphone</b> and <b>camera</b> access when prompted by your browser.<br/>
          If you do not see a prompt, check your browser permissions (click the lock icon near the address bar).
        </div>
      )}
      <div ref={jitsiContainerRef} style={{ flex: 1, minHeight: 600 }} />
    </div>
  );
};

export default LiveInterviewRoom;