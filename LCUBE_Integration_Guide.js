/**
 * LCUBE Token Integration with C-Cube Learning Points
 * Connect your learning system to blockchain token rewards
 */

const { ethers } = require('ethers');

// Configuration (update after deployment)
const CONFIG = {
    // BSC Testnet
    testnet: {
        rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
        contractAddress: 'TESTNET_CONTRACT_ADDRESS_HERE', // Update after testnet deployment
        chainId: 97
    },
    // BSC Mainnet  
    mainnet: {
        rpcUrl: 'https://bsc-dataseed1.binance.org/',
        contractAddress: 'MAINNET_CONTRACT_ADDRESS_HERE', // Update after mainnet deployment
        chainId: 56
    }
};

// LCUBE Contract ABI (same as in deployment file)
const LCUBE_ABI = [
    "function mintFromPoints(address learner, uint256 points, string memory activity)",
    "function batchMintFromPoints(address[] memory learners, uint256[] memory points, string[] memory activities)",
    "function balanceOf(address account) view returns (uint256)",
    "function totalPointsEarned(address account) view returns (uint256)",
    "function totalSupply() view returns (uint256)",
    "event TokensMinted(address indexed learner, uint256 points, uint256 tokens)",
    "event PointsEarned(address indexed learner, uint256 points, string activity)"
];

class LCUBEIntegration {
    constructor(network = 'testnet') {
        this.network = network;
        this.config = CONFIG[network];
        
        // Backend wallet (authorized minter)
        this.privateKey = process.env.PRIVATE_KEY;
        
        // Setup blockchain connection
        this.provider = new ethers.JsonRpcProvider(this.config.rpcUrl);
        this.wallet = new ethers.Wallet(this.privateKey, this.provider);
        this.contract = new ethers.Contract(
            this.config.contractAddress,
            LCUBE_ABI,
            this.wallet
        );
        
        console.log(`🔗 Connected to LCUBE on ${network}`);
        console.log(`📄 Contract: ${this.config.contractAddress}`);
    }
    
    /**
     * Convert learning points to LCUBE tokens
     * Called when student earns points in your C-Cube app
     */
    async convertPointsToTokens(studentWalletAddress, pointsEarned, activityDescription) {
        try {
            console.log(`\n🎓 Converting ${pointsEarned} points to LCUBE tokens`);
            console.log(`👤 Student: ${studentWalletAddress}`);
            console.log(`📚 Activity: ${activityDescription}`);
            
            // Call smart contract to mint tokens
            const tx = await this.contract.mintFromPoints(
                studentWalletAddress,
                pointsEarned,
                activityDescription
            );
            
            console.log(`⏳ Transaction submitted: ${tx.hash}`);
            console.log(`🔗 View on explorer: ${this.getExplorerUrl(tx.hash)}`);
            
            // Wait for blockchain confirmation
            const receipt = await tx.wait();
            
            console.log(`✅ Tokens minted successfully!`);
            console.log(`📊 Gas used: ${receipt.gasUsed.toString()}`);
            
            // Get updated balances
            const studentBalance = await this.contract.balanceOf(studentWalletAddress);
            const totalSupply = await this.contract.totalSupply();
            
            console.log(`💰 Student's LCUBE balance: ${ethers.formatEther(studentBalance)}`);
            console.log(`📈 Total LCUBE supply: ${ethers.formatEther(totalSupply)}`);
            
            return {
                success: true,
                transactionHash: tx.hash,
                studentBalance: ethers.formatEther(studentBalance),
                totalSupply: ethers.formatEther(totalSupply),
                explorerUrl: this.getExplorerUrl(tx.hash)
            };
            
        } catch (error) {
            console.error(`❌ Failed to convert points to tokens:`, error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Batch convert multiple students' points efficiently
     */
    async batchConvertPoints(studentsData) {
        try {
            const addresses = studentsData.map(s => s.walletAddress);
            const points = studentsData.map(s => s.points);
            const activities = studentsData.map(s => s.activity);
            
            console.log(`\n🎓 Batch converting points for ${studentsData.length} students`);
            
            const tx = await this.contract.batchMintFromPoints(addresses, points, activities);
            const receipt = await tx.wait();
            
            console.log(`✅ Batch minting completed!`);
            console.log(`🔗 Transaction: ${this.getExplorerUrl(tx.hash)}`);
            
            return {
                success: true,
                transactionHash: tx.hash,
                studentsProcessed: studentsData.length
            };
            
        } catch (error) {
            console.error(`❌ Batch conversion failed:`, error.message);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Get student's LCUBE token balance
     */
    async getStudentBalance(walletAddress) {
        try {
            const balance = await this.contract.balanceOf(walletAddress);
            const totalPoints = await this.contract.totalPointsEarned(walletAddress);
            
            return {
                lcubeBalance: ethers.formatEther(balance),
                totalPointsEarned: totalPoints.toString(),
                walletAddress
            };
        } catch (error) {
            console.error(`❌ Failed to get balance:`, error.message);
            return null;
        }
    }
    
    /**
     * Get current token supply statistics
     */
    async getSupplyStats() {
        try {
            const totalSupply = await this.contract.totalSupply();
            const maxSupply = ethers.parseUnits("1000000000", 18); // 1B LCUBE
            const remainingSupply = maxSupply - totalSupply;
            
            return {
                totalSupply: ethers.formatEther(totalSupply),
                maxSupply: ethers.formatEther(maxSupply),
                remainingSupply: ethers.formatEther(remainingSupply),
                percentageIssued: ((totalSupply * 100n) / maxSupply).toString()
            };
        } catch (error) {
            console.error(`❌ Failed to get supply stats:`, error.message);
            return null;
        }
    }
    
    getExplorerUrl(txHash) {
        const baseUrl = this.network === 'testnet' 
            ? 'https://testnet.bscscan.com' 
            : 'https://bscscan.com';
        return `${baseUrl}/tx/${txHash}`;
    }
}

// Example usage functions for your C-Cube app integration
class CCubePointsIntegration {
    constructor() {
        this.lcube = new LCUBEIntegration('testnet'); // Start with testnet
        this.pendingConversions = new Map(); // Track pending point conversions
    }
    
    /**
     * Called when student completes a quiz in your C-Cube app
     */
    async onQuizCompleted(studentData) {
        const { walletAddress, pointsEarned, quizName, userId } = studentData;
        
        // Convert points to tokens
        const result = await this.lcube.convertPointsToTokens(
            walletAddress,
            pointsEarned,
            `Quiz: ${quizName}`
        );
        
        if (result.success) {
            // Update your database
            await this.updateStudentRecord(userId, {
                lcubeEarned: pointsEarned,
                transactionHash: result.transactionHash,
                newBalance: result.studentBalance
            });
            
            // Notify student
            await this.notifyStudent(userId, {
                tokensEarned: pointsEarned,
                activity: `Quiz: ${quizName}`,
                explorerUrl: result.explorerUrl
            });
        }
        
        return result;
    }
    
    /**
     * Called when student completes Story Mode chapter
     */
    async onChapterCompleted(studentData) {
        const { walletAddress, pointsEarned, chapterNumber, userId } = studentData;
        
        return await this.lcube.convertPointsToTokens(
            walletAddress,
            pointsEarned,
            `Story Mode Chapter ${chapterNumber}`
        );
    }
    
    /**
     * Called when student uses AI Assistant
     */
    async onAIInteraction(studentData) {
        const { walletAddress, pointsEarned, interactionType, userId } = studentData;
        
        return await this.lcube.convertPointsToTokens(
            walletAddress,
            pointsEarned,
            `AI Assistant: ${interactionType}`
        );
    }
    
    /**
     * Process daily batch of earned points (gas optimization)
     */
    async processDailyRewards() {
        // Get all pending point conversions from your database
        const pendingRewards = await this.getPendingRewards();
        
        if (pendingRewards.length > 0) {
            const result = await this.lcube.batchConvertPoints(pendingRewards);
            
            if (result.success) {
                // Mark as processed in database
                await this.markRewardsAsProcessed(pendingRewards);
            }
        }
    }
    
    // Placeholder functions - implement based on your database
    async updateStudentRecord(userId, data) {
        // Update your C-Cube user database
        console.log(`Updating student ${userId}:`, data);
    }
    
    async notifyStudent(userId, data) {
        // Send notification to student
        console.log(`Notifying student ${userId}:`, data);
    }
    
    async getPendingRewards() {
        // Get pending rewards from your database
        return [];
    }
    
    async markRewardsAsProcessed(rewards) {
        // Mark rewards as processed in database
        console.log(`Marked ${rewards.length} rewards as processed`);
    }
}

// Export for use in your C-Cube application
module.exports = {
    LCUBEIntegration,
    CCubePointsIntegration,
    CONFIG,
    LCUBE_ABI
};

// Example test function
async function testIntegration() {
    console.log('\n🧪 Testing LCUBE Integration...');
    
    const integration = new LCUBEIntegration('testnet');
    
    // Test converting points for a student
    const result = await integration.convertPointsToTokens(
        '0x519Aed31035cF4cdfd06AeFc586A3bE081E999CC', // Your wallet for testing
        50, // 50 points earned
        'Test Quiz Completion'
    );
    
    console.log('Test Result:', result);
    
    // Get supply stats
    const stats = await integration.getSupplyStats();
    console.log('Supply Stats:', stats);
}

// Uncomment to test (after updating contract addresses)
// testIntegration().catch(console.error);

console.log(`
🎯 LCUBE Integration Ready!

📋 SETUP CHECKLIST:
1. ✅ Deploy LCUBE token contract
2. ⏳ Update CONFIG with deployed contract addresses
3. ⏳ Set PRIVATE_KEY environment variable  
4. ⏳ Integrate with your C-Cube app
5. ⏳ Test on testnet first

🔧 INTEGRATION STEPS:
1. Student earns points in C-Cube app
2. App calls: convertPointsToTokens(walletAddress, points, activity)
3. Smart contract mints LCUBE tokens to student's wallet
4. Token supply increases automatically
5. Student sees tokens in their BSC wallet

💡 OPTIMIZATION TIPS:
- Use batch processing for multiple students (saves gas)
- Process rewards daily instead of instantly (cheaper)
- Start with testnet for free testing
- Monitor gas prices for cost optimization
`);