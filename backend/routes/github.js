const express = require('express');
const axios = require('axios');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireVerified } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(requireVerified);

// GitHub API base URL
const GITHUB_API_BASE = 'https://api.github.com';

// Helper function to make GitHub API requests
const githubRequest = async (endpoint, token) => {
  try {
    const response = await axios.get(`${GITHUB_API_BASE}${endpoint}`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Mini-Trello-App'
      }
    });
    return response.data;
  } catch (error) {
    console.error('GitHub API error:', error.response?.data || error.message);
    throw error;
  }
};

// @route   GET /api/github/repositories
// @desc    Get user's GitHub repositories
// @access  Private
router.get('/repositories', async (req, res) => {
  try {
    // For now, we'll use a mock response since we don't have GitHub OAuth set up yet
    // In a real implementation, you would get the GitHub token from the user's profile
    
    const mockRepositories = [
      {
        id: 1,
        name: 'mini-trello-app',
        full_name: 'user/mini-trello-app',
        description: 'A real-time board management tool',
        private: false,
        html_url: 'https://github.com/user/mini-trello-app',
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'react-project',
        full_name: 'user/react-project',
        description: 'React application with modern features',
        private: true,
        html_url: 'https://github.com/user/react-project',
        updated_at: new Date().toISOString()
      }
    ];

    res.json({
      repositories: mockRepositories
    });
  } catch (error) {
    console.error('Get repositories error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

// @route   GET /api/github/repositories/:repoId/info
// @desc    Get repository information (branches, PRs, issues, commits)
// @access  Private
router.get('/repositories/:repoId/info', async (req, res) => {
  try {
    const { repoId } = req.params;
    
    // Mock data for demonstration
    const mockInfo = {
      repositoryId: repoId,
      branches: [
        {
          name: 'main',
          lastCommitSha: 'abc123def456'
        },
        {
          name: 'develop',
          lastCommitSha: 'def456ghi789'
        },
        {
          name: 'feature/new-feature',
          lastCommitSha: 'ghi789jkl012'
        }
      ],
      pulls: [
        {
          title: 'Add new feature',
          pullNumber: '1',
          state: 'open',
          html_url: 'https://github.com/user/repo/pull/1'
        },
        {
          title: 'Fix bug in authentication',
          pullNumber: '2',
          state: 'closed',
          html_url: 'https://github.com/user/repo/pull/2'
        }
      ],
      issues: [
        {
          title: 'Bug: Login not working',
          issueNumber: '1',
          state: 'open',
          html_url: 'https://github.com/user/repo/issues/1'
        },
        {
          title: 'Feature request: Dark mode',
          issueNumber: '2',
          state: 'open',
          html_url: 'https://github.com/user/repo/issues/2'
        }
      ],
      commits: [
        {
          sha: 'abc123def456',
          message: 'Initial commit',
          html_url: 'https://github.com/user/repo/commit/abc123def456'
        },
        {
          sha: 'def456ghi789',
          message: 'Add authentication feature',
          html_url: 'https://github.com/user/repo/commit/def456ghi789'
        },
        {
          sha: 'ghi789jkl012',
          message: 'Fix responsive design issues',
          html_url: 'https://github.com/user/repo/commit/ghi789jkl012'
        }
      ]
    };

    res.json(mockInfo);
  } catch (error) {
    console.error('Get repository info error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

// @route   POST /api/github/attach
// @desc    Attach GitHub item to task
// @access  Private
router.post('/attach', [
  body('taskId')
    .isMongoId()
    .withMessage('Task ID không hợp lệ'),
  body('type')
    .isIn(['pull_request', 'commit', 'issue'])
    .withMessage('Type phải là pull_request, commit hoặc issue'),
  body('number')
    .notEmpty()
    .withMessage('Number không được để trống'),
  body('title')
    .notEmpty()
    .withMessage('Title không được để trống'),
  body('url')
    .isURL()
    .withMessage('URL không hợp lệ')
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

    const { taskId, type, number, title, url } = req.body;

    // In a real implementation, you would:
    // 1. Find the task
    // 2. Add the GitHub attachment to the task
    // 3. Save the task

    const mockAttachment = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      number,
      title,
      url,
      attachedBy: req.user._id,
      attachedAt: new Date()
    };

    res.status(201).json({
      message: 'Gắn GitHub item thành công',
      attachment: mockAttachment
    });
  } catch (error) {
    console.error('Attach GitHub item error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

// @route   GET /api/github/attachments/:taskId
// @desc    Get GitHub attachments for a task
// @access  Private
router.get('/attachments/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;

    // Mock data for demonstration
    const mockAttachments = [
      {
        id: '1',
        type: 'pull_request',
        number: '1',
        title: 'Add new feature',
        url: 'https://github.com/user/repo/pull/1',
        attachedBy: req.user._id,
        attachedAt: new Date()
      },
      {
        id: '2',
        type: 'issue',
        number: '2',
        title: 'Bug: Login not working',
        url: 'https://github.com/user/repo/issues/2',
        attachedBy: req.user._id,
        attachedAt: new Date()
      }
    ];

    res.json({
      attachments: mockAttachments
    });
  } catch (error) {
    console.error('Get attachments error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

// @route   DELETE /api/github/attachments/:attachmentId
// @desc    Remove GitHub attachment
// @access  Private
router.delete('/attachments/:attachmentId', async (req, res) => {
  try {
    const { attachmentId } = req.params;

    // In a real implementation, you would:
    // 1. Find the attachment
    // 2. Remove it from the task
    // 3. Save the task

    res.json({
      message: 'Xóa GitHub attachment thành công'
    });
  } catch (error) {
    console.error('Remove attachment error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

// @route   GET /api/github/auth
// @desc    Get GitHub OAuth URL
// @access  Private
router.get('/auth', async (req, res) => {
  try {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = process.env.GITHUB_CALLBACK_URL;
    
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo,user`;
    
    res.json({
      authUrl
    });
  } catch (error) {
    console.error('Get GitHub auth URL error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

// @route   POST /api/github/callback
// @desc    Handle GitHub OAuth callback
// @access  Private
router.post('/callback', [
  body('code')
    .notEmpty()
    .withMessage('Authorization code không được để trống')
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

    const { code } = req.body;

    // In a real implementation, you would:
    // 1. Exchange the code for an access token
    // 2. Get user info from GitHub
    // 3. Update the user's profile with GitHub info
    // 4. Return success response

    const mockUserInfo = {
      id: 12345,
      login: 'githubuser',
      name: 'GitHub User',
      avatar_url: 'https://avatars.githubusercontent.com/u/12345?v=4'
    };

    res.json({
      message: 'Kết nối GitHub thành công',
      user: mockUserInfo
    });
  } catch (error) {
    console.error('GitHub callback error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Lỗi máy chủ'
    });
  }
});

module.exports = router; 