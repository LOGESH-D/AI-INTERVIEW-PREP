import React from 'react';
import { FaDownload } from 'react-icons/fa';
import { formatDate } from '../utils/interviews';

const InterviewCard = ({ interview, onFeedbackClick, onDownloadClick, onStartClick, onDeleteClick }) => (
  <div className="bg-white rounded-xl shadow border border-gray-200 p-5 flex flex-col justify-between min-h-[180px] hover:shadow-lg transition-all duration-200">
    <div>
      <h3 className="text-lg font-bold text-[#3b3bb3] mb-1">{interview.title}</h3>
      <p className="text-gray-700 text-sm mb-1">{interview.role}</p>
      <p className="text-gray-500 text-sm mb-1">{interview.company && <span>{interview.company} | </span>}{interview.status && <span className="capitalize">{interview.status}</span>}</p>
      <p className="text-gray-700 text-sm">{interview.yearsOfExperience ? `Years of Experience: ${interview.yearsOfExperience}` : 'Years of Experience: N/A'}</p>
      <p className="text-gray-400 text-xs mt-1">Created At: {formatDate(interview.createdAt)}</p>
    </div>
    <div className="flex gap-2 mt-4">
      <button
        className="border border-[#3b3bb3] text-[#3b3bb3] font-semibold px-4 py-2 rounded-lg hover:bg-[#3b3bb3] hover:text-white transition-colors duration-200"
        onClick={onFeedbackClick}
      >
        Feedback
      </button>
      {interview.status === 'completed' && (
        <button
          className="border border-green-600 text-green-600 font-semibold px-2 py-1 rounded hover:bg-green-600 hover:text-white transition-colors duration-200 flex items-center text-sm"
          title="Download PDF"
          onClick={onDownloadClick}
        >
          <FaDownload className="mr-1" />
        </button>
      )}
      {interview.status !== 'completed' && (
        <button
          className="bg-[#3b3bb3] text-white font-semibold px-6 py-2 rounded-lg hover:bg-[#23237a] transition-colors duration-200"
          onClick={onStartClick}
        >
          Start
        </button>
      )}
      <button
        className="border border-red-500 text-red-500 font-semibold px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-colors duration-200"
        onClick={onDeleteClick}
      >
        Delete
      </button>
    </div>
  </div>
);

export default InterviewCard; 