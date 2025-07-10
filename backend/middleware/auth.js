const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        message: 'Vui lòng đăng nhập để tiếp tục'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-verificationCode -verificationCodeExpires');

    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'Token không hợp lệ'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        error: 'Account deactivated',
        message: 'Tài khoản đã bị vô hiệu hóa'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'Token không hợp lệ'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Token đã hết hạn'
      });
    }
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Authentication error',
      message: 'Lỗi xác thực'
    });
  }
};

// Middleware to check if user is verified
const requireVerified = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({ 
      error: 'Email not verified',
      message: 'Vui lòng xác minh email trước khi tiếp tục'
    });
  }
  next();
};

// Middleware to check if user is board owner
const requireBoardOwner = async (req, res, next) => {
  try {
    const Board = require('../models/Board');
    const board = await Board.findById(req.params.boardId || req.params.id);

    if (!board) {
      return res.status(404).json({ 
        error: 'Board not found',
        message: 'Bảng không tồn tại'
      });
    }

    if (board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Bạn không có quyền thực hiện hành động này'
      });
    }

    req.board = board;
    next();
  } catch (error) {
    console.error('Board owner middleware error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
};

// Middleware to check if user can edit board
const requireBoardEdit = async (req, res, next) => {
  try {
    const Board = require('../models/Board');
    const board = await Board.findById(req.params.boardId || req.params.id);

    if (!board) {
      return res.status(404).json({ 
        error: 'Board not found',
        message: 'Bảng không tồn tại'
      });
    }

    if (!board.canEdit(req.user._id)) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Bạn không có quyền chỉnh sửa bảng này'
      });
    }

    req.board = board;
    next();
  } catch (error) {
    console.error('Board edit middleware error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
};

// Middleware to check if user is board member
const requireBoardMember = async (req, res, next) => {
  try {
    const Board = require('../models/Board');
    const board = await Board.findById(req.params.boardId || req.params.id);

    if (!board) {
      return res.status(404).json({ 
        error: 'Board not found',
        message: 'Bảng không tồn tại'
      });
    }

    if (board.owner.toString() !== req.user._id.toString() && !board.isMember(req.user._id)) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Bạn không phải là thành viên của bảng này'
      });
    }

    req.board = board;
    next();
  } catch (error) {
    console.error('Board member middleware error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
};

// Middleware to check if user is card owner
const requireCardOwner = async (req, res, next) => {
  try {
    const Card = require('../models/Card');
    const card = await Card.findById(req.params.cardId || req.params.id);

    if (!card) {
      return res.status(404).json({ 
        error: 'Card not found',
        message: 'Thẻ không tồn tại'
      });
    }

    if (card.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Bạn không có quyền thực hiện hành động này'
      });
    }

    req.card = card;
    next();
  } catch (error) {
    console.error('Card owner middleware error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
};

// Middleware to check if user can edit card
const requireCardEdit = async (req, res, next) => {
  try {
    const Card = require('../models/Card');
    const card = await Card.findById(req.params.cardId || req.params.id);

    if (!card) {
      return res.status(404).json({ 
        error: 'Card not found',
        message: 'Thẻ không tồn tại'
      });
    }

    // Check if user is owner or member of the card
    if (card.owner.toString() !== req.user._id.toString() && !card.isMember(req.user._id)) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Bạn không có quyền chỉnh sửa thẻ này'
      });
    }

    req.card = card;
    next();
  } catch (error) {
    console.error('Card edit middleware error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
};

// Middleware to check if user is task owner
const requireTaskOwner = async (req, res, next) => {
  try {
    const Task = require('../models/Task');
    const task = await Task.findById(req.params.taskId || req.params.id);

    if (!task) {
      return res.status(404).json({ 
        error: 'Task not found',
        message: 'Nhiệm vụ không tồn tại'
      });
    }

    if (task.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Bạn không có quyền thực hiện hành động này'
      });
    }

    req.task = task;
    next();
  } catch (error) {
    console.error('Task owner middleware error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
};

// Middleware to check if user can edit task
const requireTaskEdit = async (req, res, next) => {
  try {
    const Task = require('../models/Task');
    const task = await Task.findById(req.params.taskId || req.params.id);

    if (!task) {
      return res.status(404).json({ 
        error: 'Task not found',
        message: 'Nhiệm vụ không tồn tại'
      });
    }

    // Check if user is owner or assigned to the task
    if (task.owner.toString() !== req.user._id.toString() && !task.isAssignedTo(req.user._id)) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Bạn không có quyền chỉnh sửa nhiệm vụ này'
      });
    }

    req.task = task;
    next();
  } catch (error) {
    console.error('Task edit middleware error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
};

module.exports = {
  authenticateToken,
  requireVerified,
  requireBoardOwner,
  requireBoardEdit,
  requireBoardMember,
  requireCardOwner,
  requireCardEdit,
  requireTaskOwner,
  requireTaskEdit
}; 