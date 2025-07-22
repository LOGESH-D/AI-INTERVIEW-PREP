import React, { useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import { generateInterviewQuestions } from '../utils/gemini';
import { toast } from 'react-toastify';

const NewInterview = () => {
  const [jobPosition, setJobPosition] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobExperience, setJobExperience] = useState('');
  const [questions, setQuestions] = useState(['']);
  const [error, setError] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const navigate = useNavigate();

  const handleQuestionChange = (idx, value) => {
    const newQuestions = [...questions];
    newQuestions[idx] = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => setQuestions([...questions, '']);

  const handleGenerateAI = async () => {
    setLoadingAI(true);
    try {
      const prompt = `Generate 5 interview questions for the following job position and description:\nPosition: ${jobPosition}\nDescription: ${jobDesc}\nExperience: ${jobExperience} years.`;
      const aiText = await generateInterviewQuestions(prompt);
      const aiQuestions = aiText.split('\n').filter(q => q.trim()).map(q => q.replace(/^[0-9]+[.)]?\s*/, ''));
      setQuestions(aiQuestions.length ? aiQuestions : [aiText]);
      toast.success("AI questions generated!");
    } catch (err) {
      toast.error("Failed to generate questions with AI");
    }
    setLoadingAI(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await API.post('/interviews', {
        title: jobPosition,
        role: jobDesc,
        company: '', // You can add a company field to the form if needed
        notes: '',   // You can add a notes field to the form if needed
        questions: questions.filter(q => q.trim()),
      });
      navigate('/interviews');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create interview');
      console.error('Create interview error:', err.response?.data || err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#3b3bb3] via-[#6366f1] to-[#a5b4fc] py-8 px-2">
      <div className="w-full max-w-xl bg-white/90 dark:bg-[#181a2a] rounded-2xl shadow-2xl p-8 border border-[#3b3bb3] animate-fade-in">
        <h2 className="text-3xl font-extrabold text-[#3b3bb3] mb-2 text-center tracking-tight drop-shadow">Create New Interview</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">Fill in the details and generate questions with AI!</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-semibold text-[#3b3bb3] mb-1">Job Position</label>
            <input className="w-full border-2 border-[#6366f1] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3b3bb3] bg-white dark:bg-[#23244d] text-gray-900 dark:text-white transition" value={jobPosition} onChange={e => setJobPosition(e.target.value)} required />
          </div>
          <div>
            <label className="block font-semibold text-[#3b3bb3] mb-1">Job Description</label>
            <input className="w-full border-2 border-[#6366f1] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3b3bb3] bg-white dark:bg-[#23244d] text-gray-900 dark:text-white transition" value={jobDesc} onChange={e => setJobDesc(e.target.value)} required />
          </div>
          <div>
            <label className="block font-semibold text-[#3b3bb3] mb-1">Years of Experience</label>
            <input type="number" className="w-full border-2 border-[#6366f1] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3b3bb3] bg-white dark:bg-[#23244d] text-gray-900 dark:text-white transition" value={jobExperience} onChange={e => setJobExperience(e.target.value)} required />
          </div>
          <div>
            <label className="block font-semibold text-[#3b3bb3] mb-1">Questions</label>
            {questions.map((q, idx) => (
              <input
                key={idx}
                className="w-full border-2 border-[#6366f1] rounded-lg px-4 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-[#3b3bb3] bg-white dark:bg-[#23244d] text-gray-900 dark:text-white transition"
                value={q}
                onChange={e => handleQuestionChange(idx, e.target.value)}
                required
                placeholder={`Question ${idx + 1}`}
              />
            ))}
            <div className="flex gap-2 mt-2">
              <button type="button" className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg font-semibold hover:bg-gray-300 transition" onClick={addQuestion}>Add Question</button>
              <button
                type="button"
                className="bg-[#3b3bb3] text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-[#23237a] transition"
                onClick={handleGenerateAI}
                disabled={loadingAI}
              >
                {loadingAI ? "Generating..." : "Generate with AI"}
              </button>
            </div>
          </div>
          {error && <div className="text-red-500 text-center font-semibold">{error}</div>}
          <button type="submit" className="bg-gradient-to-r from-[#6366f1] to-[#3b3bb3] text-white px-6 py-3 rounded-xl w-full font-bold text-lg shadow-lg hover:from-[#3b3bb3] hover:to-[#23237a] transition-all">Create Interview</button>
        </form>
      </div>
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.7s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default NewInterview; 