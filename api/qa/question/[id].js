/**
 * API endpoint to get a specific question by ID
 * GET /api/qa/question/[id]
 */

import fs from 'fs';
import path from 'path';

const QA_DATABASE_PATH = path.join(process.cwd(), '..', 'C_DataBase', 'qa-system');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Question ID is required' });
  }

  try {
    const questionPath = path.join(QA_DATABASE_PATH, 'questions', `${id}.json`);
    
    if (!fs.existsSync(questionPath)) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const question = JSON.parse(fs.readFileSync(questionPath, 'utf8'));

    // Increment view count
    question.views = (question.views || 0) + 1;
    question.last_activity = new Date().toISOString();
    
    // Save updated question
    fs.writeFileSync(questionPath, JSON.stringify(question, null, 2));

    // Get related questions by tags
    const relatedQuestions = await getRelatedQuestions(question.tags, id);

    res.status(200).json({
      question,
      related_questions: relatedQuestions
    });

  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getRelatedQuestions(tags, excludeId) {
  try {
    const indexPath = path.join(QA_DATABASE_PATH, 'questions', 'index.json');
    if (!fs.existsSync(indexPath)) {
      return [];
    }

    const questionIds = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    const relatedQuestions = [];

    for (const questionId of questionIds) {
      if (questionId === excludeId) continue;
      
      const questionPath = path.join(QA_DATABASE_PATH, 'questions', `${questionId}.json`);
      if (fs.existsSync(questionPath)) {
        const question = JSON.parse(fs.readFileSync(questionPath, 'utf8'));
        
        // Check if question has common tags
        const commonTags = question.tags.filter(tag => tags.includes(tag));
        if (commonTags.length > 0) {
          relatedQuestions.push({
            id: question.id,
            title: question.title,
            tags: question.tags,
            votes: question.votes,
            answer_count: question.answer_count,
            common_tags: commonTags,
            similarity_score: commonTags.length / Math.max(tags.length, question.tags.length)
          });
        }
      }
    }

    // Sort by similarity score and votes
    relatedQuestions.sort((a, b) => {
      const scoreA = a.similarity_score * 0.7 + (a.votes || 0) * 0.3;
      const scoreB = b.similarity_score * 0.7 + (b.votes || 0) * 0.3;
      return scoreB - scoreA;
    });

    return relatedQuestions.slice(0, 5);
  } catch (error) {
    console.error('Error getting related questions:', error);
    return [];
  }
}