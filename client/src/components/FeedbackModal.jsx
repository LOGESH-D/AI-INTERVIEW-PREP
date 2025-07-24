import React, { useState, useMemo } from 'react';
import { skillKeywords, categorizeSkill } from '../utils/interviews';

const FeedbackModal = ({ open, onClose, reportData }) => {
  const [tab, setTab] = useState('overall');
  const [openQ, setOpenQ] = useState(null);

  // Extract job role/desc for skill filtering
  const jobRole = reportData?.jobRole || reportData?.report?.[0]?.jobRole || '';
  const jobDesc = reportData?.jobDesc || reportData?.report?.[0]?.jobDesc || '';

  // Calculate average skill scores from enhanced data
  const avgSkills = useMemo(() => {
    if (!reportData?.report) return { communication: 0, grammar: 0, attitude: 0, softSkills: 0 };
    const totals = reportData.report.reduce((acc, item) => {
      if (item.skillAnalysis) {
        acc.communication += item.skillAnalysis.communication || 5;
        acc.grammar += item.skillAnalysis.grammar || 5;
        acc.attitude += item.skillAnalysis.attitude || 5;
        acc.softSkills += item.skillAnalysis.softSkills || 5;
      }
      return acc;
    }, { communication: 0, grammar: 0, attitude: 0, softSkills: 0 });
    const count = reportData.report.length;
    return {
      communication: count > 0 ? Math.round(totals.communication / count * 10) / 10 : 0,
      grammar: count > 0 ? Math.round(totals.grammar / count * 10) / 10 : 0,
      attitude: count > 0 ? Math.round(totals.attitude / count * 10) / 10 : 0,
      softSkills: count > 0 ? Math.round(totals.softSkills / count * 10) / 10 : 0
    };
  }, [reportData]);

  if (!open || !reportData) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative animate-fade-in">
        <button className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-extrabold text-[#3b3bb3] mb-1">Interview Feedback & Report</h2>
        <div className="flex gap-2 mb-6 mt-2 border-b">
          <button className={`px-4 py-2 rounded-t-lg font-semibold ${tab === 'overall' ? 'bg-[#3b3bb3] text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => setTab('overall')}>Overall Score</button>
          <button className={`px-4 py-2 rounded-t-lg font-semibold ${tab === 'interview' ? 'bg-[#3b3bb3] text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => setTab('interview')}>Interview</button>
          <button className={`px-4 py-2 rounded-t-lg font-semibold ${tab === 'skills' ? 'bg-[#3b3bb3] text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => setTab('skills')}>Skills</button>
          <button className={`px-4 py-2 rounded-t-lg font-semibold ${tab === 'questions' ? 'bg-[#3b3bb3] text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => setTab('questions')}>Questions</button>
        </div>
        {/* Tab Content */}
        {tab === 'overall' && (
          <div>
            <div className="text-3xl font-bold mb-6 text-center text-[#3b3bb3]">
              Overall Performance Score: <span className="text-black">{reportData.score} / 10</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 text-blue-800">Performance Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Content Accuracy</span>
                    <span className="font-bold text-blue-600">{reportData.score}/10</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Communication</span>
                    <span className="font-bold text-blue-600">{avgSkills.communication}/10</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Grammar & Language</span>
                    <span className="font-bold text-blue-600">{avgSkills.grammar}/10</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Professional Attitude</span>
                    <span className="font-bold text-blue-600">{avgSkills.attitude}/10</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Soft Skills</span>
                    <span className="font-bold text-blue-600">{avgSkills.softSkills}/10</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 text-green-800">Recommendations</h3>
                <div className="space-y-2 text-sm">
                  {reportData.score < 7 && (
                    <div className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <span>Focus on improving content accuracy and technical knowledge</span>
                    </div>
                  )}
                  {avgSkills.communication < 7 && (
                    <div className="flex items-start">
                      <span className="text-orange-500 mr-2">•</span>
                      <span>Work on clear communication and articulation</span>
                    </div>
                  )}
                  {avgSkills.grammar < 7 && (
                    <div className="flex items-start">
                      <span className="text-orange-500 mr-2">•</span>
                      <span>Improve grammar and language proficiency</span>
                    </div>
                  )}
                  {avgSkills.attitude < 7 && (
                    <div className="flex items-start">
                      <span className="text-orange-500 mr-2">•</span>
                      <span>Maintain professional attitude and enthusiasm</span>
                    </div>
                  )}
                  {avgSkills.softSkills < 7 && (
                    <div className="flex items-start">
                      <span className="text-orange-500 mr-2">•</span>
                      <span>Develop problem-solving and interpersonal skills</span>
                    </div>
                  )}
                  {(reportData.score >= 7 && avgSkills.communication >= 7 && avgSkills.grammar >= 7 && avgSkills.attitude >= 7 && avgSkills.softSkills >= 7) && (
                    <div className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      <span>Excellent performance! Keep up the great work</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {tab === 'interview' && (
          <div className="max-h-[500px] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 text-[#3b3bb3]">Interview Recordings</h3>
            {reportData.report && reportData.report.length > 0 ? reportData.report.map((item, idx) => (
              <div key={idx} className="mb-4 border rounded-lg p-4">
                <button
                  className="w-full text-left font-bold text-[#3b3bb3] py-2 flex justify-between items-center focus:outline-none"
                  onClick={() => setOpenQ(openQ === idx ? null : idx)}
                >
                  <span>Q{idx + 1}: {item.question}</span>
                  <span>{openQ === idx ? '−' : '+'}</span>
                </button>
                {openQ === idx && (
                  <div className="p-4 bg-gray-50 rounded-b space-y-3">
                    <div>
                      <span className="font-semibold">Question:</span>
                      <p className="mt-1 text-gray-700">{item.question}</p>
                    </div>
                    <div>
                      <span className="font-semibold">Your Answer:</span>
                      <p className="mt-1 text-gray-700">{item.user || <span className="italic text-gray-400">No answer</span>}</p>
                    </div>
                    {item.video && (
                      <div>
                        <span className="font-semibold">Video Recording:</span>
                        <video controls className="mt-2 w-full max-w-md rounded" src={item.video} />
                      </div>
                    )}
                    {item.audio && (
                      <div>
                        <span className="font-semibold">Audio Recording:</span>
                        <audio controls className="mt-2 w-full" src={item.audio} />
                      </div>
                    )}
                    {!item.video && !item.audio && (
                      <div>
                        <span className="font-semibold">Recordings:</span>
                        <p className="mt-1 text-gray-500 italic">No recording available for this question</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )) : <div className="text-gray-500">No interview recordings available.</div>}
          </div>
        )}
        {tab === 'skills' && (
          <div>
            <div className="text-xl font-bold mb-4 text-[#3b3bb3]">Overall Score: <span className="text-black">{reportData.score} / 10</span></div>
            {avgSkills.communication !== 0 && (
              <div className="mb-4">
                <div className="font-semibold mb-1 capitalize">communication</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-3 rounded bg-gray-200 overflow-hidden">
                    <div className={`h-3 rounded ${avgSkills.communication < 4 ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${(avgSkills.communication / 10) * 100}%` }}></div>
                  </div>
                  <span className="font-bold text-gray-700">{avgSkills.communication}/10</span>
                  <span className="ml-2 text-yellow-400">&#9889;</span>
                </div>
              </div>
            )}
            {avgSkills.grammar !== 0 && (
              <div className="mb-4">
                <div className="font-semibold mb-1 capitalize">grammar</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-3 rounded bg-gray-200 overflow-hidden">
                    <div className={`h-3 rounded ${avgSkills.grammar < 4 ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${(avgSkills.grammar / 10) * 100}%` }}></div>
                  </div>
                  <span className="font-bold text-gray-700">{avgSkills.grammar}/10</span>
                  <span className="ml-2 text-yellow-400">&#9889;</span>
                </div>
              </div>
            )}
            {avgSkills.attitude !== 0 && (
              <div className="mb-4">
                <div className="font-semibold mb-1 capitalize">attitude</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-3 rounded bg-gray-200 overflow-hidden">
                    <div className={`h-3 rounded ${avgSkills.attitude < 4 ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${(avgSkills.attitude / 10) * 100}%` }}></div>
                  </div>
                  <span className="font-bold text-gray-700">{avgSkills.attitude}/10</span>
                  <span className="ml-2 text-yellow-400">&#9889;</span>
                </div>
              </div>
            )}
            {avgSkills.softSkills !== 0 && (
              <div className="mb-4">
                <div className="font-semibold mb-1 capitalize">soft skills</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-3 rounded bg-gray-200 overflow-hidden">
                    <div className={`h-3 rounded ${avgSkills.softSkills < 4 ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${(avgSkills.softSkills / 10) * 100}%` }}></div>
                  </div>
                  <span className="font-bold text-gray-700">{avgSkills.softSkills}/10</span>
                  <span className="ml-2 text-yellow-400">&#9889;</span>
                </div>
              </div>
            )}
          </div>
        )}
        {tab === 'questions' && (
          <div className="max-h-[500px] overflow-y-auto">
            {reportData.report && reportData.report.length > 0 ? reportData.report.map((item, idx) => (
              <div key={idx} className="mb-4 border rounded-lg p-4">
                <button
                  className="w-full text-left font-bold text-[#3b3bb3] py-2 flex justify-between items-center focus:outline-none"
                  onClick={() => setOpenQ(openQ === idx ? null : idx)}
                >
                  <span>Q{idx + 1}: {item.question}</span>
                  <span>{openQ === idx ? '−' : '+'}</span>
                </button>
                {openQ === idx && (
                  <div className="p-4 bg-gray-50 rounded-b space-y-3">
                    <div>
                      <span className="font-semibold">Your Answer:</span> 
                      <p className="mt-1 text-gray-700">{item.user || <span className="italic text-gray-400">No answer</span>}</p>
                    </div>
                    {item.audio && (
                      <div>
                        <span className="font-semibold">Audio Recording:</span>
                        <audio src={item.audio} controls className="mt-1 w-full" />
                      </div>
                    )}
                    <div>
                      <span className="font-semibold">Ideal Answer:</span>
                      <p className="mt-1 text-gray-700">{item.ideal}</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div className="bg-blue-50 p-2 rounded">
                        <span className="font-semibold">Content Score:</span> {item.score}/10
                      </div>
                      {item.skillAnalysis && (
                        <>
                          <div className="bg-green-50 p-2 rounded">
                            <span className="font-semibold">Communication:</span> {item.skillAnalysis.communication}/10
                          </div>
                          <div className="bg-yellow-50 p-2 rounded">
                            <span className="font-semibold">Grammar:</span> {item.skillAnalysis.grammar}/10
                          </div>
                          <div className="bg-purple-50 p-2 rounded">
                            <span className="font-semibold">Attitude:</span> {item.skillAnalysis.attitude}/10
                          </div>
                        </>
                      )}
                    </div>
                    {item.skill && (
                      <div>
                        <span className="font-semibold">Skill Category:</span> {item.skill}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )) : <div>No feedback available.</div>}
          </div>
        )}
      </div>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.7s ease-in; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default FeedbackModal; 