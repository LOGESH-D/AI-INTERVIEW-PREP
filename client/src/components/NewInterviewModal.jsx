import React, { useState } from 'react';
import { generateInterviewQuestions } from '../utils/gemini';

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

export default NewInterviewModal; 