const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  // Profile information
  profile: {
    name: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    photo: {
      type: String, // URL to uploaded photo
      trim: true
    },
    resume: {
      type: String, // URL to uploaded resume
      trim: true
    },
    education: [{
      school: {
        type: String,
        trim: true
      },
      degree: {
        type: String,
        trim: true
      },
      year: {
        type: String,
        trim: true
      }
    }],
    experience: [{
      company: {
        type: String,
        trim: true
      },
      role: {
        type: String,
        trim: true
      },
      years: {
        type: String,
        trim: true
      }
    }]
  },
  // Test statistics
  testStats: {
    totalTests: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    bestScore: {
      type: Number,
      default: 0
    },
    lastTestDate: {
      type: Date
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to update test statistics
userSchema.methods.updateTestStats = async function(score) {
  this.testStats.totalTests += 1;
  
  // Update average score
  const totalScore = (this.testStats.averageScore * (this.testStats.totalTests - 1)) + score;
  this.testStats.averageScore = totalScore / this.testStats.totalTests;
  
  // Update best score
  if (score > this.testStats.bestScore) {
    this.testStats.bestScore = score;
  }
  
  this.testStats.lastTestDate = new Date();
  
  return this.save();
};

module.exports = mongoose.model('User', userSchema); 