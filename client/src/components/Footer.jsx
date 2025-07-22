import React from "react";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-[#fdf6f2] text-[#b36a5e] py-2 px-4 mt-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
        {/* PRODUCT */}
        <div>
          <h3 className="font-bold mb-3 uppercase tracking-wide">Platform</h3>
          <ul className="space-y-2 text-[#7c5c53]">
            <li><a href="/" className="hover:underline">Dashboard</a></li>
            <li><a href="/interviews" className="hover:underline">Mock Interviews</a></li>
            <li><a href="/questions" className="hover:underline">Question Bank</a></li>
            <li><a href="/profile" className="hover:underline">User Profile</a></li>
          </ul>
        </div>
        {/* COMPANY */}
        <div>
          <h3 className="font-bold mb-3 uppercase tracking-wide">About</h3>
          <ul className="space-y-2 text-[#7c5c53]">
            <li><a href="/about" className="hover:underline">Our Mission</a></li>
            <li><a href="/team" className="hover:underline">Meet the Team</a></li>
            <li><a href="/contact" className="hover:underline">Contact Us</a></li>
            <li><a href="https://github.com/your-repo" target="_blank" rel="noopener noreferrer" className="hover:underline">GitHub</a></li>
          </ul>
        </div>
        {/* RESOURCES */}
        <div>
          <h3 className="font-bold mb-3 uppercase tracking-wide">Resources</h3>
          <ul className="space-y-2 text-[#7c5c53]">
            <li><a href="/faq" className="hover:underline">FAQ</a></li>
            <li><a href="/blog" className="hover:underline">Blog</a></li>
            <li><a href="/privacy" className="hover:underline">Privacy Policy</a></li>
            <li><a href="/terms" className="hover:underline">Terms of Service</a></li>
          </ul>
        </div>
        {/* STAY CONNECTED */}
        <div>
          <h3 className="font-bold mb-3 uppercase tracking-wide">Stay Connected</h3>
          <p className="text-[#7c5c53] mb-2">Get updates, tips, and AI interview resources.</p>
          <a href="/newsletter" className="font-semibold underline text-[#b36a5e]">Subscribe to our newsletter</a>
          <div className="flex space-x-4 mt-4 text-xl">
            <a href="mailto:support@ai-prepify.com" aria-label="Email"><FaEnvelope /></a>
            <a href="https://github.com/your-repo" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><FaGithub /></a>
            <a href="https://linkedin.com/company/ai-prepify" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedin /></a>
          </div>
        </div>
      </div>
      <div className="text-center text-xs text-[#b36a5e] mt-8">
        &copy; {new Date().getFullYear()} AI Interview Prep. Empowering your tech career.
      </div>
    </footer>
  );
};

export default Footer; 