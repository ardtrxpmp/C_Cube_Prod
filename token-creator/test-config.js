const { ethers } = require('ethers');
require('dotenv').config();

async function testConfiguration() {
    console.log('🧪 Testing Configuration...\n');

    try {
        // Test environment variables
        const requiredVars = ['WALLET_ADDRESS', 'PRIVATE_KEY', 'TOKEN_NAME', 'TOKEN_SYMBOL', 'INITIAL_SUPPLY'];
        
        console.log('📋 Environment Variables:');
        for (const varName of requiredVars) {
            const value = process.env[varName];
            if (!value) {
                console.log(`❌ ${varName}: Missing`);
                return false;
            } else if (varName === 'PRIVATE_KEY') {
                console.log(`✅ ${varName}: ****${value.slice(-8)} (${value.length} chars)`);
            } else {
                console.log(`✅ ${varName}: ${value}`);
            }
        }

        // Test private key format
        console.log('\n🔑 Private Key Validation:');
        const privateKey = process.env.PRIVATE_KEY;
        if (privateKey.length !== 64) {
            console.log(`❌ Private key length: ${privateKey.length} (should be 64)`);
            return false;
        }
        if (!/^[a-fA-F0-9]{64}$/.test(privateKey)) {
            console.log('❌ Private key format: Invalid hex characters');
            return false;
        }
        console.log('✅ Private key format: Valid');

        // Test wallet creation
        console.log('\n💰 Wallet Validation:');
        const wallet = new ethers.Wallet(privateKey);
        console.log(`✅ Wallet created: ${wallet.address}`);
        
        if (wallet.address.toLowerCase() !== process.env.WALLET_ADDRESS.toLowerCase()) {
            console.log(`❌ Address mismatch!`);
            console.log(`   Private key derives: ${wallet.address}`);
            console.log(`   Environment has: ${process.env.WALLET_ADDRESS}`);
            return false;
        }
        console.log('✅ Address matches private key');

        // Test network connection
        console.log('\n📡 Network Connection:');
        const rpcUrl = process.env.BSC_TESTNET_RPC || 'https://data-seed-prebsc-1-s1.binance.org:8545/';
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        
        try {
            const network = await provider.getNetwork();
            console.log(`✅ Connected to network: Chain ID ${network.chainId}`);
            
            const balance = await provider.getBalance(wallet.address);
            console.log(`💳 Wallet balance: ${ethers.formatEther(balance)} BNB`);
            
            if (balance === 0n) {
                console.log('⚠️  Warning: No BNB for gas fees!');
                console.log('💡 Get testnet BNB: https://testnet.binance.org/faucet-smart');
            }
        } catch (error) {
            console.log(`❌ Network connection failed: ${error.message}`);
            return false;
        }

        console.log('\n🎉 Configuration Test Passed!');
        console.log('🚀 Ready to deploy token with: npm run deploy');
        return true;

    } catch (error) {
        console.error('\n❌ Configuration test failed:', error.message);
        return false;
    }
}

if (require.main === module) {
    testConfiguration();
}

module.exports = { testConfiguration };