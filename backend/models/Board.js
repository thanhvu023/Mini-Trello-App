const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'member', 'viewer'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  settings: {
    allowMemberInvite: {
      type: Boolean,
      default: true
    },
    allowMemberEdit: {
      type: Boolean,
      default: true
    },
    defaultCardStatus: {
      type: String,
      enum: ['icebox', 'backlog', 'ongoing', 'review', 'done'],
      default: 'backlog'
    }
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
boardSchema.index({ owner: 1 });
boardSchema.index({ 'members.user': 1 });
boardSchema.index({ isArchived: 1 });

// Virtual for board summary
boardSchema.virtual('summary').get(function() {
  return {
    id: this._id,
    name: this.name,
    description: this.description,
    owner: this.owner,
    memberCount: this.members.length,
    isPublic: this.isPublic,
    isArchived: this.isArchived,
    lastActivity: this.lastActivity
  };
});

// Method to add member
boardSchema.methods.addMember = function(userId, role = 'member') {
  const existingMember = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (existingMember) {
    existingMember.role = role;
  } else {
    this.members.push({
      user: userId,
      role: role,
      joinedAt: new Date()
    });
  }
  
  this.lastActivity = new Date();
  return this.save();
};

// Method to remove member
boardSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(member => 
    member.user.toString() !== userId.toString()
  );
  this.lastActivity = new Date();
  return this.save();
};

// Method to check if user is member
boardSchema.methods.isMember = function(userId) {
  return this.members.some(member => 
    member.user.toString() === userId.toString()
  );
};

// Method to check if user is admin
boardSchema.methods.isAdmin = function(userId) {
  const member = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  return member && member.role === 'admin';
};

// Method to check if user can edit
boardSchema.methods.canEdit = function(userId) {
  if (this.owner.toString() === userId.toString()) return true;
  if (!this.settings.allowMemberEdit) return false;
  
  const member = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  return member && (member.role === 'admin' || member.role === 'member');
};

// Static method to find boards by user
boardSchema.statics.findByUser = function(userId) {
  return this.find({
    $or: [
      { owner: userId },
      { 'members.user': userId }
    ],
    isArchived: false
  }).populate('owner', 'name email avatar');
};

// Pre-save middleware to update last activity
boardSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.lastActivity = new Date();
  }
  next();
});

module.exports = mongoose.model('Board', boardSchema); 