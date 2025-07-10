const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken, requireVerified } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(requireVerified);

// @route   GET /api/users
// @desc    Get all users (for search/invite)
// @access  Private
router.get('/', async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .select('name email avatar githubUsername')
      .limit(50);

    res.json({
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        githubUsername: user.githubUsername
      }))
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user profile
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-verificationCode -verificationCodeExpires');

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'Người dùng không tồn tại'
      });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        githubUsername: user.githubUsername,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private
router.put('/:id', [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Tên phải từ 2-50 ký tự'),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar phải là URL hợp lệ')
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

    // Only allow users to update their own profile
    if (req.params.id !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Bạn chỉ có thể cập nhật thông tin của chính mình'
      });
    }

    const { name, avatar } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-verificationCode -verificationCodeExpires');

    res.json({
      message: 'Cập nhật thông tin thành công',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        githubUsername: user.githubUsername,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

// @route   GET /api/users/search
// @desc    Search users by name or email
// @access  Private
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({
        error: 'Search query required',
        message: 'Từ khóa tìm kiếm phải có ít nhất 2 ký tự'
      });
    }

    const users = await User.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } }
          ]
        }
      ]
    })
    .select('name email avatar githubUsername')
    .limit(10);

    res.json({
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        githubUsername: user.githubUsername
      }))
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

module.exports = router; 