const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  notes: {
    type: String,
    trim: true
  },
  yearsOfExperience: {
    type: String,
    trim: true
  },
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  report: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  skills: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Interview', interviewSchema); 