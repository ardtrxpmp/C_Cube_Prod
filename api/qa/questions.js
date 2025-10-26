/**
 * API endpoint to get questions from qa-system database
 * GET /api/qa/questions
 * GET /api/qa/questions?category=defi&sort=votes&limit=10&offset=0
 */

import fs from 'fs';
import path from 'path';

const QA_DATABASE_PATH = path.join(process.cwd(), '..', 'C_DataBase', 'qa-system');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { category, sort = 'newest', limit = 20, offset = 0, search } = req.query;

    // Read questions index
    const indexPath = path.join(QA_DATABASE_PATH, 'questions', 'index.json');
    if (!fs.existsSync(indexPath)) {
      return res.status(404).json({ error: 'Questions index not found' });
    }

    const questionIds = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    const questions = [];

    // Load all questions
    for (const questionId of questionIds) {
      const questionPath = path.join(QA_DATABASE_PATH, 'questions', `${questionId}.json`);
      if (fs.existsSync(questionPath)) {
        const question = JSON.parse(fs.readFileSync(questionPath, 'utf8'));
        questions.push(question);
      }
    }

    // Apply filters
    let filteredQuestions = questions;

    // Category filter
    if (category && category !== 'all') {
      filteredQuestions = filteredQuestions.filter(q => 
        q.tags.includes(category.toLowerCase()) ||
        q.tags.some(tag => tag.includes(category.toLowerCase()))
      );
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredQuestions = filteredQuestions.filter(q => 
        q.title.toLowerCase().includes(searchLower) ||
        q.content.toLowerCase().includes(searchLower) ||
        q.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    switch (sort) {
      case 'newest':
        filteredQuestions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'active':
        filteredQuestions.sort((a, b) => new Date(b.last_activity) - new Date(a.last_activity));
        break;
      case 'votes':
        filteredQuestions.sort((a, b) => (b.votes || 0) - (a.votes || 0));
        break;
      case 'views':
        filteredQuestions.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'trending':
        filteredQuestions.sort((a, b) => {
          const trendingScoreA = (a.votes || 0) * 0.5 + (a.views || 0) * 0.3 + (a.answer_count || 0) * 0.2;
          const trendingScoreB = (b.votes || 0) * 0.5 + (b.views || 0) * 0.3 + (b.answer_count || 0) * 0.2;
          return trendingScoreB - trendingScoreA;
        });
        break;
      default:
        filteredQuestions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    // Apply pagination
    const total = filteredQuestions.length;
    const paginatedQuestions = filteredQuestions.slice(
      parseInt(offset), 
      parseInt(offset) + parseInt(limit)
    );

    res.status(200).json({
      questions: paginatedQuestions,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total
      },
      filters: {
        category: category || 'all',
        sort,
        search: search || ''
      }
    });

  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}