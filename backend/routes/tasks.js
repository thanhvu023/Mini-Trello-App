const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Card = require('../models/Card');
const { 
  authenticateToken, 
  requireVerified, 
  requireCardEdit, 
  requireTaskEdit 
} = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(requireVerified);

// @route   GET /api/tasks/card/:cardId
// @desc    Get all tasks for a card
// @access  Private
router.get('/card/:cardId', requireCardEdit, async (req, res) => {
  try {
    const tasks = await Task.findByCard(req.params.cardId);
    
    res.json({
      tasks: tasks.map(task => ({
        id: task._id,
        title: task.title,
        description: task.description,
        card: task.card,
        board: task.board,
        owner: task.owner,
        assignedTo: task.assignedTo,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        estimatedHours: task.estimatedHours,
        actualHours: task.actualHours,
        labels: task.labels,
        attachmentCount: task.attachments.length,
        githubAttachmentCount: task.githubAttachments.length,
        commentCount: task.comments.length,
        isCompleted: task.isCompleted,
        isArchived: task.isArchived,
        lastActivity: task.lastActivity,
        createdAt: task.createdAt
      }))
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

// @route   POST /api/tasks/card/:cardId
// @desc    Create a new task
// @access  Private
router.post('/card/:cardId', requireCardEdit, [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Tiêu đề phải từ 1-200 ký tự'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Mô tả không được quá 1000 ký tự'),
  body('status')
    .optional()
    .isIn(['icebox', 'backlog', 'ongoing', 'review', 'done'])
    .withMessage('Status không hợp lệ'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority không hợp lệ'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date không hợp lệ'),
  body('estimatedHours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Estimated hours phải là số dương')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Dữ liệu không hợp lệ',
        details: errors.array()
      });
    }

    const { title, description = '', status = 'backlog', priority = 'medium', dueDate, estimatedHours = 0 } = req.body;

    // Get card to get board ID
    const card = await Card.findById(req.params.cardId);
    if (!card) {
      return res.status(404).json({
        error: 'Card not found',
        message: 'Thẻ không tồn tại'
      });
    }

    const task = new Task({
      title,
      description,
      card: req.params.cardId,
      board: card.board,
      owner: req.user._id,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      estimatedHours
    });

    await task.save();

    res.status(201).json({
      message: 'Tạo nhiệm vụ thành công',
      task: {
        id: task._id,
        title: task.title,
        description: task.description,
        card: task.card,
        board: task.board,
        owner: task.owner,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        estimatedHours: task.estimatedHours,
        actualHours: task.actualHours,
        isCompleted: task.isCompleted,
        isArchived: task.isArchived,
        lastActivity: task.lastActivity,
        createdAt: task.createdAt
      }
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get task details
// @access  Private
router.get('/:id', requireTaskEdit, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('assignedTo.user', 'name email avatar')
      .populate('comments.author', 'name email avatar')
      .populate('card', 'name')
      .populate('board', 'name');

    res.json({
      task: {
        id: task._id,
        title: task.title,
        description: task.description,
        card: task.card,
        board: task.board,
        owner: task.owner,
        assignedTo: task.assignedTo,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        estimatedHours: task.estimatedHours,
        actualHours: task.actualHours,
        labels: task.labels,
        attachments: task.attachments,
        githubAttachments: task.githubAttachments,
        comments: task.comments,
        isCompleted: task.isCompleted,
        completedAt: task.completedAt,
        completedBy: task.completedBy,
        isArchived: task.isArchived,
        lastActivity: task.lastActivity,
        createdAt: task.createdAt
      }
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task details
// @access  Private
router.put('/:id', requireTaskEdit, [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Tiêu đề phải từ 1-200 ký tự'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Mô tả không được quá 1000 ký tự'),
  body('status')
    .optional()
    .isIn(['icebox', 'backlog', 'ongoing', 'review', 'done'])
    .withMessage('Status không hợp lệ'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority không hợp lệ'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date không hợp lệ'),
  body('estimatedHours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Estimated hours phải là số dương'),
  body('actualHours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Actual hours phải là số dương')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Dữ liệu không hợp lệ',
        details: errors.array()
      });
    }

    const { title, description, status, priority, dueDate, estimatedHours, actualHours } = req.body;
    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (estimatedHours !== undefined) updateData.estimatedHours = estimatedHours;
    if (actualHours !== undefined) updateData.actualHours = actualHours;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('owner', 'name email avatar')
     .populate('assignedTo.user', 'name email avatar')
     .populate('card', 'name')
     .populate('board', 'name');

    res.json({
      message: 'Cập nhật nhiệm vụ thành công',
      task: {
        id: task._id,
        title: task.title,
        description: task.description,
        card: task.card,
        board: task.board,
        owner: task.owner,
        assignedTo: task.assignedTo,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        estimatedHours: task.estimatedHours,
        actualHours: task.actualHours,
        labels: task.labels,
        attachments: task.attachments,
        githubAttachments: task.githubAttachments,
        isCompleted: task.isCompleted,
        isArchived: task.isArchived,
        lastActivity: task.lastActivity,
        createdAt: task.createdAt
      }
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private
router.delete('/:id', requireTaskEdit, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    
    res.json({
      message: 'Xóa nhiệm vụ thành công'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

// @route   POST /api/tasks/:id/assign
// @desc    Assign user to task
// @access  Private
router.post('/:id/assign', requireTaskEdit, [
  body('userId')
    .isMongoId()
    .withMessage('User ID không hợp lệ')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Dữ liệu không hợp lệ',
        details: errors.array()
      });
    }

    const { userId } = req.body;

    await req.task.assignUser(userId);

    res.json({
      message: 'Gán nhiệm vụ thành công'
    });
  } catch (error) {
    console.error('Assign task error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

// @route   DELETE /api/tasks/:id/assign/:userId
// @desc    Unassign user from task
// @access  Private
router.delete('/:id/assign/:userId', requireTaskEdit, async (req, res) => {
  try {
    await req.task.unassignUser(req.params.userId);

    res.json({
      message: 'Bỏ gán nhiệm vụ thành công'
    });
  } catch (error) {
    console.error('Unassign task error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

// @route   POST /api/tasks/:id/complete
// @desc    Complete task
// @access  Private
router.post('/:id/complete', requireTaskEdit, async (req, res) => {
  try {
    await req.task.complete(req.user._id);

    res.json({
      message: 'Hoàn thành nhiệm vụ thành công'
    });
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

// @route   POST /api/tasks/:id/reopen
// @desc    Reopen task
// @access  Private
router.post('/:id/reopen', requireTaskEdit, async (req, res) => {
  try {
    await req.task.reopen();

    res.json({
      message: 'Mở lại nhiệm vụ thành công'
    });
  } catch (error) {
    console.error('Reopen task error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

// @route   POST /api/tasks/:id/comments
// @desc    Add comment to task
// @access  Private
router.post('/:id/comments', requireTaskEdit, [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Nội dung comment phải từ 1-1000 ký tự')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Dữ liệu không hợp lệ',
        details: errors.array()
      });
    }

    const { content } = req.body;

    await req.task.addComment(content, req.user._id);

    res.json({
      message: 'Thêm comment thành công'
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

module.exports = router; 