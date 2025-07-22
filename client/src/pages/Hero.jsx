import React, { useContext } from 'react';
import { 
  FaRocket, 
  FaChartLine, 
  FaVideo, 
  FaMicrophone, 
  FaDownload, 
  FaShieldAlt, 
  FaRedoAlt, 
  FaMobile,
  FaCheckCircle,
  FaUsers,
  FaClock,
  FaStar,
  FaPlay,
  FaArrowRight,
  FaGlobe,
  FaHeadset,
  FaWifi,
  FaEnvelope
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const features = [
  { icon: FaRocket, text: 'AI-powered mock interviews', color: 'text-blue-500' },
  { icon: FaChartLine, text: 'Real-time feedback & scoring', color: 'text-green-500' },
  { icon: FaVideo, text: 'Skill-based analytics', color: 'text-purple-500' },
  { icon: FaMicrophone, text: 'Video & audio answer support', color: 'text-red-500' },
  { icon: FaDownload, text: 'Downloadable feedback reports', color: 'text-indigo-500' },
  { icon: FaMobile, text: 'Responsive, modern UI', color: 'text-pink-500' },
  { icon: FaShieldAlt, text: 'Secure authentication', color: 'text-yellow-500' },
  { icon: FaRedoAlt, text: 'Retake interviews anytime', color: 'text-teal-500' },
];

const goals = [
  { icon: FaUsers, text: 'Help users prepare for real interviews' },
  { icon: FaChartLine, text: 'Identify strengths and areas for improvement' },
  { icon: FaRocket, text: 'Provide actionable, AI-driven feedback' },
  { icon: FaGlobe, text: 'Make interview practice accessible to everyone' },
];

const requirements = [
  { icon: FaGlobe, text: 'Modern browser (Chrome, Edge, Firefox, Safari)' },
  { icon: FaHeadset, text: 'Webcam and microphone access' },
  { icon: FaWifi, text: 'Stable internet connection' },
  { icon: FaEnvelope, text: 'Personal email for registration' },
];

const stats = [
  { number: '10K+', label: 'Users Trained', icon: FaUsers },
  { number: '95%', label: 'Success Rate', icon: FaStar },
  { number: '24/7', label: 'Available', icon: FaClock },
  { number: '50+', label: 'Interview Types', icon: FaPlay },
];

const Hero = ({ onRegisterClick }) => {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const handleGetStarted = () => {
    if (token) {
      navigate('/interviews');
    } else if (onRegisterClick) {
      onRegisterClick();
    }
  };
  
  const handleWatchDemo = () => {
    // Replace with your demo logic
    console.log('Open demo video');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-green-400 to-blue-400 rounded-full opacity-10 animate-pulse"></div>
        {/* Centered image inside the main circle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-96 h-96 pointer-events-none">
          <img
            src="/AI-PREPIFY-center.png"
            alt="AI Prepify Center"
            className="w-[20rem] h-[20rem] object-contain opacity-90"
          />
        </div>
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="relative flex flex-col items-center">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-lg">
                <FaRocket className="animate-bounce" />
                <span>AI-Powered Interview Platform</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 mb-6 leading-tight">
                Master Your Next
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
                  Interview
                </span>
              </h1>
            </div>
            
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed">
              Practice with AI-powered mock interviews, get instant feedback, and boost your confidence. 
              Transform your interview skills with personalized analytics and expert guidance.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                className="group bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-purple-500/25 hover:scale-105 transition-all duration-300 flex items-center gap-3"
                onClick={handleGetStarted}
              >
                <FaPlay className="group-hover:animate-pulse" />
                Start Free Trial
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="group bg-white/80 backdrop-blur-sm text-purple-600 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-purple-200 flex items-center gap-3" onClick={handleWatchDemo}>
                <FaVideo className="group-hover:animate-pulse" />
                Watch Demo
              </button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/50">
                <stat.icon className="text-3xl text-purple-600 mx-auto mb-3" />
                <div className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">{stat.number}</div>
                <div className="text-sm sm:text-base text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Dashboard Preview */}
          <div className="mb-16 relative">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-1 shadow-2xl">
              <div className="bg-white rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-blue-500"></div>
                <img 
                  src="/dash.png" 
                  alt="AI Interview Dashboard" 
                  className="w-full h-auto rounded-2xl shadow-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-transparent rounded-2xl pointer-events-none"></div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="mb-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 sm:p-12 shadow-2xl border border-white/50">
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-4">
                  About This Platform
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full"></div>
              </div>
              <p className="text-lg sm:text-xl text-gray-700 leading-relaxed text-center max-w-4xl mx-auto">
                Our cutting-edge platform harnesses the power of artificial intelligence to create realistic interview scenarios, 
                provide instant comprehensive feedback, and track your progress with detailed analytics. Whether you're a fresh graduate, 
                career changer, or seasoned professional, our AI-driven approach helps you practice effectively and build unshakeable confidence.
              </p>
            </div>
          </div>

          {/* Features Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-4">
                Powerful Features
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-white/50">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br from-white to-gray-100 shadow-md group-hover:shadow-lg transition-all duration-300`}>
                      <feature.icon className={`text-2xl ${feature.color} group-hover:scale-110 transition-transform duration-300`} />
                    </div>
                  </div>
                  <p className="text-gray-800 font-medium text-sm sm:text-base group-hover:text-gray-900 transition-colors">
                    {feature.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Goals Section */}
          <div className="mb-16">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-1 shadow-2xl">
              <div className="bg-white rounded-3xl p-8 sm:p-12">
                <div className="text-center mb-8">
                  <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-4">
                    Our Mission
                  </h2>
                  <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {goals.map((goal, index) => (
                    <div key={index} className="flex items-start gap-4 p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-100 hover:shadow-lg transition-all duration-300">
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl text-white shadow-lg">
                        <goal.icon className="text-xl" />
                      </div>
                      <p className="text-gray-800 font-medium text-base sm:text-lg flex-1">
                        {goal.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Requirements Section */}
          <div className="mb-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 sm:p-12 shadow-2xl border border-white/50">
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-4">
                  System Requirements
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full"></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {requirements.map((req, index) => (
                  <div key={index} className="flex flex-col items-center text-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <div className="p-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl text-white mb-4 shadow-lg">
                      <req.icon className="text-2xl" />
                    </div>
                    <p className="text-gray-800 font-medium text-sm sm:text-base">
                      {req.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 sm:p-12 text-white shadow-2xl">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Ace Your Next Interview?
            </h2>
            <p className="text-lg sm:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of successful candidates who've transformed their interview skills with our AI-powered platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                className="group bg-white text-purple-600 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-3"
                onClick={handleGetStarted}
              >
                <FaRocket className="group-hover:animate-pulse" />
                Get Started Now
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="flex items-center gap-2 text-white/90">
                <FaCheckCircle />
                <span>No credit card required</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;