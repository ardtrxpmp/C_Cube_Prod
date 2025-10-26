/**
 * API endpoint for Q&A system statistics and overview
 * GET /api/qa/stats
 */

import fs from 'fs';
import path from 'path';

const QA_DATABASE_PATH = path.join(process.cwd(), '..', 'C_DataBase', 'qa-system');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get questions statistics
    const questionsIndexPath = path.join(QA_DATABASE_PATH, 'questions', 'index.json');
    let totalQuestions = 0;
    let totalAnswers = 0;
    let totalVotes = 0;
    let totalViews = 0;
    let categories = {};
    let trendingQuestions = [];

    if (fs.existsSync(questionsIndexPath)) {
      const questionIds = JSON.parse(fs.readFileSync(questionsIndexPath, 'utf8'));
      totalQuestions = questionIds.length;

      for (const questionId of questionIds) {
        const questionPath = path.join(QA_DATABASE_PATH, 'questions', `${questionId}.json`);
        if (fs.existsSync(questionPath)) {
          const question = JSON.parse(fs.readFileSync(questionPath, 'utf8'));
          
          totalAnswers += question.answer_count || 0;
          totalVotes += question.votes || 0;
          totalViews += question.views || 0;

          // Count categories (based on tags)
          question.tags.forEach(tag => {
            categories[tag] = (categories[tag] || 0) + 1;
          });

          // Collect trending questions
          if (question.is_trending) {
            trendingQuestions.push({
              id: question.id,
              title: question.title,
              votes: question.votes,
              views: question.views,
              answer_count: question.answer_count
            });
          }
        }
      }
    }

    // Get tags statistics
    const tagsDir = path.join(QA_DATABASE_PATH, 'tags');
    let totalTags = 0;
    let popularTags = [];

    if (fs.existsSync(tagsDir)) {
      const tagFiles = fs.readdirSync(tagsDir).filter(file => file.endsWith('.json'));
      totalTags = tagFiles.length;

      for (const file of tagFiles.slice(0, 10)) { // Top 10 tags
        const tagPath = path.join(tagsDir, file);
        const tag = JSON.parse(fs.readFileSync(tagPath, 'utf8'));
        popularTags.push({
          name: tag.name,
          display_name: tag.display_name,
          question_count: tag.question_count,
          trending_score: tag.trending_score,
          color: tag.color
        });
      }

      popularTags.sort((a, b) => (b.question_count || 0) - (a.question_count || 0));
    }

    // Calculate activity metrics (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let recentActivity = {
      questions: 0,
      answers: 0,
      votes: 0
    };

    // Count recent questions
    if (fs.existsSync(questionsIndexPath)) {
      const questionIds = JSON.parse(fs.readFileSync(questionsIndexPath, 'utf8'));
      
      for (const questionId of questionIds) {
        const questionPath = path.join(QA_DATABASE_PATH, 'questions', `${questionId}.json`);
        if (fs.existsSync(questionPath)) {
          const question = JSON.parse(fs.readFileSync(questionPath, 'utf8'));
          const createdDate = new Date(question.created_at);
          
          if (createdDate > thirtyDaysAgo) {
            recentActivity.questions++;
          }
        }
      }
    }

    // Sort trending questions
    trendingQuestions.sort((a, b) => {
      const scoreA = (a.votes || 0) * 0.4 + (a.views || 0) * 0.3 + (a.answer_count || 0) * 0.3;
      const scoreB = (b.votes || 0) * 0.4 + (b.views || 0) * 0.3 + (b.answer_count || 0) * 0.3;
      return scoreB - scoreA;
    });

    // Calculate answer rate
    const answerRate = totalQuestions > 0 ? ((totalAnswers / totalQuestions) * 100).toFixed(1) : 0;

    res.status(200).json({
      overview: {
        total_questions: totalQuestions,
        total_answers: totalAnswers,
        total_votes: totalVotes,
        total_views: totalViews,
        total_tags: totalTags,
        answer_rate: `${answerRate}%`,
        avg_answers_per_question: totalQuestions > 0 ? (totalAnswers / totalQuestions).toFixed(1) : 0
      },
      categories: Object.entries(categories)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([name, count]) => ({ name, count })),
      popular_tags: popularTags.slice(0, 10),
      trending_questions: trendingQuestions.slice(0, 5),
      recent_activity: recentActivity,
      engagement: {
        total_votes: totalVotes,
        total_views: totalViews,
        avg_votes_per_question: totalQuestions > 0 ? (totalVotes / totalQuestions).toFixed(1) : 0,
        avg_views_per_question: totalQuestions > 0 ? (totalViews / totalQuestions).toFixed(0) : 0
      }
    });

  } catch (error) {
    console.error('Error fetching Q&A statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}