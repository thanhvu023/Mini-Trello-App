const express = require('express');
const { body, validationResult } = require('express-validator');
const Board = require('../models/Board');
const Invitation = require('../models/Invitation');
const User = require('../models/User');
const { 
  authenticateToken, 
  requireVerified, 
  requireBoardOwner, 
  requireBoardEdit, 
  requireBoardMember 
} = require('../middleware/auth');
const { sendInvitationEmail } = require('../services/emailService');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(requireVerified);

// @route   GET /api/boards
// @desc    Get all boards for current user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const boards = await Board.findByUser(req.user._id);
    
    res.json({
      boards: boards.map(board => ({
        id: board._id,
        name: board.name,
        description: board.description,
        owner: board.owner,
        memberCount: board.members.length,
        isPublic: board.isPublic,
        isArchived: board.isArchived,
        lastActivity: board.lastActivity,
        createdAt: board.createdAt
      }))
    });
  } catch (error) {
    console.error('Get boards error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

// @route   POST /api/boards
// @desc    Create a new board
// @access  Private
router.post('/', [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Tên bảng phải từ 1-100 ký tự'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Mô tả không được quá 500 ký tự')
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

    const { name, description = '' } = req.body;

    const board = new Board({
      name,
      description,
      owner: req.user._id
    });

    await board.save();

    res.status(201).json({
      message: 'Tạo bảng thành công',
      board: {
        id: board._id,
        name: board.name,
        description: board.description,
        owner: board.owner,
        memberCount: board.members.length,
        isPublic: board.isPublic,
        isArchived: board.isArchived,
        lastActivity: board.lastActivity,
        createdAt: board.createdAt
      }
    });
  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

// @route   GET /api/boards/:id
// @desc    Get board details
// @access  Private
router.get('/:id', requireBoardMember, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.json({
      board: {
        id: board._id,
        name: board.name,
        description: board.description,
        owner: board.owner,
        members: board.members,
        isPublic: board.isPublic,
        isArchived: board.isArchived,
        settings: board.settings,
        lastActivity: board.lastActivity,
        createdAt: board.createdAt
      }
    });
  } catch (error) {
    console.error('Get board error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

// @route   PUT /api/boards/:id
// @desc    Update board details
// @access  Private
router.put('/:id', requireBoardEdit, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Tên bảng phải từ 1-100 ký tự'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Mô tả không được quá 500 ký tự'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic phải là boolean'),
  body('settings')
    .optional()
    .isObject()
    .withMessage('Settings phải là object')
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

    const { name, description, isPublic, settings } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (settings !== undefined) updateData.settings = { ...req.board.settings, ...settings };

    const board = await Board.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('owner', 'name email avatar')
     .populate('members.user', 'name email avatar');

    res.json({
      message: 'Cập nhật bảng thành công',
      board: {
        id: board._id,
        name: board.name,
        description: board.description,
        owner: board.owner,
        members: board.members,
        isPublic: board.isPublic,
        isArchived: board.isArchived,
        settings: board.settings,
        lastActivity: board.lastActivity,
        createdAt: board.createdAt
      }
    });
  } catch (error) {
    console.error('Update board error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

// @route   DELETE /api/boards/:id
// @desc    Delete board
// @access  Private
router.delete('/:id', requireBoardOwner, async (req, res) => {
  try {
    await Board.findByIdAndDelete(req.params.id);
    
    res.json({
      message: 'Xóa bảng thành công'
    });
  } catch (error) {
    console.error('Delete board error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

// @route   POST /api/boards/:id/invite
// @desc    Invite member to board
// @access  Private
router.post('/:id/invite', requireBoardEdit, [
  body('email')
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),
  body('role')
    .optional()
    .isIn(['admin', 'member', 'viewer'])
    .withMessage('Role phải là admin, member hoặc viewer'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Tin nhắn không được quá 500 ký tự')
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

    const { email, role = 'member', message = '' } = req.body;
    const boardId = req.params.id;

    // Check if user is trying to invite themselves
    if (email.toLowerCase() === req.user.email.toLowerCase()) {
      return res.status(400).json({
        error: 'Cannot invite yourself',
        message: 'Không thể mời chính mình'
      });
    }

    // Find or create user by email
    let invitee = await User.findByEmail(email);
    if (!invitee) {
      return res.status(404).json({
        error: 'User not found',
        message: 'Người dùng không tồn tại'
      });
    }

    // Check if user is already a member
    if (req.board.isMember(invitee._id)) {
      return res.status(400).json({
        error: 'User already member',
        message: 'Người dùng đã là thành viên của bảng'
      });
    }

    // Check if invitation already exists
    const existingInvitation = await Invitation.findOne({
      board: boardId,
      invitee: invitee._id,
      status: 'pending'
    });

    if (existingInvitation) {
      return res.status(400).json({
        error: 'Invitation already exists',
        message: 'Lời mời đã tồn tại'
      });
    }

    // Create invitation
    const invitation = new Invitation({
      board: boardId,
      inviter: req.user._id,
      invitee: invitee._id,
      email: email.toLowerCase(),
      role,
      message
    });

    await invitation.save();

    // Send invitation email
    const emailSent = await sendInvitationEmail(
      invitation, 
      req.board.name, 
      req.user.name
    );

    if (!emailSent) {
      console.warn('Failed to send invitation email');
    }

    res.status(201).json({
      message: 'Gửi lời mời thành công',
      invitation: {
        id: invitation._id,
        board: invitation.board,
        invitee: invitation.invitee,
        email: invitation.email,
        role: invitation.role,
        message: invitation.message,
        status: invitation.status,
        expiresAt: invitation.expiresAt
      }
    });
  } catch (error) {
    console.error('Invite member error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

// @route   GET /api/boards/:id/invitations
// @desc    Get board invitations
// @access  Private
router.get('/:id/invitations', requireBoardEdit, async (req, res) => {
  try {
    const invitations = await Invitation.findByBoard(req.params.id);
    
    res.json({
      invitations: invitations.map(invitation => ({
        id: invitation._id,
        board: invitation.board,
        inviter: invitation.inviter,
        invitee: invitation.invitee,
        email: invitation.email,
        role: invitation.role,
        message: invitation.message,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        respondedAt: invitation.respondedAt,
        isExpired: invitation.isExpired
      }))
    });
  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

// @route   POST /api/boards/:id/archive
// @desc    Archive/Unarchive board
// @access  Private
router.post('/:id/archive', requireBoardOwner, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    board.isArchived = !board.isArchived;
    await board.save();

    res.json({
      message: board.isArchived ? 'Đã lưu trữ bảng' : 'Đã bỏ lưu trữ bảng',
      board: {
        id: board._id,
        name: board.name,
        isArchived: board.isArchived
      }
    });
  } catch (error) {
    console.error('Archive board error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

module.exports = router; 