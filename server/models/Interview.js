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
    enum: ['pending', 'in-progress', 'completed', 'scheduled'],
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
  }],
  // Live interview specific fields
  specialist: {
    type: Boolean,
    default: false
  },
  humanSpecialist: {
    type: Boolean,
    default: false
  },
  roomName: {
    type: String,
    trim: true
  },
  scheduledAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  duration: {
    type: Number, // Duration in seconds
    default: 0
  },
  interviewerFeedback: {
    type: String,
    trim: true
  },
  overallRating: {
    type: Number,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Interview', interviewSchema); 