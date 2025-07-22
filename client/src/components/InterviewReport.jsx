import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const InterviewReport = ({ report, overallScore, reportLoading, interview }) => {
  const [feedbackTab, setFeedbackTab] = useState('overall');
  const [openQuestion, setOpenQuestion] = useState(null);
  const navigate = useNavigate();

  // Calculate average skill scores
  const avgSkills = report.length > 0 ? report.reduce((acc, item) => {
    acc.communication += item.skillAnalysis.communication;
    acc.grammar += item.skillAnalysis.grammar;
    acc.attitude += item.skillAnalysis.attitude;
    acc.softSkills += item.skillAnalysis.softSkills;
    return acc;
  }, { communication: 0, grammar: 0, attitude: 0, softSkills: 0 }) : { communication: 0, grammar: 0, attitude: 0, softSkills: 0 };

  if (report.length > 0) {
    avgSkills.communication = Math.round(avgSkills.communication / report.length * 10) / 10;
    avgSkills.grammar = Math.round(avgSkills.grammar / report.length * 10) / 10;
    avgSkills.attitude = Math.round(avgSkills.attitude / report.length * 10) / 10;
    avgSkills.softSkills = Math.round(avgSkills.softSkills / report.length * 10) / 10;
  }

  // Calculate average body language score (0-10)
  let avgBodyLang = null;
  if (report.length > 0) {
    let total = 0, count = 0;
    report.forEach(item => {
      if (item.bodyLanguage) {
        let score = 5;
        if (item.bodyLanguage.expression === 'confident' && item.bodyLanguage.eyeContact) score = 10;
        else if (item.bodyLanguage.expression === 'confident') score = 7;
        else if (item.bodyLanguage.expression === 'neutral') score = 5;
        else if (item.bodyLanguage.expression === 'smiling') score = 8;
        else if (item.bodyLanguage.expression === 'nervous' || item.bodyLanguage.expression === 'distracted') score = 3;
        if (!item.bodyLanguage.eyeContact) score -= 2;
        if (score < 0) score = 0;
        total += score;
        count++;
      }
    });
    if (count > 0) avgBodyLang = Math.round((total / count) * 10) / 10;
  }

  // Helper for transcript highlighting
  function highlightTranscript(text, fillerWords, strongWords, negativeWords) {
    if (!text) return null;
    // Build regex for each type
    const fillerRegex = new RegExp(`\\b(${fillerWords.join('|')})\\b`, 'gi');
    const strongRegex = new RegExp(`\\b(${strongWords.join('|')})\\b`, 'gi');
    const negativeRegex = new RegExp(`\\b(${negativeWords.join('|')})\\b`, 'gi');
    // First, highlight filler words
    let html = text.replace(fillerRegex, '<span style="background:#fee2e2;color:#b91c1c;font-weight:bold;">$1</span>');
    // Then, highlight strong points
    html = html.replace(strongRegex, '<span style="background:#dcfce7;color:#166534;font-weight:bold;">$1</span>');
    // Then, highlight negative words
    html = html.replace(negativeRegex, '<span style="background:#fef9c3;color:#b45309;font-weight:bold;">$1</span>');
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  }

  // Helper for generating AI commentary (simulated)
  function getAICommentary(item) {
    const comments = [];
    // Filler words
    if (item.skillAnalysis?.communicationDetails?.fillerWords?.length > 0) {
      comments.push({ time: 2, text: `Try to avoid filler words like: ${item.skillAnalysis.communicationDetails.fillerWords.join(', ')}` });
    }
    // Strong points
    if (item.skillAnalysis?.softSkillsDetails?.cues) {
      const strong = Object.entries(item.skillAnalysis.softSkillsDetails.cues).filter(([k, v]) => v > 0).map(([k]) => k);
      if (strong.length > 0) {
        comments.push({ time: 5, text: `Great demonstration of: ${strong.join(', ')}` });
      }
    }
    // Sentiment
    if (item.skillAnalysis?.softSkillsDetails?.sentiment === 'negative') {
      comments.push({ time: 8, text: 'Try to maintain a more positive tone.' });
    }
    // Body language
    if (item.bodyLanguage && item.bodyLanguage.expression === 'nervous') {
      comments.push({ time: 12, text: 'Try to relax and maintain confident body language.' });
    }
    // Default
    if (comments.length === 0) {
      comments.push({ time: 3, text: 'Keep practicing for even better results!' });
    }
    return comments;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f8fafc] to-[#e0e7ff] py-8 px-2">
      <h1 className="text-2xl md:text-3xl font-extrabold mb-4">Interview Feedback & Report</h1>
      {reportLoading ? (
        <div className="text-lg text-[#3b3bb3] font-semibold">Generating your report...</div>
      ) : (
        <div className="w-full max-w-4xl bg-white rounded-xl shadow p-6">
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6 border-b">
            <button 
              className={`px-4 py-2 rounded-t-lg font-semibold ${feedbackTab === 'overall' ? 'bg-[#3b3bb3] text-white' : 'bg-gray-100 text-gray-700'}`} 
              onClick={() => setFeedbackTab('overall')}
            >
              Overall Score
            </button>
            <button 
              className={`px-4 py-2 rounded-t-lg font-semibold ${feedbackTab === 'interview' ? 'bg-[#3b3bb3] text-white' : 'bg-gray-100 text-gray-700'}`} 
              onClick={() => setFeedbackTab('interview')}
            >
              Interview
            </button>
            <button 
              className={`px-4 py-2 rounded-t-lg font-semibold ${feedbackTab === 'skills' ? 'bg-[#3b3bb3] text-white' : 'bg-gray-100 text-gray-700'}`} 
              onClick={() => setFeedbackTab('skills')}
            >
              Skills
            </button>
            <button 
              className={`px-4 py-2 rounded-t-lg font-semibold ${feedbackTab === 'questions' ? 'bg-[#3b3bb3] text-white' : 'bg-gray-100 text-gray-700'}`} 
              onClick={() => setFeedbackTab('questions')}
            >
              Questions
            </button>
          </div>

          {/* Overall Score Tab */}
          {feedbackTab === 'overall' && (
            <div>
              <div className="text-3xl font-bold mb-6 text-center text-[#3b3bb3]">
                Overall Performance Score: <span className="text-black">{overallScore} / 10</span>
              </div>
              {/* Radar Chart Visualization */}
              <div className="flex justify-center mb-8">
                <div className="w-full max-w-md">
                  <Radar
                    data={{
                      labels: [
                        'Content Accuracy',
                        'Communication',
                        'Grammar',
                        'Attitude',
                        'Soft Skills',
                        ...(avgBodyLang !== null ? ['Body Language'] : [])
                      ],
                      datasets: [
                        {
                          label: 'Your Scores',
                          data: [
                            overallScore,
                            avgSkills.communication,
                            avgSkills.grammar,
                            avgSkills.attitude,
                            avgSkills.softSkills,
                            ...(avgBodyLang !== null ? [avgBodyLang] : [])
                          ],
                          backgroundColor: 'rgba(59, 59, 179, 0.2)',
                          borderColor: 'rgba(59, 59, 179, 1)',
                          borderWidth: 2,
                          pointBackgroundColor: 'rgba(59, 59, 179, 1)'
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                        tooltip: { enabled: true }
                      },
                      scales: {
                        r: {
                          min: 0,
                          max: 10,
                          ticks: { stepSize: 2, color: '#6366f1' },
                          pointLabels: { color: '#23237a', font: { size: 14, weight: 'bold' } },
                          grid: { color: '#c7d2fe' },
                          angleLines: { color: '#a5b4fc' }
                        }
                      }
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4 text-blue-800">Performance Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Content Accuracy</span>
                      <span className="font-bold text-blue-600">{overallScore}/10</span>
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
                    {avgBodyLang !== null && (
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Body Language</span>
                        <span className="font-bold text-blue-600">{avgBodyLang}/10</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4 text-green-800">Recommendations</h3>
                  <div className="space-y-2 text-sm">
                    {overallScore < 7 && (
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
                    {(overallScore >= 7 && avgSkills.communication >= 7 && avgSkills.grammar >= 7 && avgSkills.attitude >= 7 && avgSkills.softSkills >= 7) && (
                      <div className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        <span>Excellent performance! Keep up the great work</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Personalized Improvement Plan */}
              <div className="bg-white rounded-xl shadow p-6 mt-8">
                <h3 className="text-2xl font-bold mb-4 text-[#3b3bb3]">Personalized Improvement Plan</h3>
                <ul className="list-disc list-inside text-gray-800 text-base space-y-2">
                  {/* Analyze lowest scoring areas and generate recommendations */}
                  {(() => {
                    const recs = [];
                    if (overallScore < 7) recs.push('Practice answering questions with a focus on accuracy and covering all key points. Review sample answers for your target roles.');
                    if (avgSkills.communication < 7) recs.push('Record yourself answering questions and listen for clarity, filler words, and pacing. Practice speaking clearly and confidently.');
                    if (avgSkills.grammar < 7) recs.push('Review common grammar mistakes and practice using varied sentence structures. Read your answers aloud.');
                    if (avgSkills.attitude < 7) recs.push('Work on maintaining a positive, enthusiastic, and professional tone throughout your answers.');
                    if (avgSkills.softSkills < 7) recs.push('Reflect on past experiences where you demonstrated teamwork, leadership, or adaptability. Prepare stories to share.');
                    if (avgBodyLang !== null && avgBodyLang < 7) recs.push('Practice maintaining eye contact and confident posture in front of a mirror or camera. Record yourself and review your body language.');
                    // Suggest sample exercises
                    recs.push('Try mock interviews with a friend or AI, focusing on your weakest areas.');
                    recs.push('Review feedback from previous interviews and set specific improvement goals for your next practice session.');
                    return recs.map((r, i) => <li key={i}>{r}</li>);
                  })()}
                </ul>
              </div>
            </div>
          )}

          {/* Interview Tab */}
          {feedbackTab === 'interview' && (
            <div>
              <h3 className="text-xl font-bold mb-4 text-[#3b3bb3]">Interview Recordings</h3>
              <div className="space-y-4">
                {report.map((item, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <h4 className="font-bold text-[#3b3bb3] mb-2">Question {idx + 1}</h4>
                    <p className="text-gray-700 mb-3">{item.question}</p>
                    <div className="space-y-2">
                      {item.video && (
                        <div>
                          <label className="block text-sm font-semibold mb-1">Video Recording:</label>
                          <video controls className="w-full max-w-md rounded" src={item.video} />
                        </div>
                      )}
                      {item.audio && (
                        <div>
                          <label className="block text-sm font-semibold mb-1">Audio Recording:</label>
                          <audio controls className="w-full" src={item.audio} />
                        </div>
                      )}
                      {!item.video && !item.audio && (
                        <p className="text-gray-500 italic">No recording available for this question</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills Tab */}
          {feedbackTab === 'skills' && (
            <div>
              <h3 className="text-xl font-bold mb-4 text-[#3b3bb3]">Skills Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">Communication</span>
                      <span className="font-bold text-[#3b3bb3]">{avgSkills.communication}/10</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className={`h-3 rounded-full ${avgSkills.communication < 4 ? 'bg-red-500' : avgSkills.communication < 7 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                           style={{ width: `${(avgSkills.communication / 10) * 100}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">Grammar & Language</span>
                      <span className="font-bold text-[#3b3bb3]">{avgSkills.grammar}/10</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className={`h-3 rounded-full ${avgSkills.grammar < 4 ? 'bg-red-500' : avgSkills.grammar < 7 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                           style={{ width: `${(avgSkills.grammar / 10) * 100}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">Professional Attitude</span>
                      <span className="font-bold text-[#3b3bb3]">{avgSkills.attitude}/10</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className={`h-3 rounded-full ${avgSkills.attitude < 4 ? 'bg-red-500' : avgSkills.attitude < 7 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                           style={{ width: `${(avgSkills.attitude / 10) * 100}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">Soft Skills</span>
                      <span className="font-bold text-[#3b3bb3]">{avgSkills.softSkills}/10</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className={`h-3 rounded-full ${avgSkills.softSkills < 4 ? 'bg-red-500' : avgSkills.softSkills < 7 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                           style={{ width: `${(avgSkills.softSkills / 10) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold mb-3 text-[#3b3bb3]">Skill Insights</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Communication:</strong> {avgSkills.communication >= 7 ? 'Excellent clarity and articulation' : avgSkills.communication >= 4 ? 'Good communication with room for improvement' : 'Needs improvement in clarity and articulation'}</p>
                    <p><strong>Grammar:</strong> {avgSkills.grammar >= 7 ? 'Strong language proficiency' : avgSkills.grammar >= 4 ? 'Adequate language skills' : 'Grammar and vocabulary need improvement'}</p>
                    <p><strong>Attitude:</strong> {avgSkills.attitude >= 7 ? 'Professional and enthusiastic approach' : avgSkills.attitude >= 4 ? 'Good professional demeanor' : 'Work on maintaining professional attitude'}</p>
                    <p><strong>Soft Skills:</strong> {avgSkills.softSkills >= 7 ? 'Strong problem-solving and interpersonal skills' : avgSkills.softSkills >= 4 ? 'Good soft skills foundation' : 'Focus on developing soft skills'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Questions Tab */}
          {feedbackTab === 'questions' && (
            <div className="max-h-[500px] overflow-y-auto">
              {report.map((item, idx) => (
                <div key={idx} className="mb-4 border rounded-lg p-4">
                  <button
                    className="w-full text-left font-bold text-[#3b3bb3] py-2 flex justify-between items-center focus:outline-none"
                    onClick={() => setOpenQuestion(openQuestion === idx ? null : idx)}
                  >
                    <span>Q{idx + 1}: {item.question}</span>
                    <span>{openQuestion === idx ? '−' : '+'}</span>
                  </button>
                  {openQuestion === idx && (
                    <div className="p-4 bg-gray-50 rounded-b space-y-3">
                      <div>
                        <span className="font-semibold">Your Answer:</span> 
                        <p className="mt-1 text-gray-700">
                          {item.user ?
                            highlightTranscript(
                              item.user,
                              item.skillAnalysis?.communicationDetails?.fillerWords || [],
                              [
                                // strong points: soft skills cues
                                ...Object.keys(item.skillAnalysis?.softSkillsDetails?.cues || {}).filter(k => (item.skillAnalysis.softSkillsDetails.cues[k] > 0)),
                                'positive', 'enthusiastic', 'motivated', 'excited', 'optimistic', 'happy', 'lead', 'team', 'solve', 'adapt', 'collaborate', 'support', 'guide', 'mentor', 'improve', 'analyze'
                              ],
                              ['bad', 'terrible', 'hate', 'difficult', 'problem', 'issue', 'wrong', 'fail', 'stress']
                            ) : <span className="italic text-gray-400">No answer</span>}
                        </p>
                      </div>
                      {item.transcribedText && item.transcribedText !== item.user && (
                        <div>
                          <span className="font-semibold text-blue-600">Transcribed from Voice:</span> 
                          <p className="mt-1 text-blue-700 italic">
                            {highlightTranscript(
                              item.transcribedText,
                              item.skillAnalysis?.communicationDetails?.fillerWords || [],
                              [
                                ...Object.keys(item.skillAnalysis?.softSkillsDetails?.cues || {}).filter(k => (item.skillAnalysis.softSkillsDetails.cues[k] > 0)),
                                'positive', 'enthusiastic', 'motivated', 'excited', 'optimistic', 'happy', 'lead', 'team', 'solve', 'adapt', 'collaborate', 'support', 'guide', 'mentor', 'improve', 'analyze'
                              ],
                              ['bad', 'terrible', 'hate', 'difficult', 'problem', 'issue', 'wrong', 'fail', 'stress']
                            )}
                          </p>
                        </div>
                      )}
                      {item.audio && (
                        <div>
                          <span className="font-semibold">Audio Recording:</span>
                          <audio ref={audio => item._audioRef = audio} src={item.audio} controls className="mt-1 w-full" />
                          <InteractiveCommentary item={item} mediaType="audio" />
                        </div>
                      )}
                      {item.video && (
                        <div>
                          <span className="font-semibold">Video Recording:</span>
                          <video ref={video => item._videoRef = video} src={item.video} controls className="mt-1 w-full max-w-md rounded" />
                          <InteractiveCommentary item={item} mediaType="video" />
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
                        <div className="bg-green-50 p-2 rounded">
                          <span className="font-semibold">Communication:</span> {item.skillAnalysis.communication}/10
                        </div>
                        <div className="bg-yellow-50 p-2 rounded">
                          <span className="font-semibold">Grammar:</span> {item.skillAnalysis.grammar}/10
                        </div>
                        <div className="bg-purple-50 p-2 rounded">
                          <span className="font-semibold">Attitude:</span> {item.skillAnalysis.attitude}/10
                        </div>
                      </div>
                      {item.relevanceScore !== undefined && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                          <div className="bg-red-50 p-2 rounded">
                            <span className="font-semibold">Relevance Score:</span> {item.relevanceScore}/10
                          </div>
                          <div className="bg-orange-50 p-2 rounded">
                            <span className="font-semibold">Soft Skills:</span> {item.skillAnalysis.softSkills}/10
                          </div>
                        </div>
                      )}
                      {item.skill && (
                        <div>
                          <span className="font-semibold">Skill Category:</span> {item.skill}
                        </div>
                      )}
                      {item.feedback && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <span className="font-semibold text-blue-800">Detailed Feedback:</span>
                          <p className="mt-1 text-blue-700 text-sm">{item.feedback}</p>
                        </div>
                      )}
                      {item.missingPoints && item.missingPoints.length > 0 && (
                        <div className="bg-red-50 p-3 rounded-lg">
                          <span className="font-semibold text-red-800">Missing Key Points:</span>
                          <ul className="mt-1 text-red-700 text-sm list-disc list-inside">
                            {item.missingPoints.map((point, i) => (
                              <li key={i}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {item.similarity !== undefined && (
                        <div className="bg-gray-100 p-2 rounded text-xs text-gray-700">
                          <span className="font-semibold">Semantic Similarity:</span> {(item.similarity * 100).toFixed(0)}%
                        </div>
                      )}
                      {item.skillAnalysis && item.skillAnalysis.communicationDetails && (
                        <div className="bg-yellow-50 p-3 rounded-lg mt-2">
                          <span className="font-semibold text-yellow-800">Communication Analysis:</span>
                          <ul className="mt-1 text-yellow-700 text-sm list-disc list-inside">
                            {item.skillAnalysis.communicationDetails.fillerWords && item.skillAnalysis.communicationDetails.fillerWords.length > 0 && (
                              <li><strong>Filler Words:</strong> {item.skillAnalysis.communicationDetails.fillerWords.join(', ')}</li>
                            )}
                            {item.skillAnalysis.communicationDetails.pace && (
                              <li><strong>Speaking Pace:</strong> {item.skillAnalysis.communicationDetails.pace.toFixed(0)} wpm</li>
                            )}
                            {item.skillAnalysis.communicationDetails.pauses !== null && (
                              <li><strong>Long Pauses:</strong> {item.skillAnalysis.communicationDetails.pauses}</li>
                            )}
                          </ul>
                          {item.skillAnalysis.communicationDetails.suggestions && item.skillAnalysis.communicationDetails.suggestions.length > 0 && (
                            <div className="mt-2">
                              <span className="font-semibold">Suggestions:</span>
                              <ul className="list-disc list-inside text-yellow-800 text-xs mt-1">
                                {item.skillAnalysis.communicationDetails.suggestions.map((s, i) => (
                                  <li key={i}>{s}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                      {item.skillAnalysis && item.skillAnalysis.softSkillsDetails && (
                        <div className="bg-pink-50 p-3 rounded-lg mt-2">
                          <span className="font-semibold text-pink-800">Soft Skills & Sentiment Analysis:</span>
                          <ul className="mt-1 text-pink-700 text-sm list-disc list-inside">
                            <li><strong>Empathy cues:</strong> {item.skillAnalysis.softSkillsDetails.cues.empathy}</li>
                            <li><strong>Leadership cues:</strong> {item.skillAnalysis.softSkillsDetails.cues.leadership}</li>
                            <li><strong>Teamwork cues:</strong> {item.skillAnalysis.softSkillsDetails.cues.teamwork}</li>
                            <li><strong>Adaptability cues:</strong> {item.skillAnalysis.softSkillsDetails.cues.adaptability}</li>
                            <li><strong>Problem-solving cues:</strong> {item.skillAnalysis.softSkillsDetails.cues.problemSolving}</li>
                            <li><strong>Positivity cues:</strong> {item.skillAnalysis.softSkillsDetails.cues.positivity}</li>
                            <li><strong>Sentiment:</strong> {item.skillAnalysis.softSkillsDetails.sentiment}</li>
                            {item.skillAnalysis.softSkillsDetails.emotion && (
                              <li><strong>Emotion (from voice):</strong> {item.skillAnalysis.softSkillsDetails.emotion}</li>
                            )}
                          </ul>
                          {item.skillAnalysis.softSkillsDetails.suggestions && item.skillAnalysis.softSkillsDetails.suggestions.length > 0 && (
                            <div className="mt-2">
                              <span className="font-semibold">Suggestions:</span>
                              <ul className="list-disc list-inside text-pink-800 text-xs mt-1">
                                {item.skillAnalysis.softSkillsDetails.suggestions.map((s, i) => (
                                  <li key={i}>{s}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                      {item.bodyLanguage && (
                        <div className="bg-green-50 p-3 rounded-lg mt-2">
                          <span className="font-semibold text-green-800">Body Language Analysis:</span>
                          <ul className="mt-1 text-green-700 text-sm list-disc list-inside">
                            <li><strong>Expression:</strong> {item.bodyLanguage.expression}</li>
                            <li><strong>Eye Contact:</strong> {item.bodyLanguage.eyeContact ? 'Yes' : 'No'}</li>
                          </ul>
                          {item.bodyLanguage.suggestions && item.bodyLanguage.suggestions.length > 0 && (
                            <div className="mt-2">
                              <span className="font-semibold">Suggestions:</span>
                              <ul className="list-disc list-inside text-green-800 text-xs mt-1">
                                {item.bodyLanguage.suggestions.map((s, i) => (
                                  <li key={i}>{s}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-center mt-8">
            <button
              className="bg-[#3b3bb3] text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:bg-[#23237a] transition-all text-lg"
              onClick={() => navigate('/interviews')}
            >
              Back to Interviews
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// InteractiveCommentary component
function InteractiveCommentary({ item, mediaType }) {
  const [show, setShow] = useState(false);
  const [currentComment, setCurrentComment] = useState(null);
  const [playing, setPlaying] = useState(false);
  const mediaRef = useRef(null);
  const comments = getAICommentary(item);
  // Simulate comment timing
  function handlePlay() {
    setPlaying(true);
    setCurrentComment(null);
    let idx = 0;
    const interval = setInterval(() => {
      if (!mediaRef.current || mediaRef.current.paused) {
        clearInterval(interval);
        setPlaying(false);
        return;
      }
      const t = Math.floor(mediaRef.current.currentTime);
      if (comments[idx] && t >= comments[idx].time) {
        setCurrentComment(comments[idx].text);
        idx++;
      }
      if (idx >= comments.length) {
        clearInterval(interval);
        setTimeout(() => setCurrentComment(null), 2000);
      }
    }, 500);
  }
  return (
    <div className="mt-2">
      <button className="text-xs px-3 py-1 rounded bg-[#3b3bb3] text-white font-semibold hover:bg-[#23237a]" onClick={() => setShow(s => !s)}>
        {show ? 'Hide AI Commentary' : 'Replay with AI Commentary'}
      </button>
      {show && (
        <div className="mt-2">
          {mediaType === 'audio' ? (
            <audio ref={mediaRef} src={item.audio} controls onPlay={handlePlay} className="w-full" />
          ) : (
            <video ref={mediaRef} src={item.video} controls onPlay={handlePlay} className="w-full max-w-md rounded" />
          )}
          {currentComment && (
            <div className="mt-2 p-2 bg-blue-50 border-l-4 border-blue-400 text-blue-900 text-xs rounded">
              <span className="font-semibold">AI Comment:</span> {currentComment}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default InterviewReport; 