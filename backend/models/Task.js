const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
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
  card: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card',
    required: true
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
  assignedTo: [{
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
  estimatedHours: {
    type: Number,
    min: 0,
    default: 0
  },
  actualHours: {
    type: Number,
    min: 0,
    default: 0
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
  comments: [{
    content: {
      type: String,
      required: true,
      maxlength: 1000
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
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
taskSchema.index({ card: 1 });
taskSchema.index({ board: 1 });
taskSchema.index({ owner: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ 'assignedTo.user': 1 });
taskSchema.index({ isArchived: 1 });
taskSchema.index({ isCompleted: 1 });

// Virtual for task summary
taskSchema.virtual('summary').get(function() {
  return {
    id: this._id,
    title: this.title,
    description: this.description,
    card: this.card,
    board: this.board,
    owner: this.owner,
    status: this.status,
    priority: this.priority,
    dueDate: this.dueDate,
    assignedCount: this.assignedTo.length,
    attachmentCount: this.attachments.length,
    githubAttachmentCount: this.githubAttachments.length,
    commentCount: this.comments.length,
    isCompleted: this.isCompleted,
    isArchived: this.isArchived,
    lastActivity: this.lastActivity
  };
});

// Method to assign user
taskSchema.methods.assignUser = function(userId) {
  const existingAssignment = this.assignedTo.find(assignment => 
    assignment.user.toString() === userId.toString()
  );
  
  if (!existingAssignment) {
    this.assignedTo.push({
      user: userId,
      assignedAt: new Date()
    });
    this.lastActivity = new Date();
  }
  
  return this.save();
};

// Method to unassign user
taskSchema.methods.unassignUser = function(userId) {
  this.assignedTo = this.assignedTo.filter(assignment => 
    assignment.user.toString() !== userId.toString()
  );
  this.lastActivity = new Date();
  return this.save();
};

// Method to check if user is assigned
taskSchema.methods.isAssignedTo = function(userId) {
  return this.assignedTo.some(assignment => 
    assignment.user.toString() === userId.toString()
  );
};

// Method to add comment
taskSchema.methods.addComment = function(content, userId) {
  this.comments.push({
    content,
    author: userId,
    createdAt: new Date()
  });
  this.lastActivity = new Date();
  return this.save();
};

// Method to complete task
taskSchema.methods.complete = function(userId) {
  this.isCompleted = true;
  this.completedAt = new Date();
  this.completedBy = userId;
  this.status = 'done';
  this.lastActivity = new Date();
  return this.save();
};

// Method to reopen task
taskSchema.methods.reopen = function() {
  this.isCompleted = false;
  this.completedAt = null;
  this.completedBy = null;
  this.status = 'ongoing';
  this.lastActivity = new Date();
  return this.save();
};

// Method to add label
taskSchema.methods.addLabel = function(name, color = '#3B82F6') {
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
taskSchema.methods.removeLabel = function(name) {
  this.labels = this.labels.filter(label => 
    label.name.toLowerCase() !== name.toLowerCase()
  );
  this.lastActivity = new Date();
  return this.save();
};

// Method to add GitHub attachment
taskSchema.methods.addGitHubAttachment = function(attachment, userId) {
  this.githubAttachments.push({
    ...attachment,
    attachedBy: userId,
    attachedAt: new Date()
  });
  this.lastActivity = new Date();
  return this.save();
};

// Method to remove GitHub attachment
taskSchema.methods.removeGitHubAttachment = function(attachmentId) {
  this.githubAttachments = this.githubAttachments.filter(attachment => 
    attachment._id.toString() !== attachmentId.toString()
  );
  this.lastActivity = new Date();
  return this.save();
};

// Static method to find tasks by card
taskSchema.statics.findByCard = function(cardId) {
  return this.find({ 
    card: cardId,
    isArchived: false 
  }).populate('owner', 'name email avatar')
    .populate('assignedTo.user', 'name email avatar')
    .populate('comments.author', 'name email avatar');
};

// Static method to find tasks by board
taskSchema.statics.findByBoard = function(boardId) {
  return this.find({ 
    board: boardId,
    isArchived: false 
  }).populate('card', 'name')
    .populate('owner', 'name email avatar')
    .populate('assignedTo.user', 'name email avatar');
};

// Static method to find tasks by user
taskSchema.statics.findByUser = function(userId) {
  return this.find({
    $or: [
      { owner: userId },
      { 'assignedTo.user': userId }
    ],
    isArchived: false
  }).populate('card', 'name')
    .populate('board', 'name')
    .populate('owner', 'name email avatar');
};

// Pre-save middleware to update last activity
taskSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.lastActivity = new Date();
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema); 