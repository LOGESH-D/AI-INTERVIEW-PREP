import React, { useState } from 'react';

const HumanInterviewBookingModal = ({ open, onClose, onBook }) => {
  const [form, setForm] = useState({
    jobRole: '',
    jobDesc: '',
    experience: '',
    date: '',
    time: '',
  });
  const [error, setError] = useState('');
  if (!open) return null;
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = e => {
    e.preventDefault();
    if (!form.jobRole || !form.jobDesc || !form.experience || !form.date || !form.time) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    onBook(form);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative animate-fade-in">
        <button className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-extrabold text-[#3b3bb3] mb-1">Book Interview with Recruitment Specialist</h2>
        <p className="text-gray-600 mb-6">Fill in the details to book your live session with a recruitment specialist!</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-semibold text-[#3b3bb3] mb-1">Job Role/Job Position</label>
            <input name="jobRole" value={form.jobRole} onChange={handleChange} required className="w-full border-2 border-[#6366f1] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3b3bb3] bg-white text-gray-900 transition" placeholder="Ex. Frontend Developer" />
          </div>
          <div>
            <label className="block font-semibold text-[#3b3bb3] mb-1">Job Description/ Tech Stack (In Short)</label>
            <textarea name="jobDesc" value={form.jobDesc} onChange={handleChange} required className="w-full border-2 border-[#6366f1] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3b3bb3] bg-white text-gray-900 transition" placeholder="Ex. React, NodeJs, MySQL, etc" />
          </div>
          <div>
            <label className="block font-semibold text-[#3b3bb3] mb-1">Years of Experience</label>
            <input name="experience" value={form.experience} onChange={handleChange} required type="number" className="w-full border-2 border-[#6366f1] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3b3bb3] bg-white text-gray-900 transition" placeholder="Ex. 3" />
          </div>
          <div className="flex gap-2">
            <div className="w-1/2">
              <label className="block font-semibold text-[#3b3bb3] mb-1">Date</label>
              <input name="date" value={form.date} onChange={handleChange} required type="date" className="w-full border-2 border-[#6366f1] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3b3bb3] bg-white text-gray-900 transition" />
            </div>
            <div className="w-1/2">
              <label className="block font-semibold text-[#3b3bb3] mb-1">Time</label>
              <input name="time" value={form.time} onChange={handleChange} required type="time" className="w-full border-2 border-[#6366f1] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3b3bb3] bg-white text-gray-900 transition" />
            </div>
          </div>
          {error && <div className="text-red-500 text-center font-semibold">{error}</div>}
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition" onClick={onClose}>Cancel</button>
            <button type="submit" className="bg-[#3b3bb3] text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-[#23237a] transition-all">Book Now</button>
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

export default HumanInterviewBookingModal; 