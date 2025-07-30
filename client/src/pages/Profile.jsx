import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../AuthContext';
import { profileAPI } from '../api';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [testStats, setTestStats] = useState({
    stats: { totalTests: 0, averageScore: 0, bestScore: 0 },
    totalInterviews: 0,
    averageRecentScore: 0,
    improvementTrend: 'insufficient_data',
    testHistory: [],
    performanceBreakdown: {
      excellent: 0,
      good: 0,
      average: 0,
      needsImprovement: 0
    }
  });
  
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    photo: '',
    resume: '',
    education: [{ school: '', degree: '', year: '' }],
    experience: [{ company: '', role: '', years: '' }]
  });

  // Load profile data on component mount
  useEffect(() => {
    loadProfile();
    loadTestStats();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await profileAPI.getProfile();
      const userData = response.data;
      
      setProfile({
        name: userData.profile?.name || userData.username || '',
        email: userData.email || '',
        phone: userData.profile?.phone || '',
        photo: userData.profile?.photo || '',
        resume: userData.profile?.resume || '',
        education: userData.profile?.education?.length > 0 
          ? userData.profile.education 
          : [{ school: '', degree: '', year: '' }],
        experience: userData.profile?.experience?.length > 0 
          ? userData.profile.experience 
          : [{ company: '', role: '', years: '' }]
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const loadTestStats = async () => {
    try {
      console.log('📊 Loading test statistics...');
      const response = await profileAPI.getTestStats();
      console.log('✅ Test stats loaded:', response.data);
      setTestStats(response.data);
    } catch (error) {
      console.error('❌ Error loading test stats:', error);
      toast.error('Failed to load test statistics');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleEducationChange = (idx, field, value) => {
    const updated = [...profile.education];
    updated[idx][field] = value;
    setProfile((prev) => ({ ...prev, education: updated }));
  };

  const handleExperienceChange = (idx, field, value) => {
    const updated = [...profile.experience];
    updated[idx][field] = value;
    setProfile((prev) => ({ ...prev, experience: updated }));
  };

  const addEducation = () => {
    setProfile((prev) => ({ 
      ...prev, 
      education: [...prev.education, { school: '', degree: '', year: '' }] 
    }));
  };

  const removeEducation = (idx) => {
    if (profile.education.length > 1) {
      setProfile((prev) => ({ 
        ...prev, 
        education: prev.education.filter((_, i) => i !== idx) 
      }));
    }
  };

  const addExperience = () => {
    setProfile((prev) => ({ 
      ...prev, 
      experience: [...prev.experience, { company: '', role: '', years: '' }] 
    }));
  };

  const removeExperience = (idx) => {
    if (profile.experience.length > 1) {
      setProfile((prev) => ({ 
        ...prev, 
        experience: prev.experience.filter((_, i) => i !== idx) 
      }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Filter out empty education/experience entries
      const cleanEducation = profile.education.filter(edu => 
        edu.school.trim() || edu.degree.trim() || edu.year.trim()
      );
      const cleanExperience = profile.experience.filter(exp => 
        exp.company.trim() || exp.role.trim() || exp.years.trim()
      );

      const profileData = {
        name: profile.name,
        phone: profile.phone,
        education: cleanEducation.length > 0 ? cleanEducation : [{ school: '', degree: '', year: '' }],
        experience: cleanExperience.length > 0 ? cleanExperience : [{ company: '', role: '', years: '' }]
      };

      const response = await profileAPI.updateProfile(profileData);
      
      // Update the user context with new profile data
      if (updateUser) {
        updateUser(response.data);
      }
      
      setEditMode(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    loadProfile(); // Reload original data
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      console.log('📸 Uploading photo:', file.name, file.size, file.type);
      
      const formData = new FormData();
      formData.append('photo', file);

      const response = await profileAPI.uploadPhoto(formData);
      console.log('✅ Photo upload response:', response.data);
      
      setProfile(prev => ({ ...prev, photo: response.data.photoUrl }));
      console.log('🔄 Updated profile photo URL:', response.data.photoUrl);
      
      // Update user context
      if (updateUser) {
        updateUser(response.data.user);
      }
      
      toast.success('Profile photo updated successfully!');
    } catch (error) {
      console.error('❌ Error uploading photo:', error);
      console.error('❌ Error response:', error.response?.data);
      toast.error('Failed to upload photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingResume(true);
      const formData = new FormData();
      formData.append('resume', file);

      const response = await profileAPI.uploadResume(formData);
      
      setProfile(prev => ({ ...prev, resume: response.data.resumeUrl }));
      
      // Update user context
      if (updateUser) {
        updateUser(response.data.user);
      }
      
      toast.success('Resume uploaded successfully!');
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast.error('Failed to upload resume. Please try again.');
    } finally {
      setUploadingResume(false);
    }
  };

  if (loading) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex items-center justify-center h-screen">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 shadow-2xl mb-8">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -translate-y-48 translate-x-48"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full translate-y-32 -translate-x-32"></div>
          
          <div className="relative p-8 sm:p-12">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Profile Photo */}
              <div className="relative group">
                <div className="relative">
                  <img 
                    src={profile.photo || `https://ui-avatars.com/api/?name=${profile.name || 'User'}&size=200&background=3b3bb3&color=fff`}
                    alt="Profile" 
                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white shadow-2xl transition-transform duration-300 group-hover:scale-105" 
                    onLoad={() => console.log('✅ Image loaded successfully:', profile.photo)}
                    onError={(e) => {
                      console.log('❌ Image failed to load:', profile.photo);
                      e.target.src = `https://ui-avatars.com/api/?name=${profile.name || 'User'}&size=200&background=3b3bb3&color=fff`;
                    }}
                  />
                  {editMode && (
                    <div className="absolute bottom-2 right-2">
                      <label className="cursor-pointer bg-white text-blue-600 p-3 rounded-full hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                          disabled={uploadingPhoto}
                        />
                      </label>
                      {uploadingPhoto && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                        </div>
                      )}
                    </div>
                  )}
              </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center lg:text-left text-white">
                <h1 className="text-4xl sm:text-5xl font-bold mb-4 drop-shadow-lg">
                  {profile.name || 'Your Name'}
                </h1>
                <p className="text-xl mb-2 opacity-90">{profile.email}</p>
                <p className="text-lg mb-6 opacity-80">{profile.phone || 'No phone number'}</p>
                
                {!editMode && (
                  <button 
                    className="px-8 py-3 bg-white text-blue-600 rounded-full font-semibold hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    onClick={() => setEditMode(true)}
                  >
                    ✏️ Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden">
          <div className="flex flex-wrap border-b border-gray-200">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'stats', label: 'Statistics', icon: '📈' },
              { id: 'history', label: 'History', icon: '📋' },
              { id: 'edit', label: 'Edit Profile', icon: '✏️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 text-center font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total Tests</p>
                      <p className="text-3xl font-bold">{testStats.stats.totalTests}</p>
                    </div>
                    <div className="text-4xl">📝</div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Average Score</p>
                      <p className="text-3xl font-bold">{testStats.stats.averageScore.toFixed(1)}/10</p>
                    </div>
                    <div className="text-4xl">🎯</div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Best Score</p>
                      <p className="text-3xl font-bold">{testStats.stats.bestScore.toFixed(1)}/10</p>
                    </div>
                    <div className="text-4xl">🏆</div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium">Recent Average</p>
                      <p className="text-3xl font-bold">{testStats.averageRecentScore.toFixed(1)}/10</p>
                    </div>
                    <div className="text-4xl">📈</div>
                  </div>
                </div>
              </div>
            )}

            {/* Statistics Tab */}
            {activeTab === 'stats' && (
              <div className="space-y-6">
                {/* Performance Trend */}
                {testStats.improvementTrend !== 'insufficient_data' && (
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Performance Trend</h3>
                    <div className="flex items-center justify-center">
                      <div className={`text-6xl mr-4 ${
                        testStats.improvementTrend === 'improving' ? 'text-green-500' :
                        testStats.improvementTrend === 'stable' ? 'text-blue-500' :
                        'text-red-500'
                      }`}>
                        {testStats.improvementTrend === 'improving' ? '↗' :
                         testStats.improvementTrend === 'stable' ? '→' : '↘'}
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-800">
                          {testStats.improvementTrend === 'improving' ? 'Improving' :
                           testStats.improvementTrend === 'stable' ? 'Stable' : 'Declining'}
                        </p>
                        <p className="text-gray-600">Your performance trend</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Performance Breakdown */}
                {testStats.stats.totalTests > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Performance Breakdown</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                        <div className="flex items-center justify-between">
                          <span className="text-green-700 font-medium">Excellent</span>
                          <span className="text-2xl font-bold text-green-600">{testStats.performanceBreakdown.excellent}</span>
                        </div>
                        <p className="text-sm text-green-600 mt-1">(8-10)</p>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <div className="flex items-center justify-between">
                          <span className="text-blue-700 font-medium">Good</span>
                          <span className="text-2xl font-bold text-blue-600">{testStats.performanceBreakdown.good}</span>
                        </div>
                        <p className="text-sm text-blue-600 mt-1">(6-7.9)</p>
                      </div>
                      <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                        <div className="flex items-center justify-between">
                          <span className="text-yellow-700 font-medium">Average</span>
                          <span className="text-2xl font-bold text-yellow-600">{testStats.performanceBreakdown.average}</span>
                        </div>
                        <p className="text-sm text-yellow-600 mt-1">(4-5.9)</p>
                      </div>
                      <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                        <div className="flex items-center justify-between">
                          <span className="text-red-700 font-medium">Needs Improvement</span>
                          <span className="text-2xl font-bold text-red-600">{testStats.performanceBreakdown.needsImprovement}</span>
                        </div>
                        <p className="text-sm text-red-600 mt-1">(&lt;4)</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div>
                {testStats.testHistory.length > 0 ? (
                  <div className="space-y-4">
                    {testStats.testHistory.map((test, index) => (
                      <div key={index} className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{test.title}</h3>
                            <p className="text-gray-600 mb-2">{test.role}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>📅 {new Date(test.date).toLocaleDateString()}</span>
                              {test.duration > 0 && (
                                <span>⏱️ {Math.floor(test.duration / 60)}m {test.duration % 60}s</span>
                              )}
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <div className={`text-2xl font-bold px-4 py-2 rounded-full ${
                              test.score >= 8 ? 'bg-green-100 text-green-700' :
                              test.score >= 6 ? 'bg-blue-100 text-blue-700' :
                              test.score >= 4 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {test.score.toFixed(1)}/10
                            </div>
          </div>
        </div>
      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-8xl mb-4">📊</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">No tests taken yet</h3>
                    <p className="text-gray-600">Start your first interview to see your history here</p>
                  </div>
                )}
              </div>
            )}

            {/* Edit Profile Tab */}
            {activeTab === 'edit' && (
              <div className="space-y-8">
                {/* Basic Information */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <span className="mr-2">👤</span>
                    Basic Information
                  </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold mb-2 text-gray-700">Name</label>
              <input 
                name="name" 
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" 
                value={profile.name} 
                onChange={handleChange} 
                disabled={!editMode}
                placeholder="Enter your full name"
              />
            </div>
                    <div>
                      <label className="block font-semibold mb-2 text-gray-700">Phone</label>
                      <input 
                        name="phone" 
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" 
                        value={profile.phone} 
                        onChange={handleChange} 
                        disabled={!editMode}
                        placeholder="Enter your phone number"
                      />
                    </div>
            <div>
              <label className="block font-semibold mb-2 text-gray-700">Email</label>
              <input 
                name="email" 
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50" 
                value={profile.email} 
                disabled={true}
                placeholder="Your email address"
              />
            </div>
            <div>
                      <label className="block font-semibold mb-2 text-gray-700">Resume</label>
                      {profile.resume ? (
                        <div className="flex items-center gap-2">
                          <a 
                            href={profile.resume} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline font-medium"
                          >
                            📄 View Current Resume
                          </a>
                          {editMode && (
                            <label className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                              (Change)
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={handleResumeUpload}
                                className="hidden"
                                disabled={uploadingResume}
                              />
                            </label>
                          )}
                        </div>
                      ) : (
                        <div>
                          {editMode ? (
                            <label className="cursor-pointer">
                              <div className="w-full border-2 border-dashed border-gray-300 rounded-xl px-4 py-3 text-center hover:border-blue-500 transition-colors">
                                {uploadingResume ? '📤 Uploading...' : '📄 Upload Resume (PDF/DOC)'}
              <input 
                                  type="file"
                                  accept=".pdf,.doc,.docx"
                                  onChange={handleResumeUpload}
                                  className="hidden"
                                  disabled={uploadingResume}
                                />
                              </div>
                            </label>
                          ) : (
                            <p className="text-gray-500 text-sm">No resume uploaded</p>
                          )}
                        </div>
                      )}
                    </div>
            </div>
          </div>

          {/* Education Section */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center">
                      <span className="mr-2">🎓</span>
                      Education
                    </h3>
              {editMode && (
                <button 
                  type="button" 
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                  onClick={addEducation}
                >
                  + Add Education
                </button>
              )}
            </div>
            <div className="space-y-4">
              {profile.education.map((edu, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-xl bg-gray-50">
                  <input 
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" 
                    placeholder="School/University" 
                    value={edu.school} 
                    onChange={e => handleEducationChange(idx, 'school', e.target.value)} 
                    disabled={!editMode}
                  />
                  <input 
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" 
                    placeholder="Degree" 
                    value={edu.degree} 
                    onChange={e => handleEducationChange(idx, 'degree', e.target.value)} 
                    disabled={!editMode}
                  />
                  <input 
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" 
                    placeholder="Year" 
                    value={edu.year} 
                    onChange={e => handleEducationChange(idx, 'year', e.target.value)} 
                    disabled={!editMode}
                  />
                        {editMode && profile.education.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEducation(idx)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            🗑️ Remove
                          </button>
                        )}
                </div>
              ))}
            </div>
          </div>

          {/* Experience Section */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center">
                      <span className="mr-2">💼</span>
                      Work Experience
                    </h3>
              {editMode && (
                <button 
                  type="button" 
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                  onClick={addExperience}
                >
                  + Add Experience
                </button>
              )}
            </div>
            <div className="space-y-4">
              {profile.experience.map((exp, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-xl bg-gray-50">
                  <input 
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" 
                    placeholder="Company" 
                    value={exp.company} 
                    onChange={e => handleExperienceChange(idx, 'company', e.target.value)} 
                    disabled={!editMode}
                  />
                  <input 
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" 
                    placeholder="Role" 
                    value={exp.role} 
                    onChange={e => handleExperienceChange(idx, 'role', e.target.value)} 
                    disabled={!editMode}
                  />
                  <input 
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" 
                    placeholder="Years" 
                    value={exp.years} 
                    onChange={e => handleExperienceChange(idx, 'years', e.target.value)} 
                    disabled={!editMode}
                  />
                        {editMode && profile.experience.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeExperience(idx)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            🗑️ Remove
                          </button>
                        )}
                </div>
              ))}
            </div>
          </div>

          {/* Save/Cancel Buttons */}
          {editMode && (
                  <div className="flex gap-4 justify-center">
                    <button 
                      type="button" 
                      className="px-8 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? '💾 Saving...' : '💾 Save Changes'}
                    </button>
                    <button 
                      type="button" 
                      className="px-8 py-3 bg-gray-300 text-gray-800 rounded-xl font-semibold hover:bg-gray-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      ❌ Cancel
                    </button>
                  </div>
                )}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 