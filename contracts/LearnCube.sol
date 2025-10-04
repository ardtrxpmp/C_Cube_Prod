// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LearnCube is ERC20, Ownable {
    // Learning-specific features
    mapping(address => uint256) public totalPointsEarned;
    mapping(address => bool) public authorizedMinters;
    
    uint256 public constant POINTS_TO_TOKEN_RATIO = 1; // 1 point = 1 LCUBE
    uint256 public constant MAX_SUPPLY = 1000000000 * 10**18; // 1 billion LCUBE
    
    event TokensMinted(address indexed learner, uint256 points, uint256 tokens);
    event PointsEarned(address indexed learner, uint256 points, string activity);
    
    modifier onlyAuthorized() {
        require(authorizedMinters[msg.sender] || msg.sender == owner(), "Not authorized to mint");
        _;
    }
    
    constructor() ERC20("LearnCube", "LCUBE") {
        // Mint 100M tokens (10% of max supply) to deployer
        _mint(msg.sender, 100000000 * 10**18);
        authorizedMinters[msg.sender] = true;
    }
    
    /**
     * Mint tokens based on learning points earned
     */
    function mintFromPoints(address learner, uint256 points, string memory activity) external onlyAuthorized {
        require(learner != address(0), "Cannot mint to zero address");
        require(points > 0, "Points must be greater than 0");
        
        uint256 tokensToMint = points * POINTS_TO_TOKEN_RATIO;
        require(totalSupply() + tokensToMint <= MAX_SUPPLY, "Would exceed max supply");
        
        _mint(learner, tokensToMint);
        totalPointsEarned[learner] += points;
        
        emit TokensMinted(learner, points, tokensToMint);
        emit PointsEarned(learner, points, activity);
    }
    
    /**
     * Batch mint tokens for multiple learners (gas optimization)
     */
    function batchMintFromPoints(
        address[] memory learners, 
        uint256[] memory points, 
        string[] memory activities
    ) external onlyAuthorized {
        require(learners.length == points.length && points.length == activities.length, "Array lengths mismatch");
        
        for (uint256 i = 0; i < learners.length; i++) {
            mintFromPoints(learners[i], points[i], activities[i]);
        }
    }
    
    /**
     * Add authorized minter (only owner)
     */
    function addAuthorizedMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = true;
    }
    
    /**
     * Remove authorized minter (only owner)
     */
    function removeAuthorizedMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
    }
    
    /**
     * Burn tokens
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}