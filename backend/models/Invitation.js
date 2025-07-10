const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  inviter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  invitee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'member', 'viewer'],
    default: 'member'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  },
  message: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    }
  },
  respondedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better query performance
invitationSchema.index({ board: 1 });
invitationSchema.index({ invitee: 1 });
invitationSchema.index({ email: 1 });
invitationSchema.index({ status: 1 });
invitationSchema.index({ expiresAt: 1 });

// Virtual for invitation summary
invitationSchema.virtual('summary').get(function() {
  return {
    id: this._id,
    board: this.board,
    inviter: this.inviter,
    invitee: this.invitee,
    email: this.email,
    role: this.role,
    status: this.status,
    message: this.message,
    expiresAt: this.expiresAt,
    respondedAt: this.respondedAt,
    isExpired: this.isExpired
  };
});

// Virtual to check if invitation is expired
invitationSchema.virtual('isExpired').get(function() {
  return Date.now() > this.expiresAt;
});

// Method to accept invitation
invitationSchema.methods.accept = function() {
  this.status = 'accepted';
  this.respondedAt = new Date();
  return this.save();
};

// Method to decline invitation
invitationSchema.methods.decline = function() {
  this.status = 'declined';
  this.respondedAt = new Date();
  return this.save();
};

// Method to check if invitation is valid
invitationSchema.methods.isValid = function() {
  return this.status === 'pending' && !this.isExpired;
};

// Static method to find pending invitations by user
invitationSchema.statics.findPendingByUser = function(userId) {
  return this.find({
    invitee: userId,
    status: 'pending',
    expiresAt: { $gt: new Date() }
  }).populate('board', 'name description')
    .populate('inviter', 'name email avatar');
};

// Static method to find pending invitations by email
invitationSchema.statics.findPendingByEmail = function(email) {
  return this.find({
    email: email.toLowerCase(),
    status: 'pending',
    expiresAt: { $gt: new Date() }
  }).populate('board', 'name description')
    .populate('inviter', 'name email avatar');
};

// Static method to find invitations by board
invitationSchema.statics.findByBoard = function(boardId) {
  return this.find({ board: boardId })
    .populate('inviter', 'name email avatar')
    .populate('invitee', 'name email avatar');
};

// Pre-save middleware to ensure email is lowercase
invitationSchema.pre('save', function(next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }
  next();
});

module.exports = mongoose.model('Invitation', invitationSchema); 