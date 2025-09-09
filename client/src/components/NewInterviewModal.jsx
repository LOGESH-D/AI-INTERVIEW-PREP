import React, { useState } from 'react';
import { generateInterviewData } from '../utils/gemini';

const NewInterviewModal = ({ open, onClose, onStart }) => {
  const [jobPosition, setJobPosition] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobExperience, setJobExperience] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStart = async (e) => {
    e.preventDefault();
    
    // Prevent multiple simultaneous requests
    if (loading) {
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      // Generate both questions and skills with AI in a single request
      const { questions: aiQuestions, ideals: aiIdeals, skills: aiSkills } = await generateInterviewData(
        jobPosition, 
        jobDesc, 
        jobExperience
      );
      
      onStart({
        jobPosition,
        jobDesc,
        jobExperience,
        questions: aiQuestions,
        ideals: aiIdeals,
        skills: aiSkills
      });
    } catch (err) {
      console.error('Failed to generate interview data:', err);
      
      // Provide more specific error messages
      if (err.message.includes('429')) {
        setError('Too many requests. Please wait a moment and try again.');
      } else if (err.message.includes('Max retries reached')) {
        setError('Service is temporarily busy. Please try again in a few minutes.');
      } else {
        setError('Failed to generate questions or skills. Please try again.');
      }
    } finally {
      setLoading(false);
    }
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
            <button 
              type="submit" 
              className={`px-6 py-2 rounded-lg font-bold shadow transition-all ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-[#3b3bb3] hover:bg-[#23237a]'
              } text-white`} 
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Start Interview'}
            </button>
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

export default NewInterviewModal; 