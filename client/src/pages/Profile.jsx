import React, { useContext, useState } from 'react';
import { AuthContext } from '../AuthContext';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    education: [{ school: '', degree: '', year: '' }],
    experience: [{ company: '', role: '', years: '' }]
  });

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

  const addEducation = () => setProfile((prev) => ({ ...prev, education: [...prev.education, { school: '', degree: '', year: '' }] }));
  const addExperience = () => setProfile((prev) => ({ ...prev, experience: [...prev.experience, { company: '', role: '', years: '' }] }));

  const handleSave = async () => {
    try {
      setEditMode(false);
      toast.success('Profile updated successfully! (Local storage only)');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setProfile({
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      education: [{ school: '', degree: '', year: '' }],
      experience: [{ company: '', role: '', years: '' }]
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative">
            <img 
              src={`https://ui-avatars.com/api/?name=${profile.name || 'User'}&size=128&background=3b3bb3&color=fff`}
              alt="Profile" 
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-400 shadow-lg" 
            />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{profile.name || 'Your Name'}</h1>
            <p className="text-gray-600 mb-1">{profile.email}</p>
            <p className="text-gray-600 mb-4">{profile.phone || 'No phone number'}</p>
            {!editMode && (
              <button 
                className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                onClick={() => setEditMode(true)}
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Test Statistics Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Test Statistics</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-semibold text-blue-800">Total Tests</span>
                <span className="text-2xl font-bold text-blue-600">0</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-semibold text-green-800">Average Score</span>
                <span className="text-2xl font-bold text-green-600">0.0/10</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="font-semibold text-purple-800">Best Score</span>
                <span className="text-2xl font-bold text-purple-600">0.0/10</span>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Test History</h2>
            <div className="text-center py-8 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No tests taken yet</p>
              <p className="text-sm">Start your first interview to see your history here</p>
            </div>
          </div>
        </div>
      </div>
      {/* Profile Form */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Profile Information</h2>
        <form className="space-y-6" onSubmit={e => { e.preventDefault(); handleSave(); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold mb-2 text-gray-700">Name</label>
              <input 
                name="name" 
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                value={profile.name} 
                onChange={handleChange} 
                disabled={!editMode}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="block font-semibold mb-2 text-gray-700">Email</label>
              <input 
                name="email" 
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50" 
                value={profile.email} 
                disabled={true}
                placeholder="Your email address"
              />
            </div>
            <div>
              <label className="block font-semibold mb-2 text-gray-700">Phone</label>
              <input 
                name="phone" 
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                value={profile.phone} 
                onChange={handleChange} 
                disabled={!editMode}
                placeholder="Enter your phone number"
              />
            </div>
          </div>
          {/* Education Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block font-semibold text-gray-700">Education</label>
              {editMode && (
                <button 
                  type="button" 
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  onClick={addEducation}
                >
                  + Add Education
                </button>
              )}
            </div>
            <div className="space-y-4">
              {profile.education.map((edu, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg">
                  <input 
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    placeholder="School/University" 
                    value={edu.school} 
                    onChange={e => handleEducationChange(idx, 'school', e.target.value)} 
                    disabled={!editMode}
                  />
                  <input 
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    placeholder="Degree" 
                    value={edu.degree} 
                    onChange={e => handleEducationChange(idx, 'degree', e.target.value)} 
                    disabled={!editMode}
                  />
                  <input 
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    placeholder="Year" 
                    value={edu.year} 
                    onChange={e => handleEducationChange(idx, 'year', e.target.value)} 
                    disabled={!editMode}
                  />
                </div>
              ))}
            </div>
          </div>
          {/* Experience Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block font-semibold text-gray-700">Work Experience</label>
              {editMode && (
                <button 
                  type="button" 
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  onClick={addExperience}
                >
                  + Add Experience
                </button>
              )}
            </div>
            <div className="space-y-4">
              {profile.experience.map((exp, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg">
                  <input 
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    placeholder="Company" 
                    value={exp.company} 
                    onChange={e => handleExperienceChange(idx, 'company', e.target.value)} 
                    disabled={!editMode}
                  />
                  <input 
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    placeholder="Role" 
                    value={exp.role} 
                    onChange={e => handleExperienceChange(idx, 'role', e.target.value)} 
                    disabled={!editMode}
                  />
                  <input 
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    placeholder="Years" 
                    value={exp.years} 
                    onChange={e => handleExperienceChange(idx, 'years', e.target.value)} 
                    disabled={!editMode}
                  />
                </div>
              ))}
            </div>
          </div>
          {/* Save/Cancel Buttons */}
          {editMode && (
            <div className="flex gap-4 mt-6">
              <button type="submit" className="px-6 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors">Save</button>
              <button type="button" className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition-colors" onClick={handleCancel}>Cancel</button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile; 