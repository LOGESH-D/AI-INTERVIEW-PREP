import React, { useState } from 'react';
import SubscriptionPlans from './SubscriptionPlans';

const HumanInterviewBookingModal = ({ open, onClose, onBook }) => {
  const [form, setForm] = useState({
    userName: '',
    jobRole: '',
    jobDesc: '',
    experience: '',
  });
  const [error, setError] = useState('');
  const [showSubscription, setShowSubscription] = useState(false);

  if (!open) return null;
  
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  
  const handleSubmit = e => {
    e.preventDefault();
    if (!form.userName || !form.jobRole || !form.jobDesc || !form.experience) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setShowSubscription(true);
  };

  const handleSubscriptionClose = () => {
    setShowSubscription(false);
    onClose();
  };

  const handleSubscriptionBack = () => {
    setShowSubscription(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative animate-fade-in">
          <button className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-gray-700" onClick={onClose}>&times;</button>
          <h2 className="text-2xl font-extrabold text-[#3b3bb3] mb-1">Book Interview with Recruitment Specialist</h2>
          <p className="text-gray-600 mb-6">Fill in the details to book your live session with a recruitment specialist!</p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-semibold text-[#3b3bb3] mb-1">Your Full Name</label>
              <input name="userName" value={form.userName} onChange={handleChange} required className="w-full border-2 border-[#6366f1] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3b3bb3] bg-white text-gray-900 transition" placeholder="Ex. John Doe" />
            </div>
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
      
      <SubscriptionPlans
        open={showSubscription}
        onClose={handleSubscriptionClose}
        onBack={handleSubscriptionBack}
        interviewData={form}
      />
    </>
  );
};

export default HumanInterviewBookingModal; 