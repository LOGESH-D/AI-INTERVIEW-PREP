import React, { useEffect, useState, useContext, useMemo } from 'react';
import API from '../api';
import { AuthContext } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { generateInterviewQuestions } from '../utils/gemini';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FaDownload, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import SubscriptionPlans from '../components/SubscriptionPlans';
import NewInterviewModal from '../components/NewInterviewModal';
import HumanInterviewBookingModal from '../components/HumanInterviewBookingModal';
import FeedbackModal from '../components/FeedbackModal';
import InterviewCard from '../components/InterviewCard';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB');
}

const skillKeywords = [
  { skill: 'communication', keywords: ['communication', 'explain', 'describe', 'collaborate', 'team'] },
  { skill: 'react', keywords: ['react', 'jsx', 'component', 'props', 'state', 'hook'] },
  { skill: 'javascript', keywords: ['javascript', 'js', 'es6', 'variable', 'function', 'array', 'object'] },
  { skill: 'industry awareness', keywords: ['industry', 'trend', 'awareness', 'best practice', 'tool', 'framework'] },
  { skill: 'css', keywords: ['css', 'style', 'layout', 'flex', 'grid', 'responsive'] },
  { skill: 'html', keywords: ['html', 'markup', 'element', 'tag'] },
  { skill: 'soft skills', keywords: ['soft', 'conflict', 'feedback', 'leadership', 'adapt', 'problem'] },
  { skill: 'technical skills', keywords: ['technical', 'algorithm', 'performance', 'optimize', 'debug'] },
];

function categorizeSkill(question, jobRole = '', jobDesc = '') {
  const q = (question + ' ' + jobRole + ' ' + jobDesc).toLowerCase();
  for (const { skill, keywords } of skillKeywords) {
    if (keywords.some(k => q.includes(k))) return skill;
  }
  return 'other';
}

// PDF download function
function downloadReportPDF(reportData) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('Interview Feedback Report', 14, 18);
  doc.setFontSize(12);
  doc.text(`Overall Score: ${reportData.score}/10`, 14, 28);
  
  // Calculate average skill scores
  let avgSkills = { communication: 0, grammar: 0, attitude: 0, softSkills: 0 };
  if (reportData.report && reportData.report.length > 0) {
    const totals = reportData.report.reduce((acc, item) => {
      if (item.skillAnalysis) {
        acc.communication += item.skillAnalysis.communication || 5;
        acc.grammar += item.skillAnalysis.grammar || 5;
        acc.attitude += item.skillAnalysis.attitude || 5;
        acc.softSkills += item.skillAnalysis.softSkills || 5;
      }
      return acc;
    }, { communication: 0, grammar: 0, attitude: 0, softSkills: 0 });
    
    const count = reportData.report.length;
    avgSkills = {
      communication: count > 0 ? Math.round(totals.communication / count * 10) / 10 : 0,
      grammar: count > 0 ? Math.round(totals.grammar / count * 10) / 10 : 0,
      attitude: count > 0 ? Math.round(totals.attitude / count * 10) / 10 : 0,
      softSkills: count > 0 ? Math.round(totals.softSkills / count * 10) / 10 : 0
    };
  }
  
  doc.text(`Communication: ${avgSkills.communication}/10`, 14, 38);
  doc.text(`Grammar & Language: ${avgSkills.grammar}/10`, 14, 48);
  doc.text(`Professional Attitude: ${avgSkills.attitude}/10`, 14, 58);
  doc.text(`Soft Skills: ${avgSkills.softSkills}/10`, 14, 68);
  
  let y = 78;
  if (reportData.report && reportData.report.length > 0) {
    doc.setFontSize(14);
    doc.text('Detailed Question Analysis:', 14, y);
    y += 10;
    doc.setFontSize(12);
    reportData.report.forEach((item, idx) => {
      doc.setFont(undefined, 'bold');
      doc.text(`Q${idx + 1}: ${item.question}`, 14, y);
      y += 8;
      doc.setFont(undefined, 'normal');
      doc.text(`Your Answer: ${item.user || 'No answer'}`, 14, y);
      y += 8;
      doc.text(`Ideal Answer: ${item.ideal}`, 14, y);
      y += 8;
      doc.text(`Content Score: ${item.score}/10`, 14, y);
      y += 8;
      if (item.skillAnalysis) {
        doc.text(`Communication: ${item.skillAnalysis.communication}/10, Grammar: ${item.skillAnalysis.grammar}/10, Attitude: ${item.skillAnalysis.attitude}/10`, 14, y);
        y += 8;
      }
      if (item.skill) {
        doc.text(`Skill Category: ${item.skill}`, 14, y);
        y += 8;
      }
      y += 5;
      if (y > 270) { doc.addPage(); y = 20; }
    });
  }
  doc.save('interview_feedback_report.pdf');
}

const Interviews = () => {
  const { user, logout } = useContext(AuthContext);
  const [interviews, setInterviews] = useState([]);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const [feedbackModal, setFeedbackModal] = useState({ open: false, reportData: null });
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showHumanBooking, setShowHumanBooking] = useState(false);
  const [activeTab, setActiveTab] = useState('ai'); // 'ai' or 'human'

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const res = await API.get('/interviews');
      setInterviews(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch interviews');
      console.error('Fetch interviews error:', err.response?.data || err.message);
    }
  };

  const handleStartInterview = async (info) => {
    // Save interview to backend (without questions)
    try {
      const res = await API.post('/interviews', {
        title: info.jobPosition,
        role: info.jobDesc,
        company: '',
        notes: '',
        questions: info.questions,
        yearsOfExperience: info.jobExperience,
        skills: info.skills
      });
      setShowModal(false);
      navigate(`/questions/${res.data._id}`);
    } catch (err) {
      alert('Failed to create interview.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-2 py-6">
      <h1 className="text-3xl md:text-4xl font-extrabold text-[#3b3bb3] mb-1">Interviews</h1>
      <p className="text-lg text-gray-600 mb-8">Create and Start your AI Mockup Interview</p>
      {/* Add New Card Section */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="flex flex-col items-center w-full">
          <span className="text-lg text-gray-600 mb-2">Take test with AI</span>
          <div
            className="flex items-center justify-center h-32 w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all duration-200"
            onClick={() => setShowModal(true)}
          >
            <span className="text-xl text-gray-500 font-semibold">+ Add New</span>
          </div>
        </div>
        <div className="flex flex-col items-center w-full">
          <span className="text-lg text-gray-600 mb-2">Take test with Recruitment Specialist</span>
          <div
            className="flex items-center justify-center h-32 w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all duration-200"
            onClick={() => setShowHumanBooking(true)}
          >
            <span className="text-xl text-gray-500 font-semibold">+ Book a Live Session</span>
          </div>
        </div>
      </div>
      <NewInterviewModal open={showModal} onClose={() => setShowModal(false)} onStart={handleStartInterview} />
      <HumanInterviewBookingModal open={showHumanBooking} onClose={() => setShowHumanBooking(false)} onBook={() => { setShowHumanBooking(false); setShowAppointmentModal(true); }} />
      <SubscriptionPlans 
        open={showAppointmentModal} 
        onClose={() => setShowAppointmentModal(false)} 
        onBack={() => { setShowAppointmentModal(false); setShowHumanBooking(true); }}
      />
      {/* Horizontal Menu Slider for Interview History */}
      <div className="w-full flex justify-center mb-6">
        <div className="flex w-full rounded-lg bg-gray-100 overflow-hidden shadow divide-x divide-gray-200">
          <button
            className={`flex-1 py-4 px-4 text-center font-semibold text-lg transition-all duration-200 ${activeTab === 'ai' ? 'bg-white text-[#3b3bb3] shadow' : 'text-gray-600 hover:bg-gray-200'}`}
            onClick={() => setActiveTab('ai')}
          >
            Previous Mock Interview With AI
          </button>
          <button
            className={`flex-1 py-4 px-4 text-center font-semibold text-lg transition-all duration-200 ${activeTab === 'human' ? 'bg-white text-[#3b3bb3] shadow' : 'text-gray-600 hover:bg-gray-200'}`}
            onClick={() => setActiveTab('human')}
          >
            Previous Mock Interview With Recruitment Specialist
          </button>
        </div>
      </div>
      {/* Tab Content */}
      <div className="mt-2">
        {activeTab === 'ai' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {interviews.filter(i => !i.specialist && !i.humanSpecialist).map((interview) => (
              <InterviewCard
                key={interview._id}
                interview={interview}
                onFeedbackClick={async () => {
                  try {
                    const res = await API.get(`/interviews/${interview._id}/report`);
                    setFeedbackModal({ open: true, reportData: res.data });
                  } catch (err) {
                    alert('Failed to fetch feedback.');
                  }
                }}
                onDownloadClick={async (e) => {
                  e.stopPropagation();
                  try {
                    const res = await API.get(`/interviews/${interview._id}/report`);
                    downloadReportPDF(res.data);
                  } catch (err) {
                    alert('Failed to download feedback report.');
                  }
                }}
                onStartClick={() => navigate(`/questions/${interview._id}`)}
                onDeleteClick={async () => {
                  if (window.confirm('Are you sure you want to delete this interview?')) {
                    try {
                      await API.delete(`/interviews/${interview._id}`);
                      setInterviews(interviews.filter((i) => i._id !== interview._id));
                    } catch (err) {
                      alert('Failed to delete interview.');
                    }
                  }
                }}
              />
            ))}
            {interviews.filter(i => !i.specialist && !i.humanSpecialist).length === 0 && (
              <div className="col-span-full text-center text-gray-400 py-8">No AI mock interview history found.</div>
            )}
          </div>
        )}
        {activeTab === 'human' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {interviews.filter(i => i.specialist || i.humanSpecialist).map((interview) => (
              <InterviewCard
                key={interview._id}
                interview={interview}
                onFeedbackClick={async () => {
                  try {
                    const res = await API.get(`/interviews/${interview._id}/report`);
                    setFeedbackModal({ open: true, reportData: res.data });
                  } catch (err) {
                    alert('Failed to fetch feedback.');
                  }
                }}
                onDownloadClick={async (e) => {
                  e.stopPropagation();
                  try {
                    const res = await API.get(`/interviews/${interview._id}/report`);
                    downloadReportPDF(res.data);
                  } catch (err) {
                    alert('Failed to download feedback report.');
                  }
                }}
                onStartClick={() => navigate(`/questions/${interview._id}`)}
                onDeleteClick={async () => {
                  if (window.confirm('Are you sure you want to delete this interview?')) {
                    try {
                      await API.delete(`/interviews/${interview._id}`);
                      setInterviews(interviews.filter((i) => i._id !== interview._id));
                    } catch (err) {
                      alert('Failed to delete interview.');
                    }
                  }
                }}
              />
            ))}
            {interviews.filter(i => i.specialist || i.humanSpecialist).length === 0 && (
              <div className="col-span-full text-center text-gray-400 py-8">No recruitment specialist interview history found.</div>
            )}
          </div>
        )}
      </div>
      <FeedbackModal open={feedbackModal.open} onClose={() => setFeedbackModal({ open: false, reportData: null })} reportData={feedbackModal.reportData} />
    </div>
  );
};

export default Interviews; 