/**
 * API endpoint to get all tags from qa-system database
 * GET /api/qa/tags
 * GET /api/qa/tags?popular=true&limit=20
 */

import fs from 'fs';
import path from 'path';

const QA_DATABASE_PATH = path.join(process.cwd(), '..', 'C_DataBase', 'qa-system');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { popular, limit = 50, category } = req.query;

    const tagsDir = path.join(QA_DATABASE_PATH, 'tags');
    
    if (!fs.existsSync(tagsDir)) {
      return res.status(404).json({ error: 'Tags directory not found' });
    }

    // Read all tag files
    const tagFiles = fs.readdirSync(tagsDir)
      .filter(file => file.endsWith('.json'));

    const tags = [];

    for (const file of tagFiles) {
      const tagPath = path.join(tagsDir, file);
      const tag = JSON.parse(fs.readFileSync(tagPath, 'utf8'));
      tags.push(tag);
    }

    // Apply filters
    let filteredTags = tags;

    // Category filter
    if (category) {
      filteredTags = filteredTags.filter(tag => 
        tag.category === category.toLowerCase()
      );
    }

    // Popular filter (sort by question count and trending score)
    if (popular === 'true') {
      filteredTags.sort((a, b) => {
        const scoreA = (a.question_count || 0) * 0.7 + (a.trending_score || 0) * 0.3;
        const scoreB = (b.question_count || 0) * 0.7 + (b.trending_score || 0) * 0.3;
        return scoreB - scoreA;
      });
    } else {
      // Sort alphabetically by default
      filteredTags.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Apply limit
    const limitedTags = filteredTags.slice(0, parseInt(limit));

    // Get tag statistics
    const totalQuestions = tags.reduce((sum, tag) => sum + (tag.question_count || 0), 0);
    const categories = [...new Set(tags.map(tag => tag.category).filter(Boolean))];

    res.status(200).json({
      tags: limitedTags,
      statistics: {
        total_tags: tags.length,
        total_questions: totalQuestions,
        categories: categories,
        popular_tags: tags
          .sort((a, b) => (b.question_count || 0) - (a.question_count || 0))
          .slice(0, 10)
          .map(tag => ({
            name: tag.name,
            display_name: tag.display_name,
            question_count: tag.question_count,
            color: tag.color
          }))
      },
      filters: {
        popular: popular === 'true',
        category: category || 'all',
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}