const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Interview = require('../models/Interview');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'photo') {
      // Allow images
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for profile photo'));
      }
    } else if (file.fieldname === 'resume') {
      // Allow PDF and DOC files
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only PDF and DOC files are allowed for resume'));
      }
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Get user profile
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/', auth, async (req, res) => {
  try {
    const { name, phone, education, experience } = req.body;
    
    const updateData = {};
    if (name) updateData['profile.name'] = name;
    if (phone) updateData['profile.phone'] = phone;
    if (education) updateData['profile.education'] = education;
    if (experience) updateData['profile.experience'] = experience;
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload profile photo
router.post('/photo', auth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const photoUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { 'profile.photo': photoUrl },
      { new: true }
    ).select('-password');
    
    res.json({ photoUrl, user });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload resume
router.post('/resume', auth, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const resumeUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { 'profile.resume': resumeUrl },
      { new: true }
    ).select('-password');
    
    res.json({ resumeUrl, user });
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user test statistics and history
router.get('/test-stats', auth, async (req, res) => {
  try {
    // Get all completed interviews for the user
    const interviews = await Interview.find({
      user: req.user.userId,
      status: 'completed'
    })
    .select('title role score report createdAt completedAt')
    .sort({ createdAt: -1 });
    
    // Calculate comprehensive statistics
    const totalInterviews = interviews.length;
    const scoredInterviews = interviews.filter(i => i.score !== null && i.score !== undefined);
    const totalScore = scoredInterviews.reduce((sum, interview) => sum + interview.score, 0);
    const averageScore = scoredInterviews.length > 0 ? totalScore / scoredInterviews.length : 0;
    const bestScore = scoredInterviews.length > 0 ? Math.max(...scoredInterviews.map(i => i.score)) : 0;
    
    // Calculate recent performance (last 5 interviews)
    const recentInterviews = scoredInterviews.slice(0, 5);
    const recentAverageScore = recentInterviews.length > 0 
      ? recentInterviews.reduce((sum, interview) => sum + interview.score, 0) / recentInterviews.length 
      : 0;
    
    // Calculate improvement trend
    const improvementTrend = calculateImprovementTrend(scoredInterviews);
    
    // Get detailed test history
    const testHistory = interviews.map(interview => ({
      id: interview._id,
      title: interview.title,
      role: interview.role,
      score: interview.score || 0,
      date: interview.completedAt || interview.createdAt,
      report: interview.report,
      duration: interview.duration || 0
    }));
    
    // Update user's test statistics in database
    const updatedStats = {
      totalTests: totalInterviews,
      averageScore: Math.round(averageScore * 10) / 10,
      bestScore: Math.round(bestScore * 10) / 10,
      lastTestDate: interviews.length > 0 ? interviews[0].createdAt : null
    };
    
    await User.findByIdAndUpdate(req.user.userId, {
      testStats: updatedStats
    });
    
    res.json({
      stats: updatedStats,
      totalInterviews,
      averageRecentScore: Math.round(recentAverageScore * 10) / 10,
      improvementTrend,
      testHistory: testHistory.slice(0, 10), // Show last 10 interviews
      performanceBreakdown: {
        excellent: scoredInterviews.filter(i => i.score >= 8).length,
        good: scoredInterviews.filter(i => i.score >= 6 && i.score < 8).length,
        average: scoredInterviews.filter(i => i.score >= 4 && i.score < 6).length,
        needsImprovement: scoredInterviews.filter(i => i.score < 4).length
      }
    });
  } catch (error) {
    console.error('Error fetching test stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to calculate improvement trend
function calculateImprovementTrend(interviews) {
  if (interviews.length < 2) return 'insufficient_data';
  
  const sortedInterviews = interviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const firstHalf = sortedInterviews.slice(0, Math.floor(sortedInterviews.length / 2));
  const secondHalf = sortedInterviews.slice(Math.floor(sortedInterviews.length / 2));
  
  const firstHalfAvg = firstHalf.reduce((sum, i) => sum + i.score, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, i) => sum + i.score, 0) / secondHalf.length;
  
  const improvement = secondHalfAvg - firstHalfAvg;
  
  if (improvement > 1) return 'improving';
  if (improvement < -1) return 'declining';
  return 'stable';
}

// Serve uploaded files
router.get('/uploads/:filename', (req, res) => {
  const filePath = path.join(__dirname, '../uploads', req.params.filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ message: 'File not found' });
  }
});

module.exports = router; 