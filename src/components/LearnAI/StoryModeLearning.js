import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const storyFade = keyframes`
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const StoryContainer = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, #1a1a2e, #16213e, #0f3460);
  position: relative;
  overflow-y: auto;
  padding: 40px 20px 20px 20px;
`;

const MainContentWrapper = styled.div`
  display: flex;
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
  align-items: flex-start;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

const QuestionsContainer = styled.div`
  flex: 1;
  min-width: 0;
`;

const DashboardContainer = styled.div`
  width: 320px;
  min-width: 320px;
  margin-top: 280px;
  
  @media (max-width: 1024px) {
    width: 100%;
    min-width: 100%;
    margin-top: 20px;
  }
`;

const StoryHeader = styled.div`
  text-align: center;
  margin-bottom: 30px;
  animation: ${storyFade} 1s ease-out;
`;

const ChapterSelector = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 30px;
  margin-bottom: 20px;
`;

const ChapterDropdown = styled.select`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.4);
  border-radius: 8px;
  color: white;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  outline: none;
  
  option {
    background: #1a1a2e;
    color: white;
  }
  
  &:focus {
    border-color: #10b981;
    box-shadow: 0 0 8px rgba(16, 185, 129, 0.3);
  }
`;

const ChapterTitle = styled.h2`
  color: #10b981;
  font-size: 2rem;
  margin-bottom: 10px;
`;

const QuestionCounter = styled.div`
  color: #64748b;
  font-size: 14px;
  margin-bottom: 10px;
`;

const DashboardToggle = styled.button`
  width: 100%;
  height: 40px;
  background: rgba(16, 185, 129, 0.9);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  margin-bottom: 12px;
  
  &:hover {
    background: rgba(16, 185, 129, 1);
    transform: translateY(-2px);
  }
`;

const PointsDashboard = styled.div`
  width: 100%;
  background: rgba(0, 0, 0, 0.9);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(16, 185, 129, 0.3);
  transition: all 0.3s ease-in-out;
  transform: ${props => props.show ? 'translateY(0)' : 'translateY(-20px)'};
  opacity: ${props => props.show ? '1' : '0'};
  height: ${props => props.show ? '600px' : '0'};
  overflow: hidden;
`;

const DashboardTitle = styled.h3`
  color: #10b981;
  margin: 0 0 12px 0;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PointsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(16, 185, 129, 0.2);
`;

const PointsLabel = styled.div`
  color: #e5e7eb;
  font-size: 14px;
`;

const PointsValue = styled.div`
  color: #10b981;
  font-size: 18px;
  font-weight: bold;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
`;

const StatBox = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 8px;
  text-align: center;
`;

const StatValue = styled.div`
  color: #10b981;
  font-size: 16px;
  font-weight: bold;
`;

const StatLabel = styled.div`
  color: #9ca3af;
  font-size: 11px;
  margin-top: 2px;
`;

const ChapterProgressList = styled.div`
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(16, 185, 129, 0.6);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(16, 185, 129, 0.8);
  }
`;

const ChapterProgressItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-size: 12px;
  color: #d1d5db;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const PointsAnimation = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 12px 24px;
  border-radius: 50px;
  font-weight: bold;
  font-size: 18px;
  z-index: 1000;
  animation: ${storyFade} 0.5s ease-out;
  pointer-events: none;
`;

const StoryProgress = styled.div`
  width: calc(100% + 340px);
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  margin-bottom: 20px;
  overflow: hidden;
  
  @media (max-width: 1024px) {
    width: 100%;
  }
`;

const ProgressBar = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #10b981, #3b82f6);
  width: ${props => props.progress || 0}%;
  transition: width 0.5s ease;
`;

const StoryContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 20px;
  animation: ${storyFade} 1s ease-out 0.3s both;
`;

const StoryText = styled.p`
  color: white;
  line-height: 1.8;
  font-size: 1.1rem;
  margin-bottom: 20px;
`;

const CharacterDialogue = styled.div`
  background: rgba(16, 185, 129, 0.1);
  border-left: 4px solid #10b981;
  padding: 15px 20px;
  margin: 20px 0;
  border-radius: 0 10px 10px 0;
`;

const Speaker = styled.div`
  color: #10b981;
  font-weight: bold;
  margin-bottom: 8px;
`;

const ChoiceContainer = styled.div`
  margin-top: 30px;
  animation: ${storyFade} 1s ease-out 0.6s both;
`;

const ChoiceButton = styled.button`
  display: block;
  width: 100%;
  padding: 15px 20px;
  margin: 10px 0;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2));
  border: 1px solid rgba(16, 185, 129, 0.4);
  border-radius: 10px;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(59, 130, 246, 0.3));
    transform: translateX(5px);
  }
`;

const ExplanationContainer = styled.div`
  margin-top: 20px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  border-left: 4px solid ${props => props.isCorrect ? '#10b981' : '#ef4444'};
  animation: ${storyFade} 0.5s ease-out;
`;

const ExplanationHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  font-weight: bold;
  color: ${props => props.isCorrect ? '#10b981' : '#ef4444'};
  font-size: 16px;
`;

const CorrectAnswerText = styled.div`
  color: #10b981;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
`;

const ExplanationText = styled.div`
  color: #e5e7eb;
  line-height: 1.6;
  font-size: 14px;
`;

const KeyPointsList = styled.ul`
  margin: 12px 0 0 0;
  padding-left: 16px;
  color: #d1d5db;
  
  li {
    margin-bottom: 4px;
    font-size: 13px;
  }
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

const NavButton = styled.button`
  padding: 12px 24px;
  background: rgba(16, 185, 129, 0.8);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: rgba(16, 185, 129, 1);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StoryModeLearning = ({ userProgress, setUserProgress, addPoints }) => {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [chapterScores, setChapterScores] = useState({});
  const [totalPoints, setTotalPoints] = useState(0);
  const [showPointsAnimation, setShowPointsAnimation] = useState(false);
  const [animationText, setAnimationText] = useState('');
  const [showDashboard, setShowDashboard] = useState(true);

  const storyChapters = [
    {
      title: "🏗️ Blockchain Fundamentals",
      description: "Master the core concepts of blockchain technology",
      questions: [
        {
          content: "Welcome to the blockchain revolution! Let's start with the basics. Blockchain is a revolutionary technology that has transformed how we think about digital transactions and data storage.",
          dialogue: { speaker: "Blockchain Guide", text: "What is the primary purpose of blockchain technology?" },
          choices: ["Store data in a central database", "Create a decentralized, immutable ledger", "Speed up internet connections", "Replace traditional computers"],
          correctChoice: 1,
          explanation: {
            correctAnswer: "Create a decentralized, immutable ledger",
            details: "Blockchain's revolutionary purpose is to create a decentralized, immutable ledger that allows multiple parties to agree on data without requiring a central authority. Unlike traditional centralized databases, blockchain distributes data across a network of computers, making it resistant to single points of failure and tampering.",
            keyPoints: [
              "Decentralization eliminates the need for trusted intermediaries",
              "Immutability ensures data cannot be altered once recorded",
              "Consensus mechanisms allow network participants to agree on data validity",
              "Cryptographic hashing links blocks together securely"
            ]
          }
        },
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
          choices: ["One computer controls everything", "Multiple computers maintain the network", "Data is stored in one location", "Only governments can access it"],
          correctChoice: 1,
          explanation: {
            correctAnswer: "Multiple computers maintain the network",
            details: "Decentralization means the blockchain network is maintained by thousands of computers (nodes) around the world, rather than a single central server. This distribution of power makes the network more secure, resistant to censorship, and less prone to failure since there's no single point of control.",
            keyPoints: [
              "No single entity controls the entire network",
              "Thousands of nodes participate in maintaining the blockchain",
              "Eliminates single points of failure and censorship",
              "Democratic consensus replaces centralized authority"
            ]
          }
        },
        {
          content: "Immutability means that once data is added to the blockchain, it becomes extremely difficult to change or delete. This creates a permanent record.",
          dialogue: { speaker: "Blockchain Guide", text: "Why is immutability important in blockchain?" },
          choices: ["It makes transactions faster", "It prevents unauthorized changes to data", "It reduces storage costs", "It improves internet speed"],
          correctChoice: 1,
          explanation: {
            correctAnswer: "It prevents unauthorized changes to data",
            details: "Immutability is crucial because it ensures trust in the system. Once a transaction is recorded on the blockchain, it becomes part of a permanent, unalterable record. This prevents fraud, unauthorized modifications, and creates an audit trail that everyone can verify.",
            keyPoints: [
              "Creates permanent, tamper-proof records",
              "Prevents fraud and unauthorized data modification",
              "Builds trust without requiring intermediaries",
              "Enables transparent and verifiable audit trails"
            ]
          }
        },
        {
          content: "Consensus mechanisms ensure all participants in the network agree on the state of the blockchain. This prevents conflicts and maintains integrity.",
          dialogue: { speaker: "Blockchain Guide", text: "What is the purpose of consensus mechanisms?" },
          choices: ["To speed up transactions", "To ensure network participants agree", "To reduce electricity costs", "To improve user interfaces"],
          correctChoice: 1,
          explanation: {
            correctAnswer: "To ensure network participants agree",
            details: "Consensus mechanisms are the protocols that allow thousands of independent computers to agree on the same version of the blockchain. Without consensus, the network would have conflicting versions of data. Popular mechanisms include Proof of Work (Bitcoin) and Proof of Stake (Ethereum 2.0).",
            keyPoints: [
              "Enables agreement among thousands of independent nodes",
              "Prevents double-spending and conflicting transactions",
              "Maintains network integrity without central authority",
              "Different mechanisms: Proof of Work, Proof of Stake, etc."
            ]
          }
        },
        {
          content: "Transparency in blockchain means that all transactions are visible to network participants, creating an open and auditable system.",
          dialogue: { speaker: "Blockchain Guide", text: "What does transparency mean in blockchain context?" },
          choices: ["Only administrators can see transactions", "All transactions are visible to participants", "Data is completely private", "Only government can audit"],
          correctChoice: 1,
          explanation: {
            correctAnswer: "All transactions are visible to participants",
            details: "Blockchain transparency means that all transaction data is publicly visible on the network, though personal identities may be pseudonymous. Anyone can verify transactions, trace funds, and audit the system. This openness builds trust and prevents hidden manipulation.",
            keyPoints: [
              "All transactions are publicly recorded and verifiable",
              "Creates accountability without central oversight",
              "Enables community auditing and fraud detection",
              "Balances transparency with privacy through pseudonymity"
            ]
          }
        },
        {
          content: "Nodes are individual computers that participate in the blockchain network. They store copies of the blockchain and help validate transactions.",
          dialogue: { speaker: "Blockchain Guide", text: "What role do nodes play in a blockchain network?" },
          choices: ["They provide internet access", "They store and validate blockchain data", "They design user interfaces", "They collect transaction fees"],
          correctChoice: 1,
          explanation: {
            correctAnswer: "They store and validate blockchain data",
            details: "Nodes are the backbone of blockchain networks. Each node maintains a complete copy of the blockchain and participates in validating new transactions. The more nodes a network has, the more decentralized and secure it becomes. Different types include full nodes, light nodes, and mining nodes.",
            keyPoints: [
              "Store complete copies of the blockchain ledger",
              "Validate new transactions and blocks",
              "Relay information across the network",
              "More nodes = greater decentralization and security"
            ]
          }
        },
        {
          content: "Digital signatures use cryptography to prove that a transaction was created by the owner of a private key without revealing the private key itself.",
          dialogue: { speaker: "Blockchain Guide", text: "What do digital signatures prove in blockchain?" },
          choices: ["The transaction amount", "The identity and authenticity of the sender", "The transaction speed", "The network location"],
          correctChoice: 1,
          explanation: {
            correctAnswer: "The identity and authenticity of the sender",
            details: "Digital signatures prove two critical things: 1) The transaction was created by someone who owns the private key (authentication), and 2) The transaction hasn't been tampered with (integrity). This is achieved without ever revealing the private key, maintaining security.",
            keyPoints: [
              "Proves ownership of the private key without revealing it",
              "Ensures transaction hasn't been modified (integrity)",
              "Provides non-repudiation - sender can't deny they sent it",
              "Uses public-key cryptography for verification"
            ]
          }
        },
        {
          content: "Hash functions take input data of any size and produce a fixed-size string of characters. They're essential for linking blocks and ensuring data integrity.",
          dialogue: { speaker: "Blockchain Guide", text: "What is a key property of cryptographic hash functions?" },
          choices: ["They can be easily reversed", "Small input changes create dramatically different outputs", "They always produce the same length output regardless of input", "They require internet connectivity"],
          correctChoice: 2,
          explanation: {
            correctAnswer: "They always produce the same length output regardless of input",
            details: "Cryptographic hash functions have several key properties: they always produce fixed-length output (like SHA-256 always producing 256 bits), are deterministic (same input = same output), are irreversible, and exhibit the avalanche effect (small changes create completely different outputs). The fixed output length is fundamental to their use in blockchain.",
            keyPoints: [
              "Always produce fixed-length output (e.g., SHA-256 = 256 bits)",
              "Deterministic: same input always gives same output",
              "Irreversible: can't determine input from output",
              "Avalanche effect: tiny input changes = completely different output"
            ]
          }
        },
        {
          content: "The genesis block is the very first block in a blockchain. It's hardcoded into the blockchain software and serves as the foundation for all subsequent blocks.",
          dialogue: { speaker: "Blockchain Guide", text: "What is special about the genesis block?" },
          choices: ["It contains the most transactions", "It's the first block and foundation of the chain", "It processes transactions fastest", "It stores user passwords"],
          correctChoice: 1,
          explanation: {
            correctAnswer: "It's the first block and foundation of the chain",
            details: "The genesis block is unique because it's the starting point of the entire blockchain - it has no previous block to reference. It's hardcoded into the blockchain software and often contains special messages from the creator. For example, Bitcoin's genesis block contained a newspaper headline about bank bailouts.",
            keyPoints: [
              "First block in the blockchain with no predecessor",
              "Hardcoded into the blockchain software",
              "Serves as the foundation for all subsequent blocks",
              "Often contains symbolic messages from creators"
            ]
          }
        }
      ]
    },
    {
      title: "🔐 Cryptography & Security",
      description: "Explore the cryptographic foundations that secure blockchain",
      questions: [
        {
          content: "Cryptography is the backbone of blockchain security. It protects data and ensures that only authorized parties can access or modify information.",
          dialogue: { speaker: "Security Expert", text: "What is the main purpose of cryptography in blockchain?" },
          choices: ["To make transactions faster", "To protect and secure data", "To reduce storage costs", "To improve user experience"],
          correctChoice: 1,
          explanation: {
            correctAnswer: "To protect and secure data",
            details: "Cryptography is essential for blockchain security, providing three key services: confidentiality (keeping data private), integrity (ensuring data hasn't been tampered with), and authenticity (proving who created the data). Without cryptography, blockchain would be vulnerable to fraud, tampering, and unauthorized access.",
            keyPoints: [
              "Provides confidentiality through encryption",
              "Ensures data integrity with hash functions",
              "Proves authenticity with digital signatures",
              "Enables secure communication without trusted intermediaries"
            ]
          }
        },
        {
          content: "Public key cryptography uses a pair of keys: a public key that can be shared with everyone, and a private key that must be kept secret.",
          dialogue: { speaker: "Security Expert", text: "In public key cryptography, which key should you never share?" },
          choices: ["Public key", "Private key", "Session key", "Network key"],
          correctChoice: 1,
          explanation: {
            correctAnswer: "Private key",
            details: "Your private key is like your digital signature and must never be shared. Anyone with your private key can spend your cryptocurrency, sign transactions on your behalf, and impersonate you. The public key can be safely shared - it's used by others to verify your signatures and send you funds.",
            keyPoints: [
              "Private key = complete control over your assets",
              "Public key = safe to share, used for receiving funds",
              "Private key signs transactions, public key verifies them",
              "Lost private key = lost access to funds forever"
            ]
          }
        },
        {
          content: "SHA-256 is a cryptographic hash function that produces a 256-bit (32-byte) hash value. It's widely used in Bitcoin and many other blockchains.",
          dialogue: { speaker: "Security Expert", text: "What does SHA-256 produce?" },
          choices: ["A 128-bit hash", "A 256-bit hash", "A 512-bit hash", "A variable-length hash"],
          correctChoice: 1,
          explanation: {
            correctAnswer: "A 256-bit hash",
            details: "SHA-256 (Secure Hash Algorithm 256-bit) always produces exactly 256 bits (32 bytes) of output, regardless of input size. Whether you hash a single letter or an entire book, you get the same 256-bit length output. This consistency is crucial for blockchain operations and creates uniform block identifiers.",
            keyPoints: [
              "Always produces exactly 256 bits (32 bytes) of output",
              "Input size doesn't affect output length",
              "Widely used in Bitcoin's proof-of-work mining",
              "Part of the SHA-2 family of cryptographic functions"
            ]
          }
        },
        {
          content: "Merkle trees organize transaction data in a tree structure where each leaf represents a transaction hash, and parent nodes contain hashes of their children.",
          dialogue: { speaker: "Security Expert", text: "What do Merkle trees help verify efficiently?" },
          choices: ["User identities", "Transaction inclusion without downloading full block", "Network speed", "Storage capacity"],
          correctChoice: 1,
          explanation: {
            correctAnswer: "Transaction inclusion without downloading full block",
            details: "Merkle trees enable efficient verification of transaction inclusion through a mathematical proof path. Instead of downloading an entire block (which could be megabytes), you only need the transaction and a small proof path (logarithmic in size) to verify it's included in the block. This is crucial for lightweight clients and mobile wallets.",
            keyPoints: [
              "Enables verification without downloading full block data",
              "Proof size grows logarithmically, not linearly with transactions",
              "Essential for lightweight clients and mobile wallets",
              "Merkle root in block header represents all transactions"
            ]
          }
        },
        {
          content: "Digital signatures provide authentication, non-repudiation, and integrity. They prove who sent a message and that it hasn't been tampered with.",
          dialogue: { speaker: "Security Expert", text: "What does non-repudiation mean in digital signatures?" },
          choices: ["The signature can be copied", "The sender can't deny they sent the message", "The message is encrypted", "The signature expires quickly"],
          correctChoice: 1,
          explanation: {
            correctAnswer: "The sender can't deny they sent the message",
            details: "Non-repudiation means the sender cannot later deny having sent the message or transaction. Since only the holder of the private key could have created the signature, it provides legal and technical proof of authorship. This is crucial for financial transactions and legal contracts.",
            keyPoints: [
              "Sender cannot deny they created the signature",
              "Provides legal proof of transaction authorship",
              "Only private key holder could create valid signature",
              "Essential for accountability in digital transactions"
            ]
          }
        },
        {
          content: "Elliptic Curve Cryptography (ECC) provides the same security as RSA but with smaller key sizes, making it more efficient for blockchain applications.",
          dialogue: { speaker: "Security Expert", text: "Why is ECC preferred in blockchain over RSA?" },
          choices: ["It's older technology", "It provides same security with smaller keys", "It's easier to understand", "It works without internet"],
          correctChoice: 1,
          explanation: {
            correctAnswer: "It provides same security with smaller keys",
            details: "ECC achieves the same security level as RSA with much smaller key sizes. A 256-bit ECC key provides equivalent security to a 3072-bit RSA key. This means smaller transaction sizes, less storage, faster processing, and lower bandwidth usage - all critical for blockchain scalability.",
            keyPoints: [
              "256-bit ECC = 3072-bit RSA security level",
              "Smaller keys mean smaller transaction sizes",
              "Faster cryptographic operations",
              "Better suited for mobile and IoT devices"
            ]
          }
        },
        {
          content: "Nonces are random numbers used once in cryptographic communications. In blockchain, miners adjust nonces to find valid block hashes.",
          dialogue: { speaker: "Security Expert", text: "What is a nonce in blockchain mining?" },
          choices: ["A transaction fee", "A random number used to find valid hashes", "A user password", "A network address"],
          correctChoice: 1,
          explanation: {
            correctAnswer: "A random number used to find valid hashes",
            details: "In blockchain mining, the nonce (number used once) is a field that miners continuously change to find a block hash that meets the difficulty requirement. Miners try billions of different nonce values until they find one that produces a hash starting with the required number of zeros.",
            keyPoints: [
              "Miners change nonce values to find valid block hashes",
              "'Number used once' - should be unique for each attempt",
              "Critical component of proof-of-work mining",
              "Typically a 32-bit field allowing ~4 billion attempts"
            ]
          }
        },
        {
          content: "Salt is random data added to passwords before hashing to prevent rainbow table attacks and ensure identical passwords have different hashes.",
          dialogue: { speaker: "Security Expert", text: "Why is salt used in password hashing?" },
          choices: ["To make passwords longer", "To prevent rainbow table attacks", "To speed up hashing", "To compress data"],
          correctChoice: 1,
          explanation: {
            correctAnswer: "To prevent rainbow table attacks",
            details: "Salt prevents rainbow table attacks by ensuring that identical passwords produce different hash values. Rainbow tables are precomputed tables of common passwords and their hashes. By adding unique random salt to each password before hashing, attackers cannot use these precomputed tables.",
            keyPoints: [
              "Makes identical passwords have different hash values",
              "Prevents use of precomputed rainbow tables",
              "Each password gets unique random salt",
              "Significantly increases cost of password cracking"
            ]
          }
        },
        {
          content: "Zero-knowledge proofs allow one party to prove they know information without revealing the information itself. This enables privacy while maintaining verification.",
          dialogue: { speaker: "Security Expert", text: "What can zero-knowledge proofs accomplish?" },
          choices: ["Prove knowledge without revealing information", "Make transactions faster", "Reduce storage costs", "Eliminate all fees"],
          correctChoice: 0,
          explanation: {
            correctAnswer: "Prove knowledge without revealing information",
            details: "Zero-knowledge proofs are cryptographic methods that allow you to prove you know something (like a password, private key, or solution) without revealing what you know. This enables privacy-preserving verification - crucial for applications like private transactions, identity verification, and confidential smart contracts.",
            keyPoints: [
              "Prove knowledge without revealing the actual information",
              "Enables privacy-preserving verification systems",
              "Used in privacy coins like Zcash and Monero",
              "Applications: private transactions, identity, voting"
            ]
          }
        },
        {
          content: "Multi-signature (multisig) security requires multiple private keys to authorize a transaction, providing additional security for high-value transactions.",
          dialogue: { speaker: "Security Expert", text: "What is the main benefit of multi-signature wallets?" },
          choices: ["Faster transactions", "Enhanced security through multiple required signatures", "Lower fees", "Better user interface"],
          correctChoice: 1,
          explanation: {
            correctAnswer: "Enhanced security through multiple required signatures",
            details: "Multi-signature wallets require multiple people to sign a transaction before it can be executed (e.g., 2-of-3 or 3-of-5). This prevents single points of failure - no one person can steal funds, and the loss of one key doesn't mean loss of all funds. It's essential for organizations and high-value storage.",
            keyPoints: [
              "Requires multiple signatures to authorize transactions",
              "Eliminates single points of failure",
              "Perfect for organizations and shared funds",
              "Common configurations: 2-of-3, 3-of-5, etc."
            ]
          }
        }
      ]
    },
    {
      title: "⛏️ Mining & Consensus",
      description: "Understand how blockchain networks reach agreement",
      questions: [
        {
          content: "Mining is the process of creating new blocks and adding them to the blockchain. Miners compete to solve cryptographic puzzles to earn rewards.",
          dialogue: { speaker: "Mining Expert", text: "What is the primary goal of blockchain mining?" },
          choices: ["To earn money quickly", "To create new blocks and secure the network", "To delete old transactions", "To speed up internet"],
          correctChoice: 1,
          explanation: {
            correctAnswer: "To create new blocks and secure the network",
            details: "Mining serves two critical purposes: creating new blocks to process transactions and securing the network through computational work. While miners are incentivized by rewards, their primary function is maintaining the blockchain's integrity and processing transactions for users worldwide.",
            keyPoints: [
              "Creates new blocks to process pending transactions",
              "Secures network through computational proof-of-work",
              "Maintains blockchain integrity and consensus",
              "Economic incentives align miner behavior with network security"
            ]
          }
        },
        {
          content: "Proof of Work requires miners to perform computational work to validate transactions and create new blocks. The first to solve the puzzle wins the reward.",
          dialogue: { speaker: "Mining Expert", text: "What does Proof of Work require from miners?" },
          choices: ["Social media followers", "Computational work to solve puzzles", "Government approval", "Large bank accounts"],
          correctChoice: 1,
          explanation: {
            correctAnswer: "Computational work to solve puzzles",
            details: "Proof of Work requires miners to expend real computational energy solving cryptographic puzzles. This work is easy to verify but expensive to produce, making it costly to attack the network. The difficulty adjusts so puzzles take approximately 10 minutes in Bitcoin.",
            keyPoints: [
              "Requires significant computational energy expenditure",
              "Puzzles are difficult to solve but easy to verify",
              "Makes attacking the network economically expensive",
              "Difficulty adjusts to maintain consistent block times"
            ]
          }
        },
        {
          content: "Block rewards incentivize miners to participate in the network. They typically consist of newly created cryptocurrency plus transaction fees.",
          dialogue: { speaker: "Mining Expert", text: "What typically makes up a block reward?" },
          choices: ["Only transaction fees", "Only newly created cryptocurrency", "Both new cryptocurrency and transaction fees", "Government subsidies"],
          correctChoice: 2,
          explanation: {
            correctAnswer: "Both new cryptocurrency and transaction fees",
            details: "Block rewards have two components: the block subsidy (newly created cryptocurrency) and transaction fees paid by users. As block subsidies decrease over time (like Bitcoin's halving), transaction fees become increasingly important for miner compensation and network security.",
            keyPoints: [
              "Block subsidy: newly created cryptocurrency",
              "Transaction fees: paid by users for processing",
              "Total reward = subsidy + fees",
              "Fee importance increases as subsidies decrease"
            ]
          }
        },
        {
          content: "Difficulty adjustment ensures blocks are created at consistent intervals despite changes in mining power. The network automatically adjusts puzzle difficulty.",
          dialogue: { speaker: "Mining Expert", text: "Why does mining difficulty automatically adjust?" },
          choices: ["To maintain consistent block creation times", "To make mining easier", "To reduce electricity costs", "To limit the number of miners"],
          correctChoice: 0,
          explanation: {
            correctAnswer: "To maintain consistent block creation times",
            details: "Difficulty adjustment is crucial for blockchain stability. If more miners join, blocks would be found too quickly; if miners leave, blocks would take too long. Bitcoin adjusts difficulty every 2016 blocks to maintain the 10-minute average block time regardless of total network hash rate.",
            keyPoints: [
              "Maintains consistent block times despite hash rate changes",
              "Bitcoin: 10-minute average, adjusted every 2016 blocks",
              "Prevents blockchain from becoming too fast or slow",
              "Essential for predictable transaction confirmation times"
            ]
          }
        },
        {
          content: "Mining pools allow individual miners to combine their computational power and share rewards proportionally to their contribution.",
          dialogue: { speaker: "Mining Expert", text: "What is the main benefit of joining a mining pool?" },
          choices: ["Higher individual rewards", "More consistent smaller rewards", "No electricity costs", "Guaranteed profits"],
          correctChoice: 1,
          explanation: {
            correctAnswer: "More consistent smaller rewards",
            details: "Mining pools reduce the variance in mining rewards. Instead of potentially waiting months or years to find a block solo, pool members receive smaller but regular payouts based on their contributed work. This makes mining more predictable and accessible to smaller miners.",
            keyPoints: [
              "Provides more frequent, predictable payouts",
              "Reduces mining reward variance significantly",
              "Makes mining accessible to smaller participants",
              "Rewards distributed proportionally to contributed work"
            ]
          }
        },
        {
          content: "Proof of Stake replaces computational work with economic stake. Validators are chosen to create blocks based on their stake in the network.",
          dialogue: { speaker: "Mining Expert", text: "How are validators chosen in Proof of Stake?" },
          choices: ["Random selection", "Based on their economic stake", "Government appointment", "Social media popularity"],
          correctChoice: 1,
          explanation: {
            correctAnswer: "Based on their economic stake",
            details: "In Proof of Stake, validators are chosen to propose blocks based on their economic stake in the network. Those with more stake have higher probability of being selected, but selection includes randomness. Validators risk losing their stake if they act maliciously, aligning incentives with network security.",
            keyPoints: [
              "Selection probability proportional to stake amount",
              "Includes controlled randomness to prevent manipulation",
              "Validators risk losing stake for malicious behavior",
              "Much more energy-efficient than Proof of Work"
            ]
          }
        },
        {
          content: "The 51% attack occurs when a single entity controls more than half of the network's mining power, potentially allowing them to manipulate the blockchain.",
          dialogue: { speaker: "Mining Expert", text: "What makes a 51% attack dangerous?" },
          choices: ["It speeds up transactions", "It allows potential manipulation of the blockchain", "It reduces fees", "It improves security"],
          correctChoice: 1,
          explanation: {
            correctAnswer: "It allows potential manipulation of the blockchain",
            details: "A 51% attack enables the attacker to potentially reverse transactions, double-spend coins, and prevent new transactions from confirming. However, they cannot steal existing coins from other wallets or create new coins beyond protocol rules. The attack becomes exponentially more expensive as network hash rate increases.",
            keyPoints: [
              "Can reverse transactions and enable double-spending",
              "Cannot steal coins from other people's wallets",
              "Cannot create coins beyond protocol rules",
              "Becomes extremely expensive on large networks"
            ]
          }
        },
        {
          content: "Halving events reduce block rewards by half at predetermined intervals, controlling the supply of new cryptocurrency entering circulation.",
          dialogue: { speaker: "Mining Expert", text: "What is the purpose of halving events?" },
          choices: ["To make mining easier", "To control cryptocurrency supply", "To speed up transactions", "To reduce network costs"],
          correctChoice: 1,
          explanation: {
            correctAnswer: "To control cryptocurrency supply",
            details: "Halving events are built into Bitcoin's protocol to create digital scarcity. By reducing new supply issuance every four years, Bitcoin approaches its maximum supply of 21 million coins asymptotically. This deflationary mechanism contrasts with traditional fiat currencies that can be printed infinitely.",
            keyPoints: [
              "Reduces new Bitcoin supply entering circulation",
              "Occurs every 210,000 blocks (~4 years)",
              "Creates digital scarcity and deflationary pressure",
              "Ensures Bitcoin approaches 21 million maximum supply"
            ]
          }
        },
        {
          content: "ASIC (Application-Specific Integrated Circuit) miners are specialized hardware designed specifically for cryptocurrency mining, offering superior efficiency.",
          dialogue: { speaker: "Mining Expert", text: "What advantage do ASIC miners have?" },
          choices: ["They use less electricity for the same hash rate", "They're cheaper to buy", "They work without internet", "They mine all cryptocurrencies"],
          correctChoice: 0,
          explanation: {
            correctAnswer: "They use less electricity for the same hash rate",
            details: "ASICs are purpose-built for specific mining algorithms, achieving much higher efficiency than general-purpose hardware. A modern Bitcoin ASIC can be thousands of times more efficient than a CPU or GPU for SHA-256 mining, using far less electricity per hash calculated.",
            keyPoints: [
              "Thousands of times more efficient than CPUs/GPUs",
              "Designed specifically for mining algorithms",
              "Lower electricity costs per unit of hash rate",
              "Cannot be repurposed for other computing tasks"
            ]
          }
        },
        {
          content: "Delegated Proof of Stake allows token holders to vote for delegates who validate transactions on their behalf, combining democracy with efficiency.",
          dialogue: { speaker: "Mining Expert", text: "How does Delegated Proof of Stake work?" },
          choices: ["Everyone mines equally", "Token holders vote for delegates to validate", "Random selection of validators", "Government controls validation"],
          correctChoice: 1,
          explanation: {
            correctAnswer: "Token holders vote for delegates to validate",
            details: "DPoS creates a representative democracy where token holders vote for a limited number of delegates (often 21-101) who validate transactions. This system is more scalable than pure PoS because fewer validators need to coordinate, while still maintaining decentralization through democratic selection.",
            keyPoints: [
              "Token holders vote for limited number of delegates",
              "Delegates validate transactions on voters' behalf",
              "More scalable than pure Proof of Stake",
              "Maintains decentralization through democratic voting"
            ]
          }
        }
      ]
    },
    {
      title: "💰 Bitcoin Fundamentals",
      description: "Dive deep into the world's first cryptocurrency",
      questions: [
        {
          content: "Bitcoin was created by the pseudonymous Satoshi Nakamoto in 2009 as the first successful implementation of a peer-to-peer electronic cash system.",
          dialogue: { speaker: "Bitcoin Historian", text: "What was Bitcoin's primary innovation?" },
          choices: ["Faster internet payments", "First peer-to-peer electronic cash system", "Better user interfaces", "Lower electricity costs"],
          correctChoice: 1,
          explanation: {
            correctAnswer: "First peer-to-peer electronic cash system",
            details: "Bitcoin solved the 'double-spending problem' for digital currency without requiring a trusted third party. Before Bitcoin, digital payments required banks or payment processors to prevent people from spending the same digital money twice. Bitcoin's blockchain enables direct peer-to-peer transactions with mathematical certainty.",
            keyPoints: [
              "Eliminated need for trusted intermediaries in digital payments",
              "Solved the double-spending problem through blockchain",
              "Created the first truly decentralized digital currency",
              "Enabled peer-to-peer value transfer like physical cash"
            ]
          }
        },
        {
          content: "The Bitcoin whitepaper, titled 'Bitcoin: A Peer-to-Peer Electronic Cash System,' outlined the technical design and vision for digital currency.",
          dialogue: { speaker: "Bitcoin Historian", text: "What did the Bitcoin whitepaper propose?" },
          choices: ["A new internet protocol", "A peer-to-peer electronic cash system", "A social media platform", "A search engine"],
          correctChoice: 1,
          explanation: {
            correctAnswer: "A peer-to-peer electronic cash system",
            details: "Satoshi Nakamoto's whitepaper specifically proposed a system for electronic payments that would work directly between parties without requiring financial institutions. The 9-page document outlined how cryptographic proof could replace trust, enabling direct transactions between any two willing parties.",
            keyPoints: [
              "Enables direct payments without financial institutions",
              "Uses cryptographic proof instead of trust",
              "Solves double-spending problem for digital currency",
              "Published October 31, 2008, by Satoshi Nakamoto"
            ]
          }
        },
        {
          content: "UTXO (Unspent Transaction Output) model means Bitcoin doesn't track account balances but rather tracks individual outputs from previous transactions.",
          dialogue: { speaker: "Bitcoin Historian", text: "How does Bitcoin track balances?" },
          choices: ["Through account balances like banks", "Through UTXOs from previous transactions", "Through credit scores", "Through government records"],
          correctChoice: 1,
          explanation: {
            correctAnswer: "Through UTXOs from previous transactions",
            details: "Bitcoin uses a UTXO model where each transaction consumes previous outputs and creates new ones. Your 'balance' is the sum of all UTXOs you can spend with your private keys. This is different from account-based systems where balances are simply numbers that increase or decrease.",
            keyPoints: [
              "No account balances - only unspent transaction outputs",
              "Your balance = sum of UTXOs you can spend",
              "Each transaction consumes inputs and creates outputs",
              "Provides better privacy than account-based systems"
            ]
          }
        },
        {
          content: "Bitcoin addresses are derived from public keys and represent destinations where bitcoins can be sent. They typically start with 1, 3, or bc1.",
          dialogue: { speaker: "Bitcoin Historian", text: "What do Bitcoin addresses represent?" },
          choices: ["User names", "Destinations for sending bitcoins", "Password hints", "Location coordinates"],
          correctChoice: 1,
          explanation: {
            correctAnswer: "Destinations for sending bitcoins",
            details: "Bitcoin addresses are like postal addresses for cryptocurrency - they specify where bitcoins should be sent. Different address formats serve different purposes: Legacy (1...), Script Hash (3...), and Bech32 (bc1...) addresses, each with different features and fee structures.",
            keyPoints: [
              "Destinations for receiving Bitcoin payments",
              "Derived from public keys through hashing",
              "Different formats: Legacy (1), P2SH (3), Bech32 (bc1)",
              "Can generate unlimited addresses from one wallet"
            ]
          }
        },
        {
          content: "The Bitcoin blockchain has a maximum block size limit, which constrains the number of transactions that can be processed per block.",
          dialogue: { speaker: "Bitcoin Historian", text: "What does Bitcoin's block size limit affect?" },
          choices: ["The number of users", "The number of transactions per block", "The price of Bitcoin", "The internet speed"],
          correctChoice: 1,
          explanation: {
            correctAnswer: "The number of transactions per block",
            details: "Bitcoin's 1MB block size limit (4MB with SegWit) constrains transaction throughput to approximately 3-7 transactions per second. This limit was implemented for decentralization - larger blocks would require more bandwidth and storage, potentially excluding smaller nodes from the network.",
            keyPoints: [
              "Limits transactions to ~3-7 per second",
              "1MB base limit, up to 4MB with SegWit",
              "Designed to maintain decentralization",
              "Trade-off between throughput and node accessibility"
            ]
          }
        },
        {
          content: "Lightning Network is a 'layer 2' solution that enables fast, low-cost Bitcoin transactions by creating payment channels between users.",
          dialogue: { speaker: "Bitcoin Historian", text: "What problem does Lightning Network solve?" },
          choices: ["Bitcoin's transaction speed and cost", "Bitcoin's security", "Bitcoin's price volatility", "Bitcoin's energy consumption"],
          correctChoice: 0,
          explanation: {
            correctAnswer: "Bitcoin's transaction speed and cost",
            details: "Lightning Network addresses Bitcoin's scalability limitations by enabling instant, low-cost payments through off-chain payment channels. Users can conduct thousands of transactions off-chain and only settle the final balances on the main Bitcoin blockchain, dramatically improving speed and reducing fees.",
            keyPoints: [
              "Enables instant, low-cost Bitcoin payments",
              "Uses off-chain payment channels",
              "Only final settlements recorded on main chain",
              "Can process millions of transactions per second"
            ]
          }
        },
        {
          content: "Bitcoin's monetary policy is fixed: only 21 million bitcoins will ever exist, with new bitcoins created through mining rewards that halve every four years.",
          dialogue: { speaker: "Bitcoin Historian", text: "What is Bitcoin's maximum supply?" },
          choices: ["100 million", "21 million", "1 billion", "Unlimited"],
          correctChoice: 1,
          explanation: {
            correctAnswer: "21 million",
            details: "Bitcoin's supply is capped at 21 million coins, making it potentially deflationary. This limit is enforced by the protocol itself - no central authority can create more bitcoins. The final bitcoin is expected to be mined around 2140, after which miners will be compensated only through transaction fees.",
            keyPoints: [
              "Hard cap of 21 million bitcoins maximum",
              "No central authority can increase supply",
              "Final bitcoin expected to be mined around 2140",
              "Creates digital scarcity similar to precious metals"
            ]
          }
        },
        {
          content: "Segregated Witness (SegWit) was an upgrade that separated signature data from transaction data, effectively increasing block capacity.",
          dialogue: { speaker: "Bitcoin Historian", text: "What did SegWit accomplish?" },
          choices: ["Increased Bitcoin's price", "Separated signatures to increase capacity", "Added new features", "Changed the consensus algorithm"],
          correctChoice: 1,
          explanation: {
            correctAnswer: "Separated signatures to increase capacity",
            details: "SegWit moved signature data outside the main block, allowing more transactions per block without changing the 1MB base limit. It also fixed transaction malleability, enabled Lightning Network development, and introduced a new address format (Bech32) with lower fees.",
            keyPoints: [
              "Separated signatures from transaction data",
              "Increased effective block capacity to ~4MB",
              "Fixed transaction malleability issue",
              "Enabled Lightning Network development"
            ]
          }
        },
        {
          content: "Bitcoin wallets don't actually store bitcoins; they store private keys that prove ownership of bitcoins recorded on the blockchain.",
          dialogue: { speaker: "Bitcoin Historian", text: "What do Bitcoin wallets actually store?" },
          choices: ["Bitcoin files", "Private keys that prove ownership", "Account numbers", "User photographs"],
          correctChoice: 1,
          explanation: {
            correctAnswer: "Private keys that prove ownership",
            details: "Bitcoin wallets are more like keychains than traditional wallets. They store the private keys that can spend bitcoins recorded on the blockchain. The bitcoins themselves exist only as entries in the blockchain ledger - your wallet simply proves you can spend certain UTXOs.",
            keyPoints: [
              "Store private keys, not actual bitcoins",
              "Private keys prove ownership of blockchain entries",
              "Bitcoins exist only as ledger entries",
              "Multiple wallet types: software, hardware, paper"
            ]
          }
        },
        {
          content: "Bitcoin's pseudonymity means transactions are not directly linked to real-world identities, but all transactions are publicly visible on the blockchain.",
          dialogue: { speaker: "Bitcoin Historian", text: "What does Bitcoin's pseudonymity mean?" },
          choices: ["Complete anonymity", "Transactions not directly linked to real identities", "Government tracks everything", "Only names are hidden"],
          correctChoice: 1,
          explanation: {
            correctAnswer: "Transactions not directly linked to real identities",
            details: "Bitcoin provides pseudonymity, not anonymity. While transactions are public, they're linked to addresses rather than real names. However, through various analysis techniques, transaction patterns can potentially be traced back to individuals, especially when interacting with regulated exchanges.",
            keyPoints: [
              "Addresses aren't directly linked to real identities",
              "All transactions are publicly visible",
              "Analysis can potentially link addresses to individuals",
              "Privacy depends on proper address management"
            ]
          }
        }
      ]
    },
    {
      title: "♦️ Ethereum & Smart Contracts",
      description: "Explore programmable blockchain and decentralized applications",
      questions: [
        {
          content: "Ethereum, proposed by Vitalik Buterin in 2013, introduced the concept of a 'world computer' that can execute smart contracts.",
          dialogue: { speaker: "Ethereum Developer", text: "What was Ethereum's main innovation beyond Bitcoin?" },
          choices: ["Faster transactions", "Programmable smart contracts", "Better user interface", "Lower fees"],
          correctChoice: 1,
          explanation: {
            correctAnswer: "Programmable smart contracts",
            details: "Ethereum's revolutionary innovation was enabling programmable smart contracts on the blockchain. While Bitcoin primarily handles simple transactions, Ethereum created a 'world computer' where developers can build decentralized applications (DApps) with complex logic, automated execution, and trustless interactions.",
            keyPoints: [
              "Introduced programmable smart contracts to blockchain",
              "Created a 'world computer' for decentralized applications",
              "Turing-complete virtual machine for complex logic",
              "Enabled entire ecosystem of DeFi, NFTs, and DAOs"
            ]
          }
        },
        {
          content: "Smart contracts are self-executing contracts with terms directly written into code. They automatically execute when predetermined conditions are met.",
          dialogue: { speaker: "Ethereum Developer", text: "What makes smart contracts 'smart'?" },
          choices: ["They think like humans", "They automatically execute when conditions are met", "They use AI", "They adapt to situations"],
          correctChoice: 1,
          explanation: {
            correctAnswer: "They automatically execute when conditions are met",
            details: "Smart contracts are 'smart' because they automatically execute without human intervention when predefined conditions are met. Like a vending machine that automatically dispenses a product when you insert the right amount of money, smart contracts eliminate the need for intermediaries and manual enforcement of agreements.",
            keyPoints: [
              "Automatically execute when conditions are met",
              "No human intervention or intermediaries needed",
              "Terms written directly in code, not legal language",
              "Immutable once deployed - cannot be changed"
            ]
          }
        },
        {
          content: "The Ethereum Virtual Machine (EVM) is a runtime environment for smart contracts. It's Turing-complete, meaning it can run any computation given enough resources.",
          dialogue: { speaker: "Ethereum Developer", text: "What does 'Turing-complete' mean for the EVM?" },
          choices: ["It's very fast", "It can run any computation given enough resources", "It's completely secure", "It uses less energy"],
          correctChoice: 1,
          explanation: {
            correctAnswer: "It can run any computation given enough resources",
            details: "Turing-completeness means the EVM can theoretically solve any computational problem that any other computer can solve, given unlimited time and memory. This makes Ethereum incredibly flexible for building complex applications, unlike Bitcoin's limited scripting language.",
            keyPoints: [
              "Can execute any algorithm theoretically possible",
              "Enables complex decentralized applications",
              "Gas limits prevent infinite loops in practice",
              "Much more flexible than Bitcoin's scripting"
            ]
          }
        },
        {
          content: "Gas is the unit that measures computational effort required to execute operations. Users pay gas fees to compensate miners for processing transactions.",
          dialogue: { speaker: "Ethereum Developer", text: "What is the purpose of gas in Ethereum?" },
          choices: ["To fuel cars", "To measure and pay for computational effort", "To store data", "To create addresses"],
          correctChoice: 1,
          explanation: {
            correctAnswer: "To measure and pay for computational effort",
            details: "Gas prevents spam and ensures fair resource allocation on Ethereum. Each operation costs gas based on computational complexity. Users set gas prices to incentivize miners, and unused gas is refunded. This system ensures the network remains functional even under high demand.",
            keyPoints: [
              "Measures computational cost of operations",
              "Prevents spam and infinite loops",
              "Users pay miners for processing power",
              "Gas price affects transaction priority"
            ]
          }
        },
        {
          content: "Solidity is the primary programming language for writing smart contracts on Ethereum. It's designed to be similar to JavaScript and C++.",
          dialogue: { speaker: "Ethereum Developer", text: "What is Solidity used for?" },
          choices: ["Building websites", "Writing Ethereum smart contracts", "Creating databases", "Designing user interfaces"],
          correctChoice: 1
        },
        {
          content: "DApps (Decentralized Applications) run on blockchain networks instead of centralized servers, providing censorship resistance and transparency.",
          dialogue: { speaker: "Ethereum Developer", text: "What distinguishes DApps from traditional apps?" },
          choices: ["They're faster", "They run on blockchain networks, not centralized servers", "They cost less", "They have better graphics"],
          correctChoice: 1
        },
        {
          content: "ERC-20 is a technical standard for fungible tokens on Ethereum. It defines a common list of rules that all ERC-20 tokens must follow.",
          dialogue: { speaker: "Ethereum Developer", text: "What does the ERC-20 standard define?" },
          choices: ["Smart contract sizes", "Rules for fungible tokens", "Gas prices", "User interfaces"],
          correctChoice: 1
        },
        {
          content: "ERC-721 is the standard for Non-Fungible Tokens (NFTs), enabling unique digital assets that cannot be replaced or exchanged on a one-to-one basis.",
          dialogue: { speaker: "Ethereum Developer", text: "What makes ERC-721 tokens special?" },
          choices: ["They're very valuable", "Each token is unique and non-fungible", "They're faster to transfer", "They cost less gas"],
          correctChoice: 1
        },
        {
          content: "Ethereum 2.0 transition moved from Proof of Work to Proof of Stake, significantly reducing energy consumption while maintaining security.",
          dialogue: { speaker: "Ethereum Developer", text: "What was the main benefit of Ethereum's transition to Proof of Stake?" },
          choices: ["Higher transaction fees", "Significantly reduced energy consumption", "Faster development", "Better marketing"],
          correctChoice: 1
        },
        {
          content: "Layer 2 solutions like Polygon and Arbitrum process transactions off the main Ethereum chain, then batch them together for lower costs and higher speed.",
          dialogue: { speaker: "Ethereum Developer", text: "How do Layer 2 solutions improve Ethereum?" },
          choices: ["They replace Ethereum completely", "They process transactions off-chain for lower costs", "They increase token prices", "They eliminate smart contracts"],
          correctChoice: 1
        }
      ]
    },
    {
      title: "🏦 DeFi (Decentralized Finance)",
      description: "Learn about the future of financial services",
      questions: [
        {
          content: "DeFi recreates traditional financial services like lending, borrowing, and trading using smart contracts instead of traditional intermediaries.",
          dialogue: { speaker: "DeFi Specialist", text: "What does DeFi aim to replace?" },
          choices: ["All money", "Traditional financial intermediaries", "The internet", "Personal computers"],
          correctChoice: 1,
          explanation: {
            correctAnswer: "Traditional financial intermediaries",
            details: "DeFi aims to replace banks, brokers, insurance companies, and other financial intermediaries with smart contracts. Instead of trusting institutions, users interact directly with transparent, programmable protocols. This reduces costs, increases accessibility, and eliminates single points of failure in financial services.",
            keyPoints: [
              "Replaces banks, brokers, and financial institutions",
              "Uses smart contracts instead of human intermediaries",
              "Provides 24/7 global access to financial services",
              "Transparent, programmable, and permissionless"
            ]
          }
        },
        {
          content: "Automated Market Makers (AMMs) like Uniswap use mathematical formulas instead of order books to price assets and enable trading.",
          dialogue: { speaker: "DeFi Specialist", text: "How do AMMs price assets?" },
          choices: ["Through government regulation", "Using mathematical formulas", "Based on popularity", "Random selection"],
          correctChoice: 1
        },
        {
          content: "Liquidity pools are collections of tokens locked in smart contracts that provide liquidity for decentralized exchanges and earn fees for providers.",
          dialogue: { speaker: "DeFi Specialist", text: "What is the purpose of liquidity pools?" },
          choices: ["To store personal savings", "To provide liquidity for trading and earn fees", "To hide transactions", "To speed up internet"],
          correctChoice: 1
        },
        {
          content: "Yield farming involves providing liquidity to DeFi protocols in exchange for rewards, often in the form of governance tokens.",
          dialogue: { speaker: "DeFi Specialist", text: "What do yield farmers receive as rewards?" },
          choices: ["Cash only", "Often governance tokens and fees", "Physical goods", "Government benefits"],
          correctChoice: 1
        },
        {
          content: "Impermanent loss occurs when the price ratio of tokens in a liquidity pool changes compared to holding the tokens separately.",
          dialogue: { speaker: "DeFi Specialist", text: "When does impermanent loss occur?" },
          choices: ["When tokens are stolen", "When price ratios in pools change", "When gas fees are high", "When networks are slow"],
          correctChoice: 1
        },
        {
          content: "Flash loans allow users to borrow large amounts without collateral, provided the loan is repaid within the same transaction block.",
          dialogue: { speaker: "DeFi Specialist", text: "What makes flash loans unique?" },
          choices: ["They're very slow", "No collateral needed if repaid in same transaction", "They require government approval", "They only work offline"],
          correctChoice: 1
        },
        {
          content: "Governance tokens give holders voting rights on protocol changes and improvements, enabling decentralized decision-making.",
          dialogue: { speaker: "DeFi Specialist", text: "What do governance tokens provide?" },
          choices: ["Higher transaction speeds", "Voting rights on protocol decisions", "Free transactions", "Better user interfaces"],
          correctChoice: 1
        },
        {
          content: "Composability in DeFi means protocols can be combined like building blocks, creating complex financial products from simple components.",
          dialogue: { speaker: "DeFi Specialist", text: "What does composability enable in DeFi?" },
          choices: ["Faster computers", "Combining protocols like building blocks", "Better graphics", "Cheaper electricity"],
          correctChoice: 1
        },
        {
          content: "Total Value Locked (TVL) measures the total amount of assets deposited in DeFi protocols, indicating the ecosystem's growth and adoption.",
          dialogue: { speaker: "DeFi Specialist", text: "What does TVL measure in DeFi?" },
          choices: ["Transaction speed", "Total assets deposited in protocols", "Number of users", "Energy consumption"],
          correctChoice: 1
        },
        {
          content: "Slippage occurs when the actual price of a trade differs from the expected price due to market movement during transaction execution.",
          dialogue: { speaker: "DeFi Specialist", text: "What causes slippage in trading?" },
          choices: ["Slow internet", "Market movement during transaction execution", "High gas fees", "Bad weather"],
          correctChoice: 1
        }
      ]
    },
    {
      title: "🎨 NFTs & Digital Ownership",
      description: "Understand non-fungible tokens and digital asset ownership",
      questions: [
        {
          content: "Non-Fungible Tokens (NFTs) are unique digital assets that represent ownership of specific items, unlike cryptocurrencies where each unit is identical.",
          dialogue: { speaker: "NFT Curator", text: "What makes NFTs different from regular cryptocurrencies?" },
          choices: ["They're more expensive", "Each NFT is unique and non-interchangeable", "They use less energy", "They're government-backed"],
          correctChoice: 1,
          explanation: {
            correctAnswer: "Each NFT is unique and non-interchangeable",
            details: "NFTs are non-fungible, meaning each token is unique and cannot be exchanged on a one-to-one basis like cryptocurrencies. While one Bitcoin equals any other Bitcoin, each NFT has distinct properties, metadata, and value. This uniqueness enables digital ownership of art, collectibles, and other unique items.",
            keyPoints: [
              "Each NFT is unique with distinct properties",
              "Cannot be exchanged equally like cryptocurrencies",
              "Enables ownership of unique digital items",
              "Metadata defines the NFT's characteristics"
            ]
          }
        },
        {
          content: "NFT metadata contains information about the digital asset, including its properties, image, and attributes, often stored off-chain for efficiency.",
          dialogue: { speaker: "NFT Curator", text: "What does NFT metadata contain?" },
          choices: ["Only the price", "Information about the asset's properties and attributes", "User passwords", "Network addresses"],
          correctChoice: 1
        },
        {
          content: "Digital ownership through NFTs doesn't necessarily grant copyright ownership, but rather proves ownership of a specific digital certificate or token.",
          dialogue: { speaker: "NFT Curator", text: "What does owning an NFT typically prove?" },
          choices: ["Complete copyright ownership", "Ownership of a specific digital certificate/token", "Physical ownership", "Government licensing"],
          correctChoice: 1
        },
        {
          content: "NFT marketplaces like OpenSea, Rarible, and Foundation provide platforms for creating, buying, selling, and trading non-fungible tokens.",
          dialogue: { speaker: "NFT Curator", text: "What do NFT marketplaces facilitate?" },
          choices: ["Only viewing NFTs", "Creating, buying, selling, and trading NFTs", "Mining cryptocurrencies", "Web browsing"],
          correctChoice: 1
        },
        {
          content: "Minting an NFT means creating and recording a new token on the blockchain, establishing provable ownership and authenticity.",
          dialogue: { speaker: "NFT Curator", text: "What does minting an NFT accomplish?" },
          choices: ["Deletes the original file", "Creates and records a new token on blockchain", "Copies someone else's work", "Reduces file size"],
          correctChoice: 1
        },
        {
          content: "Utility NFTs provide holders with additional benefits beyond ownership, such as access to exclusive content, events, or services.",
          dialogue: { speaker: "NFT Curator", text: "What do utility NFTs provide beyond basic ownership?" },
          choices: ["Nothing extra", "Additional benefits like exclusive access", "Higher prices", "Better storage"],
          correctChoice: 1
        },
        {
          content: "Royalties in NFTs allow original creators to earn a percentage of future sales, providing ongoing revenue streams from their work.",
          dialogue: { speaker: "NFT Curator", text: "How do NFT royalties benefit creators?" },
          choices: ["One-time payment only", "Ongoing revenue from future sales", "Free marketing", "Legal protection"],
          correctChoice: 1
        },
        {
          content: "Profile Picture (PFP) NFTs like CryptoPunks and Bored Apes became popular as digital identity symbols and community membership tokens.",
          dialogue: { speaker: "NFT Curator", text: "Why did PFP NFTs become popular?" },
          choices: ["They're cheap", "As digital identity symbols and community membership", "Government promotion", "Technical superiority"],
          correctChoice: 1
        },
        {
          content: "Generative art NFTs use algorithms to create unique artworks, with traits and rarity often determining their value in the marketplace.",
          dialogue: { speaker: "NFT Curator", text: "How are generative art NFTs created?" },
          choices: ["Hand-drawn by artists", "Using algorithms to create unique artworks", "Copying existing art", "Random selection"],
          correctChoice: 1
        },
        {
          content: "Cross-chain NFTs can exist and be transferred across multiple blockchain networks, increasing interoperability and utility.",
          dialogue: { speaker: "NFT Curator", text: "What advantage do cross-chain NFTs offer?" },
          choices: ["Lower prices", "Ability to exist across multiple blockchains", "Faster creation", "Better graphics"],
          correctChoice: 1
        }
      ]
    },
    {
      title: "🔗 Interoperability & Scaling",
      description: "Explore how blockchains connect and scale",
      questions: [
        {
          content: "Blockchain interoperability allows different blockchain networks to communicate and share information, creating a connected ecosystem.",
          dialogue: { speaker: "Bridge Engineer", text: "What does blockchain interoperability enable?" },
          choices: ["Faster mining", "Different blockchains to communicate", "Lower prices", "Better graphics"],
          correctChoice: 1
        },
        {
          content: "Cross-chain bridges enable the transfer of tokens and data between different blockchain networks, expanding functionality and liquidity.",
          dialogue: { speaker: "Bridge Engineer", text: "What do cross-chain bridges facilitate?" },
          choices: ["Only data storage", "Transfer of tokens and data between blockchains", "Internet browsing", "Email communication"],
          correctChoice: 1
        },
        {
          content: "Layer 2 scaling solutions process transactions off the main blockchain, then batch them together for submission to reduce costs and increase speed.",
          dialogue: { speaker: "Bridge Engineer", text: "How do Layer 2 solutions improve blockchain performance?" },
          choices: ["By replacing the main chain", "By processing transactions off-chain then batching", "By increasing fees", "By reducing security"],
          correctChoice: 1
        },
        {
          content: "Sidechains are separate blockchains that run parallel to the main chain, connected through two-way pegs that allow asset transfers.",
          dialogue: { speaker: "Bridge Engineer", text: "How are sidechains connected to main chains?" },
          choices: ["They're completely separate", "Through two-way pegs allowing transfers", "Only through internet", "By government regulation"],
          correctChoice: 1
        },
        {
          content: "State channels allow participants to conduct multiple off-chain transactions, only recording the opening and closing states on the main blockchain.",
          dialogue: { speaker: "Bridge Engineer", text: "What do state channels record on the main blockchain?" },
          choices: ["Every single transaction", "Only opening and closing states", "User identities", "Network statistics"],
          correctChoice: 1
        },
        {
          content: "Sharding divides the blockchain into smaller, parallel chains called shards, each processing different transactions to increase overall throughput.",
          dialogue: { speaker: "Bridge Engineer", text: "How does sharding improve blockchain performance?" },
          choices: ["By making blocks larger", "By dividing into parallel chains processing different transactions", "By reducing security", "By eliminating mining"],
          correctChoice: 1
        },
        {
          content: "Atomic swaps enable the exchange of cryptocurrencies between different blockchains without requiring trusted intermediaries or exchanges.",
          dialogue: { speaker: "Bridge Engineer", text: "What makes atomic swaps trustless?" },
          choices: ["Government backing", "They don't require trusted intermediaries", "Higher fees", "Slower processing"],
          correctChoice: 1
        },
        {
          content: "Polkadot's parachain architecture allows multiple specialized blockchains to operate in parallel while sharing security and interoperability.",
          dialogue: { speaker: "Bridge Engineer", text: "What do Polkadot's parachains share?" },
          choices: ["Only data", "Security and interoperability", "User accounts", "Mining rewards"],
          correctChoice: 1
        },
        {
          content: "Cosmos uses the Inter-Blockchain Communication (IBC) protocol to enable secure communication and asset transfers between independent blockchains.",
          dialogue: { speaker: "Bridge Engineer", text: "What does Cosmos' IBC protocol enable?" },
          choices: ["Faster mining", "Secure communication between independent blockchains", "Lower electricity costs", "Better user interfaces"],
          correctChoice: 1
        },
        {
          content: "Wrapped tokens represent assets from one blockchain on another blockchain, maintaining 1:1 backing while enabling cross-chain functionality.",
          dialogue: { speaker: "Bridge Engineer", text: "What maintains the value of wrapped tokens?" },
          choices: ["Government promises", "1:1 backing with original assets", "Market speculation", "Mining rewards"],
          correctChoice: 1
        }
      ]
    },
    {
      title: "🏛️ Governance & DAOs",
      description: "Learn about decentralized autonomous organizations",
      questions: [
        {
          content: "Decentralized Autonomous Organizations (DAOs) use smart contracts and token-based voting to make collective decisions without traditional management.",
          dialogue: { speaker: "DAO Coordinator", text: "How do DAOs make decisions?" },
          choices: ["Through CEOs", "Through token-based voting and smart contracts", "Government oversight", "Random selection"],
          correctChoice: 1
        },
        {
          content: "Governance tokens give holders the right to vote on proposals, protocol changes, and resource allocation within decentralized organizations.",
          dialogue: { speaker: "DAO Coordinator", text: "What rights do governance tokens provide?" },
          choices: ["Only trading rights", "Voting rights on proposals and protocol changes", "Employment guarantees", "Free products"],
          correctChoice: 1
        },
        {
          content: "Proposal systems in DAOs allow community members to suggest changes, improvements, or new initiatives that token holders can vote on.",
          dialogue: { speaker: "DAO Coordinator", text: "Who can typically make proposals in DAOs?" },
          choices: ["Only founders", "Community members (often token holders)", "Government officials", "External consultants only"],
          correctChoice: 1
        },
        {
          content: "Quadratic voting gives more weight to preferences than to resources, helping prevent wealthy holders from completely dominating governance decisions.",
          dialogue: { speaker: "DAO Coordinator", text: "What problem does quadratic voting help solve?" },
          choices: ["Slow voting", "Wealthy holders dominating decisions", "Technical complexity", "High gas fees"],
          correctChoice: 1
        },
        {
          content: "Multi-signature (multisig) wallets require multiple signatures to execute transactions, providing security and distributed control over DAO treasuries.",
          dialogue: { speaker: "DAO Coordinator", text: "Why do DAOs use multisig wallets for treasuries?" },
          choices: ["They're cheaper", "For security and distributed control", "Government requirements", "Better user interface"],
          correctChoice: 1
        },
        {
          content: "Treasury management in DAOs involves collectively deciding how to allocate and invest the organization's funds for long-term sustainability.",
          dialogue: { speaker: "DAO Coordinator", text: "What is the goal of DAO treasury management?" },
          choices: ["Maximizing short-term profits", "Long-term sustainability through collective allocation decisions", "Reducing taxes", "Hiring more employees"],
          correctChoice: 1
        },
        {
          content: "Delegate voting allows token holders to assign their voting power to trusted community members who actively participate in governance discussions.",
          dialogue: { speaker: "DAO Coordinator", text: "What does delegate voting allow?" },
          choices: ["Selling votes for money", "Assigning voting power to trusted active members", "Eliminating all voting", "Government control"],
          correctChoice: 1
        },
        {
          content: "Snapshot is a popular off-chain voting platform that allows DAOs to conduct governance votes without paying gas fees for each vote.",
          dialogue: { speaker: "DAO Coordinator", text: "What advantage does off-chain voting provide?" },
          choices: ["Higher security", "Avoiding gas fees for voting", "Faster computers", "Better graphics"],
          correctChoice: 1
        },
        {
          content: "Rage quitting allows DAO members to exit the organization and claim their proportional share of assets if they disagree with governance decisions.",
          dialogue: { speaker: "DAO Coordinator", text: "What does rage quitting allow in DAOs?" },
          choices: ["Stealing assets", "Exiting and claiming proportional share if disagreeing", "Deleting the DAO", "Changing all votes"],
          correctChoice: 1
        },
        {
          content: "Legal wrappers help DAOs operate within existing legal frameworks while maintaining decentralized governance and blockchain-based operations.",
          dialogue: { speaker: "DAO Coordinator", text: "Why might DAOs use legal wrappers?" },
          choices: ["To avoid taxes completely", "To operate within existing legal frameworks", "To increase profits", "To eliminate governance"],
          correctChoice: 1
        }
      ]
    },
    {
      title: "🌐 Web3 & The Future",
      description: "Explore the decentralized web and emerging trends",
      questions: [
        {
          content: "Web3 represents a decentralized internet where users own their data, identity, and digital assets without relying on centralized platforms.",
          dialogue: { speaker: "Web3 Visionary", text: "What is the core promise of Web3?" },
          choices: ["Faster internet speeds", "User ownership of data and digital assets", "Cheaper computers", "Better video quality"],
          correctChoice: 1
        },
        {
          content: "Decentralized storage solutions like IPFS distribute files across multiple nodes, providing censorship resistance and eliminating single points of failure.",
          dialogue: { speaker: "Web3 Visionary", text: "What advantage does decentralized storage provide?" },
          choices: ["Cheaper storage costs", "Censorship resistance and no single points of failure", "Faster upload speeds", "Better file compression"],
          correctChoice: 1
        },
        {
          content: "Self-sovereign identity allows individuals to own and control their digital identity without relying on centralized authorities or platforms.",
          dialogue: { speaker: "Web3 Visionary", text: "What does self-sovereign identity eliminate the need for?" },
          choices: ["Internet connectivity", "Centralized authorities controlling identity", "Personal computers", "Digital devices"],
          correctChoice: 1
        },
        {
          content: "Decentralized social media platforms give users control over their content and social graphs, preventing platform lock-in and censorship.",
          dialogue: { speaker: "Web3 Visionary", text: "How do decentralized social platforms differ from traditional ones?" },
          choices: ["They have better graphics", "Users control content and avoid platform lock-in", "They're always free", "They require less internet"],
          correctChoice: 1
        },
        {
          content: "The metaverse combines virtual reality, blockchain, and digital ownership to create immersive digital worlds where users can own virtual assets.",
          dialogue: { speaker: "Web3 Visionary", text: "What technologies combine to create the metaverse vision?" },
          choices: ["Only virtual reality", "VR, blockchain, and digital ownership", "Just better graphics", "Only faster internet"],
          correctChoice: 1
        },
        {
          content: "Play-to-earn gaming models allow players to earn real value through gameplay, often through NFTs and cryptocurrency rewards.",
          dialogue: { speaker: "Web3 Visionary", text: "How do play-to-earn games create value for players?" },
          choices: ["Only through entertainment", "Through NFTs and cryptocurrency rewards", "By selling game copies", "Through advertising revenue"],
          correctChoice: 1
        },
        {
          content: "Decentralized Autonomous Organizations (DAOs) could evolve into new forms of governance for digital communities, cities, and even nations.",
          dialogue: { speaker: "Web3 Visionary", text: "What could DAOs potentially govern in the future?" },
          choices: ["Only small projects", "Digital communities, cities, and potentially nations", "Just financial decisions", "Only technical systems"],
          correctChoice: 1
        },
        {
          content: "Carbon-neutral and sustainable blockchain technologies are being developed to address environmental concerns while maintaining security and decentralization.",
          dialogue: { speaker: "Web3 Visionary", text: "Why are sustainable blockchain technologies important?" },
          choices: ["They're cheaper to operate", "To address environmental concerns", "They're faster", "They have better user interfaces"],
          correctChoice: 1
        },
        {
          content: "Central Bank Digital Currencies (CBDCs) represent government-issued digital currencies that could coexist with or compete against decentralized cryptocurrencies.",
          dialogue: { speaker: "Web3 Visionary", text: "What are CBDCs?" },
          choices: ["Private company coins", "Government-issued digital currencies", "Gaming tokens", "Social media points"],
          correctChoice: 1
        },
        {
          content: "The convergence of AI and blockchain could enable new forms of automated decision-making, resource allocation, and value creation in decentralized systems.",
          dialogue: { speaker: "Web3 Visionary", text: "What could AI and blockchain convergence enable?" },
          choices: ["Just faster computers", "Automated decision-making and value creation", "Only better graphics", "Reduced internet costs"],
          correctChoice: 1
        }
      ]
    }
  ];

  const currentStory = storyChapters[currentChapter];
  const currentQuestionData = currentStory.questions[currentQuestion];
  const chapterProgress = (currentQuestion / currentStory.questions.length) * 100;
  const totalProgress = ((currentChapter * 10 + currentQuestion) / 100) * 100;

  const handleChoiceSelect = (choiceIndex) => {
    setSelectedChoice(choiceIndex);
    
    // Update chapter scores
    const chapterKey = `chapter-${currentChapter}`;
    const isCorrect = choiceIndex === currentQuestionData.correctChoice;
    
    setChapterScores(prev => ({
      ...prev,
      [chapterKey]: {
        ...prev[chapterKey],
        [`question-${currentQuestion}`]: isCorrect
      }
    }));
    
    // Award 1 point for each question attempt (correct or incorrect)
    const newTotalPoints = totalPoints + 1;
    setTotalPoints(newTotalPoints);

    // Award points to the global system (only for correct answers)
    if (addPoints && isCorrect) {
      const questionPoints = 5; // Points for correct answers
      const chapterKey = `chapter${currentChapter + 1}`; // chapter1, chapter2, etc.
      addPoints('storyMode', chapterKey, questionPoints);
      console.log(`✅ Correct answer in Chapter ${currentChapter + 1}! Awarded ${questionPoints} points.`);
    }
    
    // Check for milestones and show appropriate animation
    let animation = isCorrect ? '+1 Point! ✅' : '+1 Point! 📚';
    
    // Milestone celebrations
    if (newTotalPoints === 10) animation = '🎉 10 Points Milestone!';
    else if (newTotalPoints === 25) animation = '🌟 25 Points Achievement!';
    else if (newTotalPoints === 50) animation = '🚀 50 Points Mastery!';
    else if (newTotalPoints === 75) animation = '💎 75 Points Expert!';
    else if (newTotalPoints === 100) animation = '👑 100 Points Champion!';
    else if (newTotalPoints % 20 === 0 && newTotalPoints > 100) animation = `🔥 ${newTotalPoints} Points Streak!`;
    
    setAnimationText(animation);
    setShowPointsAnimation(true);
    setTimeout(() => setShowPointsAnimation(false), 2000);
    
    // Update user progress
    const newProgress = { ...userProgress };
    newProgress.totalProgress = (newProgress.totalProgress || 0) + 1;
    if (isCorrect) {
      newProgress.correctAnswers = (newProgress.correctAnswers || 0) + 1;
    }
    setUserProgress(newProgress);
  };

  const handleNext = () => {
    if (currentQuestion < currentStory.questions.length - 1) {
      // Next question in current chapter
      setCurrentQuestion(currentQuestion + 1);
      setSelectedChoice(null);
    } else if (currentChapter < storyChapters.length - 1) {
      // Chapter completed! Award points before moving to next chapter
      if (addPoints) {
        const chapterPoints = 50; // Points for completing a chapter
        const chapterKey = `chapter${currentChapter + 1}`; // chapter1, chapter2, etc.
        addPoints('storyMode', chapterKey, chapterPoints);
        console.log(`📖 Chapter ${currentChapter + 1} completed! Awarded ${chapterPoints} points.`);
      }

      // Next chapter
      setCurrentChapter(currentChapter + 1);
      setCurrentQuestion(0);
      setSelectedChoice(null);
    } else {
      // Final chapter completed!
      if (addPoints) {
        const finalChapterPoints = 75; // Extra points for final chapter
        const finalChapterKey = `chapter${currentChapter + 1}`;
        addPoints('storyMode', finalChapterKey, finalChapterPoints);
        console.log(`🏆 Final chapter (${currentChapter + 1}) completed! Awarded ${finalChapterPoints} points.`);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      // Previous question in current chapter
      setCurrentQuestion(currentQuestion - 1);
      setSelectedChoice(null);
    } else if (currentChapter > 0) {
      // Previous chapter (go to last question)
      setCurrentChapter(currentChapter - 1);
      setCurrentQuestion(storyChapters[currentChapter - 1].questions.length - 1);
      setSelectedChoice(null);
    }
  };

  const handleChapterSelect = (chapterIndex) => {
    setCurrentChapter(parseInt(chapterIndex));
    setCurrentQuestion(0);
    setSelectedChoice(null);
  };

  const getChapterScore = (chapterIndex) => {
    const chapterKey = `chapter-${chapterIndex}`;
    const chapterData = chapterScores[chapterKey];
    if (!chapterData) return 0;
    
    const correct = Object.values(chapterData).filter(Boolean).length;
    return correct;
  };

  const getTotalCorrectAnswers = () => {
    let total = 0;
    Object.values(chapterScores).forEach(chapterData => {
      total += Object.values(chapterData).filter(Boolean).length;
    });
    return total;
  };

  const getTotalQuestionsAnswered = () => {
    let total = 0;
    Object.values(chapterScores).forEach(chapterData => {
      total += Object.keys(chapterData).length;
    });
    return total;
  };

  const getAccuracyPercentage = () => {
    const total = getTotalQuestionsAnswered();
    const correct = getTotalCorrectAnswers();
    return total > 0 ? Math.round((correct / total) * 100) : 0;
  };

  const getChapterProgress = (chapterIndex) => {
    const chapterKey = `chapter-${chapterIndex}`;
    const chapterData = chapterScores[chapterKey];
    if (!chapterData) return 0;
    
    const answered = Object.keys(chapterData).length;
    return Math.round((answered / 10) * 100); // 10 questions per chapter
  };

  return (
    <StoryContainer>
      <MainContentWrapper>
        {/* Questions Container */}
        <QuestionsContainer>
          <StoryHeader>
        <ChapterSelector>
          <div style={{ color: '#10b981', fontWeight: 'bold' }}>Select Chapter:</div>
          <ChapterDropdown value={currentChapter} onChange={(e) => handleChapterSelect(e.target.value)}>
            {storyChapters.map((chapter, index) => (
              <option key={index} value={index}>
                Chapter {index + 1}: {chapter.title} ({getChapterScore(index)}/10)
              </option>
            ))}
          </ChapterDropdown>
        </ChapterSelector>
        
        <ChapterTitle>
          {currentStory.title}
        </ChapterTitle>
        
        <QuestionCounter>
          Question {currentQuestion + 1} of {currentStory.questions.length} • Chapter {currentChapter + 1} of {storyChapters.length}
        </QuestionCounter>
        
        <div style={{ color: '#64748b', fontSize: '13px', marginBottom: '10px' }}>
          {currentStory.description}
        </div>
        
        <StoryProgress>
          <ProgressBar progress={chapterProgress} />
        </StoryProgress>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
          <span>Chapter Progress: {Math.round(chapterProgress)}%</span>
          <span>Total Progress: {Math.round(totalProgress)}%</span>
        </div>
      </StoryHeader>

      <StoryContent>
        <StoryText>{currentQuestionData.content}</StoryText>
        
        <CharacterDialogue>
          <Speaker>{currentQuestionData.dialogue.speaker}:</Speaker>
          <div>{currentQuestionData.dialogue.text}</div>
        </CharacterDialogue>

        <ChoiceContainer>
          {currentQuestionData.choices.map((choice, index) => (
            <ChoiceButton
              key={index}
              onClick={() => handleChoiceSelect(index)}
              style={{
                background: selectedChoice === index 
                  ? (index === currentQuestionData.correctChoice 
                     ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.5), rgba(34, 197, 94, 0.5))'
                     : 'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(220, 38, 38, 0.3))')
                  : undefined
              }}
            >
              {choice}
              {selectedChoice === index && index === currentQuestionData.correctChoice && " ✅"}
              {selectedChoice === index && index !== currentQuestionData.correctChoice && " ❌"}
            </ChoiceButton>
          ))}
          
          {selectedChoice !== null && currentQuestionData.explanation && (
            <ExplanationContainer isCorrect={selectedChoice === currentQuestionData.correctChoice}>
              <ExplanationHeader isCorrect={selectedChoice === currentQuestionData.correctChoice}>
                {selectedChoice === currentQuestionData.correctChoice ? '🎉 Correct!' : '📚 Learning Opportunity'}
                {selectedChoice !== currentQuestionData.correctChoice && (
                  <span style={{ fontSize: '14px', fontWeight: 'normal' }}>
                    - Let's learn from this!
                  </span>
                )}
              </ExplanationHeader>
              
              {selectedChoice !== currentQuestionData.correctChoice && (
                <CorrectAnswerText>
                  ✅ Correct Answer: {currentQuestionData.explanation.correctAnswer}
                </CorrectAnswerText>
              )}
              
              <ExplanationText>
                {currentQuestionData.explanation.details}
              </ExplanationText>
              
              {currentQuestionData.explanation.keyPoints && currentQuestionData.explanation.keyPoints.length > 0 && (
                <>
                  <div style={{ color: '#10b981', fontWeight: '600', marginTop: '12px', fontSize: '14px' }}>
                    🔑 Key Points:
                  </div>
                  <KeyPointsList>
                    {currentQuestionData.explanation.keyPoints.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </KeyPointsList>
                </>
              )}
            </ExplanationContainer>
          )}
        </ChoiceContainer>
      </StoryContent>

      <NavigationButtons>
        <NavButton 
          onClick={handlePrevious} 
          disabled={currentChapter === 0 && currentQuestion === 0}
        >
          ← Previous
        </NavButton>
        <NavButton 
          onClick={handleNext} 
          disabled={(currentChapter === storyChapters.length - 1 && currentQuestion === currentStory.questions.length - 1) || selectedChoice === null}
        >
          {currentQuestion < currentStory.questions.length - 1 ? 'Next Question →' : 
           currentChapter < storyChapters.length - 1 ? 'Next Chapter →' : 'Complete! 🎉'}
        </NavButton>
      </NavigationButtons>

          {/* Points Animation */}
          {showPointsAnimation && (
            <PointsAnimation>
              {animationText}
            </PointsAnimation>
          )}
        </QuestionsContainer>

        {/* Dashboard Container */}
        <DashboardContainer>
          <DashboardToggle onClick={() => setShowDashboard(!showDashboard)}>
            {showDashboard ? '📊 Hide Dashboard' : '📊 Show Dashboard'}
          </DashboardToggle>

          <PointsDashboard show={showDashboard}>
            <DashboardTitle>
              🏆 Learning Dashboard
            </DashboardTitle>
            
            <PointsContainer>
              <PointsLabel>Total Points Earned</PointsLabel>
              <PointsValue>{totalPoints}</PointsValue>
            </PointsContainer>
            
            <StatsGrid>
              <StatBox>
                <StatValue>{getTotalCorrectAnswers()}</StatValue>
                <StatLabel>Correct</StatLabel>
              </StatBox>
              <StatBox>
                <StatValue>{getTotalQuestionsAnswered()}</StatValue>
                <StatLabel>Answered</StatLabel>
              </StatBox>
              <StatBox>
                <StatValue>{getAccuracyPercentage()}%</StatValue>
                <StatLabel>Accuracy</StatLabel>
              </StatBox>
              <StatBox>
                <StatValue>{Object.keys(chapterScores).length}</StatValue>
                <StatLabel>Chapters</StatLabel>
              </StatBox>
            </StatsGrid>

            <ChapterProgressList>
              {storyChapters.map((chapter, index) => (
                <ChapterProgressItem key={index}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {getChapterProgress(index) === 100 && <span style={{ color: '#fbbf24' }}>🏅</span>}
                    Ch{index + 1}: {chapter.title.replace(/🏗️|🔐|⛏️|💰|♦️|🏦|🎨|🔗|🏛️|🌐/g, '').trim()}
                  </span>
                  <span style={{ color: getChapterProgress(index) === 100 ? '#10b981' : '#64748b' }}>
                    {getChapterScore(index)}/10 ({getChapterProgress(index)}%)
                  </span>
                </ChapterProgressItem>
              ))}
            </ChapterProgressList>
            
            {totalPoints > 0 && (
              <button
                onClick={() => {
                  setTotalPoints(0);
                  setChapterScores({});
                  setCurrentChapter(0);
                  setCurrentQuestion(0);
                  setSelectedChoice(null);
                }}
                style={{
                  width: '100%',
                  padding: '8px',
                  marginTop: '12px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '6px',
                  color: '#ef4444',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.3)'}
                onMouseOut={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.2)'}
              >
                🔄 Reset Progress
              </button>
            )}
          </PointsDashboard>
        </DashboardContainer>
      </MainContentWrapper>
    </StoryContainer>
  );
};

export default StoryModeLearning;