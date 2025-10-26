/**
 * API endpoint to get answers for a specific question
 * GET /api/qa/answers/[questionId]
 */

import fs from 'fs';
import path from 'path';

const QA_DATABASE_PATH = path.join(process.cwd(), '..', 'C_DataBase', 'qa-system');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { questionId } = req.query;

  if (!questionId) {
    return res.status(400).json({ error: 'Question ID is required' });
  }

  try {
    // Check if answers directory exists for this question
    const answerDir = path.join(QA_DATABASE_PATH, 'answers', questionId);
    
    // Try comprehensive answer files first (like ans_polygon001_comprehensive.json)
    const comprehensiveAnswerFiles = fs.readdirSync(path.join(QA_DATABASE_PATH, 'answers'))
      .filter(file => file.includes(questionId.split('_')[2]) && file.includes('comprehensive') && file.endsWith('.json'));

    if (comprehensiveAnswerFiles.length > 0) {
      // Load comprehensive answer file
      const comprehensiveAnswerPath = path.join(QA_DATABASE_PATH, 'answers', comprehensiveAnswerFiles[0]);
      const comprehensiveAnswers = JSON.parse(fs.readFileSync(comprehensiveAnswerPath, 'utf8'));
      
      return res.status(200).json({
        question_id: questionId,
        answers: comprehensiveAnswers.answers || [],
        statistics: comprehensiveAnswers.statistics || {},
        source: 'comprehensive'
      });
    }

    // Fallback to individual answer files in question directory
    if (!fs.existsSync(answerDir)) {
      return res.status(200).json({
        question_id: questionId,
        answers: [],
        statistics: {
          total_answers: 0,
          total_votes: 0,
          total_views: 0
        },
        source: 'individual'
      });
    }

    // Read individual answer files
    const answerFiles = fs.readdirSync(answerDir)
      .filter(file => file.endsWith('.json') && file !== 'index.json');

    const answers = [];
    let totalVotes = 0;

    for (const file of answerFiles) {
      const answerPath = path.join(answerDir, file);
      const answer = JSON.parse(fs.readFileSync(answerPath, 'utf8'));
      answers.push(answer);
      totalVotes += (answer.votes || 0);
    }

    // Sort answers: accepted first, then by votes, then by creation time
    answers.sort((a, b) => {
      if (a.is_accepted !== b.is_accepted) {
        return b.is_accepted - a.is_accepted; // Accepted answers first
      }
      const aVotes = a.votes || (a.votes && typeof a.votes === 'object' ? (a.votes.upvotes || 0) - (a.votes.downvotes || 0) : 0);
      const bVotes = b.votes || (b.votes && typeof b.votes === 'object' ? (b.votes.upvotes || 0) - (b.votes.downvotes || 0) : 0);
      if (aVotes !== bVotes) {
        return bVotes - aVotes; // Higher votes first
      }
      return new Date(a.created_at) - new Date(b.created_at); // Older first
    });

    res.status(200).json({
      question_id: questionId,
      answers,
      statistics: {
        total_answers: answers.length,
        total_votes: totalVotes,
        accepted_answers: answers.filter(a => a.is_accepted).length
      },
      source: 'individual'
    });

  } catch (error) {
    console.error('Error fetching answers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}