import React, { useState } from 'react';
import API from '../api';
import { toast } from 'react-toastify';

const ContactModal = ({ open, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await API.post('/contacts', {
        name,
        email,
        phone,
        message
      });
      
      setSubmitted(true);
      toast.success('Contact form submitted successfully!');
      
      setTimeout(() => {
        setSubmitted(false);
        setName('');
        setEmail('');
        setPhone('');
        setMessage('');
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Contact submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit contact form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-full max-w-md bg-white/90 rounded-2xl shadow-2xl p-8 border border-[#3b3bb3] animate-fade-in">
        <button className="absolute top-3 right-3 text-2xl text-gray-700 hover:text-gray-900 font-bold" onClick={onClose}>&times;</button>
        <h2 className="text-3xl font-extrabold text-[#3b3bb3] mb-4 text-center">Contact Us</h2>
        {submitted ? (
          <div className="text-green-700 text-center font-semibold py-8">Thank you for reaching out! We'll get back to you soon.</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input type="text" className="w-full border-2 border-[#6366f1] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3b3bb3] bg-white text-gray-900 placeholder-gray-700 transition" value={name} onChange={e => setName(e.target.value)} required placeholder="Name" />
            </div>
            <div>
              <input type="email" className="w-full border-2 border-[#6366f1] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3b3bb3] bg-white text-gray-900 placeholder-gray-700 transition" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Email" />
            </div>
            <div>
              <input type="tel" className="w-full border-2 border-[#6366f1] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3b3bb3] bg-white text-gray-900 placeholder-gray-700 transition" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="Phone" />
            </div>
            <div>
              <textarea className="w-full border-2 border-[#6366f1] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3b3bb3] bg-white text-gray-900 placeholder-gray-700 transition resize-none" value={message} onChange={e => setMessage(e.target.value)} placeholder="Message (optional)" rows="3" />
            </div>
            <button type="submit" disabled={loading} className="bg-green-700 hover:bg-green-900 disabled:bg-gray-400 text-white px-6 py-2 rounded w-full font-bold text-base shadow-lg transition-all mt-2">
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        )}
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

export default ContactModal; 