import React, { useEffect } from 'react';
import { AI_AVATAR } from '../utils/aiAnalysis';

const InterviewSession = ({
  currentQ,
  totalQ,
  question,
  aiSpeaking,
  videoRef,
  mediaStream,
  cameraOn,
  speechRecognitionSupported,
  isListening,
  transcribedText,
  speechError,
  recording,
  textAnswer,
  setTextAnswer,
  setTranscribedText,
  setSpeechError,
  setAudioURL,
  setVideoURL,
  audioURL,
  videoURL,
  handleMic,
  userAnswers,
  setUserAnswers,
  setCurrentQ,
  setShowReport,
  cleanupCamera
}) => {
  useEffect(() => {
    if (cameraOn && mediaStream && videoRef.current) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play().catch(e => console.error('Video play error:', e));
      };
    }
    if (!cameraOn && videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [mediaStream, cameraOn, videoRef]);

  // Text-to-speech: read the question aloud when it changes
  useEffect(() => {
    if (question && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel(); // Cancel any previous speech
      const utter = new window.SpeechSynthesisUtterance(question);
      utter.rate = 1;
      utter.pitch = 1;
      utter.lang = 'en-US';
      window.speechSynthesis.speak(utter);
      return () => window.speechSynthesis.cancel();
    }
  }, [question]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f8fafc] to-[#e0e7ff] py-4 px-1 sm:py-8 sm:px-4 overflow-x-hidden">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold mb-4 text-center">Interview in Progress</h1>
      <div className="flex flex-col gap-4 w-full max-w-5xl mb-6 sm:mb-8 lg:flex-row lg:gap-8">
        {/* AI Avatar */}
        <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl border p-3 sm:p-6 mb-2 lg:mb-0 w-full">
          <img src={AI_AVATAR} alt="AI Avatar" className="w-20 h-20 xs:w-24 xs:h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full mb-2 sm:mb-4 border-4 border-[#3b3bb3] shadow" />
          <div className="font-bold text-[#3b3bb3] text-base sm:text-lg mb-1 sm:mb-2">AI Interviewer</div>
          <div className="text-gray-600 text-center text-xs sm:text-base">{aiSpeaking ? 'Reading question...' : 'Ready'}</div>
        </div>
        {/* User Webcam */}
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-100 rounded-xl border p-3 sm:p-6 w-full">
          {cameraOn ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-20 h-20 xs:w-24 xs:h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 rounded-lg object-cover border-2 border-gray-300 bg-black"
            />
          ) : (
            <div className="w-20 h-20 xs:w-24 xs:h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 rounded-lg object-cover border-2 border-gray-300 bg-black flex items-center justify-center text-white">
              Camera is off
            </div>
          )}
          <div className="mt-2 text-center font-semibold text-xs sm:text-base">Your Camera</div>
          {cameraOn && !mediaStream && (
            <div className="mt-1 text-center text-xs text-red-600">
              Camera not connected. Please check permissions.
            </div>
          )}
        </div>
      </div>
      {/* Question and Answer Section */}
      <div className="w-full max-w-2xl bg-white rounded-xl shadow p-3 sm:p-6 mb-4 sm:mb-6">
        <div className="text-[#3b3bb3] font-bold mb-1 sm:mb-2 text-xs sm:text-base">Question {currentQ + 1} of {totalQ}</div>
        <div className="text-sm sm:text-lg font-semibold mb-2 sm:mb-4 break-words">{question}</div>
        {/* Speech Recognition Status */}
        {speechRecognitionSupported && (
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-center gap-2 mb-1 sm:mb-2">
              <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="font-semibold text-blue-800 text-xs sm:text-base">
                {isListening ? 'Listening...' : 'Speech Recognition Ready'}
              </span>
            </div>
            {!speechRecognitionSupported && (
              <p className="text-xs sm:text-sm text-blue-600">Speech recognition not supported in your browser. Please type your answers.</p>
            )}
          </div>
        )}
        {/* Speech Recognition Error */}
        {speechError && (
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg bg-red-50 border border-red-200">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold text-red-800 text-xs sm:text-sm">Speech Recognition Error:</span>
            </div>
            <p className="mt-1 text-red-700 text-xs sm:text-sm">{speechError}</p>
          </div>
        )}
        {/* Transcribed Text Display */}
        {isListening && transcribedText && (
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg bg-green-50 border border-green-200">
            <div className="font-semibold text-green-800 mb-1 text-xs sm:text-sm">What you're saying:</div>
            <div className="text-green-700 italic text-xs sm:text-sm">{transcribedText}</div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center">
          <button
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-semibold border-2 ${recording ? 'bg-red-500 text-white border-red-500' : 'bg-white text-[#3b3bb3] border-[#3b3bb3]'} transition text-xs sm:text-base`}
            onClick={handleMic}
          >
            {recording ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-3-3h-4a3 3 0 00-3 3v2h5z" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18v-6m0 0a2 2 0 012-2h0a2 2 0 012 2v6a2 2 0 01-2 2h0a2 2 0 01-2-2z" /></svg>
            )}
            {recording ? 'Stop Recording' : 'Start Recording'}
          </button>
          <input
            type="text"
            className="flex-1 border-2 border-[#6366f1] rounded-lg px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3b3bb3] bg-white text-gray-900 transition text-xs sm:text-base"
            placeholder="Type your answer or use the recording..."
            value={textAnswer}
            onChange={e => setTextAnswer(e.target.value)}
            disabled={recording}
          />
        </div>
        {/* Clear Text Button */}
        {(textAnswer || transcribedText) && (
          <div className="mt-2 flex justify-end">
            <button
              className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 underline"
              onClick={() => {
                setTextAnswer("");
                setTranscribedText("");
                setSpeechError("");
                setAudioURL(null);
                setVideoURL(null);
              }}
            >
              Clear Text
            </button>
          </div>
        )}
        {(audioURL || videoURL) && (
          <div className="mt-2 space-y-2">
            {videoURL && <video controls className="w-full max-w-md rounded" src={videoURL} />}
            {audioURL && <audio controls className="w-full" src={audioURL} />}
          </div>
        )}
        <div className="flex justify-end mt-4 sm:mt-6">
          <button
            className="bg-[#3b3bb3] text-white font-bold px-4 sm:px-8 py-2 sm:py-3 rounded-xl shadow-lg hover:bg-[#23237a] transition-all text-xs sm:text-lg"
            onClick={async () => {
              // Save answer and go to next question or show report
              // Use transcribed text if available, otherwise use typed text
              const finalAnswer = transcribedText || textAnswer;
              setUserAnswers([...userAnswers, { 
                text: finalAnswer, 
                audio: audioURL, 
                video: videoURL,
                transcribedText: transcribedText // Store transcribed text separately
              }]);
              setTextAnswer("");
              setTranscribedText("");
              setSpeechError("");
              setAudioURL(null);
              setVideoURL(null);
              if (currentQ + 1 < totalQ) {
                setCurrentQ(currentQ + 1);
              } else {
                // Cleanup camera only when finishing the interview
                cleanupCamera();
                setShowReport(true);
              }
            }}
            disabled={recording || (!textAnswer && !audioURL && !videoURL && !transcribedText)}
          >
            {currentQ + 1 < totalQ ? 'Next Question' : 'Finish Interview'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewSession; 