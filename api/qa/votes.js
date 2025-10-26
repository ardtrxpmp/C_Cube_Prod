/**
 * API endpoint to get votes for questions and answers
 * GET /api/qa/votes?type=question&id=q_1729814400_abc123
 * GET /api/qa/votes?type=answer&id=ans_polygon001_001
 */

import fs from 'fs';
import path from 'path';

const QA_DATABASE_PATH = path.join(process.cwd(), '..', 'C_DataBase', 'qa-system');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, id } = req.query;

  if (!type || !id) {
    return res.status(400).json({ error: 'Type and ID are required' });
  }

  if (!['question', 'answer'].includes(type)) {
    return res.status(400).json({ error: 'Type must be either "question" or "answer"' });
  }

  try {
    let votesPath;
    
    if (type === 'question') {
      votesPath = path.join(QA_DATABASE_PATH, 'votes', 'questions', `${id}.json`);
    } else {
      votesPath = path.join(QA_DATABASE_PATH, 'votes', 'answers', `${id}.json`);
    }

    if (!fs.existsSync(votesPath)) {
      return res.status(200).json({
        target_type: type,
        target_id: id,
        votes: [],
        summary: {
          total_votes: 0,
          upvotes: 0,
          downvotes: 0,
          score: 0
        }
      });
    }

    const votes = JSON.parse(fs.readFileSync(votesPath, 'utf8'));

    // Calculate vote summary
    const upvotes = votes.filter(vote => vote.vote_type === 'up').length;
    const downvotes = votes.filter(vote => vote.vote_type === 'down').length;
    const score = upvotes - downvotes;

    // Get vote distribution by user reputation (if available)
    const votesByReputation = votes.reduce((acc, vote) => {
      const reputation = vote.voter_reputation || 'unknown';
      if (!acc[reputation]) {
        acc[reputation] = { upvotes: 0, downvotes: 0 };
      }
      if (vote.vote_type === 'up') {
        acc[reputation].upvotes++;
      } else {
        acc[reputation].downvotes++;
      }
      return acc;
    }, {});

    res.status(200).json({
      target_type: type,
      target_id: id,
      votes: votes.map(vote => ({
        id: vote.id,
        voter_wallet: vote.voter_wallet,
        voter_name: vote.voter_name,
        vote_type: vote.vote_type,
        created_at: vote.created_at,
        vote_weight: vote.vote_weight || 1
      })),
      summary: {
        total_votes: votes.length,
        upvotes,
        downvotes,
        score,
        vote_distribution: votesByReputation,
        recent_activity: votes
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 10)
      }
    });

  } catch (error) {
    console.error('Error fetching votes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}