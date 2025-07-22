import React, { useState, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { toast } from 'react-toastify';

const LoginModal = ({ open, onClose, onRegisterLink }) => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      onClose();
      toast.success('well come back');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-full max-w-xs sm:max-w-sm bg-white/90 rounded-2xl shadow-2xl p-8 border border-[#3b3bb3] animate-fade-in">
        <button className="absolute top-3 right-3 text-2xl text-gray-700 hover:text-gray-900 font-bold" onClick={onClose}>&times;</button>
        <h2 className="text-3xl font-extrabold text-[#3b3bb3] mb-6 text-center tracking-tight drop-shadow">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <input type="email" className="w-full border-2 border-[#6366f1] rounded-lg px-8 py-2 focus:outline-none focus:ring-2 focus:ring-[#3b3bb3] bg-white text-gray-900 placeholder-gray-700 transition" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Email" />
            <FaEnvelope className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-700" />
          </div>
          <div className="relative">
            <input type="password" className="w-full border-2 border-[#6366f1] rounded-lg px-8 py-2 focus:outline-none focus:ring-2 focus:ring-[#3b3bb3] bg-white text-gray-900 placeholder-gray-700 transition" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Password" />
            <FaLock className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-700" />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-800 mt-2">
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="accent-blue-700" />
              Remember me
            </label>
            <button type="button" className="hover:underline text-gray-800" onClick={() => alert('Forgot password functionality coming soon!')}>Forgot Password?</button>
          </div>
          {error && <div className="text-red-600 text-center font-semibold text-sm">{error}</div>}
          <button type="submit" className="bg-gradient-to-r from-[#6366f1] to-[#3b3bb3] text-white px-6 py-3 rounded-xl w-full font-bold text-lg shadow-lg hover:from-[#3b3bb3] hover:to-[#23237a] transition-all mt-2">Login</button>
        </form>
        <div className="mt-4 text-center text-gray-900 text-sm">
          Don't have an account?{' '}
          <span className="text-blue-900 font-semibold cursor-pointer hover:underline" onClick={onRegisterLink}>Register</span>
        </div>
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

export default LoginModal; 