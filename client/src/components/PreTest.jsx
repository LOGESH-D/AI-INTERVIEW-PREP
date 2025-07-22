import React, { useState, useEffect, useRef } from 'react';
import {
  FaVideo,
  FaMicrophone,
  FaVideoSlash,
  FaMicrophoneSlash,
  FaPlay,
  FaInfoCircle,
  FaCheckCircle,
  FaSignOutAlt,
  FaQuestionCircle,
  FaTools,
} from 'react-icons/fa';

const PreTest = ({
  interview,
  handleTestStart,
  startWarning,
  setStartWarning,
  showExitModal,
  setShowExitModal,
  modalAction,
  setModalAction,
  navigate,
}) => {
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const videoRef = useRef(null);

  // Toggle camera only
  const handleToggleCamera = async () => {
    if (!cameraOn) {
      // Turn on camera (preserve mic state)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: micOn // only request audio if mic is on
      });
      setMediaStream(stream);
      setCameraOn(true);
      if (micOn) setMicOn(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(e => console.error('Video play error:', e));
        };
      }
    } else {
      // Turn off camera, keep mic if on
      if (mediaStream) {
        mediaStream.getVideoTracks().forEach(track => track.stop());
        if (mediaStream.getAudioTracks().length && micOn) {
          // Keep audio stream alive
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setMediaStream(audioStream);
          if (videoRef.current) videoRef.current.srcObject = null;
        } else {
          setMediaStream(null);
          if (videoRef.current) videoRef.current.srcObject = null;
        }
      }
      setCameraOn(false);
    }
  };

  // Toggle mic only
  const handleToggleMic = async () => {
    if (!micOn) {
      // Turn on mic (preserve camera state)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: cameraOn,
        audio: true
      });
      setMediaStream(stream);
      setMicOn(true);
      if (cameraOn) setCameraOn(true);
      if (videoRef.current && cameraOn) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(e => console.error('Video play error:', e));
        };
      }
    } else {
      // Turn off mic, keep camera if on
      if (mediaStream) {
        mediaStream.getAudioTracks().forEach(track => track.stop());
        if (mediaStream.getVideoTracks().length && cameraOn) {
          // Keep video stream alive
          const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
          setMediaStream(videoStream);
          if (videoRef.current) {
            videoRef.current.srcObject = videoStream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current.play().catch(e => console.error('Video play error:', e));
            };
          }
        } else {
          setMediaStream(null);
          if (videoRef.current) videoRef.current.srcObject = null;
        }
      }
      setMicOn(false);
    }
  };

  // Assign stream to video element after it's available
  useEffect(() => {
    if (videoRef.current && mediaStream) {
      try {
        videoRef.current.srcObject = mediaStream;
      } catch (err) {
        console.error("Error assigning stream:", err);
      }
    }
  }, [mediaStream]);

  // Stop media on component unmount
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mediaStream]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 via-white to-blue-100 px-2 py-8">
      <div className="w-full max-w-5xl bg-white/95 rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-gray-200">
        {/* Left: Video Preview and Device Controls */}
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 p-8 min-h-[400px] relative">
          {/* Video or Placeholder in Black Box */}
          <div className="relative w-[400px] h-[250px] rounded-xl bg-black border-2 border-gray-400 flex items-center justify-center mb-8">
            {cameraOn ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                className="absolute top-0 left-0 w-full h-full object-cover rounded-xl"
                style={{ background: 'black' }}
              />
            ) : (
              <span className="text-white text-lg">Camera is off</span>
            )}
          </div>
          {/* Device Controls */}
          <div className="flex gap-6 mt-8">
            <button
              className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg border-2 transition-all duration-200 ${cameraOn ? 'bg-green-500 text-white border-green-600 hover:bg-green-600' : 'bg-gray-700 text-white border-gray-600 hover:bg-gray-800'}`}
              onClick={handleToggleCamera}
              aria-label={cameraOn ? 'Turn off camera' : 'Turn on camera'}
            >
              {cameraOn ? <FaVideo /> : <FaVideoSlash />}
            </button>
            <button
              className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg border-2 transition-all duration-200 ${micOn ? 'bg-green-500 text-white border-green-600 hover:bg-green-600' : 'bg-gray-700 text-white border-gray-600 hover:bg-gray-800'}`}
              onClick={handleToggleMic}
              aria-label={micOn ? 'Mute microphone' : 'Unmute microphone'}
            >
              {micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
            </button>
          </div>
          {/* Status Text */}
          <div className="flex gap-4 mt-4 text-sm">
            <span className={`flex items-center gap-1 ${cameraOn ? 'text-green-400' : 'text-red-400'}`}><FaVideo /> {cameraOn ? 'Camera On' : 'Camera Off'}</span>
            <span className={`flex items-center gap-1 ${micOn ? 'text-green-400' : 'text-red-400'}`}><FaMicrophone /> {micOn ? 'Mic On' : 'Mic Off'}</span>
          </div>
          {startWarning && <div className="mt-2 text-red-400 font-semibold text-center">{startWarning}</div>}
        </div>

        {/* Right: Info & Controls */}
        <div className="flex-1 flex flex-col justify-center p-8 bg-white gap-6">
          <div className="mb-2">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-lg mb-2">
              <FaInfoCircle /> Interview Details
            </div>
            <div className="text-gray-700 text-base mb-1"><span className="font-semibold">Job Role:</span> {interview.title}</div>
            <div className="text-gray-700 text-base mb-1"><span className="font-semibold">Tech Stack:</span> {interview.role}</div>
            <div className="text-gray-700 text-base mb-1"><span className="font-semibold">Experience:</span> {interview.yearsOfExperience || interview.experience || 'N/A'} years</div>
          </div>

          {/* Cards */}
          <div className="flex flex-col gap-3">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-xl shadow-sm">
              <div className="font-bold flex items-center gap-2 mb-1"><FaInfoCircle /> Information</div>
              <div className="text-sm leading-relaxed">
                Enable your webcam and microphone to start your AI-generated mock interview. You will answer 5 questions and receive a detailed report at the end.<br />
                <span className="font-bold">NOTE:</span> We never record your video. You can disable webcam access at any time.
              </div>
            </div>
            <div className="bg-green-50 border-l-4 border-green-400 text-green-800 p-4 rounded-xl shadow-sm">
              <div className="font-bold flex items-center gap-2 mb-1"><FaCheckCircle /> AI Analysis Available</div>
              <div className="text-sm leading-relaxed">
                AI analysis and feedback will be available after you finish your test.
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <button
              className={`flex items-center gap-2 px-8 py-3 rounded-xl text-white text-lg font-bold shadow transition-all duration-200 ${
                cameraOn && micOn ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
              }`}
              disabled={!(cameraOn && micOn)}
              onClick={() => {
                if (cameraOn && micOn) {
                  setModalAction('start');
                  setShowExitModal(true);
                  setStartWarning('');
                } else {
                  setStartWarning('Please enable both camera and microphone to start the test.');
                }
              }}
            >
              <FaPlay className="text-2xl" /> Start Test
            </button>
            <button
              className="flex items-center gap-2 px-8 py-3 rounded-xl text-white text-lg font-bold bg-red-500 hover:bg-red-600 shadow transition-all duration-200"
              onClick={() => {
                setModalAction('exit');
                setShowExitModal(true);
              }}
            >
              <FaSignOutAlt /> Exit Test
            </button>
          </div>

          {/* Help */}
          <div className="mt-4 text-sm text-gray-600">
            <span className="flex items-center gap-1 cursor-pointer hover:underline" onClick={() => setShowHelp(true)}>
              <FaQuestionCircle /> Having trouble? See help
            </span>
          </div>
          {showHelp && (
            <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-5 rounded-xl shadow-sm">
              <div className="font-bold mb-1 flex items-center gap-2"><FaTools /> How to Enable Camera & Microphone</div>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Click the <b>lock icon</b> or <b>Not Secure</b> in your browser’s address bar.</li>
                <li>Allow <b>Camera</b> and <b>Microphone</b> permissions for this site.</li>
                <li>If you blocked access, click <b>Reset permissions</b> and refresh the page.</li>
                <li>Try a different browser if issues persist.</li>
              </ul>
              <button className="mt-2 text-xs text-blue-600 underline" onClick={() => setShowHelp(false)}>Close help</button>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col items-center">
            <h2 className={`text-2xl font-bold mb-4 ${modalAction === 'exit' ? 'text-red-600' : 'text-blue-600'}`}>
              {modalAction === 'exit' ? 'Exit Mock Interview?' : 'Start Mock Interview?'}
            </h2>
            <p className="mb-6 text-gray-700 text-center">
              {modalAction === 'exit'
                ? 'Are you sure you want to exit? Your progress will not be saved.'
                : 'Are you sure you want to start the test? You will not be able to return to this screen.'}
            </p>
            <div className="flex gap-4 w-full justify-center">
              <button
                className="px-6 py-2 rounded bg-gray-300 text-gray-800 font-semibold hover:bg-gray-400"
                onClick={() => setShowExitModal(false)}
              >
                Cancel
              </button>
              <button
                className={`px-6 py-2 rounded font-semibold ${
                  modalAction === 'exit'
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                onClick={() => {
                  setShowExitModal(false);
                  if (modalAction === 'exit') {
                    navigate('/interviews');
                  } else if (modalAction === 'start') {
                    handleTestStart();
                  }
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreTest;
