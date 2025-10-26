const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3334;

// Middleware
app.use(cors({
  origin: ['http://localhost:3002', 'http://localhost:3000', 'http://localhost:3004'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Import the API routes
const deployTokenRoute = require('./api/deploy-token');
const launchedTokensRoute = require('./api/tokens/launched');
const saveUserScoresRoute = require('./api/save-user-scores');

// Import Q&A System Service (NEW - DO NOT MODIFY EXISTING ROUTES)
const QAService = require('./services/QAService');

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/deploy-token', deployTokenRoute);
app.get('/api/tokens/launched', launchedTokensRoute);
app.use('/api/save-user-scores', saveUserScoresRoute);

// === Q&A SYSTEM API ROUTES (NEW - DO NOT MODIFY EXISTING ROUTES) ===
const qaService = new QAService();

// Get all questions with filtering and sorting
app.get('/api/qa/questions', async (req, res) => {
  try {
    const { sort = 'newest', tag, status, unanswered } = req.query;
    
    const filterBy = {};
    if (tag) filterBy.tag = tag;
    if (status) filterBy.status = status;
    if (unanswered === 'true') filterBy.unanswered = true;
    
    const questions = await qaService.getAllQuestions(sort, Object.keys(filterBy).length > 0 ? filterBy : null);
    
    res.json({
      success: true,
      data: questions,
      count: questions.length
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch questions'
    });
  }
});

// Get a specific question by ID
app.get('/api/qa/questions/:questionId', async (req, res) => {
  try {
    const { questionId } = req.params;
    const question = await qaService.getQuestionById(questionId);
    
    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }
    
    res.json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch question'
    });
  }
});

// Create a new question (requires wallet connection)
app.post('/api/qa/questions', async (req, res) => {
  try {
    const { title, content, tags, author_wallet, author_name, difficulty_level, bounty } = req.body;
    
    // Validate required fields
    if (!title || !content || !author_wallet || !author_name) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, content, author_wallet, author_name'
      });
    }
    
    const questionData = {
      title: title.trim(),
      content: content.trim(),
      tags: tags || [],
      author_wallet,
      author_name,
      difficulty_level,
      bounty
    };
    
    const question = await qaService.createQuestion(questionData);
    
    res.status(201).json({
      success: true,
      data: question,
      message: 'Question created successfully'
    });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create question'
    });
  }
});

// Get answers for a specific question
app.get('/api/qa/questions/:questionId/answers', async (req, res) => {
  try {
    const { questionId } = req.params;
    const answers = await qaService.getAnswersForQuestion(questionId);
    
    res.json({
      success: true,
      data: answers,
      count: answers.length
    });
  } catch (error) {
    console.error('Error fetching answers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch answers'
    });
  }
});

// Create a new answer (wallet connection optional)
app.post('/api/qa/questions/:questionId/answers', async (req, res) => {
  try {
    const { questionId } = req.params;
    const { content, author_wallet, author_name, parent_answer_id, code_snippets } = req.body;
    
    // Validate required fields
    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required'
      });
    }
    
    // Calculate depth for nested replies
    let depth = 0;
    if (parent_answer_id) {
      // This is a reply, calculate depth
      const answers = await qaService.getAnswersForQuestion(questionId);
      const parentAnswer = answers.find(a => a.id === parent_answer_id);
      if (parentAnswer) {
        depth = (parentAnswer.depth || 0) + 1;
      }
    }
    
    const answerData = {
      question_id: questionId,
      content: content.trim(),
      author_wallet: author_wallet || null,
      author_name: author_name || 'Anonymous',
      parent_answer_id,
      depth,
      code_snippets: code_snippets || []
    };
    
    const answer = await qaService.createAnswer(answerData);
    
    res.status(201).json({
      success: true,
      data: answer,
      message: 'Answer created successfully'
    });
  } catch (error) {
    console.error('Error creating answer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create answer'
    });
  }
});

// Vote on a question
app.post('/api/qa/questions/:questionId/vote', async (req, res) => {
  try {
    const { questionId } = req.params;
    const { voter_wallet, voter_name, vote_type } = req.body;
    
    if (!voter_wallet || !vote_type || !['up', 'down'].includes(vote_type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid vote data. Required: voter_wallet, vote_type (up/down)'
      });
    }
    
    const vote = await qaService.voteOnQuestion(questionId, voter_wallet, voter_name || 'Anonymous', vote_type);
    
    res.json({
      success: true,
      data: vote,
      message: 'Vote recorded successfully'
    });
  } catch (error) {
    console.error('Error voting on question:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record vote'
    });
  }
});

// Vote on an answer
app.post('/api/qa/answers/:answerId/vote', async (req, res) => {
  try {
    const { answerId } = req.params;
    const { question_id, voter_wallet, voter_name, vote_type } = req.body;
    
    if (!voter_wallet || !vote_type || !question_id || !['up', 'down'].includes(vote_type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid vote data. Required: question_id, voter_wallet, vote_type (up/down)'
      });
    }
    
    const vote = await qaService.voteOnAnswer(answerId, question_id, voter_wallet, voter_name || 'Anonymous', vote_type);
    
    res.json({
      success: true,
      data: vote,
      message: 'Vote recorded successfully'
    });
  } catch (error) {
    console.error('Error voting on answer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record vote'
    });
  }
});

// Accept an answer (anyone can accept)
app.post('/api/qa/answers/:answerId/accept', async (req, res) => {
  try {
    const { answerId } = req.params;
    const { question_id, accepted_by_wallet, accepted_by_name, reason } = req.body;
    
    if (!question_id || !accepted_by_wallet || !accepted_by_name) {
      return res.status(400).json({
        success: false,
        error: 'Required: question_id, accepted_by_wallet, accepted_by_name'
      });
    }
    
    const acceptance = await qaService.acceptAnswer(question_id, answerId, accepted_by_wallet, accepted_by_name, reason);
    
    res.json({
      success: true,
      data: acceptance,
      message: 'Answer accepted successfully'
    });
  } catch (error) {
    console.error('Error accepting answer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to accept answer'
    });
  }
});

// Get all available tags
app.get('/api/qa/tags', async (req, res) => {
  try {
    const tags = await qaService.getAllTags();
    
    res.json({
      success: true,
      data: tags,
      count: tags.length
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tags'
    });
  }
});
// === END Q&A SYSTEM API ROUTES ===

// Server info endpoint for getting server wallet address
app.get('/api/server-info', (req, res) => {
  try {
    const { ethers } = require('ethers');
    const privateKey = process.env.PRIVATE_KEY;
    
    if (!privateKey) {
      return res.status(500).json({
        error: 'Server private key not configured'
      });
    }
    
    const wallet = new ethers.Wallet(privateKey);
    
    res.json({
      walletAddress: wallet.address,
      message: 'Server wallet address for gas transfers'
    });
  } catch (error) {
    console.error('Error getting server info:', error);
    res.status(500).json({
      error: 'Failed to get server information'
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'C-Cube Token Deployment API Server',
    status: 'running',
    endpoints: {
      health: '/api/health',
      deployToken: '/api/deploy-token',
      qaQuestions: '/api/qa/questions',
      qaTags: '/api/qa/tags'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API server is running' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/api/health`);
  console.log(`Deploy token endpoint at http://localhost:${PORT}/api/deploy-token`);
  console.log('Server is ready to accept requests...');
});

// Keep the server running
server.on('error', (err) => {
  console.error('Server error:', err);
});

// Keep the process alive
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});

// Prevent process from exiting
setInterval(() => {
  // Keep alive
}, 60000);

module.exports = app;