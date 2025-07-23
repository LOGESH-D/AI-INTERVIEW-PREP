import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import logo from '/AI-PREPIFY.png';
import { toast } from 'react-toastify';
import { FaBars, FaTimes } from 'react-icons/fa';

const NavBar = ({ onContactClick, onLoginClick, onRegisterClick }) => {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('sucessfully loged out');
  };

  const handleToggleMenu = () => setMenuOpen((prev) => !prev);
  const handleLinkClick = (cb) => {
    setMenuOpen(false);
    if (cb) cb();
  };

  return (
    <nav
      className={`flex items-center justify-between px-2 py-1 mt-2 mx-2 shadow-md transition-all duration-500 bg-gradient-to-r from-[#1e293b] to-[#3b82f6] relative z-50`}
      style={{ fontFamily: 'Poppins, Inter, Arial, sans-serif', position: 'sticky', top: '0.5rem', zIndex: 50 }}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 animate-fade-in group" style={{ textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
        <img
          src={logo}
          alt="AI Prepify Logo"
          className="w-12 h-12 rounded-full shadow-lg transition-transform duration-300 group-hover:scale-110 bg-white object-cover"
        />
        <span className="text-lg font-extrabold tracking-tight text-white drop-shadow-lg animate-slide-in-left group-hover:text-yellow-300" style={{ letterSpacing: '2px' }}>
          AI-PREPIFY
        </span>
      </Link>
      {/* Hamburger for mobile */}
      <button
        className="md:hidden ml-auto text-white text-2xl p-2 focus:outline-none"
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        onClick={handleToggleMenu}
      >
        {menuOpen ? <FaTimes /> : <FaBars />}
      </button>
      {/* Links */}
      <div
        className={`
          flex-col md:flex-row md:flex items-start md:items-center gap-2 md:gap-6 animate-fade-in
          fixed md:static top-16 left-0 w-full md:w-auto bg-gradient-to-r from-[#1e293b] to-[#3b82f6] md:bg-none shadow-lg md:shadow-none transition-all duration-150
          ${menuOpen ? 'flex' : 'hidden'} md:flex
        `}
        style={{ zIndex: 100 }}
      >
        {token ? (
          <>
            <Link to="/interviews" className="nav-link" onClick={() => handleLinkClick()}>Interviews</Link>
            <Link to="/profile" className="nav-link" onClick={() => handleLinkClick()}>Profile</Link>
            <button className="nav-link text-base font-semibold" onClick={() => handleLinkClick(onContactClick)}>Contact</button>
            <button onClick={() => { handleLinkClick(); handleLogout(); }} className="nav-link">Logout</button>
          </>
        ) : (
          <>
            <button className="nav-link" onClick={() => handleLinkClick(onLoginClick)}>Login</button>
            <button className="nav-link" onClick={() => handleLinkClick(onRegisterClick)}>Register</button>
            <button className="nav-link text-base font-semibold" onClick={() => handleLinkClick(onContactClick)}>Contact</button>
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
            flex-direction: row;
            align-items: center;
            padding: 0.5rem 0.2rem;
          }
          .nav-link {
            font-size: 1rem;
            padding: 0.5rem 1rem;
            width: 100%;
            display: block;
            text-align: left;
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