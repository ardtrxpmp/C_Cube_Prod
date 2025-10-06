// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title LCUBE Token with Point Migration
 * @dev Enhanced ERC20 token for LearnCube platform with point migration functionality
 */
contract LCUBETokenEnhanced {
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    // Access control
    address public owner;
    mapping(address => bool) public authorizedMinters;
    
    // Point migration tracking
    mapping(address => uint256) public totalPointsMigrated;
    mapping(string => bool) public usedMigrationIds; // Prevent double spending
    
    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event PointsMigrated(address indexed user, uint256 points, uint256 tokens, string migrationId);
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    // Configuration
    uint256 public pointToTokenRatio = 1; // 1 point = 1 token (can be adjusted)
    uint256 public maxMigrationPerTransaction = 10000 * 10**decimals; // Max tokens per migration
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
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
        uint256 tokensToMint = points * pointToTokenRatio * 10**decimals / 1000; // Assuming points are in whole numbers
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
    
    function setMaxMigrationPerTransaction(uint256 _maxTokens) external onlyOwner {
        maxMigrationPerTransaction = _maxTokens;
    }
    
    function addMinter(address minter) external onlyOwner {
        require(minter != address(0), "Invalid minter address");
        require(!authorizedMinters[minter], "Already a minter");
        
        authorizedMinters[minter] = true;
        emit MinterAdded(minter);
    }
    
    function removeMinter(address minter) external onlyOwner {
        require(minter != address(0), "Invalid minter address");
        require(minter != owner, "Cannot remove owner as minter");
        require(authorizedMinters[minter], "Not a minter");
        
        authorizedMinters[minter] = false;
        emit MinterRemoved(minter);
    }
    
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        require(newOwner != owner, "New owner must be different");
        
        address previousOwner = owner;
        owner = newOwner;
        
        // Transfer minter rights to new owner
        authorizedMinters[newOwner] = true;
        emit MinterAdded(newOwner);
        
        emit OwnershipTransferred(previousOwner, newOwner);
    }
    
    // Emergency functions
    function emergencyWithdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
    
    // View functions
    function getMigrationInfo(address user) external view returns (uint256 totalMigrated, bool canMigrate) {
        return (totalPointsMigrated[user], true);
    }
    
    function isMigrationIdUsed(string memory migrationId) external view returns (bool) {
        return usedMigrationIds[migrationId];
    }
    
    function getTokensForPoints(uint256 points) external view returns (uint256) {
        return points * pointToTokenRatio * 10**decimals / 1000;
    }
}