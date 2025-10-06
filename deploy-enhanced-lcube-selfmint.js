const { ethers } = require('hardhat');

async function main() {
  console.log('🚀 Deploying Enhanced LCUBE Token with Self-Minting...');

  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log('Account balance:', ethers.formatEther(balance), 'BNB');

  // Deploy the enhanced LCUBE token
  const LCUBEToken = await ethers.getContractFactory('LCUBETokenEnhanced');
  
  const lcubeToken = await LCUBEToken.deploy(
    'LearnCube Token',  // name
    'LCUBE',           // symbol
    1000000            // initial supply (1M tokens)
  );

  await lcubeToken.waitForDeployment();
  const contractAddress = await lcubeToken.getAddress();
  
  console.log('✅ LCUBE Token deployed to:', contractAddress);
  console.log('🔗 Network: BSC Testnet (97)');
  console.log('👤 Owner:', deployer.address);
  
  // Verify contract is working
  const name = await lcubeToken.name();
  const symbol = await lcubeToken.symbol();
  const totalSupply = await lcubeToken.totalSupply();
  const decimals = await lcubeToken.decimals();
  
  console.log('\n📋 Contract Details:');
  console.log('Name:', name);
  console.log('Symbol:', symbol);
  console.log('Decimals:', decimals);
  console.log('Total Supply:', ethers.formatEther(totalSupply), symbol);
  
  // Check if deployer is authorized minter
  const isMinter = await lcubeToken.authorizedMinters(deployer.address);
  console.log('Deployer is authorized minter:', isMinter);
  
  console.log('\n🔧 Contract Configuration:');
  console.log('Contract Address:', contractAddress);
  console.log('Update your .env file:');
  console.log(`CONTRACT_ADDRESS=${contractAddress}`);
  
  console.log('\n✅ Deployment Complete!');
  console.log('🚀 Users can now mint their own tokens using migrateMyPoints()');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });