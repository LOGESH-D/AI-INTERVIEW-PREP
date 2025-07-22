const express = require('express');
const jwt = require('jsonwebtoken');
const Interview = require('../models/Interview');
const User = require('../models/User');
const Question = require('../models/Question');

const router = express.Router();

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Get all interviews for a user
router.get('/', auth, async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.userId })
      .populate('questions')
      .sort({ createdAt: -1 });
    
    res.json(interviews);
  } catch (error) {
    console.error('Get interviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single interview
router.get('/:id', auth, async (req, res) => {
  try {
    const interview = await Interview.findOne({ 
      _id: req.params.id, 
      user: req.userId 
    }).populate('questions');
    
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    
    res.json(interview);
  } catch (error) {
    console.error('Get interview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new interview
router.post('/', auth, async (req, res) => {
  try {
    const { title, role, company, notes, questions, yearsOfExperience, skills } = req.body;
    // Create the interview first
    const interview = new Interview({
      user: req.userId,
      title,
      role,
      company,
      notes,
      yearsOfExperience,
      skills
    });
    await interview.save();

    // Create Question documents and link them
    let questionIds = [];
    if (Array.isArray(questions)) {
      for (const q of questions) {
        const questionDoc = new Question({
          text: typeof q === 'string' ? q : q.text,
          category: role || '',
          user: req.userId,
          interview: interview._id
        });
        await questionDoc.save();
        questionIds.push(questionDoc._id);
      }
    }
    interview.questions = questionIds;
    await interview.save();
    // Populate questions for response
    await interview.populate('questions');
    res.status(201).json(interview);
  } catch (error) {
    console.error('Create interview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update interview
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, role, company, status, notes, score } = req.body;
    
    const interview = await Interview.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { title, role, company, status, notes, score },
      { new: true }
    );
    
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    
    res.json(interview);
  } catch (error) {
    console.error('Update interview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete interview
router.delete('/:id', auth, async (req, res) => {
  try {
    const interview = await Interview.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });
    
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    
    res.json({ message: 'Interview deleted successfully' });
  } catch (error) {
    console.error('Delete interview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save feedback/report and mark as completed
router.post('/:id/report', auth, async (req, res) => {
  try {
    const { report, overallScore } = req.body;
    const interview = await Interview.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { report, status: 'completed', score: overallScore },
      { new: true }
    );
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    
    // Update user test statistics
    try {
      const user = await User.findById(req.userId);
      if (user) {
        await user.updateTestStats(overallScore);
      }
    } catch (statsError) {
      console.error('Error updating test stats:', statsError);
      // Don't fail the request if stats update fails
    }
    
    res.json({ message: 'Report saved', interview });
  } catch (error) {
    console.error('Save report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch feedback/report for an interview
router.get('/:id/report', auth, async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.userId });
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    res.json({ report: interview.report, score: interview.score, status: interview.status });
  } catch (error) {
    console.error('Fetch report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 