import React, { useEffect, useState, useContext, useMemo } from 'react';
import API from '../api';
import { AuthContext } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { generateInterviewQuestions } from '../utils/gemini';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FaDownload, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB');
}

const NewInterviewModal = ({ open, onClose, onStart }) => {
  const [jobPosition, setJobPosition] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobExperience, setJobExperience] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStart = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Generate questions with AI
      const prompt = `Generate 5 interview questions only (no introduction, no explanations, no numbering, just the questions, each on a new line) for a candidate applying for the following job:\nPosition: ${jobPosition}\nDescription: ${jobDesc}\nExperience: ${jobExperience} years.`;
      const aiText = await generateInterviewQuestions(prompt);
      const aiQuestions = aiText.split('\n').filter(q => q.trim()).map(q => q.replace(/^[0-9]+[.)]?\s*/, ''));
      // Fetch relevant skills from AI
      const skillsPrompt = `List the top 5-10 relevant skills for this job role and description as a comma-separated list.\nJob Role: ${jobPosition}\nJob Description: ${jobDesc}`;
      const skillsText = await generateInterviewQuestions(skillsPrompt);
      const aiSkills = skillsText.split(',').map(s => s.trim()).filter(Boolean);
      onStart({
        jobPosition,
        jobDesc,
        jobExperience,
        questions: aiQuestions.length ? aiQuestions : [aiText],
        skills: aiSkills
      });
    } catch (err) {
      setError('Failed to generate questions or skills. Please try again.');
    }
    setLoading(false);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative animate-fade-in">
        <button className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-extrabold text-[#3b3bb3] mb-1">Tell us more about your job interviewing</h2>
        <p className="text-gray-600 mb-6">Add Details about your job position/role, Job description and years of experience</p>
        <form onSubmit={handleStart} className="space-y-5">
          <div>
            <label className="block font-semibold text-[#3b3bb3] mb-1">Job Role/Job Position</label>
            <input className="w-full border-2 border-[#6366f1] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3b3bb3] bg-white text-gray-900 transition" value={jobPosition} onChange={e => setJobPosition(e.target.value)} required placeholder="Ex. Full Stack Developer" />
          </div>
          <div>
            <label className="block font-semibold text-[#3b3bb3] mb-1">Job Description/ Tech Stack (In Short)</label>
            <textarea className="w-full border-2 border-[#6366f1] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3b3bb3] bg-white text-gray-900 transition" value={jobDesc} onChange={e => setJobDesc(e.target.value)} required placeholder="Ex. React, Angular, NodeJs, MySql etc" />
          </div>
          <div>
            <label className="block font-semibold text-[#3b3bb3] mb-1">Years of experience</label>
            <input className="w-full border-2 border-[#6366f1] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3b3bb3] bg-white text-gray-900 transition" value={jobExperience} onChange={e => setJobExperience(e.target.value)} required placeholder="Ex. 5" />
          </div>
          {error && <div className="text-red-500 text-center font-semibold">{error}</div>}
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition" onClick={onClose}>Cancel</button>
            <button type="submit" className="bg-[#3b3bb3] text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-[#23237a] transition-all" disabled={loading}>{loading ? 'Starting...' : 'Start Interview'}</button>
          </div>
        </form>
      </div>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.7s ease-in; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

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

const FeedbackModal = ({ open, onClose, reportData }) => {
  const [tab, setTab] = useState('overall');
  const [openQ, setOpenQ] = useState(null);
  
  // Extract job role/desc for skill filtering
  const jobRole = reportData?.jobRole || reportData?.report?.[0]?.jobRole || '';
  const jobDesc = reportData?.jobDesc || reportData?.report?.[0]?.jobDesc || '';
  
  // Calculate average skill scores from enhanced data
  const avgSkills = useMemo(() => {
    if (!reportData?.report) return { communication: 0, grammar: 0, attitude: 0, softSkills: 0 };
    
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
    return {
      communication: count > 0 ? Math.round(totals.communication / count * 10) / 10 : 0,
      grammar: count > 0 ? Math.round(totals.grammar / count * 10) / 10 : 0,
      attitude: count > 0 ? Math.round(totals.attitude / count * 10) / 10 : 0,
      softSkills: count > 0 ? Math.round(totals.softSkills / count * 10) / 10 : 0
    };
  }, [reportData]);

  if (!open || !reportData) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative animate-fade-in">
        <button className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-extrabold text-[#3b3bb3] mb-1">Interview Feedback & Report</h2>
        <div className="flex gap-2 mb-6 mt-2 border-b">
          <button className={`px-4 py-2 rounded-t-lg font-semibold ${tab === 'overall' ? 'bg-[#3b3bb3] text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => setTab('overall')}>Overall Score</button>
          <button className={`px-4 py-2 rounded-t-lg font-semibold ${tab === 'interview' ? 'bg-[#3b3bb3] text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => setTab('interview')}>Interview</button>
          <button className={`px-4 py-2 rounded-t-lg font-semibold ${tab === 'skills' ? 'bg-[#3b3bb3] text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => setTab('skills')}>Skills</button>
          <button className={`px-4 py-2 rounded-t-lg font-semibold ${tab === 'questions' ? 'bg-[#3b3bb3] text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => setTab('questions')}>Questions</button>
        </div>

        {/* Overall Score Tab */}
        {tab === 'overall' && (
          <div>
            <div className="text-3xl font-bold mb-6 text-center text-[#3b3bb3]">
              Overall Performance Score: <span className="text-black">{reportData.score} / 10</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 text-blue-800">Performance Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Content Accuracy</span>
                    <span className="font-bold text-blue-600">{reportData.score}/10</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Communication</span>
                    <span className="font-bold text-blue-600">{avgSkills.communication}/10</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Grammar & Language</span>
                    <span className="font-bold text-blue-600">{avgSkills.grammar}/10</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Professional Attitude</span>
                    <span className="font-bold text-blue-600">{avgSkills.attitude}/10</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Soft Skills</span>
                    <span className="font-bold text-blue-600">{avgSkills.softSkills}/10</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 text-green-800">Recommendations</h3>
                <div className="space-y-2 text-sm">
                  {reportData.score < 7 && (
                    <div className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <span>Focus on improving content accuracy and technical knowledge</span>
                    </div>
                  )}
                  {avgSkills.communication < 7 && (
                    <div className="flex items-start">
                      <span className="text-orange-500 mr-2">•</span>
                      <span>Work on clear communication and articulation</span>
                    </div>
                  )}
                  {avgSkills.grammar < 7 && (
                    <div className="flex items-start">
                      <span className="text-orange-500 mr-2">•</span>
                      <span>Improve grammar and language proficiency</span>
                    </div>
                  )}
                  {avgSkills.attitude < 7 && (
                    <div className="flex items-start">
                      <span className="text-orange-500 mr-2">•</span>
                      <span>Maintain professional attitude and enthusiasm</span>
                    </div>
                  )}
                  {avgSkills.softSkills < 7 && (
                    <div className="flex items-start">
                      <span className="text-orange-500 mr-2">•</span>
                      <span>Develop problem-solving and interpersonal skills</span>
                    </div>
                  )}
                  {(reportData.score >= 7 && avgSkills.communication >= 7 && avgSkills.grammar >= 7 && avgSkills.attitude >= 7 && avgSkills.softSkills >= 7) && (
                    <div className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      <span>Excellent performance! Keep up the great work</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {tab === 'interview' && (
          <div className="max-h-[500px] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 text-[#3b3bb3]">Interview Recordings</h3>
            {reportData.report && reportData.report.length > 0 ? reportData.report.map((item, idx) => (
              <div key={idx} className="mb-4 border rounded-lg p-4">
                <button
                  className="w-full text-left font-bold text-[#3b3bb3] py-2 flex justify-between items-center focus:outline-none"
                  onClick={() => setOpenQ(openQ === idx ? null : idx)}
                >
                  <span>Q{idx + 1}: {item.question}</span>
                  <span>{openQ === idx ? '−' : '+'}</span>
                </button>
                {openQ === idx && (
                  <div className="p-4 bg-gray-50 rounded-b space-y-3">
                    <div>
                      <span className="font-semibold">Question:</span>
                      <p className="mt-1 text-gray-700">{item.question}</p>
                    </div>
                    <div>
                      <span className="font-semibold">Your Answer:</span>
                      <p className="mt-1 text-gray-700">{item.user || <span className="italic text-gray-400">No answer</span>}</p>
                    </div>
                    {item.video && (
                      <div>
                        <span className="font-semibold">Video Recording:</span>
                        <video controls className="mt-2 w-full max-w-md rounded" src={item.video} />
                      </div>
                    )}
                    {item.audio && (
                      <div>
                        <span className="font-semibold">Audio Recording:</span>
                        <audio controls className="mt-2 w-full" src={item.audio} />
                      </div>
                    )}
                    {!item.video && !item.audio && (
                      <div>
                        <span className="font-semibold">Recordings:</span>
                        <p className="mt-1 text-gray-500 italic">No recording available for this question</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )) : <div className="text-gray-500">No interview recordings available.</div>}
          </div>
        )}
        {tab === 'skills' && (
          <div>
            <div className="text-xl font-bold mb-4 text-[#3b3bb3]">Overall Score: <span className="text-black">{reportData.score} / 10</span></div>
            {avgSkills.communication !== 0 && (
              <div className="mb-4">
                <div className="font-semibold mb-1 capitalize">communication</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-3 rounded bg-gray-200 overflow-hidden">
                    <div className={`h-3 rounded ${avgSkills.communication < 4 ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${(avgSkills.communication / 10) * 100}%` }}></div>
                  </div>
                  <span className="font-bold text-gray-700">{avgSkills.communication}/10</span>
                  <span className="ml-2 text-yellow-400">&#9889;</span>
                </div>
              </div>
            )}
            {avgSkills.grammar !== 0 && (
              <div className="mb-4">
                <div className="font-semibold mb-1 capitalize">grammar</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-3 rounded bg-gray-200 overflow-hidden">
                    <div className={`h-3 rounded ${avgSkills.grammar < 4 ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${(avgSkills.grammar / 10) * 100}%` }}></div>
                  </div>
                  <span className="font-bold text-gray-700">{avgSkills.grammar}/10</span>
                  <span className="ml-2 text-yellow-400">&#9889;</span>
                </div>
              </div>
            )}
            {avgSkills.attitude !== 0 && (
              <div className="mb-4">
                <div className="font-semibold mb-1 capitalize">attitude</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-3 rounded bg-gray-200 overflow-hidden">
                    <div className={`h-3 rounded ${avgSkills.attitude < 4 ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${(avgSkills.attitude / 10) * 100}%` }}></div>
                  </div>
                  <span className="font-bold text-gray-700">{avgSkills.attitude}/10</span>
                  <span className="ml-2 text-yellow-400">&#9889;</span>
                </div>
              </div>
            )}
            {avgSkills.softSkills !== 0 && (
              <div className="mb-4">
                <div className="font-semibold mb-1 capitalize">soft skills</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-3 rounded bg-gray-200 overflow-hidden">
                    <div className={`h-3 rounded ${avgSkills.softSkills < 4 ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${(avgSkills.softSkills / 10) * 100}%` }}></div>
                  </div>
                  <span className="font-bold text-gray-700">{avgSkills.softSkills}/10</span>
                  <span className="ml-2 text-yellow-400">&#9889;</span>
                </div>
              </div>
            )}
          </div>
        )}
        {tab === 'questions' && (
          <div className="max-h-[500px] overflow-y-auto">
            {reportData.report && reportData.report.length > 0 ? reportData.report.map((item, idx) => (
              <div key={idx} className="mb-4 border rounded-lg p-4">
                <button
                  className="w-full text-left font-bold text-[#3b3bb3] py-2 flex justify-between items-center focus:outline-none"
                  onClick={() => setOpenQ(openQ === idx ? null : idx)}
                >
                  <span>Q{idx + 1}: {item.question}</span>
                  <span>{openQ === idx ? '−' : '+'}</span>
                </button>
                {openQ === idx && (
                  <div className="p-4 bg-gray-50 rounded-b space-y-3">
                    <div>
                      <span className="font-semibold">Your Answer:</span> 
                      <p className="mt-1 text-gray-700">{item.user || <span className="italic text-gray-400">No answer</span>}</p>
                    </div>
                    {item.audio && (
                      <div>
                        <span className="font-semibold">Audio Recording:</span>
                        <audio src={item.audio} controls className="mt-1 w-full" />
                      </div>
                    )}
                    <div>
                      <span className="font-semibold">Ideal Answer:</span>
                      <p className="mt-1 text-gray-700">{item.ideal}</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div className="bg-blue-50 p-2 rounded">
                        <span className="font-semibold">Content Score:</span> {item.score}/10
                      </div>
                      {item.skillAnalysis && (
                        <>
                          <div className="bg-green-50 p-2 rounded">
                            <span className="font-semibold">Communication:</span> {item.skillAnalysis.communication}/10
                          </div>
                          <div className="bg-yellow-50 p-2 rounded">
                            <span className="font-semibold">Grammar:</span> {item.skillAnalysis.grammar}/10
                          </div>
                          <div className="bg-purple-50 p-2 rounded">
                            <span className="font-semibold">Attitude:</span> {item.skillAnalysis.attitude}/10
                          </div>
                        </>
                      )}
                    </div>
                    {item.skill && (
                      <div>
                        <span className="font-semibold">Skill Category:</span> {item.skill}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )) : <div>No feedback available.</div>}
          </div>
        )}
      </div>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.7s ease-in; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

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
      {/* Add New Card */}
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
          <span className="text-lg text-gray-600 mb-2">Take test with human professionals</span>
          <div
            className="flex items-center justify-center h-32 w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all duration-200"
            onClick={() => alert('Feature coming soon!')}
          >
            <span className="text-xl text-gray-500 font-semibold">+ Place Appointment</span>
          </div>
        </div>
      </div>
      <NewInterviewModal open={showModal} onClose={() => setShowModal(false)} onStart={handleStartInterview} />
      <h2 className="text-xl font-bold mb-4 mt-8">Previous Mock Interview</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <FeedbackModal open={feedbackModal.open} onClose={() => setFeedbackModal({ open: false, reportData: null })} reportData={feedbackModal.reportData} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {interviews.map((interview) => (
          <div
            key={interview._id}
            className="bg-white rounded-xl shadow border border-gray-200 p-5 flex flex-col justify-between min-h-[180px] hover:shadow-lg transition-all duration-200"
          >
            <div>
              <h3 className="text-lg font-bold text-[#3b3bb3] mb-1">{interview.title}</h3>
              <p className="text-gray-700 text-sm mb-1">{interview.role}</p>
              <p className="text-gray-500 text-sm mb-1">{interview.company && <span>{interview.company} | </span>}{interview.status && <span className="capitalize">{interview.status}</span>}</p>
              <p className="text-gray-700 text-sm">{interview.yearsOfExperience ? `Years of Experience: ${interview.yearsOfExperience}` : 'Years of Experience: N/A'}</p>
              <p className="text-gray-400 text-xs mt-1">Created At: {formatDate(interview.createdAt)}</p>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                className="border border-[#3b3bb3] text-[#3b3bb3] font-semibold px-4 py-2 rounded-lg hover:bg-[#3b3bb3] hover:text-white transition-colors duration-200"
                onClick={async () => {
                  try {
                    const res = await API.get(`/interviews/${interview._id}/report`);
                    setFeedbackModal({ open: true, reportData: res.data });
                  } catch (err) {
                    alert('Failed to fetch feedback.');
                  }
                }}
              >
                Feedback
              </button>
              {interview.status === 'completed' && (
                <button
                  className="border border-green-600 text-green-600 font-semibold px-2 py-1 rounded hover:bg-green-600 hover:text-white transition-colors duration-200 flex items-center text-sm"
                  title="Download PDF"
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      const res = await API.get(`/interviews/${interview._id}/report`);
                      downloadReportPDF(res.data);
                    } catch (err) {
                      alert('Failed to download feedback report.');
                    }
                  }}
                >
                  <FaDownload className="mr-1" />
                </button>
              )}
              {interview.status !== 'completed' && (
                <button
                  className="bg-[#3b3bb3] text-white font-semibold px-6 py-2 rounded-lg hover:bg-[#23237a] transition-colors duration-200"
                  onClick={() => navigate(`/questions/${interview._id}`)}
                >
                  Start
                </button>
              )}
              <button
                className="border border-red-500 text-red-500 font-semibold px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-colors duration-200"
                onClick={async () => {
                  if (window.confirm('Are you sure you want to delete this interview?')) {
                    try {
                      await API.delete(`/interviews/${interview._id}`);
                      setInterviews(interviews.filter((i) => i._id !== interview._id));
                    } catch (err) {
                      alert('Failed to delete interview.');
                    }
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Interviews; 