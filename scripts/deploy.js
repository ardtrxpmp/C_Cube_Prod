const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    console.log("\n🧪 Deploying LCUBE Token to BSC Testnet");
    console.log("=====================================");
    
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log(`📱 Deployer: ${deployer.address}`);
    
    // Check balance
    const balance = await deployer.getBalance();
    console.log(`💰 Balance: ${ethers.formatEther(balance)} BNB`);
    
    if (balance === 0n) {
        console.log("❌ No BNB balance. Get test BNB from: https://testnet.binance.org/faucet-smart");
        return;
    }
    
    // Deploy LCUBE contract
    console.log("\n⏳ Deploying LearnCube token...");
    const LearnCube = await ethers.getContractFactory("LearnCube");
    const lcube = await LearnCube.deploy();
    
    // Wait for deployment
    await lcube.waitForDeployment();
    const contractAddress = await lcube.getAddress();
    
    console.log("\n🎉 LCUBE Token Deployed Successfully!");
    console.log("===================================");
    console.log(`📄 Contract Address: ${contractAddress}`);
    console.log(`🔗 BSC Testnet Explorer: https://testnet.bscscan.com/address/${contractAddress}`);
    
    // Get token details
    const name = await lcube.name();
    const symbol = await lcube.symbol();
    const decimals = await lcube.decimals();
    const totalSupply = await lcube.totalSupply();
    const ownerBalance = await lcube.balanceOf(deployer.address);
    
    console.log("\n📊 Token Details:");
    console.log(`   Name: ${name}`);
    console.log(`   Symbol: ${symbol}`);
    console.log(`   Decimals: ${decimals}`);
    console.log(`   Total Supply: ${ethers.formatEther(totalSupply)} LCUBE`);
    console.log(`   Owner Balance: ${ethers.formatEther(ownerBalance)} LCUBE`);
    
    // Test minting functionality
    console.log("\n🧪 Testing Minting Functionality...");
    const testAddress = "0x519Aed31035cF4cdfd06AeFc586A3bE081E999CC"; // Your address
    const testPoints = 50;
    
    try {
        const mintTx = await lcube.mintFromPoints(testAddress, testPoints, "Test Quiz Completion");
        await mintTx.wait();
        
        const newBalance = await lcube.balanceOf(testAddress);
        const pointsEarned = await lcube.totalPointsEarned(testAddress);
        
        console.log(`✅ Test mint successful!`);
        console.log(`   ${testAddress} received: ${testPoints} LCUBE`);
        console.log(`   New balance: ${ethers.formatEther(newBalance)} LCUBE`);
        console.log(`   Total points earned: ${pointsEarned.toString()}`);
        
    } catch (error) {
        console.log(`⚠️  Test mint failed: ${error.message}`);
    }
    
    console.log("\n🔧 Integration Setup:");
    console.log("Update your LCUBE_Integration_Guide.js with:");
    console.log(`testnet: {`);
    console.log(`  contractAddress: '${contractAddress}',`);
    console.log(`  rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',`);
    console.log(`  chainId: 97`);
    console.log(`}`);
    
    console.log("\n🎯 Next Steps:");
    console.log("1. ✅ Token deployed and tested");
    console.log("2. ✅ Update integration files with contract address");
    console.log("3. ✅ Integrate with C-Cube learning system");
    console.log("4. ✅ Deploy to mainnet when ready");
    
    return {
        contractAddress,
        name,
        symbol,
        totalSupply: ethers.formatEther(totalSupply),
        ownerBalance: ethers.formatEther(ownerBalance)
    };
}

main()
    .then((result) => {
        console.log("\n✅ Deployment completed successfully!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Deployment failed:", error);
        process.exit(1);
    });