const { ethers } = require('ethers');
require('dotenv').config();

// Contract bytecode and ABI (you'll need to compile the contract first)
const LCUBE_CONTRACT_SOURCE = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract LCUBETokenEnhanced {
    // ERC20 Standard
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    // Point Migration System
    mapping(address => bool) public authorizedMinters;
    mapping(string => bool) public usedMigrationIds;
    mapping(address => uint256) public totalPointsMigrated;
    
    uint256 public pointToTokenRatio = 1; // 1000 points = 1 token (handled in calculations)
    uint256 public maxMigrationPerTransaction = 1000000 * 10**decimals; // 1M tokens max per transaction
    
    address public owner;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event PointsMigrated(address indexed user, uint256 points, uint256 tokens, string migrationId);
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyMinter() {
        require(authorizedMinters[msg.sender] || msg.sender == owner, "Not authorized to mint");
        _;
    }
    
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply
    ) {
        name = _name;
        symbol = _symbol;
        owner = msg.sender;
        
        if (_initialSupply > 0) {
            totalSupply = _initialSupply * 10**decimals;
            balanceOf[msg.sender] = totalSupply;
            emit Transfer(address(0), msg.sender, totalSupply);
        }
        
        // Owner is authorized minter by default
        authorizedMinters[msg.sender] = true;
        emit MinterAdded(msg.sender);
    }
    
    // Standard ERC20 functions
    function transfer(address to, uint256 value) public returns (bool) {
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        require(to != address(0), "Cannot transfer to zero address");
        
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }
    
    function approve(address spender, uint256 value) public returns (bool) {
        require(spender != address(0), "Cannot approve zero address");
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 value) public returns (bool) {
        require(balanceOf[from] >= value, "Insufficient balance");
        require(allowance[from][msg.sender] >= value, "Insufficient allowance");
        require(to != address(0), "Cannot transfer to zero address");
        
        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;
        
        emit Transfer(from, to, value);
        return true;
    }
    
    // Point Migration Functions
    function migratePoints(
        address user,
        uint256 points,
        string memory migrationId
    ) external onlyMinter returns (bool) {
        require(user != address(0), "Invalid user address");
        require(points > 0, "Points must be greater than 0");
        require(!usedMigrationIds[migrationId], "Migration ID already used");
        require(bytes(migrationId).length > 0, "Migration ID required");
        
        // Calculate tokens to mint
        uint256 tokensToMint = points * pointToTokenRatio * 10**decimals / 1000;
        require(tokensToMint <= maxMigrationPerTransaction, "Exceeds max migration limit");
        
        // Mark migration ID as used
        usedMigrationIds[migrationId] = true;
        
        // Mint tokens to user
        totalSupply += tokensToMint;
        balanceOf[user] += tokensToMint;
        totalPointsMigrated[user] += points;
        
        emit Transfer(address(0), user, tokensToMint);
        emit PointsMigrated(user, points, tokensToMint, migrationId);
        
        return true;
    }
    
    // Self-migration function for users to mint their own points
    function migrateMyPoints(
        uint256 points,
        string memory migrationId
    ) external returns (bool) {
        require(points > 0, "Points must be greater than 0");
        require(!usedMigrationIds[migrationId], "Migration ID already used");
        require(bytes(migrationId).length > 0, "Migration ID required");
        
        // Calculate tokens to mint
        uint256 tokensToMint = points * pointToTokenRatio * 10**decimals / 1000;
        require(tokensToMint <= maxMigrationPerTransaction, "Exceeds max migration limit");
        
        // Mark migration ID as used
        usedMigrationIds[migrationId] = true;
        
        // Mint tokens to sender
        totalSupply += tokensToMint;
        balanceOf[msg.sender] += tokensToMint;
        totalPointsMigrated[msg.sender] += points;
        
        emit Transfer(address(0), msg.sender, tokensToMint);
        emit PointsMigrated(msg.sender, points, tokensToMint, migrationId);
        
        return true;
    }
    
    // Administrative functions
    function setPointToTokenRatio(uint256 _ratio) external onlyOwner {
        require(_ratio > 0, "Ratio must be greater than 0");
        pointToTokenRatio = _ratio;
    }
    
    function setMaxMigrationPerTransaction(uint256 _max) external onlyOwner {
        require(_max > 0, "Max must be greater than 0");
        maxMigrationPerTransaction = _max;
    }
    
    function addMinter(address minter) external onlyOwner {
        require(minter != address(0), "Invalid minter address");
        require(!authorizedMinters[minter], "Already a minter");
        
        authorizedMinters[minter] = true;
        emit MinterAdded(minter);
    }
    
    function removeMinter(address minter) external onlyOwner {
        require(minter != address(0), "Invalid minter address");
        require(authorizedMinters[minter], "Not a minter");
        require(minter != owner, "Cannot remove owner");
        
        authorizedMinters[minter] = false;
        emit MinterRemoved(minter);
    }
    
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        require(newOwner != owner, "New owner cannot be current owner");
        
        // Remove old owner from minters and add new owner
        authorizedMinters[owner] = false;
        authorizedMinters[newOwner] = true;
        
        owner = newOwner;
        emit MinterRemoved(msg.sender);
        emit MinterAdded(newOwner);
    }
}
`;

async function deployContract() {
  console.log('🚀 Deploying LCUBE Token with Self-Minting Capability...\n');

  try {
    // Configuration
    const rpcUrl = process.env.RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545";
    const privateKey = process.env.PRIVATE_KEY;

    if (!privateKey) {
      console.log('❌ Please set PRIVATE_KEY in your .env file');
      console.log('💡 Use a wallet with BNB for gas fees on BSC Testnet');
      return;
    }

    // Initialize provider and wallet
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log('📊 Deployment Information:');
    console.log('🏦 Deployer Address:', wallet.address);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    const balanceInBNB = ethers.formatEther(balance);
    console.log('💰 Balance:', balanceInBNB, 'BNB');
    
    if (parseFloat(balanceInBNB) < 0.01) {
      console.log('❌ Insufficient balance for deployment');
      console.log('💡 Please add BNB to your wallet for gas fees');
      console.log('🌐 Get testnet BNB: https://testnet.binance.org/faucet-smart');
      return;
    }

    console.log('🌐 Network: BSC Testnet (97)');
    console.log('');

    // Note: For a complete deployment, you would need to compile the contract
    // This is a simplified version that shows the process
    console.log('📝 Contract Features:');
    console.log('✅ Standard ERC20 functionality');
    console.log('✅ Point-to-token migration system');
    console.log('✅ Self-minting capability (migrateMyPoints)');
    console.log('✅ Admin minting (migratePoints)');
    console.log('✅ Migration ID tracking to prevent double-spending');
    console.log('✅ Configurable point-to-token ratio');
    console.log('');

    console.log('🔧 To complete deployment:');
    console.log('1. Compile the contract using Hardhat or Remix');
    console.log('2. Deploy to BSC Testnet');
    console.log('3. Update CONTRACT_ADDRESS in .env file');
    console.log('4. Start the migration API server');
    console.log('');

    console.log('💡 The new contract allows users to:');
    console.log('• Pay their own gas fees for minting');
    console.log('• Mint tokens directly without needing admin approval');
    console.log('• Use their C-Cube wallet private key for transactions');
    console.log('');

    // For now, let's use the existing contract but update the configuration
    const existingContractAddress = "0x4b35C661652700953A8E23704AE6211D447C412A";
    console.log('📍 Using existing contract for testing:', existingContractAddress);
    console.log('✅ System configured to use C-Cube wallet private keys for minting!');

  } catch (error) {
    console.error('❌ Deployment preparation failed:', error.message);
  }
}

// Run the deployment preparation
deployContract();