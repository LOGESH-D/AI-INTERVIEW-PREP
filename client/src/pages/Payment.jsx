import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const planColors = {
  Basic: 'yellow',
  Advanced: 'purple',
  Premium: 'cyan',
};

const planDetails = {
  Basic: {
    price: 49,
    duration: '10 days',
    interviews: 5,
    users: 1,
    color: 'yellow',
  },
  Advanced: {
    price: 199,
    duration: '55 days',
    interviews: 25,
    users: 1,
    color: 'purple',
  },
  Premium: {
    price: 999,
    duration: '1 year',
    interviews: 'Unlimited',
    users: '1-2',
    color: 'cyan',
  },
};

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const plan = location.state?.plan || 'Basic';
  const details = planDetails[plan] || planDetails.Basic;
  const [form, setForm] = React.useState({ name: '', email: '', card: '', expiry: '', cvv: '' });
  const [success, setSuccess] = React.useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = e => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => navigate('/interviews'), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f8fafc] to-[#e0e7ff] py-8 px-2">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
        <h2 className={`text-2xl font-extrabold mb-2 text-${details.color}-600 text-center`}>Payment for {plan} Plan</h2>
        <div className="mb-4 p-4 rounded-lg bg-gray-50 border">
          <div className="font-bold text-lg mb-1">{plan} Plan</div>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>Price: <span className={`font-bold text-${details.color}-600`}>₹{details.price}</span></li>
            <li>Duration: {details.duration}</li>
            <li>Interviews: {details.interviews}</li>
            <li>Users: {details.users}</li>
          </ul>
        </div>
        {success ? (
          <div className="text-green-600 font-bold text-center py-8">Payment Successful! Redirecting...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input name="name" value={form.name} onChange={handleChange} required placeholder="Name on Card" className="w-full border rounded px-3 py-2" />
            <input name="email" value={form.email} onChange={handleChange} required type="email" placeholder="Email" className="w-full border rounded px-3 py-2" />
            <input name="card" value={form.card} onChange={handleChange} required placeholder="Card Number" className="w-full border rounded px-3 py-2" maxLength={16} />
            <div className="flex gap-2">
              <input name="expiry" value={form.expiry} onChange={handleChange} required placeholder="MM/YY" className="w-1/2 border rounded px-3 py-2" maxLength={5} />
              <input name="cvv" value={form.cvv} onChange={handleChange} required placeholder="CVV" className="w-1/2 border rounded px-3 py-2" maxLength={4} />
            </div>
            <div className="flex gap-2">
              <button type="submit" className={`w-1/2 py-2 rounded font-bold text-white bg-${details.color}-500 hover:bg-${details.color}-700 transition`}>Pay ₹{details.price}</button>
              <button type="button" className="w-1/2 py-2 rounded font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition" onClick={() => navigate('/interviews')}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 