const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: ''
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
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
    assignedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['icebox', 'backlog', 'ongoing', 'review', 'done'],
    default: 'backlog'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  dueDate: {
    type: Date,
    default: null
  },
  labels: [{
    name: {
      type: String,
      trim: true,
      maxlength: 20
    },
    color: {
      type: String,
      default: '#3B82F6'
    }
  }],
  attachments: [{
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['file', 'image', 'link'],
      default: 'file'
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  githubAttachments: [{
    type: {
      type: String,
      enum: ['pull_request', 'commit', 'issue'],
      required: true
    },
    number: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    attachedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    attachedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isArchived: {
    type: Boolean,
    default: false
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
cardSchema.index({ board: 1 });
cardSchema.index({ owner: 1 });
cardSchema.index({ status: 1 });
cardSchema.index({ 'members.user': 1 });
cardSchema.index({ isArchived: 1 });

// Virtual for card summary
cardSchema.virtual('summary').get(function() {
  return {
    id: this._id,
    name: this.name,
    description: this.description,
    board: this.board,
    owner: this.owner,
    status: this.status,
    priority: this.priority,
    dueDate: this.dueDate,
    memberCount: this.members.length,
    attachmentCount: this.attachments.length,
    githubAttachmentCount: this.githubAttachments.length,
    isArchived: this.isArchived,
    lastActivity: this.lastActivity
  };
});

// Method to add member
cardSchema.methods.addMember = function(userId) {
  const existingMember = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (!existingMember) {
    this.members.push({
      user: userId,
      assignedAt: new Date()
    });
    this.lastActivity = new Date();
  }
  
  return this.save();
};

// Method to remove member
cardSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(member => 
    member.user.toString() !== userId.toString()
  );
  this.lastActivity = new Date();
  return this.save();
};

// Method to check if user is member
cardSchema.methods.isMember = function(userId) {
  return this.members.some(member => 
    member.user.toString() === userId.toString()
  );
};

// Method to add label
cardSchema.methods.addLabel = function(name, color = '#3B82F6') {
  const existingLabel = this.labels.find(label => 
    label.name.toLowerCase() === name.toLowerCase()
  );
  
  if (!existingLabel) {
    this.labels.push({ name, color });
    this.lastActivity = new Date();
  }
  
  return this.save();
};

// Method to remove label
cardSchema.methods.removeLabel = function(name) {
  this.labels = this.labels.filter(label => 
    label.name.toLowerCase() !== name.toLowerCase()
  );
  this.lastActivity = new Date();
  return this.save();
};

// Method to add GitHub attachment
cardSchema.methods.addGitHubAttachment = function(attachment, userId) {
  this.githubAttachments.push({
    ...attachment,
    attachedBy: userId,
    attachedAt: new Date()
  });
  this.lastActivity = new Date();
  return this.save();
};

// Method to remove GitHub attachment
cardSchema.methods.removeGitHubAttachment = function(attachmentId) {
  this.githubAttachments = this.githubAttachments.filter(attachment => 
    attachment._id.toString() !== attachmentId.toString()
  );
  this.lastActivity = new Date();
  return this.save();
};

// Static method to find cards by board
cardSchema.statics.findByBoard = function(boardId) {
  return this.find({ 
    board: boardId,
    isArchived: false 
  }).populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');
};

// Static method to find cards by user
cardSchema.statics.findByUser = function(userId) {
  return this.find({
    $or: [
      { owner: userId },
      { 'members.user': userId }
    ],
    isArchived: false
  }).populate('board', 'name')
    .populate('owner', 'name email avatar');
};

// Pre-save middleware to update last activity
cardSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.lastActivity = new Date();
  }
  next();
});

module.exports = mongoose.model('Card', cardSchema); 