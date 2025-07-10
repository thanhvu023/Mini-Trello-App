const express = require('express');
const { body, validationResult } = require('express-validator');
const Card = require('../models/Card');
const Board = require('../models/Board');
const { 
  authenticateToken, 
  requireVerified, 
  requireBoardMember, 
  requireCardEdit 
} = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(requireVerified);

// @route   GET /api/cards/board/:boardId
// @desc    Get all cards for a board
// @access  Private
router.get('/board/:boardId', requireBoardMember, async (req, res) => {
  try {
    const cards = await Card.findByBoard(req.params.boardId);
    
    res.json({
      cards: cards.map(card => ({
        id: card._id,
        name: card.name,
        description: card.description,
        board: card.board,
        owner: card.owner,
        status: card.status,
        priority: card.priority,
        dueDate: card.dueDate,
        memberCount: card.members.length,
        attachmentCount: card.attachments.length,
        githubAttachmentCount: card.githubAttachments.length,
        isArchived: card.isArchived,
        lastActivity: card.lastActivity,
        createdAt: card.createdAt
      }))
    });
  } catch (error) {
    console.error('Get cards error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

// @route   POST /api/cards/board/:boardId
// @desc    Create a new card
// @access  Private
router.post('/board/:boardId', requireBoardMember, [
  body('name')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Tên thẻ phải từ 1-200 ký tự'),
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
    .withMessage('Due date không hợp lệ')
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

    const { name, description = '', status = 'backlog', priority = 'medium', dueDate } = req.body;

    const card = new Card({
      name,
      description,
      board: req.params.boardId,
      owner: req.user._id,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null
    });

    await card.save();

    res.status(201).json({
      message: 'Tạo thẻ thành công',
      card: {
        id: card._id,
        name: card.name,
        description: card.description,
        board: card.board,
        owner: card.owner,
        status: card.status,
        priority: card.priority,
        dueDate: card.dueDate,
        memberCount: card.members.length,
        attachmentCount: card.attachments.length,
        githubAttachmentCount: card.githubAttachments.length,
        isArchived: card.isArchived,
        lastActivity: card.lastActivity,
        createdAt: card.createdAt
      }
    });
  } catch (error) {
    console.error('Create card error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

// @route   GET /api/cards/:id
// @desc    Get card details
// @access  Private
router.get('/:id', requireCardEdit, async (req, res) => {
  try {
    const card = await Card.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .populate('board', 'name');

    res.json({
      card: {
        id: card._id,
        name: card.name,
        description: card.description,
        board: card.board,
        owner: card.owner,
        members: card.members,
        status: card.status,
        priority: card.priority,
        dueDate: card.dueDate,
        labels: card.labels,
        attachments: card.attachments,
        githubAttachments: card.githubAttachments,
        isArchived: card.isArchived,
        lastActivity: card.lastActivity,
        createdAt: card.createdAt
      }
    });
  } catch (error) {
    console.error('Get card error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

// @route   PUT /api/cards/:id
// @desc    Update card details
// @access  Private
router.put('/:id', requireCardEdit, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Tên thẻ phải từ 1-200 ký tự'),
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
    .withMessage('Due date không hợp lệ')
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

    const { name, description, status, priority, dueDate } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

    const card = await Card.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('owner', 'name email avatar')
     .populate('members.user', 'name email avatar')
     .populate('board', 'name');

    res.json({
      message: 'Cập nhật thẻ thành công',
      card: {
        id: card._id,
        name: card.name,
        description: card.description,
        board: card.board,
        owner: card.owner,
        members: card.members,
        status: card.status,
        priority: card.priority,
        dueDate: card.dueDate,
        labels: card.labels,
        attachments: card.attachments,
        githubAttachments: card.githubAttachments,
        isArchived: card.isArchived,
        lastActivity: card.lastActivity,
        createdAt: card.createdAt
      }
    });
  } catch (error) {
    console.error('Update card error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

// @route   DELETE /api/cards/:id
// @desc    Delete card
// @access  Private
router.delete('/:id', requireCardEdit, async (req, res) => {
  try {
    await Card.findByIdAndDelete(req.params.id);
    
    res.json({
      message: 'Xóa thẻ thành công'
    });
  } catch (error) {
    console.error('Delete card error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

// @route   POST /api/cards/:id/members
// @desc    Add member to card
// @access  Private
router.post('/:id/members', requireCardEdit, [
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

    await req.card.addMember(userId);

    res.json({
      message: 'Thêm thành viên thành công'
    });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

// @route   DELETE /api/cards/:id/members/:userId
// @desc    Remove member from card
// @access  Private
router.delete('/:id/members/:userId', requireCardEdit, async (req, res) => {
  try {
    await req.card.removeMember(req.params.userId);

    res.json({
      message: 'Xóa thành viên thành công'
    });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

// @route   POST /api/cards/:id/labels
// @desc    Add label to card
// @access  Private
router.post('/:id/labels', requireCardEdit, [
  body('name')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Tên label phải từ 1-20 ký tự'),
  body('color')
    .optional()
    .isHexColor()
    .withMessage('Color phải là mã màu hex hợp lệ')
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

    const { name, color = '#3B82F6' } = req.body;

    await req.card.addLabel(name, color);

    res.json({
      message: 'Thêm label thành công'
    });
  } catch (error) {
    console.error('Add label error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

// @route   DELETE /api/cards/:id/labels/:name
// @desc    Remove label from card
// @access  Private
router.delete('/:id/labels/:name', requireCardEdit, async (req, res) => {
  try {
    await req.card.removeLabel(req.params.name);

    res.json({
      message: 'Xóa label thành công'
    });
  } catch (error) {
    console.error('Remove label error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

// @route   POST /api/cards/:id/archive
// @desc    Archive/Unarchive card
// @access  Private
router.post('/:id/archive', requireCardEdit, async (req, res) => {
  try {
    req.card.isArchived = !req.card.isArchived;
    await req.card.save();

    res.json({
      message: req.card.isArchived ? 'Đã lưu trữ thẻ' : 'Đã bỏ lưu trữ thẻ',
      card: {
        id: req.card._id,
        name: req.card.name,
        isArchived: req.card.isArchived
      }
    });
  } catch (error) {
    console.error('Archive card error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

module.exports = router; 