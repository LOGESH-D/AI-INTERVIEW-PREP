import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import logo from '/AI-PREPIFY.png';
import { toast } from 'react-toastify';

const NavBar = ({ onContactClick, onLoginClick, onRegisterClick }) => {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('sucessfully loged out');
  };

  return (
    <nav
      className={`flex flex-wrap items-center justify-between px-2 py-1 mt-2 mx-2 shadow-md transition-all duration-500 bg-gradient-to-r from-[#1e293b] to-[#3b82f6]`}
      style={{ fontFamily: 'Poppins, Inter, Arial, sans-serif', position: 'sticky', top: '0.5rem', zIndex: 50 }}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 animate-fade-in group" style={{ textDecoration: 'none' }}>
        <img
          src={logo}
          alt="AI Prepify Logo"
          className="w-12 h-12 rounded-full shadow-lg transition-transform duration-300 group-hover:scale-110 bg-white object-cover"
        />
        <span className="text-lg font-extrabold tracking-tight text-white drop-shadow-lg animate-slide-in-left group-hover:text-yellow-300" style={{ letterSpacing: '2px' }}>
          AI-PREPIFY
        </span>
      </Link>
      {/* Links */}
      <div className="flex flex-wrap items-center gap-2 md:gap-6 animate-fade-in">
        {token ? (
          <>
            <Link to="/interviews" className="nav-link">Interviews</Link>
            <Link to="/profile" className="nav-link">Profile</Link>
            <button className="nav-link text-base font-semibold" onClick={onContactClick}>Contact</button>
            <button onClick={handleLogout} className="nav-link">Logout</button>
          </>
        ) : (
          <>
            <button className="nav-link" onClick={onLoginClick}>Login</button>
            <button className="nav-link" onClick={onRegisterClick}>Register</button>
            <button className="nav-link text-base font-semibold" onClick={onContactClick}>Contact</button>
          </>
        )}
      </div>
      {/* Responsive Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700;900&display=swap');
        .nav-link {
          color: #fff;
          font-weight: 600;
          font-size: 1rem;
          padding: 0.35rem 0.75rem;
          border-radius: 0.4rem;
          transition: background 0.2s, color 0.2s, transform 0.2s;
          text-decoration: none;
          position: relative;
        }
        .nav-link:hover {
          background: rgba(255,255,255,0.15);
          color: #facc15;
          transform: translateY(-2px) scale(1.05);
        }
        @media (max-width: 900px) {
          .text-lg {
            font-size: 1rem !important;
          }
          .w-12.h-12 {
            width: 2.2rem !important;
            height: 2.2rem !important;
          }
          .nav-link {
            font-size: 0.95rem;
            padding: 0.3rem 0.6rem;
          }
        }
        @media (max-width: 600px) {
          nav {
            flex-direction: column;
            align-items: flex-start;
            padding: 0.5rem 0.2rem;
          }
          .flex.items-center {
            flex-direction: row;
            gap: 0.5rem !important;
          }
          .nav-link {
            font-size: 0.9rem;
            padding: 0.25rem 0.5rem;
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-in;
        }
        .animate-slide-in-left {
          animation: slideInLeft 0.7s cubic-bezier(.68,-0.55,.27,1.55);
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </nav>
  );
};

export default NavBar; 