// Fallback data for Gaming Hub - extracted from hardcoded content
// This file contains all the previously hardcoded questions, answers, and explanations
// Only used as reference - the app should use database data exclusively
//
// NOTE: Removed from GamifiedLearningHub.js around lines 1091-1240
// Original hardcoded arrays were commented out and completely removed

export const GAMING_HUB_FALLBACK_DATA = {
  beginnerTopics: [
    ['Block', 'Transaction', 'Hash', 'Chain', 'Node', 'Network'],
    ['Bitcoin', 'Ethereum', 'Litecoin', 'Dogecoin', 'Monero', 'Ripple'],
    ['Wallet', 'Address', 'Balance', 'Send', 'Receive', 'Fee'],
    ['Mining', 'Miner', 'Reward', 'Halving', 'Difficulty', 'Pool'],
    ['Peer-to-Peer', 'Decentralized', 'Distributed', 'Central', 'Authority', 'Trust']
  ],

  intermediateTopics: [
    ['Private Key', 'Public Key', 'Digital Signature', 'Hash Function', 'Encryption', 'Decryption'],
    ['Seed Phrase', '2FA', 'Hardware Wallet', 'Multi-Signature', 'Cold Storage', 'Hot Wallet'],
    ['SHA-256', 'ECDSA', 'RSA', 'AES', 'Merkle Tree', 'Proof of Work'],
    ['Consensus', 'Byzantine Fault', 'Proof of Stake', 'Validator', 'Slashing', 'Finality'],
    ['Smart Contract', 'Gas', 'EVM', 'Solidity', 'Bytecode', 'ABI']
  ],

  advancedTopics: [
    ['Uniswap', 'Compound', 'Liquidity Pool', 'Yield Farming', 'Impermanent Loss', 'AMM'],
    ['Aave', 'MakerDAO', 'Flash Loan', 'Collateral', 'Liquidation', 'Governance'],
    ['Curve', 'Balancer', 'Arbitrage', 'Slippage', 'TVL', 'APY'],
    ['Synthetix', 'dYdX', 'Derivatives', 'Perpetuals', 'Margin', 'Leverage'],
    ['Chainlink', 'Oracle', 'Price Feed', 'VRF', 'Keeper', 'Cross-Chain']
  ],

  expertTopics: [
    ['Solidity', 'Vyper', 'Assembly', 'Optimizer', 'Security', 'Audit'],
    ['Truffle', 'Hardhat', 'Testing', 'Deployment', 'Verification', 'Mainnet'],
    ['OpenZeppelin', 'Proxy', 'Upgradeable', 'Diamond', 'Pattern', 'Library'],
    ['Gas Optimization', 'Storage', 'Memory', 'Calldata', 'Inline', 'Loop'],
    ['MEV', 'Flashbots', 'Sandwich', 'Front-running', 'Arbitrage', 'Bundle']
  ]
};

// Template explanations for different levels
export const EXPLANATION_TEMPLATES = {
  beginner: (items) => `This challenge focuses on core blockchain concepts. ${items[0]} and ${items[1]} are fundamental building blocks that make blockchain technology secure and decentralized.`,
  intermediate: (items) => `This challenge explores cryptography and security fundamentals. ${items[0]} and ${items[1]} are essential security mechanisms that protect blockchain networks and user assets.`,
  advanced: (items) => `This challenge covers advanced DeFi ecosystem components. ${items[0]} and ${items[1]} are leading protocols that enable decentralized financial services without traditional intermediaries.`,
  expert: (items) => `This challenge focuses on expert-level smart contract development. ${items[0]} and ${items[1]} are essential tools and concepts for building secure, efficient smart contracts.`
};

// Key point templates for educational content
export const KEY_POINTS_TEMPLATES = {
  beginner: (items) => [
    `${items[0]}: Essential component for blockchain functionality`,
    `${items[1]}: Works together with ${items[0]} to maintain security`,
    `${items[2]}: Additional concept that complements the core system`
  ],
  intermediate: (items) => [
    `${items[0]}: Critical security feature for protecting digital assets`,
    `${items[1]}: Advanced mechanism that works with ${items[0]} for enhanced protection`,
    `${items[2]}: Complementary security measure for comprehensive protection`
  ],
  advanced: (items) => [
    `${items[0]}: Leading DeFi protocol with significant market impact`,
    `${items[1]}: Innovative mechanism that enhances ${items[0]} functionality`,
    `${items[2]}: Advanced feature that completes the DeFi ecosystem`
  ],
  expert: (items) => [
    `${items[0]}: Professional development tool for smart contract creation`,
    `${items[1]}: Advanced technique that optimizes ${items[0]} implementation`,
    `${items[2]}: Expert-level concept for production-ready contracts`
  ]
};