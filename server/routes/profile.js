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
    
    const photoUrl = `/uploads/${req.file.filename}`;
    
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
    
    const resumeUrl = `/uploads/${req.file.filename}`;
    
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
    // Get user with test stats
    const user = await User.findById(req.user.userId).select('testStats');
    
    // Get completed interviews with scores
    const interviews = await Interview.find({
      user: req.user.userId,
      status: 'completed',
      score: { $exists: true, $ne: null }
    })
    .select('title role score report createdAt')
    .sort({ createdAt: -1 })
    .limit(10);
    
    // Calculate additional statistics
    const totalInterviews = interviews.length;
    const recentScores = interviews.slice(0, 5).map(i => i.score);
    const averageRecentScore = recentScores.length > 0 
      ? recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length 
      : 0;
    
    const testHistory = interviews.map(interview => ({
      id: interview._id,
      title: interview.title,
      role: interview.role,
      score: interview.score,
      date: interview.createdAt,
      report: interview.report
    }));
    
    res.json({
      stats: user.testStats,
      totalInterviews,
      averageRecentScore: Math.round(averageRecentScore * 10) / 10,
      testHistory
    });
  } catch (error) {
    console.error('Error fetching test stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

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