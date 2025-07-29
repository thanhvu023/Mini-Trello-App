const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { sendVerificationEmail } = require('../services/emailService');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// @route   POST /api/auth/signup
// @desc    Register new user with email verification
// @access  Public
router.post('/signup', [
  body('email')
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail()
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

    const { email } = req.body;
    const name = email.split('@')[0]; // Tạo name từ email

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists',
        message: 'Email đã được sử dụng'
      });
    }

    // Create new user
    const user = new User({
      email,
      name,
      isVerified: false
    });

    // Generate verification code
    const verificationCode = user.generateVerificationCode();
    await user.save();

    // Send verification email
    // const emailSent = await sendVerificationEmail(email, name, verificationCode);
    
    // if (!emailSent) {
    //   // If email fails, delete the user
    //   await User.findByIdAndDelete(user._id);
    //   return res.status(500).json({
    //     error: 'Email service error',
    //     message: 'Không thể gửi email xác minh. Vui lòng thử lại sau.'
    //   });
    // }
    
    // Tạm thời bỏ qua email để test
    console.log('✅ Verification code:', verificationCode);

    res.status(201).json({
      message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác minh tài khoản.',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

// @route   POST /api/auth/signin
// @desc    Sign in with email and verification code
// @access  Public
router.post('/signin', [
  body('email')
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),
  body('verificationCode')
    .isLength({ min: 6, max: 6 })
    .withMessage('Mã xác minh phải có 6 chữ số')
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

    const { email, verificationCode } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email hoặc mã xác minh không đúng'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Account deactivated',
        message: 'Tài khoản đã bị vô hiệu hóa'
      });
    }

    // Verify the code
    const isValidCode = user.verifyCode(verificationCode);
    if (!isValidCode) {
      return res.status(401).json({
        error: 'Invalid verification code',
        message: 'Mã xác minh không đúng hoặc đã hết hạn'
      });
    }

    // Update last login
    await user.updateLastLogin();

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        githubUsername: user.githubUsername,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

// @route   POST /api/auth/resend-verification
// @desc    Resend verification code
// @access  Public
router.post('/resend-verification', [
  body('email')
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail()
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

    const { email } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'Email không tồn tại'
      });
    }

    // Check if user is already verified
    if (user.isVerified) {
      return res.status(400).json({
        error: 'User already verified',
        message: 'Tài khoản đã được xác minh'
      });
    }

    // Generate new verification code
    const verificationCode = user.generateVerificationCode();
    await user.save();

    // Send verification email
    const emailSent = await sendVerificationEmail(email, user.name, verificationCode);
    
    if (!emailSent) {
      return res.status(500).json({
        error: 'Email service error',
        message: 'Không thể gửi email xác minh. Vui lòng thử lại sau.'
      });
    }

    res.json({
      message: 'Mã xác minh đã được gửi lại. Vui lòng kiểm tra email.'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        avatar: req.user.avatar,
        githubUsername: req.user.githubUsername,
        isVerified: req.user.isVerified,
        lastLogin: req.user.lastLogin,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

// @route   POST /api/auth/verify-email
// @desc    Verify email with code
// @access  Public
router.post('/verify-email', [
  body('email')
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),
  body('verificationCode')
    .isLength({ min: 6, max: 6 })
    .withMessage('Mã xác minh phải có 6 chữ số')
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

    const { email, verificationCode } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'Email không tồn tại'
      });
    }

    // Check if user is already verified
    if (user.isVerified) {
      return res.status(400).json({
        error: 'User already verified',
        message: 'Tài khoản đã được xác minh'
      });
    }

    // Verify the code
    const isValidCode = user.verifyCode(verificationCode);
    if (!isValidCode) {
      return res.status(401).json({
        error: 'Invalid verification code',
        message: 'Mã xác minh không đúng hoặc đã hết hạn'
      });
    }

    res.json({
      message: 'Xác minh email thành công',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

module.exports = router; 