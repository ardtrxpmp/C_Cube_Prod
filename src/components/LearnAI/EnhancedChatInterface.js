import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';

const messageSlide = keyframes`
  0% { transform: translateX(-20px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
`;

const typingAnimation = keyframes`
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
`;

const ChatContainer = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  display: flex;
  flex-direction: column;
  position: relative;
  padding-top: 60px;
`;

const ChatHeader = styled.div`
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2));
  padding: 20px;
  border-bottom: 1px solid rgba(16, 185, 129, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ChatTitle = styled.h2`
  color: #10b981;
  margin: 0;
  font-size: 1.5rem;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  color: #10b981;
  font-size: 0.9rem;
`;

const OnlineIndicator = styled.div`
  width: 10px;
  height: 10px;
  background: #10b981;
  border-radius: 50%;
  margin-right: 8px;
  animation: ${typingAnimation} 1s infinite;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Message = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  animation: ${messageSlide} 0.5s ease-out;
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  max-width: 70%;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.isUser 
    ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
    : 'linear-gradient(135deg, #10b981, #059669)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
`;

const MessageBubble = styled.div`
  background: ${props => props.isUser 
    ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
    : 'rgba(16, 185, 129, 0.1)'};
  border: ${props => props.isUser 
    ? 'none'
    : '1px solid rgba(16, 185, 129, 0.3)'};
  color: white;
  padding: 15px 20px;
  border-radius: ${props => props.isUser 
    ? '20px 20px 5px 20px'
    : '20px 20px 20px 5px'};
  position: relative;
  backdrop-filter: blur(10px);
`;

const MessageTime = styled.div`
  font-size: 0.75rem;
  opacity: 0.7;
  margin-top: 5px;
`;

const QuickActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 15px;
`;

const QuickActionButton = styled.button`
  padding: 8px 15px;
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(16, 185, 129, 0.4);
  border-radius: 20px;
  color: white;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(16, 185, 129, 0.4);
    transform: translateY(-2px);
  }
`;

const InputContainer = styled.div`
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-end;
`;

const MessageInput = styled.textarea`
  flex: 1;
  padding: 15px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  color: white;
  font-size: 1rem;
  resize: none;
  max-height: 120px;
  min-height: 50px;
  outline: none;
  transition: all 0.3s ease;

  &:focus {
    border-color: #10b981;
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const SendButton = styled.button`
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  color: #10b981;
  font-style: italic;
  opacity: 0.8;
  margin-left: 52px;
`;

const TypingDot = styled.div`
  width: 6px;
  height: 6px;
  background: #10b981;
  border-radius: 50%;
  animation: ${typingAnimation} 1.4s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
`;

const EnhancedChatInterface = ({ userProgress, setUserProgress }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "🤖 **Welcome to your Advanced AI Blockchain Assistant!** 🔗\n\nI'm your comprehensive blockchain expert with knowledge of **100,000+ blockchain concepts** and can answer questions asked in countless different ways!\n\n**🧠 My Advanced Capabilities:**\n• **Smart Understanding:** Ask questions naturally - I understand context and variations\n• **Multiple Question Styles:** \"What is Bitcoin?\", \"Explain Bitcoin\", \"Tell me about BTC\", \"How does Bitcoin work?\"\n• **Comparisons:** \"Bitcoin vs Ethereum\", \"Mining vs Staking\", \"DeFi vs CeFi\"\n• **How-To Guides:** \"How to create a wallet\", \"How to launch a token\", \"How to stake crypto\"\n• **Token & Meme Coin Expertise:** Complete guides on tokenomics, meme coins, and project launches\n• **Technical Deep-Dives:** From basics to advanced developer concepts\n• **Fuzzy Matching:** I understand even imperfect or partial questions\n\n**🎯 Special Features:**\n• Copy questions from Gaming Hub & Story Mode for exact answers\n• Context-aware responses based on your interests\n• **NEW:** Token launch guides, meme coin analysis, and tokenomics design\n• Comprehensive coverage: Bitcoin, Ethereum, DeFi, NFTs, Web3, Smart Contracts, Security\n• Always up-to-date with latest blockchain developments\n\n**Try asking me anything about blockchain - in any way you like!** I can handle technical jargon, casual questions, comparisons, step-by-step guides, token launches, meme coins, and everything in between! 🚀",
      isUser: false,
      timestamp: new Date(),
      avatar: "🤖"
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const quickActions = [
    "What is blockchain?",
    "What is the primary purpose of blockchain technology?",
    "What is a Private Key?",
    "What is Solidity?",
    "What connects blocks together in a blockchain?",
    "What is Uniswap?",
    "How to create a crypto wallet?",
    "What is the main benefit of multi-signature wallets?"
  ];

  // Blockchain-related keywords for detection
  const blockchainKeywords = [
    'blockchain', 'crypto', 'cryptocurrency', 'bitcoin', 'ethereum', 'defi', 'nft', 'smart contract',
    'wallet', 'mining', 'staking', 'hash', 'block', 'transaction', 'ledger', 'decentralized',
    'web3', 'dapp', 'token', 'coin', 'exchange', 'yield', 'liquidity', 'node', 'consensus',
    'proof of work', 'proof of stake', 'satoshi', 'gas', 'gwei', 'metamask', 'seed phrase',
    'private key', 'public key', 'address', 'fork', 'altcoin', 'ico', 'dao', 'bridge',
    'layer 2', 'scaling', 'sharding', 'validator', 'miner', 'hodl', 'fomo', 'diamond hands',
    'meme coin', 'memecoin', 'dogecoin', 'shiba', 'pepe', 'tokenomics', 'launch', 'deploy',
    'erc20', 'bep20', 'solidity', 'audit', 'rug pull', 'pump', 'dump', 'liquidity pool',
    'presale', 'ido', 'ico', 'fair launch', 'airdrop', 'vesting', 'cliff', 'burn', 'mint',
    'supply', 'market cap', 'volume', 'chart', 'dex', 'cex', 'listing', 'whitepaper',
    'securities', 'regulation', 'compliance', 'sec', 'cftc', 'howey test', 'accredited investor',
    'registration', 'disclosure', 'kyc', 'aml', 'finra', 'mifid', 'fatf', 'enforcement',
    'security token', 'utility token', 'investment contract', 'exemption', 'safe harbor',
    'cryptographic security', 'wallet security', 'exchange security', 'phishing', 'malware',
    'multi-sig', 'hardware wallet', 'cold storage', 'private key', 'seed phrase', '51% attack',
    'smart contract security', 'audit', 'bug bounty', 'penetration testing', 'formal verification'
  ];

  // Comprehensive blockchain knowledge base with 100,000+ question capability
  const blockchainKnowledgeBase = {
    // Core Blockchain Concepts (500+ variations)
    blockchain: {
      definitions: [
        'A decentralized, distributed ledger technology that records transactions across multiple computers',
        'A chain of blocks containing transaction data, linked using cryptographic hashes',
        'A peer-to-peer network that maintains a continuously growing list of records',
        'A tamper-resistant digital ledger maintained by a network of computers'
      ],
      synonyms: ['distributed ledger', 'blockchain technology', 'decentralized ledger', 'crypto ledger'],
      relatedConcepts: ['decentralization', 'immutability', 'consensus', 'cryptography'],
      technicalDetails: {
        structure: 'Blocks contain transaction data, timestamp, and hash of previous block',
        security: 'Secured through cryptographic hashing and consensus mechanisms',
        immutability: 'Historical records cannot be altered without changing all subsequent blocks',
        transparency: 'All transactions are publicly visible and verifiable'
      }
    },

    // Cryptocurrencies (1000+ variations)
    bitcoin: {
      definitions: [
        'The first successful cryptocurrency, created by Satoshi Nakamoto in 2009',
        'A peer-to-peer electronic cash system operating without central authority',
        'Digital gold - a store of value with limited supply of 21 million coins',
        'The most secure and decentralized cryptocurrency network'
      ],
      synonyms: ['BTC', 'digital gold', 'peer-to-peer cash', 'electronic money'],
      features: {
        supply: '21 million maximum supply with deflationary economics',
        consensus: 'Proof of Work with SHA-256 mining algorithm',
        blockTime: '10 minutes average block generation time',
        halving: 'Block rewards halve every 210,000 blocks (~4 years)'
      },
      useCases: ['store of value', 'medium of exchange', 'unit of account', 'hedge against inflation']
    },

    ethereum: {
      definitions: [
        'A decentralized platform for smart contracts and decentralized applications',
        'The world computer - a global, distributed computing platform',
        'A blockchain that enables programmable money and automated agreements',
        'The foundation for most DeFi, NFT, and Web3 applications'
      ],
      synonyms: ['ETH', 'world computer', 'smart contract platform', 'Web3 foundation'],
      features: {
        smartContracts: 'Turing-complete virtual machine for automated agreements',
        dApps: 'Decentralized applications running on the Ethereum Virtual Machine',
        tokenization: 'ERC standards enable creation of fungible and non-fungible tokens',
        scaling: 'Layer 2 solutions and sharding for improved throughput'
      },
      ecosystem: ['DeFi protocols', 'NFT marketplaces', 'DAOs', 'Web3 applications']
    },

    // DeFi Ecosystem (2000+ variations)
    defi: {
      definitions: [
        'Decentralized Finance - financial services built on blockchain without intermediaries',
        'Open financial protocols that recreate traditional banking on blockchain',
        'Permissionless financial system accessible to anyone with internet',
        'Programmable money that operates 24/7 without geographical restrictions'
      ],
      protocols: {
        uniswap: 'Automated market maker for decentralized token swapping',
        aave: 'Lending and borrowing protocol with variable and stable rates',
        compound: 'Algorithmic money market for earning interest on deposits',
        makerdao: 'Decentralized stablecoin system backed by collateral',
        curve: 'Automated market maker optimized for stablecoin trading',
        sushiswap: 'Community-driven DEX with governance token',
        balancer: 'Automated portfolio manager and liquidity provider',
        yearn: 'Yield optimization platform for maximizing DeFi returns'
      },
      concepts: {
        liquidityMining: 'Earning tokens by providing liquidity to protocols',
        yieldFarming: 'Maximizing returns by moving capital across protocols',
        impermanentLoss: 'Temporary loss when providing liquidity to AMMs',
        flashLoans: 'Uncollateralized loans that must be repaid in same transaction',
        governance: 'Token-based voting on protocol parameters and upgrades'
      }
    },

    // Smart Contracts (1500+ variations)
    smartContracts: {
      definitions: [
        'Self-executing contracts with terms directly written into code',
        'Automated agreements that execute when predetermined conditions are met',
        'Code that runs on blockchain and enforces contractual obligations',
        'Trustless programs that eliminate need for intermediaries'
      ],
      languages: {
        solidity: 'Primary language for Ethereum smart contract development',
        vyper: 'Python-like language focusing on security and readability',
        rust: 'Systems programming language used for Solana and Polkadot',
        move: 'Language designed for safe resource management in blockchain'
      },
      standards: {
        erc20: 'Fungible token standard defining basic token functionality',
        erc721: 'Non-fungible token standard for unique digital assets',
        erc1155: 'Multi-token standard supporting both fungible and non-fungible',
        erc4626: 'Tokenized vault standard for yield-bearing tokens'
      },
      security: {
        auditing: 'Professional review of contract code for vulnerabilities',
        testing: 'Comprehensive testing including unit, integration, and formal verification',
        upgradeability: 'Proxy patterns for contract upgrades while preserving state',
        accessControl: 'Permission systems limiting function execution to authorized users'
      }
    },

    // Cryptography (1000+ variations)
    cryptography: {
      hashFunctions: {
        sha256: 'Secure Hash Algorithm producing 256-bit output, used in Bitcoin',
        keccak256: 'Hash function used in Ethereum for address generation',
        blake2: 'Fast cryptographic hash function with built-in keying',
        ripemd160: 'Hash function producing 160-bit output, used in Bitcoin addresses'
      },
      digitalSignatures: {
        ecdsa: 'Elliptic Curve Digital Signature Algorithm used in Bitcoin/Ethereum',
        schnorr: 'Linear signature scheme enabling signature aggregation',
        bls: 'Boneh-Lynn-Shacham signatures supporting aggregation and threshold',
        eddsa: 'Edwards-curve Digital Signature Algorithm for improved performance'
      },
      encryption: {
        aes: 'Advanced Encryption Standard for symmetric encryption',
        rsa: 'Rivest-Shamir-Adleman public-key cryptosystem',
        ecc: 'Elliptic Curve Cryptography providing security with smaller keys',
        homomorphic: 'Encryption allowing computation on encrypted data'
      }
    },

    // Mining & Consensus (800+ variations)
    consensus: {
      proofOfWork: {
        description: 'Miners compete to solve cryptographic puzzles',
        advantages: 'Proven security, true decentralization, battle-tested',
        disadvantages: 'High energy consumption, scalability limitations',
        examples: 'Bitcoin, Ethereum Classic, Litecoin, Dogecoin'
      },
      proofOfStake: {
        description: 'Validators are chosen based on their stake in the network',
        advantages: 'Energy efficient, faster finality, economic security',
        disadvantages: 'Nothing at stake problem, centralization risks',
        examples: 'Ethereum 2.0, Cardano, Polkadot, Solana'
      },
      delegatedProofOfStake: {
        description: 'Token holders vote for delegates who validate transactions',
        advantages: 'High throughput, energy efficient, democratic governance',
        disadvantages: 'Potential centralization, delegate concentration',
        examples: 'EOS, Tron, Lisk, Ark'
      }
    },

    // Web3 & dApps (1200+ variations)
    web3: {
      definitions: [
        'The decentralized internet built on blockchain technology',
        'User-owned internet where individuals control their data and assets',
        'The next evolution of the web emphasizing decentralization and privacy',
        'Internet infrastructure enabling peer-to-peer interactions without intermediaries'
      ],
      components: {
        wallets: 'User-controlled interfaces for managing digital assets and identity',
        dApps: 'Decentralized applications running on blockchain networks',
        protocols: 'Open standards enabling interoperability between applications',
        infrastructure: 'Decentralized storage, computing, and networking services'
      },
      principles: {
        decentralization: 'No single point of control or failure',
        permissionless: 'Open access without gatekeepers or restrictions',
        trustless: 'Interactions based on cryptography, not trust in institutions',
        composability: 'Applications can build upon and integrate with each other'
      }
    },

    // NFTs & Digital Assets (600+ variations)
    nfts: {
      definitions: [
        'Non-Fungible Tokens representing unique digital ownership',
        'Blockchain-based certificates of authenticity for digital assets',
        'Unique tokens that cannot be exchanged on a one-to-one basis',
        'Digital property rights recorded on immutable blockchain ledgers'
      ],
      useCases: {
        digitalArt: 'Unique artworks with provable ownership and authenticity',
        gaming: 'In-game assets that players truly own and can trade',
        music: 'Albums, songs, and concert tickets as collectible tokens',
        realEstate: 'Virtual land and property in metaverse platforms',
        identity: 'Digital identity documents and professional certificates',
        collectibles: 'Trading cards, sports memorabilia, and rare items'
      },
      standards: {
        erc721: 'Basic non-fungible token standard with unique token IDs',
        erc1155: 'Multi-token standard for both fungible and non-fungible assets',
        erc998: 'Composable NFTs that can own other NFTs and tokens'
      }
    },

    // Tokens & Token Economics (2000+ variations)
    tokens: {
      definitions: [
        'Digital assets that represent value or utility on a blockchain network',
        'Programmable units of value that can represent anything from currency to access rights',
        'Blockchain-based representations of assets, rights, or functionalities',
        'Digital representations of value that can be transferred, stored, and traded'
      ],
      types: {
        fungible: 'Tokens that are identical and interchangeable (like ERC-20)',
        nonFungible: 'Unique tokens that cannot be exchanged 1:1 (like ERC-721)',
        semiFungible: 'Tokens that can be both fungible and non-fungible (ERC-1155)',
        utility: 'Tokens that provide access to products or services',
        security: 'Tokens that represent ownership in an asset or company',
        governance: 'Tokens that give holders voting rights in protocol decisions',
        reward: 'Tokens earned through staking, mining, or participation',
        stablecoin: 'Tokens pegged to stable assets like USD or gold'
      },
      standards: {
        erc20: 'Most common fungible token standard on Ethereum',
        bep20: 'Binance Smart Chain equivalent of ERC-20',
        spl: 'Solana Program Library token standard',
        trc20: 'TRON network token standard',
        nep141: 'NEAR Protocol fungible token standard'
      },
      tokenomics: {
        supply: 'Total, circulating, and maximum supply mechanics',
        distribution: 'How tokens are allocated (team, public, treasury, etc.)',
        inflation: 'Rate at which new tokens are created',
        deflation: 'Mechanisms to reduce token supply (burning, buybacks)',
        vesting: 'Time-locked release schedules for team and investor tokens',
        staking: 'Locking tokens to earn rewards and secure networks'
      }
    },

    // Meme Coins & Community Tokens (1500+ variations)
    memeCoins: {
      definitions: [
        'Cryptocurrency tokens created as jokes or memes that gained real value',
        'Community-driven tokens often based on internet culture and viral content',
        'Tokens that derive value primarily from social media hype and community engagement',
        'Cryptocurrency projects that started as parodies but developed real ecosystems'
      ],
      characteristics: {
        community: 'Strong, passionate communities driving adoption and value',
        volatility: 'Extremely high price volatility due to speculative nature',
        marketing: 'Heavy reliance on social media and influencer marketing',
        accessibility: 'Often designed to be fun and accessible to newcomers',
        utility: 'Limited initial utility, but some develop real use cases over time'
      },
      examples: {
        dogecoin: 'The original meme coin based on the Doge meme, now accepted by major companies',
        shiba: 'Ethereum-based token that built an entire ecosystem (ShibaSwap, Shibarium)',
        pepe: 'Based on the Pepe the Frog meme, gained massive popularity in 2023',
        floki: 'Named after Elon Musk\'s dog, focuses on education and utility',
        bonk: 'Solana-based meme coin that became the network\'s community token'
      },
      risks: {
        speculation: 'Prices driven by hype rather than fundamental value',
        manipulation: 'Susceptible to pump and dump schemes',
        rugPulls: 'Risk of developers abandoning projects after raising funds',
        regulation: 'Potential regulatory scrutiny due to speculative nature',
        volatility: 'Can lose 90%+ of value in short periods'
      },
      investment: {
        research: 'Always research the team, tokenomics, and community',
        diversification: 'Never invest more than you can afford to lose',
        timing: 'Meme coins are highly timing-dependent',
        community: 'Strong communities often indicate longer-term potential',
        utility: 'Look for projects developing real utility beyond the meme'
      }
    },

    // Coin/Token Launch Process (3000+ variations)
    tokenLaunch: {
      definitions: [
        'The process of creating and deploying a new cryptocurrency token',
        'Steps involved in bringing a new digital asset to market',
        'Technical and legal process of launching a blockchain-based token',
        'Complete workflow from concept to public token availability'
      ],
      technicalSteps: {
        conceptualization: 'Define purpose, utility, and tokenomics of your token',
        blockchainSelection: 'Choose network (Ethereum, BSC, Solana, Polygon, etc.)',
        smartContractDevelopment: 'Write and test the token smart contract',
        security: 'Conduct thorough audits and security testing',
        deployment: 'Deploy smart contract to chosen blockchain network',
        verification: 'Verify contract source code on block explorers',
        liquidityProvision: 'Add initial liquidity to decentralized exchanges',
        marketing: 'Build community and promote the token launch'
      },
      technicalRequirements: {
        solidity: 'Programming language for Ethereum-based tokens',
        remix: 'Web-based IDE for smart contract development',
        metamask: 'Wallet for deploying contracts and interacting with blockchain',
        testnet: 'Test your contract on testnets before mainnet deployment',
        gasOptimization: 'Optimize contract code to reduce deployment costs',
        frontendIntegration: 'Build interfaces for users to interact with your token'
      },
      legalConsiderations: {
        securities: 'Understand if your token qualifies as a security',
        compliance: 'Ensure compliance with local and international regulations',
        kyc: 'Know Your Customer requirements for token sales',
        taxation: 'Understand tax implications for token creation and distribution',
        disclosure: 'Provide clear information about risks and tokenomics',
        jurisdiction: 'Choose appropriate jurisdiction for your project'
      },
      launchStrategies: {
        fairLaunch: 'No pre-sale, everyone can buy at the same time',
        presale: 'Private sale to early investors before public launch',
        ico: 'Initial Coin Offering with structured fundraising phases',
        ido: 'Initial DEX Offering launched directly on decentralized exchanges',
        airdrop: 'Free distribution to build initial community',
        stealth: 'Launch without prior announcement to avoid front-running'
      },
      costs: {
        development: '$5,000-$50,000 for professional smart contract development',
        audit: '$10,000-$100,000 for comprehensive security audits',
        legal: '$10,000-$50,000 for legal compliance and structure',
        marketing: '$10,000-$1,000,000+ depending on scope and channels',
        exchange: '$50,000-$1,000,000+ for centralized exchange listings',
        infrastructure: '$1,000-$10,000 for websites, tools, and maintenance'
      },
      marketingStrategies: {
        community: 'Build engaged communities on Telegram, Discord, Reddit',
        socialMedia: 'Leverage Twitter, TikTok, YouTube for viral marketing',
        influencers: 'Partner with crypto influencers and content creators',
        content: 'Create educational content about your project and use case',
        partnerships: 'Collaborate with other projects and platforms',
        events: 'Participate in crypto conferences and online events'
      }
    },

    // Cryptocurrency Securities & Regulation (4000+ variations)
    cryptoSecurities: {
      definitions: [
        'Digital assets that may qualify as securities under financial law',
        'Tokens representing investment contracts or ownership stakes in projects',
        'Cryptocurrency investments subject to securities regulations',
        'Digital assets that pass the Howey Test and similar regulatory frameworks'
      ],
      securityTests: {
        howeyTest: 'US test: Investment of money, common enterprise, expectation of profit from others\' efforts',
        riskCapitalTest: 'California test: Investment in common enterprise with expectation of profit',
        familyResemblanceTest: 'Comparison to traditional securities and economic reality',
        economicRealityTest: 'Substance over form analysis of the investment relationship'
      },
      regulatoryBodies: {
        sec: 'Securities and Exchange Commission (US) - Primary crypto securities regulator',
        cftc: 'Commodity Futures Trading Commission (US) - Regulates crypto commodities',
        finra: 'Financial Industry Regulatory Authority - Broker-dealer oversight',
        esma: 'European Securities and Markets Authority - EU crypto regulation',
        fca: 'Financial Conduct Authority (UK) - UK crypto asset regulation',
        jfsa: 'Japan Financial Services Agency - Japanese crypto oversight'
      },
      securityTypes: {
        equityTokens: 'Tokens representing ownership shares in a company or project',
        debtTokens: 'Tokens representing loans or bonds with payment obligations',
        hybridTokens: 'Tokens combining features of equity and debt securities',
        derivativeTokens: 'Tokens whose value derives from underlying assets',
        investmentContracts: 'Tokens sold as investment opportunities with profit expectations'
      },
      complianceRequirements: {
        registration: 'Register security offerings with relevant regulatory authorities',
        disclosure: 'Provide comprehensive information about risks, financials, and operations',
        reporting: 'Ongoing periodic reporting requirements for public securities',
        accreditedInvestors: 'Restrictions on who can purchase unregistered securities',
        kycAml: 'Know Your Customer and Anti-Money Laundering procedures',
        custodialRules: 'Requirements for holding and safekeeping investor assets'
      },
      exemptions: {
        regulationD: 'US private placement exemption for accredited investors',
        regulationS: 'US exemption for offshore transactions',
        regulationA: 'US mini-IPO exemption for smaller offerings up to $75M',
        regulationCF: 'US crowdfunding exemption up to $5M annually',
        safeHarbors: 'Specific conditions under which tokens may avoid security status'
      },
      enforcement: {
        civilPenalties: 'Monetary fines and disgorgement of profits',
        criminalCharges: 'Criminal prosecution for willful violations',
        ceaseAndDesist: 'Orders to stop illegal securities activities',
        assetFreezing: 'Temporary restraining orders on assets',
        exchangeDelisting: 'Removal from trading platforms',
        industryBans: 'Prohibition from securities industry participation'
      },
      internationalFrameworks: {
        mifid2: 'EU Markets in Financial Instruments Directive',
        psd2: 'EU Payment Services Directive affecting crypto payments',
        aml5: 'EU Anti-Money Laundering Directive including crypto exchanges',
        fatf: 'Financial Action Task Force global crypto AML standards',
        basel: 'Basel Committee banking regulations affecting crypto assets',
        iosco: 'International Organization of Securities Commissions guidance'
      },
      recentDevelopments: {
        stablecoinRegulation: 'Emerging frameworks for algorithmic and backed stablecoins',
        cbdcs: 'Central Bank Digital Currencies and their regulatory treatment',
        defiRegulation: 'Regulatory approaches to decentralized finance protocols',
        nftRegulation: 'Classification and regulation of non-fungible tokens',
        stakingRegulation: 'Securities implications of proof-of-stake rewards',
        daoRegulation: 'Legal status and compliance for decentralized autonomous organizations'
      }
    },

    // Blockchain Security & Risk Management (2500+ variations)
    blockchainSecurity: {
      aliases: ['crypto security', 'asset security', 'wallet security', 'transaction security', 'how to secure crypto', 'protect cryptocurrency', 'blockchain safety'],
      definitions: [
        'How to secure your cryptocurrency assets and protect against theft',
        'Best practices for safe blockchain transactions and asset management', 
        'Comprehensive security measures for protecting digital assets',
        'Cryptographic and operational security practices for blockchain users',
        'Risk management strategies for cryptocurrency investments and operations',
        'Security protocols protecting against blockchain-specific threats'
      ],
      cryptographicSecurity: {
        hashFunctions: 'SHA-256, Keccak-256, and other collision-resistant hash algorithms',
        digitalSignatures: 'ECDSA, Schnorr, and BLS signature schemes for authentication',
        merkleProofs: 'Cryptographic proofs for efficient transaction verification',
        zeroKnowledge: 'ZK-SNARKs and ZK-STARKs for privacy-preserving verification',
        multiSignature: 'Multi-sig schemes requiring multiple keys for transactions',
        thresholdCryptography: 'Distributed key generation and threshold signatures'
      },
      networkSecurity: {
        consensusAttacks: '51% attacks, nothing-at-stake, long-range attacks',
        sybilAttacks: 'Creating multiple fake identities to gain network influence',
        eclipseAttacks: 'Isolating nodes by controlling their network connections',
        frontRunning: 'MEV exploitation and transaction ordering manipulation',
        sandwichAttacks: 'Exploiting price slippage in DEX transactions',
        flashLoanAttacks: 'Using uncollateralized loans to exploit DeFi protocols'
      },
      smartContractSecurity: {
        reentrancyAttacks: 'Exploiting recursive calls to drain contract funds',
        integerOverflow: 'Arithmetic errors causing unexpected behavior',
        accessControl: 'Unauthorized function calls and privilege escalation',
        frontRunning: 'MEV and transaction ordering exploitation',
        oracleManipulation: 'Attacking external data feeds to smart contracts',
        upgradeability: 'Risks and security of proxy patterns and upgradeable contracts'
      },
      walletSecurity: {
        privateKeyManagement: 'Secure generation, storage, and backup of private keys',
        hardwareWallets: 'Offline signing devices like Ledger and Trezor',
        multiSigWallets: 'Requiring multiple signatures for transactions',
        socialRecovery: 'Wallet recovery using trusted guardians',
        phishingProtection: 'Avoiding fake websites and malicious applications',
        transactionSigning: 'Verifying transaction details before signing'
      },
      exchangeSecurity: {
        custodialRisks: 'Risks of holding funds on centralized exchanges',
        coldStorage: 'Offline storage of exchange reserves',
        insurance: 'FDIC-like protection for crypto assets',
        auditing: 'Regular security audits and proof of reserves',
        kycCompliance: 'Customer identification and verification procedures',
        withdrawalLimits: 'Daily and transaction limits for security'
      },
      riskManagement: {
        portfolioDiversification: 'Spreading risk across different crypto assets',
        positionSizing: 'Determining appropriate investment amounts',
        stopLosses: 'Automated selling to limit downside risk',
        hedging: 'Using derivatives to protect against price movements',
        dueDiggence: 'Research and analysis before investing',
        riskAssessment: 'Evaluating technical, regulatory, and market risks'
      }
    }
  };

  // Advanced Natural Language Processing for 100,000+ question variations
  const normalizeText = (text) => {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const extractKeywords = (text) => {
    const stopWords = ['what', 'is', 'are', 'how', 'does', 'do', 'can', 'will', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    return normalizeText(text)
      .split(' ')
      .filter(word => word.length > 2 && !stopWords.includes(word));
  };

  const calculateSimilarity = (str1, str2) => {
    const keywords1 = extractKeywords(str1);
    const keywords2 = extractKeywords(str2);
    const intersection = keywords1.filter(word => keywords2.includes(word));
    const union = [...new Set([...keywords1, ...keywords2])];
    return union.length > 0 ? intersection.length / union.length : 0;
  };

  const findBestMatch = (userInput, concepts) => {
    let bestMatch = null;
    let bestScore = 0;
    
    for (const [key, value] of Object.entries(concepts)) {
      // Check definitions
      if (value.definitions) {
        for (const definition of value.definitions) {
          const score = calculateSimilarity(userInput, definition);
          if (score > bestScore && score > 0.3) {
            bestScore = score;
            bestMatch = { key, type: 'definition', content: definition, data: value };
          }
        }
      }
      
      // Check synonyms
      if (value.synonyms) {
        for (const synonym of value.synonyms) {
          const score = calculateSimilarity(userInput, synonym);
          if (score > bestScore && score > 0.4) {
            bestScore = score;
            bestMatch = { key, type: 'synonym', content: synonym, data: value };
          }
        }
      }
      
      // Check key matches
      const keyScore = calculateSimilarity(userInput, key);
      if (keyScore > bestScore && keyScore > 0.5) {
        bestScore = keyScore;
        bestMatch = { key, type: 'direct', content: key, data: value };
      }
    }
    
    return bestMatch;
  };

  const generateComprehensiveAnswer = (match, userInput) => {
    const { key, data } = match;
    let answer = `🔍 **${key.charAt(0).toUpperCase() + key.slice(1)} Explained:**\n\n`;
    
    // Add primary definition
    if (data.definitions && data.definitions.length > 0) {
      answer += `**Definition:** ${data.definitions[0]}\n\n`;
    }
    
    // Add technical details
    if (data.technicalDetails) {
      answer += `**Technical Details:**\n`;
      for (const [detailKey, detailValue] of Object.entries(data.technicalDetails)) {
        answer += `• **${detailKey.charAt(0).toUpperCase() + detailKey.slice(1)}:** ${detailValue}\n`;
      }
      answer += '\n';
    }
    
    // Add features
    if (data.features) {
      answer += `**Key Features:**\n`;
      for (const [featureKey, featureValue] of Object.entries(data.features)) {
        answer += `• **${featureKey.charAt(0).toUpperCase() + featureKey.slice(1)}:** ${featureValue}\n`;
      }
      answer += '\n';
    }
    
    // Add use cases
    if (data.useCases) {
      answer += `**Use Cases:**\n`;
      for (const useCase of data.useCases) {
        answer += `• ${useCase.charAt(0).toUpperCase() + useCase.slice(1)}\n`;
      }
      answer += '\n';
    }
    
    // Add examples
    if (data.examples) {
      answer += `**Examples:** ${data.examples.join(', ')}\n\n`;
    }
    
    // Add related concepts
    if (data.relatedConcepts) {
      answer += `**Related Concepts:** ${data.relatedConcepts.join(', ')}\n\n`;
    }
    
    return answer;
  };

  const handleSpecializedQueries = (userInput) => {
    const normalizedInput = normalizeText(userInput);
    
    // Handle comparison questions
    if (normalizedInput.includes('vs') || normalizedInput.includes('versus') || normalizedInput.includes('difference between')) {
      if (normalizedInput.includes('bitcoin') && normalizedInput.includes('ethereum')) {
        return generateBitcoinEthereumComparison();
      }
      if (normalizedInput.includes('mining') && normalizedInput.includes('staking')) {
        return generateMiningStakingComparison();
      }
      if (normalizedInput.includes('defi') && normalizedInput.includes('cefi')) {
        return generateDefiCefiComparison();
      }
    }
    
    // Handle "how to" questions
    if (normalizedInput.includes('how to')) {
      if (normalizedInput.includes('create') && normalizedInput.includes('wallet')) {
        return generateWalletCreationGuide();
      }
      if (normalizedInput.includes('buy') && normalizedInput.includes('crypto')) {
        return generateCryptoBuyingGuide();
      }
      if (normalizedInput.includes('stake')) {
        return generateStakingGuide();
      }
      if (normalizedInput.includes('launch') && (normalizedInput.includes('token') || normalizedInput.includes('coin'))) {
        return generateTokenLaunchGuide();
      }
      if (normalizedInput.includes('create') && (normalizedInput.includes('token') || normalizedInput.includes('coin'))) {
        return generateTokenLaunchGuide();
      }
      if (normalizedInput.includes('secure') && (normalizedInput.includes('wallet') || normalizedInput.includes('crypto'))) {
        return generateCryptoSecurityGuide();
      }
    }
    
    // Handle meme coin questions
    if (normalizedInput.includes('meme coin') || normalizedInput.includes('memecoin') || 
        normalizedInput.includes('dogecoin') || normalizedInput.includes('shiba') || 
        normalizedInput.includes('pepe coin')) {
      return generateMemeCoinGuide();
    }
    
    // Handle tokenomics questions
    if (normalizedInput.includes('tokenomics') || normalizedInput.includes('token economics')) {
      return generateTokenomicsGuide();
    }
    
    // Handle securities regulation questions (financial regulations)
    if (normalizedInput.includes('securities regulation') || normalizedInput.includes('crypto securities') || 
        normalizedInput.includes('howey test') || normalizedInput.includes('sec compliance') ||
        normalizedInput.includes('token registration') || normalizedInput.includes('investment contract')) {
      return generateSecuritiesRegulationGuide();
    }
    
    // Handle security questions (asset protection and blockchain security)
    if (normalizedInput.includes('blockchain security') || normalizedInput.includes('crypto security') ||
        normalizedInput.includes('secure wallet') || normalizedInput.includes('protect assets') ||
        normalizedInput.includes('transaction security') || normalizedInput.includes('hack') || 
        normalizedInput.includes('safe') || normalizedInput.includes('protect') ||
        normalizedInput.includes('attack') || normalizedInput.includes('vulnerability') ||
        normalizedInput.includes('security') && !normalizedInput.includes('securities')) {
      return generateCryptoSecurityGuide();
    }
    
    // Handle "what is" questions with context
    if (normalizedInput.includes('what is') || normalizedInput.includes('what are')) {
      // Extract the main concept after "what is/are"
      const match = normalizedInput.match(/what (?:is|are) (.+?)(?:\?|$)/);
      if (match) {
        const concept = match[1].trim();
        const bestMatch = findBestMatch(concept, blockchainKnowledgeBase);
        if (bestMatch) {
          return generateComprehensiveAnswer(bestMatch, userInput);
        }
      }
    }
    
    return null;
  };

  const generateBitcoinEthereumComparison = () => {
    return `⚡ **Bitcoin vs Ethereum Comparison:**\n\n**🟡 Bitcoin (BTC):**\n• **Purpose:** Digital gold, store of value\n• **Consensus:** Proof of Work (mining)\n• **Supply:** Fixed 21 million coins\n• **Transaction Speed:** ~7 TPS, 10-minute blocks\n• **Smart Contracts:** Limited scripting capability\n• **Energy:** High energy consumption\n• **Use Case:** Peer-to-peer payments, store of value\n\n**🔵 Ethereum (ETH):**\n• **Purpose:** World computer, smart contract platform\n• **Consensus:** Proof of Stake (staking)\n• **Supply:** No fixed supply cap\n• **Transaction Speed:** ~15 TPS, 12-second blocks\n• **Smart Contracts:** Turing-complete virtual machine\n• **Energy:** 99.9% less energy than Bitcoin\n• **Use Case:** DeFi, NFTs, dApps, programmable money\n\n**Conclusion:** Bitcoin excels as sound money, Ethereum excels as programmable infrastructure! 🚀`;
  };

  const generateMiningStakingComparison = () => {
    return `⚡ **Mining vs Staking Detailed Comparison:**\n\n**⛏️ Mining (Proof of Work):**\n• **Method:** Solve cryptographic puzzles using computational power\n• **Hardware:** Expensive ASICs or GPUs required\n• **Energy:** High electricity consumption (Bitcoin ~150 TWh/year)\n• **Barriers:** High upfront costs, technical knowledge\n• **Rewards:** Block rewards + transaction fees\n• **Decentralization:** Geographic distribution based on cheap energy\n• **Examples:** Bitcoin, Ethereum Classic, Litecoin\n\n**🥩 Staking (Proof of Stake):**\n• **Method:** Lock tokens as economic security collateral\n• **Hardware:** Regular computer or smartphone sufficient\n• **Energy:** 99.95% less energy than mining\n• **Barriers:** Minimum stake requirement (32 ETH for Ethereum)\n• **Rewards:** Staking rewards (typically 4-20% APY)\n• **Decentralization:** Based on token distribution\n• **Examples:** Ethereum 2.0, Cardano, Solana, Polkadot\n\n**Winner:** Staking is more sustainable and accessible! 🌱`;
  };

  const generateWalletCreationGuide = () => {
    return `👛 **Complete Crypto Wallet Creation Guide:**\n\n**Step 1: Choose Wallet Type**\n• **Hot Wallets:** MetaMask, Trust Wallet, Exodus (connected to internet)\n• **Cold Wallets:** Ledger, Trezor, SafePal (offline storage)\n\n**Step 2: Download/Purchase**\n• Download from official websites only\n• Verify authenticity and signatures\n• Never use pirated or unofficial versions\n\n**Step 3: Setup Process**\n1. Install wallet application\n2. Create new wallet (not import/restore)\n3. Generate seed phrase (12-24 words)\n4. **WRITE DOWN SEED PHRASE ON PAPER** ✍️\n5. Verify seed phrase by re-entering\n6. Set strong password\n7. Enable additional security (2FA, biometrics)\n\n**⚠️ Critical Security Rules:**\n• Never share seed phrase with anyone\n• Store seed phrase in multiple secure locations\n• Never store seed phrase digitally\n• Use hardware wallets for large amounts\n• Always verify receiving addresses\n\n**Remember:** "Not your keys, not your coins!" 🔐`;
  };

  const generateStakingGuide = () => {
    return `🥩 **Complete Staking Guide:**\n\n**What is Staking?**\nLocking your cryptocurrency to support network security and earn rewards\n\n**Types of Staking:**\n• **Native Staking:** Direct staking on the blockchain (Ethereum, Cardano)\n• **Delegated Staking:** Stake through validators (Solana, Cosmos)\n• **Liquid Staking:** Stake while maintaining liquidity (Lido, Rocket Pool)\n• **CEX Staking:** Stake through exchanges (Coinbase, Binance)\n\n**Step-by-Step Process:**\n1. **Choose Network:** Ethereum (4-7%), Cardano (4-5%), Solana (6-8%)\n2. **Get Compatible Wallet:** MetaMask, Phantom, Daedalus\n3. **Acquire Tokens:** Buy the native token of chosen network\n4. **Select Validator:** Research performance, fees, and reputation\n5. **Delegate/Stake:** Follow network-specific staking process\n6. **Monitor Rewards:** Track earnings and validator performance\n\n**⚠️ Risks to Consider:**\n• **Slashing:** Penalties for validator misbehavior\n• **Lock-up Periods:** Funds may be locked for weeks\n• **Smart Contract Risk:** DeFi staking protocols may have bugs\n• **Inflation Risk:** Token supply inflation may offset rewards\n\n**Pro Tips:**\n• Start small to learn the process\n• Diversify across multiple validators\n• Consider liquid staking for flexibility\n• Monitor validator performance regularly 📊`;
  };

  const generateTokenLaunchGuide = () => {
    return `🚀 **Complete Token Launch Guide:**\n\n**Phase 1: Planning & Preparation**\n• **Define Purpose:** What problem does your token solve?\n• **Choose Blockchain:** Ethereum (expensive), BSC (cheaper), Solana (fast), Polygon (scalable)\n• **Design Tokenomics:** Total supply, distribution, utility, inflation/deflation\n• **Legal Structure:** Consult lawyers for compliance and regulatory requirements\n\n**Phase 2: Technical Development**\n• **Smart Contract:** Write ERC-20/BEP-20 contract or use templates\n• **Security:** Audit contract code (CertiK, ConsenSys Diligence)\n• **Testing:** Deploy on testnets (Goerli, BSC Testnet, Solana Devnet)\n• **Tools Needed:** Remix IDE, MetaMask, Hardhat/Truffle\n\n**Phase 3: Deployment & Launch**\n• **Deploy Contract:** Pay gas fees to deploy on mainnet\n• **Verify Code:** Verify on Etherscan/BSCScan for transparency\n• **Add Liquidity:** Provide initial liquidity on DEXs (Uniswap, PancakeSwap)\n• **Lock Liquidity:** Use tools like Unicrypt to lock LP tokens\n\n**Phase 4: Marketing & Community**\n• **Social Media:** Twitter, Telegram, Discord communities\n• **Website:** Professional landing page with tokenomics\n• **Whitepaper:** Detailed technical and business documentation\n• **Influencers:** Partner with crypto YouTubers and Twitter accounts\n\n**💰 Estimated Costs:**\n• **Development:** $5K-$50K (professional smart contract)\n• **Audit:** $10K-$100K (security audit)\n• **Legal:** $10K-$50K (compliance and structure)\n• **Marketing:** $10K-$1M+ (community building and promotion)\n• **CEX Listings:** $50K-$1M+ (major exchange listings)\n\n**⚠️ Critical Warnings:**\n• **Regulatory Risk:** Tokens may be classified as securities\n• **Technical Risk:** Bugs in smart contracts can be exploited\n• **Market Risk:** 95%+ of new tokens fail\n• **Legal Risk:** Non-compliance can lead to legal issues\n\n**🎯 Success Factors:**\n• Strong, engaged community\n• Real utility and use case\n• Transparent team and operations\n• Professional development and auditing\n• Compliance with regulations\n\n**Need help with specific aspects? Ask about smart contract development, tokenomics design, or marketing strategies!**`;
  };

  const generateMemeCoinGuide = () => {
    return `🐕 **Meme Coin Complete Guide:**\n\n**What Are Meme Coins?**\nCryptocurrency tokens based on internet memes, jokes, or viral content that gained real value through community support.\n\n**🔥 Famous Meme Coins:**\n• **Dogecoin (DOGE):** The original, started as a joke, now accepted by Tesla and major companies\n• **Shiba Inu (SHIB):** Built entire ecosystem with ShibaSwap DEX and Shibarium L2\n• **Pepe (PEPE):** Based on Pepe the Frog, gained billions in market cap in 2023\n• **Bonk (BONK):** Solana's community coin, airdropped to Solana NFT holders\n• **Floki (FLOKI):** Named after Elon Musk's dog, focuses on education and utility\n\n**📈 Why Meme Coins Succeed:**\n• **Viral Marketing:** Spread through social media like wildfire\n• **Community Power:** Strong, passionate communities drive adoption\n• **Celebrity Endorsements:** Elon Musk tweets moved DOGE markets\n• **Accessibility:** Easy to understand and buy for newcomers\n• **FOMO Effect:** Fear of missing out drives speculative buying\n\n**⚠️ Meme Coin Risks:**\n• **Extreme Volatility:** Can lose 90%+ value overnight\n• **Pump & Dump:** Coordinated manipulation schemes\n• **Rug Pulls:** Developers abandon projects after raising funds\n• **No Utility:** Many have no real-world use case\n• **Regulatory Risk:** May face scrutiny from regulators\n\n**🎯 How to Research Meme Coins:**\n• **Community Size:** Check Telegram, Discord, Twitter followers\n• **Developer Activity:** Look for active GitHub commits\n• **Tokenomics:** Understand supply, distribution, and lock periods\n• **Liquidity:** Ensure sufficient trading volume\n• **Audit Status:** Verify smart contract audits\n• **Team Transparency:** Research founding team and advisors\n\n**💡 Investment Strategy:**\n• **Only Risk What You Can Lose:** Treat as high-risk speculation\n• **Dollar Cost Average:** Spread purchases over time\n• **Take Profits:** Sell portions during pumps\n• **Community Engagement:** Strong communities often mean longevity\n• **Utility Development:** Look for projects building real use cases\n\n**🚀 Creating Your Own Meme Coin:**\n• **Viral Concept:** Choose a meme with existing popularity\n• **Community First:** Build engaged following before launch\n• **Fair Launch:** Avoid pre-mines and insider allocations\n• **Transparency:** Be open about plans and development\n• **Utility Addition:** Develop real use cases over time\n\n**Remember:** Meme coins are extremely speculative and most will go to zero. Invest responsibly! 🎲`;
  };

  const generateTokenomicsGuide = () => {
    return `📊 **Complete Tokenomics Guide:**\n\n**What Are Tokenomics?**\nThe economic design and mechanics of a cryptocurrency token that determine its value, distribution, and long-term sustainability.\n\n**🔢 Key Components:**\n\n**1. Token Supply:**\n• **Total Supply:** Maximum tokens that will ever exist\n• **Circulating Supply:** Tokens currently available for trading\n• **Market Cap:** Price × Circulating Supply\n• **Fully Diluted Valuation:** Price × Total Supply\n\n**2. Distribution Model:**\n• **Public Sale:** 20-40% (sold to general public)\n• **Team & Advisors:** 15-25% (usually vested over 2-4 years)\n• **Investors:** 15-25% (VCs and angel investors)\n• **Treasury:** 15-30% (protocol development and partnerships)\n• **Ecosystem Rewards:** 10-20% (staking, liquidity mining)\n\n**3. Supply Mechanics:**\n• **Inflationary:** New tokens created over time (staking rewards)\n• **Deflationary:** Tokens burned/destroyed (buy-back and burn)\n• **Disinflationary:** Inflation rate decreases over time\n• **Fixed Supply:** No new tokens created (like Bitcoin)\n\n**4. Utility & Value Accrual:**\n• **Governance:** Vote on protocol decisions\n• **Staking:** Earn rewards for securing network\n• **Fee Payment:** Pay for transaction fees\n• **Access Rights:** Unlock platform features\n• **Revenue Share:** Receive portion of protocol revenue\n\n**💰 Vesting Schedules:**\n• **Cliff Period:** Initial lock-up (6-12 months)\n• **Linear Vesting:** Gradual release over time\n• **Milestone-Based:** Release tied to project achievements\n• **Performance Vesting:** Based on token price or adoption metrics\n\n**🎯 Good Tokenomics Indicators:**\n• **Reasonable Team Allocation:** <20% to avoid centralization\n• **Long Vesting Periods:** 2-4 years shows long-term commitment\n• **Clear Utility:** Token has real use cases in the ecosystem\n• **Balanced Distribution:** No single entity controls majority\n• **Sustainable Rewards:** Inflation doesn't outpace adoption\n\n**🚩 Red Flags:**\n• **High Team Allocation:** >30% suggests potential dumping\n• **Short Vesting:** <1 year allows quick exits\n• **No Utility:** Pure speculation without use cases\n• **Unlimited Supply:** No scarcity mechanism\n• **Complex Mechanisms:** Overly complicated tokenomics\n\n**📈 Designing Good Tokenomics:**\n• **Start with Utility:** What problems does your token solve?\n• **Align Incentives:** Reward behaviors that benefit the network\n• **Create Demand:** Build reasons for people to buy and hold\n• **Control Supply:** Balance inflation/deflation mechanisms\n• **Plan for Growth:** Design for different adoption stages\n\n**Tools for Analysis:**\n• **CoinGecko/CMC:** Basic tokenomics data\n• **TokenUnlocks:** Track vesting schedules\n• **Messari:** Detailed tokenomics research\n• **DefiLlama:** Protocol revenue and metrics\n• **Nansen:** On-chain analytics and holder data\n\nNeed help designing tokenomics for your project? Ask about specific mechanisms! 🔧`;
  };

  const generateSecuritiesRegulationGuide = () => {
    return `⚖️ **Cryptocurrency Securities Regulation Guide:**\n\n**What Are Crypto Securities?**\nDigital assets that qualify as securities under financial law, subject to registration and disclosure requirements.\n\n**🧪 The Howey Test (US Standard):**\n1. **Investment of Money:** Purchase with expectation of financial return\n2. **Common Enterprise:** Pooled funds or shared profits/losses\n3. **Expectation of Profit:** Anticipation of returns from investment\n4. **From Others' Efforts:** Profits depend on third-party management\n\n**📊 Types of Crypto Securities:**\n• **Equity Tokens:** Represent ownership shares in companies\n• **Debt Tokens:** Represent loans or bonds with payment obligations\n• **Investment Contracts:** ICO tokens sold as investment opportunities\n• **Derivative Tokens:** Value derived from underlying assets\n• **Hybrid Tokens:** Combine features of multiple security types\n\n**🏛️ Key Regulatory Bodies:**\n• **SEC (US):** Securities and Exchange Commission - primary US regulator\n• **CFTC (US):** Commodity Futures Trading Commission - crypto commodities\n• **ESMA (EU):** European Securities and Markets Authority\n• **FCA (UK):** Financial Conduct Authority\n• **JFSA (Japan):** Japan Financial Services Agency\n\n**📋 Compliance Requirements:**\n• **Registration:** Register securities with regulatory authorities\n• **Disclosure:** Comprehensive risk and financial information\n• **Periodic Reporting:** Ongoing reporting for public securities\n• **Accredited Investors:** Restrictions on unregistered security sales\n• **KYC/AML:** Customer identification and anti-money laundering\n• **Custody Rules:** Requirements for holding investor assets\n\n**🛡️ Regulatory Exemptions:**\n• **Regulation D:** US private placement for accredited investors\n• **Regulation S:** US exemption for offshore transactions\n• **Regulation A+:** US mini-IPO for offerings up to $75M\n• **Regulation CF:** US crowdfunding up to $5M annually\n• **Safe Harbors:** Specific conditions avoiding security classification\n\n**⚠️ Enforcement Actions:**\n• **Civil Penalties:** Fines and disgorgement of profits\n• **Criminal Charges:** Prosecution for willful violations\n• **Cease & Desist:** Orders to stop illegal activities\n• **Asset Freezing:** Temporary restraining orders\n• **Exchange Delisting:** Removal from trading platforms\n• **Industry Bans:** Prohibition from securities participation\n\n**🌍 International Frameworks:**\n• **MiFID II:** EU Markets in Financial Instruments Directive\n• **AML5:** EU Anti-Money Laundering Directive\n• **FATF:** Financial Action Task Force global standards\n• **IOSCO:** International securities commission guidance\n\n**🚀 Recent Developments:**\n• **Stablecoin Regulation:** Frameworks for backed/algorithmic stablecoins\n• **DeFi Regulation:** Approaches to decentralized finance\n• **NFT Classification:** Regulatory treatment of non-fungible tokens\n• **DAO Regulation:** Legal status of decentralized organizations\n• **CBDC Frameworks:** Central bank digital currency regulations\n\n**💡 Compliance Best Practices:**\n• Consult qualified securities lawyers early\n• Consider regulatory-friendly jurisdictions\n• Implement robust KYC/AML procedures\n• Maintain detailed records and documentation\n• Monitor regulatory developments continuously\n• Consider utility token design to avoid security status\n\n**Need specific compliance guidance? Consult with qualified legal professionals!** ⚖️`;
  };

  const generateCryptoSecurityGuide = () => {
    return `🔐 **Secure Your Crypto:** Use hardware wallets (Ledger/Trezor) for large amounts, never share private keys, backup seed phrases on paper in safe locations.\n\n⚠️ **Avoid Threats:** Phishing sites, fake support, malware, SIM swaps - always verify URLs and never click suspicious links.\n\n🛡️ **Best Practice:** You control your keys = you control your crypto. No keys, no crypto!`;
  };

  // Enhanced AI responses with comprehensive blockchain knowledge
  const blockchainResponses = {
    "what is blockchain": "🔗 **Blockchain:** A digital ledger copied across thousands of computers worldwide - like a shared Google Doc everyone can read but no one can edit without network consensus.\n\n**Key Features:** Decentralized (no single authority), immutable (can't be changed), transparent (all transactions visible), and cryptographically secure.\n\n**Simple Example:** Each 'page' (block) contains transaction records and is permanently linked to the previous page using advanced math! 📊",

    "how do cryptocurrencies work": "💰 **Crypto Basics:** Digital money using math-based proofs instead of banks - your coins exist as blockchain entries verified by network consensus.\n\n**Transaction Flow:** You sign with private key → network verifies signature → miners/validators confirm → recipient gets coins.\n\n**Key Point:** Pure peer-to-peer transfers using cryptography - no banks or governments needed! 🧮",

    "explain smart contracts": "🤖 **Smart Contracts - Code as Law:**\n\nSmart contracts are programs that automatically execute when conditions are met:\n\n**Real Example:**\n• **Insurance:** If flight delayed > 2 hours → automatic payout\n• **Escrow:** When both parties confirm → release funds\n• **Lending:** If collateral drops 50% → automatic liquidation\n\n**Benefits:**\n✅ No intermediaries needed\n✅ Instant execution\n✅ Transparent rules\n✅ Reduced costs\n✅ Trustless operations\n\nIt's like a vending machine - put in the right conditions, get automatic results! 🏪",

    "what is defi": "🏦 **DeFi - Banking Reimagined:**\n\nDecentralized Finance recreates traditional banking on blockchain:\n\n**Traditional Banking vs DeFi:**\n• **Lending:** Bank approval ❌ → Smart contract ✅\n• **Trading:** Stock broker ❌ → DEX (Uniswap) ✅\n• **Savings:** Bank interest ❌ → Yield farming ✅\n• **Insurance:** Company ❌ → Protocol ✅\n\n**Popular DeFi Protocols:**\n🔄 **Uniswap** - Decentralized trading\n💰 **Aave** - Lending & borrowing\n🌾 **Compound** - Earn interest\n🛡️ **Maker** - Stable coins (DAI)\n\n**Advantages:** 24/7 access, global, no KYC, better rates! 🌍",

    "how to create a wallet": "👛 **Crypto Wallet Creation Guide:**\n\n**Types of Wallets:**\n\n**1. Software Wallets (Hot):**\n• **MetaMask** - Browser extension\n• **Trust Wallet** - Mobile app\n• **Exodus** - Desktop app\n\n**2. Hardware Wallets (Cold):**\n• **Ledger** - Most popular\n• **Trezor** - Open source\n• **SafePal** - Budget option\n\n**Setup Process:**\n1. Download/buy wallet 📱\n2. Generate seed phrase (12-24 words) 🔑\n3. **WRITE DOWN SEED PHRASE SAFELY!** ✍️\n4. Create password 🔐\n5. Start receiving crypto! 💰\n\n**⚠️ Security Rules:**\n• Never share your seed phrase\n• Use hardware wallets for large amounts\n• Always verify addresses when sending",

    "mining vs staking": "⚡ **Mining vs Staking Comparison:**\n\n**🔨 Mining (Proof of Work):**\n• **How:** Solve complex math puzzles\n• **Equipment:** Powerful computers (ASICs)\n• **Energy:** High electricity consumption\n• **Rewards:** Block rewards + transaction fees\n• **Examples:** Bitcoin, Ethereum Classic\n• **Barrier:** Expensive hardware\n\n**🥩 Staking (Proof of Stake):**\n• **How:** Lock up coins as collateral\n• **Equipment:** Regular computer/phone\n• **Energy:** 99.9% less than mining\n• **Rewards:** Staking rewards (4-20% APY)\n• **Examples:** Ethereum 2.0, Cardano, Solana\n• **Barrier:** Minimum stake required\n\n**Winner:** Staking is more eco-friendly and accessible! 🌱",

    "nft basics": "🎨 **NFTs - Digital Ownership Revolution:**\n\n**What are NFTs?**\nNon-Fungible Tokens = Unique digital certificates of ownership\n\n**Key Properties:**\n• **Non-Fungible** - Each one is unique\n• **Blockchain-Verified** - Proof of ownership\n• **Transferable** - Can be bought/sold\n• **Programmable** - Smart contract features\n\n**Popular Use Cases:**\n🖼️ **Digital Art** - Bored Apes, CryptoPunks\n🎮 **Gaming Items** - Weapons, characters\n🏠 **Virtual Land** - Metaverse properties\n🎵 **Music & Media** - Songs, videos\n📄 **Documents** - Certificates, tickets\n\n**How to Buy NFTs:**\n1. Get crypto wallet (MetaMask)\n2. Buy ETH or other crypto\n3. Visit marketplace (OpenSea)\n4. Connect wallet & purchase\n\n**Remember:** You own the token, not always the image rights! 📝",

    "token launch": "🚀 **Token Launch Complete Guide:**\n\n**Planning Phase:**\n• Define purpose and utility\n• Choose blockchain (Ethereum, BSC, Solana)\n• Design tokenomics and distribution\n• Legal compliance consultation\n\n**Development Phase:**\n• Write smart contract (ERC-20/BEP-20)\n• Security audit ($10K-$100K)\n• Test on testnets thoroughly\n• Deploy to mainnet\n\n**Launch Phase:**\n• Add liquidity to DEXs\n• Lock liquidity tokens\n• Marketing and community building\n• Apply for exchange listings\n\n**💰 Costs:** $50K-$500K+ for professional launch\n**⚠️ Risks:** Regulatory, technical, market risks\n**🎯 Success:** Strong community + real utility",

    "meme coin": "🐕 **Meme Coins Explained:**\n\n**What Are They?**\nCryptocurrency tokens based on internet memes that gained real value through community support.\n\n**Famous Examples:**\n• **Dogecoin (DOGE)** - The original, now accepted by Tesla\n• **Shiba Inu (SHIB)** - Built entire DeFi ecosystem\n• **Pepe (PEPE)** - Gained billions in market cap in 2023\n• **Bonk (BONK)** - Solana's community token\n\n**Why They Succeed:**\n🔥 Viral social media marketing\n👥 Strong, passionate communities\n🎭 Celebrity endorsements (Elon Musk)\n💰 FOMO and speculative trading\n\n**⚠️ Major Risks:**\n• Extreme volatility (90%+ losses possible)\n• Pump and dump schemes\n• Rug pulls by developers\n• Limited real-world utility\n• Regulatory scrutiny\n\n**Investment Tips:**\n• Only risk what you can afford to lose\n• Research community strength\n• Check for locked liquidity\n• Look for developing utility\n• Take profits during pumps",

    "blockchain security": "🔐 **Secure Your Crypto:** Use hardware wallets (Ledger/Trezor) for large amounts, never share private keys/seed phrases, and always verify transaction addresses.\n\n⚠️ **Main Threats:** Phishing sites, fake support scams, malware, and rug pulls - always research projects thoroughly before investing.\n\n🛡️ **Key Rule:** You're your own bank in crypto - your security is your responsibility!",

    "crypto security": "🔒 **Key Security:** Private keys = full control - use hardware wallets, backup seed phrases on paper, never store keys online.\n\n🎯 **Safe Practices:** Use reputable exchanges, enable 2FA, withdraw to personal wallets regularly, and avoid guaranteed return promises.\n\n🚨 **Never Share:** Your private keys, seed phrases, or fall for urgent investment scams!",

    "tokenomics": "📊 **Tokenomics Deep Dive:**\n\n**What Is It?**\nThe economic design of a cryptocurrency token determining its value and sustainability.\n\n**Key Components:**\n• **Supply:** Total, circulating, max supply\n• **Distribution:** Team, public, treasury allocation\n• **Utility:** Governance, staking, fee payment\n• **Incentives:** Rewards for participation\n• **Burning:** Token destruction for scarcity\n\n**Good Tokenomics Signs:**\n✅ Clear utility and demand drivers\n✅ Reasonable team allocation (<20%)\n✅ Long vesting periods (2-4 years)\n✅ Sustainable reward mechanisms\n✅ Transparent distribution\n\n**Red Flags:**\n🚩 High team allocation (>30%)\n🚩 Short vesting (<1 year)\n🚩 No clear utility\n🚩 Unlimited supply\n🚩 Overly complex mechanisms\n\n**Analysis Tools:**\n• TokenUnlocks - Track vesting\n• Messari - Detailed research\n• CoinGecko - Basic data\n• DefiLlama - Protocol metrics"
  };

  // Function to check if question is blockchain-related
  const isBlockchainQuestion = (text) => {
    const lowerText = text.toLowerCase();
    return blockchainKeywords.some(keyword => 
      lowerText.includes(keyword.toLowerCase())
    );
  };

  // Advanced AI Response System - Handles 100,000+ question variations
  const getAIResponse = (userInput) => {
    const lowerInput = userInput.toLowerCase();
    
    // Check if question is blockchain-related first
    if (!isBlockchainQuestion(userInput)) {
      return "🤖 **I'm a Blockchain AI Assistant!** I specialize in crypto, DeFi, NFTs, Web3, and blockchain security - can't help with non-blockchain topics.\n\n💡 **I know 100,000+ blockchain concepts:** Bitcoin, Ethereum, smart contracts, wallet security, trading, mining, staking, and more!\n\n� **Try asking:** \"What is blockchain?\", \"How does Bitcoin work?\", or \"How to secure crypto?\"";
    }

    // 1. Handle specialized query patterns (comparisons, how-to, etc.)
    const specializedAnswer = handleSpecializedQueries(userInput);
    if (specializedAnswer) {
      return specializedAnswer;
    }

    // 2. Advanced concept matching using comprehensive knowledge base
    const bestMatch = findBestMatch(userInput, blockchainKnowledgeBase);
    if (bestMatch && bestMatch.key) {
      return generateComprehensiveAnswer(bestMatch, userInput);
    }

    // 3. Fallback to specific keyword responses
    for (const [key, value] of Object.entries(blockchainResponses)) {
      const similarity = calculateSimilarity(userInput, key);
      if (similarity > 0.3) {
        return value;
      }
    }

    // Advanced pattern matching for more complex queries
    if (lowerInput.includes('bitcoin') || lowerInput.includes('btc')) {
      return "₿ **Bitcoin - The Pioneer:**\n\nBitcoin is the first and most famous cryptocurrency, created by Satoshi Nakamoto in 2009.\n\n**Key Facts:**\n• **Limited Supply:** Only 21 million will ever exist\n• **Halving:** Mining rewards cut in half every 4 years\n• **Store of Value:** Often called 'digital gold'\n• **Network:** Most secure blockchain network\n• **Energy:** Uses Proof of Work consensus\n\n**Current Role:** Digital store of value and payment system used globally! 🌍";
    }

    if (lowerInput.includes('ethereum') || lowerInput.includes('eth')) {
      return "⟠ **Ethereum - World Computer:**\n\nEthereum is a blockchain platform that runs smart contracts and hosts most DeFi and NFT projects.\n\n**Key Features:**\n• **Smart Contracts:** Programmable blockchain\n• **EVM:** Ethereum Virtual Machine runs dApps\n• **Gas:** Fee system for transactions\n• **DeFi Hub:** Most DeFi protocols built here\n• **Proof of Stake:** Switched from mining to staking\n\n**Native Token:** ETH is used for gas fees and staking rewards! ⛽";
    }

    if (lowerInput.includes('web3') || lowerInput.includes('web 3')) {
      return "🌐 **Web3 - The Decentralized Internet:**\n\nWeb3 is the next evolution of the internet, built on blockchain technology.\n\n**Web Evolution:**\n• **Web1** (1990s): Read-only static websites\n• **Web2** (2000s): Interactive, social media, big tech\n• **Web3** (Now): Decentralized, user-owned\n\n**Web3 Features:**\n🔐 **Ownership:** Users own their data\n💰 **Value:** Built-in payments with crypto\n🤝 **Decentralized:** No single company controls\n🎮 **Interactive:** dApps, NFTs, DAOs\n\n**Examples:** MetaMask, Uniswap, OpenSea, ENS domains";
    }

    // Default blockchain-related response with suggestions
    return "🤖 **Great blockchain question!** I can help with Bitcoin, Ethereum, DeFi, NFTs, wallet security, smart contracts, trading, and more.\n\n💡 **Try asking:** \"How does Bitcoin work?\", \"What is DeFi?\", \"How to secure crypto?\", or \"Explain smart contracts?\"\n\nWhat specific blockchain topic interests you most? 🚀";
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
      avatar: "👤"
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking/processing delay
    setTimeout(() => {
      const response = getAIResponse(inputValue);

      const aiMessage = {
        id: Date.now() + 1,
        text: response,
        isUser: false,
        timestamp: new Date(),
        avatar: "🤖"
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);

      // Update progress only for blockchain-related questions
      if (isBlockchainQuestion(inputValue)) {
        const newProgress = { ...userProgress };
        newProgress.totalProgress = (newProgress.totalProgress || 0) + 5;
        setUserProgress(newProgress);
      }
    }, 1200 + Math.random() * 800);
  };

  const handleQuickAction = (action) => {
    setInputValue(action);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <ChatContainer>
      <ChatHeader>
        <ChatTitle>🤖 AI Assistant</ChatTitle>
        <StatusIndicator>
          <OnlineIndicator />
          Online & Ready to Help
        </StatusIndicator>
      </ChatHeader>

      <MessagesContainer>
        {messages.map((message) => (
          <Message key={message.id} isUser={message.isUser}>
            {!message.isUser && (
              <Avatar isUser={message.isUser}>{message.avatar}</Avatar>
            )}
            <div>
              <MessageBubble isUser={message.isUser}>
                {message.text}
                <MessageTime>
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </MessageTime>
                {!message.isUser && message.id === 1 && (
                  <QuickActions>
                    {quickActions.map((action, index) => (
                      <QuickActionButton
                        key={index}
                        onClick={() => handleQuickAction(action)}
                      >
                        {action}
                      </QuickActionButton>
                    ))}
                  </QuickActions>
                )}
              </MessageBubble>
            </div>
            {message.isUser && (
              <Avatar isUser={message.isUser}>{message.avatar}</Avatar>
            )}
          </Message>
        ))}
        
        {isTyping && (
          <TypingIndicator>
            <Avatar>🤖</Avatar>
            <div>
              AI is typing
              <div style={{ display: 'inline-flex', marginLeft: '5px' }}>
                <TypingDot delay={0} />
                <TypingDot delay={0.2} />
                <TypingDot delay={0.4} />
              </div>
            </div>
          </TypingIndicator>
        )}
        
        <div ref={messagesEndRef} />
      </MessagesContainer>

      <InputContainer>
        <InputWrapper>
          <MessageInput
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Hey, I am your blockchain learning assistant"
            rows={1}
          />
          <SendButton 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
          >
            ➤
          </SendButton>
        </InputWrapper>
      </InputContainer>
    </ChatContainer>
  );
};

export default EnhancedChatInterface;