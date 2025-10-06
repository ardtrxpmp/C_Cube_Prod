const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying LCUBE Token Enhanced...");

  // Get the contract factory
  const LCUBETokenEnhanced = await ethers.getContractFactory("LCUBETokenEnhanced");

  // Deploy the contract
  const lcubeToken = await LCUBETokenEnhanced.deploy(
    "LearnCube Token", // name
    "LCUBE",          // symbol
    0                 // initial supply (0 - will mint as needed)
  );

  await lcubeToken.waitForDeployment();

  const contractAddress = await lcubeToken.getAddress();
  
  console.log("✅ LCUBE Token Enhanced deployed to:", contractAddress);
  console.log("📋 Contract Details:");
  console.log("   - Name:", await lcubeToken.name());
  console.log("   - Symbol:", await lcubeToken.symbol());
  console.log("   - Decimals:", await lcubeToken.decimals());
  console.log("   - Total Supply:", ethers.formatEther(await lcubeToken.totalSupply()));
  console.log("   - Owner:", await lcubeToken.owner());
  console.log("   - Point to Token Ratio:", await lcubeToken.pointToTokenRatio());

  // Verify contract on blockchain explorer (if not local)
  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name, "- Chain ID:", network.chainId);

  if (network.chainId !== 31337n) { // Not local hardhat network
    console.log("\n⏳ Waiting for block confirmations...");
    await lcubeToken.deploymentTransaction().wait(5); // Wait for 5 confirmations
    
    console.log("\n📝 To verify on block explorer, run:");
    console.log(`npx hardhat verify --network ${network.name} ${contractAddress} "LearnCube Token" "LCUBE" 0`);
  }

  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    deployer: (await ethers.getSigners())[0].address,
    network: network.name,
    chainId: network.chainId.toString(),
    blockNumber: await ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString(),
    contractDetails: {
      name: await lcubeToken.name(),
      symbol: await lcubeToken.symbol(),
      decimals: await lcubeToken.decimals(),
      totalSupply: (await lcubeToken.totalSupply()).toString(),
      owner: await lcubeToken.owner(),
      pointToTokenRatio: (await lcubeToken.pointToTokenRatio()).toString()
    }
  };

  console.log("\n💾 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  return { lcubeToken, deploymentInfo };
}

// Handle both direct execution and module export
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Deployment failed:", error);
      process.exit(1);
    });
}

module.exports = main;