// Fallback data for Story Mode - extracted from hardcoded content
// This file contains all the previously hardcoded questions, answers, and explanations
// Only used as reference - the app should use database data exclusively

export const STORY_MODE_FALLBACK_DATA = {
  // NOTE: This file contains extracted hardcoded content from StoryModeLearning.js
  // Previously there were 10 full chapters with hundreds of questions commented out
  // Lines 742-1842 in StoryModeLearning.js contained extensive hardcoded chapters
  
  emergencyFallbackChapters: [
    {
      title: '🏗️ Blockchain Fundamentals',
      description: 'Learn the basics of blockchain technology',
      questions: [
        {
          content: "Every blockchain consists of blocks linked together in a chain. Each block contains important information about transactions and links to the previous block.",
          dialogue: { speaker: "Blockchain Guide", text: "What connects blocks together in a blockchain?" },
          choices: ["Physical cables", "Cryptographic hashes", "Internet protocols", "Database keys"],
          correctChoice: 1,
          explanation: {
            correctAnswer: "Cryptographic hashes",
            details: "Blocks are connected through cryptographic hashes, which are like digital fingerprints. Each block contains the hash of the previous block, creating an unbreakable chain. If someone tries to alter a previous block, its hash would change, breaking the chain and alerting the network to tampering.",
            keyPoints: [
              "Each block contains the hash of the previous block",
              "Hashes act like digital fingerprints - unique for each block's data", 
              "Changing any data in a block changes its hash completely",
              "This creates an immutable chain that's easy to verify"
            ]
          }
        },
        {
          content: "Decentralization is one of blockchain's key features. Instead of relying on a single central authority, the network is maintained by many participants.",
          dialogue: { speaker: "Blockchain Guide", text: "What does decentralization mean in blockchain?" },
          choices: ["One computer controls everything", "No computers are needed", "Many computers work together", "Only governments can participate"],
          correctChoice: 2,
          explanation: {
            correctAnswer: "Many computers work together",
            details: "Decentralization means the blockchain network is maintained by thousands of computers (nodes) around the world, rather than a single central server. This distribution of power makes the network more secure, resistant to censorship, and less prone to failure since there's no single point of control.",
            keyPoints: [
              "No single point of control or failure",
              "Thousands of nodes participate in maintaining the blockchain",
              "Makes the system more secure and resistant to attacks",
              "Removes the need for trusted intermediaries"
            ]
          }
        }
        // NOTE: Originally contained 8 more questions per chapter
        // and 9 more complete chapters (Cryptocurrency Basics, Wallet Security, 
        // DeFi Introduction, Smart Contracts, Advanced Trading, DAO & Governance,
        // NFT Ecosystem, Layer 2 Solutions, Future of Blockchain)
      ]
    }
    // NOTE: Originally contained 9 more complete chapters with full question sets
  ],
  
  // Reference note about the original hardcoded content
  originalHardcodedNote: `
    The original StoryModeLearning.js file contained over 1100 lines of hardcoded content 
    from lines 742-1842, including:
    - 10 complete chapters with full question sets
    - Hundreds of questions with dialogue, choices, and explanations
    - Complete story progression and educational content
    
    This content has been removed to ensure 100% database-driven operation.
    All content now comes exclusively from the C_DataBase repository.
  `
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