// Fallback data for Story Mode - extracted from hardcoded content
// This file contains all the previously hardcoded questions, answers, and explanations
// Only used as reference - the app should use database data exclusively

export const STORY_MODE_FALLBACK_DATA = {
  emergencyFallbackChapters: [
    {
      title: '🏗️ Blockchain Fundamentals',
      description: 'Learn the basics of blockchain technology',
      questions: [{
        content: 'What is blockchain?',
        dialogue: {
          speaker: 'Blockchain Guide',
          text: 'What is the primary purpose of blockchain technology?'
        },
        choices: [
          'A distributed ledger technology',
          'A type of cryptocurrency',
          'A web browser',
          'A social media platform'
        ],
        correctChoice: 0,
        explanation: {
          correctAnswer: 'A distributed ledger technology',
          details: 'Blockchain is a distributed ledger technology that maintains a continuously growing list of records.',
          keyPoints: ['Decentralized', 'Immutable', 'Transparent']
        }
      }]
    }
  ]
};

// Chapter file configuration that was previously hardcoded
export const CHAPTER_FILES_CONFIG = [
  { 
    filename: 'chapter-1-blockchain-fundamentals.json', 
    title: 'Blockchain Fundamentals' 
  },
  { 
    filename: 'chapter-2-cryptocurrency-basics.json', 
    title: 'Cryptocurrency Basics' 
  },
  { 
    filename: 'chapter-3-wallet-security.json', 
    title: 'Wallet Security' 
  },
  { 
    filename: 'chapter-4-defi-introduction.json', 
    title: 'DeFi Introduction' 
  },
  { 
    filename: 'chapter-5-smart-contracts.json', 
    title: 'Smart Contracts' 
  },
  { 
    filename: 'chapter-6-advanced-trading.json', 
    title: 'Advanced Trading' 
  },
  { 
    filename: 'chapter-7-dao-governance.json', 
    title: 'DAO & Governance' 
  },
  { 
    filename: 'chapter-8-nft-ecosystem.json', 
    title: 'NFT Ecosystem' 
  },
  { 
    filename: 'chapter-9-layer2-solutions.json', 
    title: 'Layer 2 Solutions' 
  },
  { 
    filename: 'chapter-10-future-blockchain.json', 
    title: 'Future of Blockchain' 
  }
];

// Template dialogue speakers
export const DIALOGUE_SPEAKERS = {
  guide: 'Blockchain Guide',
  expert: 'Crypto Expert', 
  mentor: 'DeFi Mentor',
  wizard: 'Smart Contract Wizard',
  oracle: 'Trading Oracle'
};

// Template explanations structure
export const EXPLANATION_TEMPLATES_STORY = {
  blockchain: {
    correctAnswer: 'A distributed ledger technology',
    details: 'Blockchain is a distributed ledger technology that maintains a continuously growing list of records.',
    keyPoints: ['Decentralized', 'Immutable', 'Transparent']
  },
  cryptocurrency: {
    correctAnswer: 'Digital or virtual currency',
    details: 'Cryptocurrency is a digital or virtual currency that is secured by cryptography.',
    keyPoints: ['Digital Currency', 'Cryptographic Security', 'Peer-to-Peer']
  },
  wallet: {
    correctAnswer: 'Digital tool to store and manage crypto',
    details: 'A crypto wallet is a digital tool that allows you to store and manage your cryptocurrency.',
    keyPoints: ['Private Keys', 'Public Keys', 'Security']
  }
};