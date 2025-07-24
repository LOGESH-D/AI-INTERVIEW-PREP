import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const planDetails = {
  Single: {
    price: 49,
    discount: '50% OFF',
    validity: '1 day',
    tests: 1,
    description: 'Special offer: 50% discount for a limited time!',
    color: 'blue',
    features: [
      'Take up to 2 live mock interviews within 1 day',
      'Real-time interviews with experienced industrial Professionals',
      'Personalized, actionable feedback on your answers and communication',
      'AI-powered analysis of your performance',
      'Downloadable interview reports',
      'Flexible scheduling and instant booking',
      'Secure and private interview environment',
      'Support for multiple job roles and domains',
    ],
  },
};

// PaymentModal: onBack should navigate to the previous popup (e.g., HumanInterviewBookingModal)
const PaymentModal = ({ open, plan, onClose, onBack }) => {
  const details = planDetails[plan] || planDetails.Single;
  const [form, setForm] = useState({ name: '', email: '', card: '', expiry: '', cvv: '' });
  const [success, setSuccess] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = e => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(onClose, 2000);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in">
        <button className="absolute top-3 left-3 text-2xl text-gray-400 hover:text-gray-700" onClick={onBack} title="Back">
          <span aria-hidden="true">&#8592;</span>
        </button>
        <button className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-gray-700" onClick={onClose} title="Close">&times;</button>
        <h2 className={`text-2xl font-extrabold mb-2 text-blue-600 text-center`}>Payment for Interview</h2>
        <div className="mb-4 p-4 rounded-lg bg-gray-50 border">
          <div className="font-bold text-lg mb-1">Special Offer Plan</div>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>Price: <span className={`font-bold text-blue-600`}>₹{details.price}</span> <span className="ml-2 text-green-600 font-semibold">({details.discount})</span></li>
            <li>Validity: {details.validity}</li>
            <li>Can take <span className="font-bold">{details.tests} live tests</span> within the time limit</li>
          </ul>
        </div>
        {success ? (
          <div className="text-green-600 font-bold text-center py-8">Payment Successful! Closing...</div>
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
              <button type="submit" className={`w-1/2 py-2 rounded font-bold text-white bg-blue-500 hover:bg-blue-700 transition`}>Pay ₹{details.price}</button>
              <button type="button" className="w-1/2 py-2 rounded font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition" onClick={onClose}>Cancel</button>
            </div>
          </form>
        )}
      </div>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.7s ease-in; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

// SubscriptionPlans: accept an optional onBack prop to control back navigation
const SubscriptionPlans = ({ open, onClose, onBack }) => {
  const [paymentPlan, setPaymentPlan] = useState(null);
  if (!open) return null;
  const details = planDetails.Single;
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg max-h-[80vh] overflow-y-auto relative animate-fade-in">
          <button className="absolute top-3 left-3 text-2xl text-gray-400 hover:text-gray-700" onClick={onBack || onClose} title="Back">
            <span aria-hidden="true">&#8592;</span>
          </button>
          <button className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-gray-700" onClick={onClose} title="Close">&times;</button>
          <h2 className="text-2xl font-extrabold text-[#3b3bb3] mb-1 text-center">Purchase Interview</h2>
          <p className="text-gray-600 mb-3 text-center">Book your appointment with an industrial Professional for a live mock interview</p>
          <div className="border-2 border-blue-200 rounded-xl p-6 flex flex-col items-center bg-blue-50 mb-4">
            <div className="text-2xl font-bold text-blue-600 mb-1">Special Offer</div>
            <div className="text-lg font-extrabold text-blue-600 mb-0.5">₹49 <span className="text-base font-normal ml-2 text-green-600 font-semibold">({details.discount})</span></div>
            <ul className="text-gray-700 text-sm mb-3 space-y-1 text-left w-full">
              <li>✓ Validity: {details.validity}</li>
              <li>✓ Can take {details.tests} live tests within the time limit</li>
              <li>✓ Pay only for what you use</li>
            </ul>
            <button className="bg-blue-500 text-white font-bold px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition text-base mt-2" onClick={() => setPaymentPlan('Single')}>Purchase</button>
          </div>
          <h3 className="text-base font-bold mb-1 mt-2 text-center">Features</h3>
          <ul className="bg-gray-50 rounded-xl p-4 text-gray-700 text-sm space-y-1">
            {details.features.map((feature, idx) => (
              <li key={idx}>• {feature}</li>
            ))}
          </ul>
        </div>
        <style>{`
          .animate-fade-in { animation: fadeIn 0.7s ease-in; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
      <PaymentModal
        open={!!paymentPlan}
        plan={paymentPlan}
        onClose={() => setPaymentPlan(null)}
        onBack={onBack ? () => { setPaymentPlan(null); onBack(); } : () => setPaymentPlan(null)}
      />
    </>
  );
};

export default SubscriptionPlans; 