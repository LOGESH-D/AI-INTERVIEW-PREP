const express = require('express');
const jwt = require('jsonwebtoken');
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

// Get all questions for a user
router.get('/', auth, async (req, res) => {
  try {
    const questions = await Question.find({ user: req.userId })
      .sort({ createdAt: -1 });
    
    res.json(questions);
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get questions by interview
router.get('/interview/:interviewId', auth, async (req, res) => {
  try {
    const questions = await Question.find({ 
      interview: req.params.interviewId,
      user: req.userId 
    }).sort({ createdAt: -1 });
    
    res.json(questions);
  } catch (error) {
    console.error('Get interview questions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single question
router.get('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findOne({ 
      _id: req.params.id, 
      user: req.userId 
    });
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    res.json(question);
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new question
router.post('/', auth, async (req, res) => {
  try {
    const { text, category, difficulty, type, answer, interview } = req.body;
    
    const question = new Question({
      text,
      category,
      difficulty,
      type,
      answer,
      interview,
      user: req.userId
    });
    
    await question.save();
    res.status(201).json(question);
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update question
router.put('/:id', auth, async (req, res) => {
  try {
    const { text, category, difficulty, type, answer } = req.body;
    
    const question = await Question.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { text, category, difficulty, type, answer },
      { new: true }
    );
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    res.json(question);
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete question
router.delete('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 