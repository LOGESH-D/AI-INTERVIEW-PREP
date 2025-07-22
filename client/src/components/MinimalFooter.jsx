import React from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";

const MinimalFooter = () => {
  return (
    <footer className="bg-white text-gray-500 py-2 px-4 border-t border-gray-200 w-full">
      <div className="flex items-center justify-center gap-4 text-xs">
        <span>© 2025 AI Interview Prep. Empowering your tech career.</span>
        <a href="https://github.com/your-github-id" target="_blank" rel="noopener noreferrer" className="hover:text-black text-lg" aria-label="GitHub">
          <FaGithub />
        </a>
        <a href="https://linkedin.com/in/your-linkedin-id" target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 text-lg" aria-label="LinkedIn">
          <FaLinkedin />
        </a>
      </div>
    </footer>
  );
};

export default MinimalFooter; 