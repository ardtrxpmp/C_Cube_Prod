const fs = require('fs');
const path = require('path');

class QAService {
  constructor() {
    this.basePath = path.join(__dirname, '..', '..', 'C_DataBase', 'qa-system');
    this.questionsPath = path.join(this.basePath, 'questions');
    this.answersPath = path.join(this.basePath, 'answers');
    this.votesPath = path.join(this.basePath, 'votes');
    this.acceptancesPath = path.join(this.basePath, 'acceptances');
    this.tagsPath = path.join(this.basePath, 'tags');
    this.usersPath = path.join(this.basePath, 'users');
  }

  // Utility function to ensure directory exists
  ensureDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  // Generate unique ID
  generateId(prefix = 'id') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${prefix}_${timestamp}_${random}`;
  }

  // === QUESTIONS ===
  
  async getAllQuestions(sortBy = 'newest', filterBy = null) {
    try {
      const indexPath = path.join(this.questionsPath, 'index.json');
      if (!fs.existsSync(indexPath)) {
        return [];
      }

      const questionIds = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
      const questions = [];

      for (const questionId of questionIds) {
        const questionPath = path.join(this.questionsPath, `${questionId}.json`);
        if (fs.existsSync(questionPath)) {
          const question = JSON.parse(fs.readFileSync(questionPath, 'utf8'));
          questions.push(question);
        }
      }

      // Apply filtering
      let filteredQuestions = questions;
      if (filterBy) {
        if (filterBy.tag) {
          filteredQuestions = questions.filter(q => q.tags.includes(filterBy.tag));
        }
        if (filterBy.status) {
          filteredQuestions = filteredQuestions.filter(q => q.status === filterBy.status);
        }
        if (filterBy.unanswered) {
          filteredQuestions = filteredQuestions.filter(q => q.answer_count === 0);
        }
      }

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          filteredQuestions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          break;
        case 'active':
          filteredQuestions.sort((a, b) => new Date(b.last_activity) - new Date(a.last_activity));
          break;
        case 'votes':
          filteredQuestions.sort((a, b) => b.votes - a.votes);
          break;
        case 'trending':
          filteredQuestions.sort((a, b) => b.views - a.views);
          break;
        default:
          filteredQuestions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }

      return filteredQuestions;
    } catch (error) {
      console.error('Error getting all questions:', error);
      return [];
    }
  }

  async getQuestionById(questionId) {
    try {
      const questionPath = path.join(this.questionsPath, `${questionId}.json`);
      if (!fs.existsSync(questionPath)) {
        return null;
      }

      const question = JSON.parse(fs.readFileSync(questionPath, 'utf8'));
      
      // Increment view count
      question.views = (question.views || 0) + 1;
      fs.writeFileSync(questionPath, JSON.stringify(question, null, 2));

      return question;
    } catch (error) {
      console.error('Error getting question by ID:', error);
      return null;
    }
  }

  async createQuestion(questionData) {
    try {
      const questionId = this.generateId('q');
      const now = new Date().toISOString();

      const question = {
        id: questionId,
        title: questionData.title,
        content: questionData.content,
        tags: questionData.tags || [],
        author_wallet: questionData.author_wallet,
        author_name: questionData.author_name,
        created_at: now,
        updated_at: now,
        last_activity: now,
        views: 0,
        votes: 0,
        answer_count: 0,
        accepted_answers: [],
        status: 'open',
        is_trending: false,
        difficulty_level: questionData.difficulty_level || 'intermediate',
        bounty: questionData.bounty || 0
      };

      // Save question
      const questionPath = path.join(this.questionsPath, `${questionId}.json`);
      fs.writeFileSync(questionPath, JSON.stringify(question, null, 2));

      // Update index
      const indexPath = path.join(this.questionsPath, 'index.json');
      let questionIds = [];
      if (fs.existsSync(indexPath)) {
        questionIds = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
      }
      questionIds.unshift(questionId); // Add to beginning
      fs.writeFileSync(indexPath, JSON.stringify(questionIds, null, 2));

      // Create answer directory
      const answerDir = path.join(this.answersPath, questionId);
      this.ensureDirectory(answerDir);
      
      // Create answer index
      const answerIndex = {
        question_id: questionId,
        answer_tree: [],
        total_answers: 0
      };
      fs.writeFileSync(path.join(answerDir, 'index.json'), JSON.stringify(answerIndex, null, 2));

      return question;
    } catch (error) {
      console.error('Error creating question:', error);
      throw error;
    }
  }

  // === ANSWERS ===

  async getAnswersForQuestion(questionId) {
    try {
      const answerDir = path.join(this.answersPath, questionId);
      const indexPath = path.join(answerDir, 'index.json');

      if (!fs.existsSync(indexPath)) {
        return [];
      }

      const answerIndex = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
      const answers = [];

      // Read all answer files in the directory
      const answerFiles = fs.readdirSync(answerDir).filter(file => 
        file.endsWith('.json') && file !== 'index.json'
      );

      for (const file of answerFiles) {
        const answerPath = path.join(answerDir, file);
        const answer = JSON.parse(fs.readFileSync(answerPath, 'utf8'));
        answers.push(answer);
      }

      // Sort answers: accepted first, then by votes, then by creation time
      answers.sort((a, b) => {
        if (a.is_accepted !== b.is_accepted) {
          return b.is_accepted - a.is_accepted; // Accepted answers first
        }
        if (a.votes !== b.votes) {
          return b.votes - a.votes; // Higher votes first
        }
        return new Date(a.created_at) - new Date(b.created_at); // Older first
      });

      return answers;
    } catch (error) {
      console.error('Error getting answers for question:', error);
      return [];
    }
  }

  async createAnswer(answerData) {
    try {
      const answerId = this.generateId('a');
      const now = new Date().toISOString();

      const answer = {
        id: answerId,
        question_id: answerData.question_id,
        content: answerData.content,
        author_wallet: answerData.author_wallet,
        author_name: answerData.author_name,
        created_at: now,
        updated_at: now,
        votes: 0,
        is_accepted: false,
        parent_answer_id: answerData.parent_answer_id || null,
        reply_count: 0,
        depth: answerData.depth || 0,
        code_snippets: answerData.code_snippets || [],
        helpful_votes: 0,
        spam_reports: 0
      };

      // Save answer
      const answerDir = path.join(this.answersPath, answerData.question_id);
      this.ensureDirectory(answerDir);
      
      const answerPath = path.join(answerDir, `${answerId}.json`);
      fs.writeFileSync(answerPath, JSON.stringify(answer, null, 2));

      // Update question answer count and last activity
      const questionPath = path.join(this.questionsPath, `${answerData.question_id}.json`);
      if (fs.existsSync(questionPath)) {
        const question = JSON.parse(fs.readFileSync(questionPath, 'utf8'));
        question.answer_count = (question.answer_count || 0) + 1;
        question.last_activity = now;
        fs.writeFileSync(questionPath, JSON.stringify(question, null, 2));
      }

      // Update answer index
      const indexPath = path.join(answerDir, 'index.json');
      let answerIndex = { question_id: answerData.question_id, answer_tree: [], total_answers: 0 };
      if (fs.existsSync(indexPath)) {
        answerIndex = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
      }
      
      answerIndex.total_answers += 1;
      
      // Update parent answer reply count if this is a reply
      if (answerData.parent_answer_id) {
        const parentAnswerPath = path.join(answerDir, `${answerData.parent_answer_id}.json`);
        if (fs.existsSync(parentAnswerPath)) {
          const parentAnswer = JSON.parse(fs.readFileSync(parentAnswerPath, 'utf8'));
          parentAnswer.reply_count = (parentAnswer.reply_count || 0) + 1;
          fs.writeFileSync(parentAnswerPath, JSON.stringify(parentAnswer, null, 2));
        }
      }
      
      fs.writeFileSync(indexPath, JSON.stringify(answerIndex, null, 2));

      return answer;
    } catch (error) {
      console.error('Error creating answer:', error);
      throw error;
    }
  }

  // === VOTING ===

  async voteOnQuestion(questionId, voterWallet, voterName, voteType) {
    try {
      const voteId = this.generateId('v');
      const now = new Date().toISOString();

      const vote = {
        id: voteId,
        target_type: 'question',
        target_id: questionId,
        voter_wallet: voterWallet,
        voter_name: voterName,
        vote_type: voteType, // 'up' or 'down'
        created_at: now,
        vote_weight: 1
      };

      // Save vote
      const voteDir = path.join(this.votesPath, 'questions');
      this.ensureDirectory(voteDir);
      
      const votesFilePath = path.join(voteDir, `${questionId}.json`);
      let votes = [];
      if (fs.existsSync(votesFilePath)) {
        votes = JSON.parse(fs.readFileSync(votesFilePath, 'utf8'));
      }

      // Check if user already voted
      const existingVoteIndex = votes.findIndex(v => v.voter_wallet === voterWallet);
      if (existingVoteIndex > -1) {
        // Update existing vote
        votes[existingVoteIndex] = vote;
      } else {
        // Add new vote
        votes.push(vote);
      }

      fs.writeFileSync(votesFilePath, JSON.stringify(votes, null, 2));

      // Update question vote count
      const questionPath = path.join(this.questionsPath, `${questionId}.json`);
      if (fs.existsSync(questionPath)) {
        const question = JSON.parse(fs.readFileSync(questionPath, 'utf8'));
        const upVotes = votes.filter(v => v.vote_type === 'up').length;
        const downVotes = votes.filter(v => v.vote_type === 'down').length;
        question.votes = upVotes - downVotes;
        fs.writeFileSync(questionPath, JSON.stringify(question, null, 2));
      }

      return vote;
    } catch (error) {
      console.error('Error voting on question:', error);
      throw error;
    }
  }

  async voteOnAnswer(answerId, questionId, voterWallet, voterName, voteType) {
    try {
      const voteId = this.generateId('v');
      const now = new Date().toISOString();

      const vote = {
        id: voteId,
        target_type: 'answer',
        target_id: answerId,
        voter_wallet: voterWallet,
        voter_name: voterName,
        vote_type: voteType,
        created_at: now,
        vote_weight: 1
      };

      // Save vote
      const voteDir = path.join(this.votesPath, 'answers');
      this.ensureDirectory(voteDir);
      
      const votesFilePath = path.join(voteDir, `${answerId}.json`);
      let votes = [];
      if (fs.existsSync(votesFilePath)) {
        votes = JSON.parse(fs.readFileSync(votesFilePath, 'utf8'));
      }

      // Check if user already voted
      const existingVoteIndex = votes.findIndex(v => v.voter_wallet === voterWallet);
      if (existingVoteIndex > -1) {
        votes[existingVoteIndex] = vote;
      } else {
        votes.push(vote);
      }

      fs.writeFileSync(votesFilePath, JSON.stringify(votes, null, 2));

      // Update answer vote count
      const answerPath = path.join(this.answersPath, questionId, `${answerId}.json`);
      if (fs.existsSync(answerPath)) {
        const answer = JSON.parse(fs.readFileSync(answerPath, 'utf8'));
        const upVotes = votes.filter(v => v.vote_type === 'up').length;
        const downVotes = votes.filter(v => v.vote_type === 'down').length;
        answer.votes = upVotes - downVotes;
        fs.writeFileSync(answerPath, JSON.stringify(answer, null, 2));
      }

      return vote;
    } catch (error) {
      console.error('Error voting on answer:', error);
      throw error;
    }
  }

  // === ACCEPTANCE ===

  async acceptAnswer(questionId, answerId, acceptedByWallet, acceptedByName, reason = '') {
    try {
      const acceptanceId = this.generateId('acc');
      const now = new Date().toISOString();

      const acceptance = {
        id: acceptanceId,
        question_id: questionId,
        answer_id: answerId,
        accepted_by_wallet: acceptedByWallet,
        accepted_by_name: acceptedByName,
        accepted_at: now,
        acceptance_reason: reason
      };

      // Save acceptance
      const acceptanceDir = this.acceptancesPath;
      this.ensureDirectory(acceptanceDir);
      
      const acceptancesFilePath = path.join(acceptanceDir, `${questionId}.json`);
      let acceptances = [];
      if (fs.existsSync(acceptancesFilePath)) {
        acceptances = JSON.parse(fs.readFileSync(acceptancesFilePath, 'utf8'));
      }

      acceptances.push(acceptance);
      fs.writeFileSync(acceptancesFilePath, JSON.stringify(acceptances, null, 2));

      // Mark answer as accepted
      const answerPath = path.join(this.answersPath, questionId, `${answerId}.json`);
      if (fs.existsSync(answerPath)) {
        const answer = JSON.parse(fs.readFileSync(answerPath, 'utf8'));
        answer.is_accepted = true;
        fs.writeFileSync(answerPath, JSON.stringify(answer, null, 2));
      }

      // Update question accepted answers list
      const questionPath = path.join(this.questionsPath, `${questionId}.json`);
      if (fs.existsSync(questionPath)) {
        const question = JSON.parse(fs.readFileSync(questionPath, 'utf8'));
        if (!question.accepted_answers) {
          question.accepted_answers = [];
        }
        if (!question.accepted_answers.includes(answerId)) {
          question.accepted_answers.push(answerId);
        }
        fs.writeFileSync(questionPath, JSON.stringify(question, null, 2));
      }

      return acceptance;
    } catch (error) {
      console.error('Error accepting answer:', error);
      throw error;
    }
  }

  // === TAGS ===

  async getAllTags() {
    try {
      const indexPath = path.join(this.tagsPath, 'index.json');
      if (!fs.existsSync(indexPath)) {
        return [];
      }

      const tagNames = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
      const tags = [];

      for (const tagName of tagNames) {
        const tagPath = path.join(this.tagsPath, `${tagName}.json`);
        if (fs.existsSync(tagPath)) {
          const tag = JSON.parse(fs.readFileSync(tagPath, 'utf8'));
          tags.push(tag);
        }
      }

      return tags.sort((a, b) => b.question_count - a.question_count);
    } catch (error) {
      console.error('Error getting all tags:', error);
      return [];
    }
  }
}

module.exports = QAService;