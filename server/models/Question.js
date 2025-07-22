const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  type: {
    type: String,
    enum: ['technical', 'behavioral', 'situational'],
    default: 'behavioral'
  },
  answer: {
    type: String,
    trim: true
  },
  interview: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Question', questionSchema); 