import CryptoJS from 'crypto-js';

// Secret salt for answer hashing (should be environment variable in production)
const HASH_SALT = 'ccube_gaming_hub_2025_secure_salt_key';

/**
 * Generate a secure hash for an answer
 * @param {string} answer - The correct answer to hash
 * @param {string} questionId - Unique question identifier
 * @returns {string} - Secure hash
 */
export const generateAnswerHash = (answer, questionId) => {
  const normalizedAnswer = answer.toLowerCase().trim();
  const saltedAnswer = `${normalizedAnswer}_${questionId}_${HASH_SALT}`;
  return CryptoJS.SHA256(saltedAnswer).toString();
};

/**
 * Validate user's answer against stored hash
 * @param {string} userAnswer - User's submitted answer
 * @param {string} questionId - Question identifier
 * @param {string} expectedHash - Stored answer hash
 * @returns {boolean} - Whether answer is correct
 */
export const validateAnswer = (userAnswer, questionId, expectedHash) => {
  const userHash = generateAnswerHash(userAnswer, questionId);
  return userHash === expectedHash;
};

/**
 * Generate secure question data with hashed answers
 * @param {Array} questions - Array of question objects
 * @param {string} categoryId - Category identifier
 * @returns {Array} - Questions with hashed answers
 */
export const secureQuestionData = (questions, categoryId) => {
  return questions.map((question, index) => {
    const questionId = `${categoryId}_q${index + 1}`;
    
    // Hash all correct answers
    const hashedCorrectAnswers = question.correctAnswers.map(answer => ({
      hash: generateAnswerHash(answer, questionId),
      length: answer.length, // Keep length for UI hints
      firstChar: answer.charAt(0).toLowerCase() // Keep first char for hints
    }));
    
    return {
      id: questionId,
      question: question.question,
      dragItems: [...question.correctAnswers, ...question.wrongAnswers], // All items for dragging
      correctAnswerHashes: hashedCorrectAnswers,
      wrongAnswers: question.wrongAnswers, // Keep wrong answers visible
      explanation: question.explanation,
      dropZones: question.dropZones || [] // Keep drop zone structure
    };
  });
};

/**
 * Obfuscate sensitive data in console logs
 * @param {Object} data - Data to obfuscate
 * @returns {Object} - Obfuscated data
 */
export const obfuscateDataForLogging = (data) => {
  if (process.env.NODE_ENV === 'production') {
    return {
      message: 'Data loaded successfully',
      questionCount: Object.values(data).reduce((sum, category) => sum + category.length, 0),
      categories: Object.keys(data),
      timestamp: new Date().toISOString()
    };
  }
  return data; // Full data in development
};