#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function configure() {
    console.log('🔧 BSC Testnet Token Creator Configuration');
    console.log('=' .repeat(50));
    console.log('⚠️  This will update your .env file with your token configuration');
    console.log('💡 Press Ctrl+C to cancel at any time\n');

    try {
        // Get token configuration
        console.log('📋 Token Configuration:');
        const tokenName = await question('Token Name (e.g., "My Awesome Token"): ');
        const tokenSymbol = await question('Token Symbol (e.g., "MAT"): ');
        const decimals = await question('Token Decimals (default: 18): ') || '18';
        const initialSupply = await question('Initial Supply (e.g., 1000000): ');

        console.log('\n💰 Wallet Configuration:');
        console.log('⚠️  IMPORTANT: Your private key will be stored in .env file');
        console.log('🔒 Make sure to keep this file secure and never share it!');
        
        const walletAddress = await question('Wallet Address (0x...): ');
        const privateKey = await question('Private Key (without 0x prefix): ');

        // Validate inputs
        if (!tokenName || !tokenSymbol || !initialSupply || !walletAddress || !privateKey) {
            throw new Error('All fields are required!');
        }

        if (privateKey.length !== 64 || !/^[a-fA-F0-9]{64}$/.test(privateKey)) {
            throw new Error('Private key must be 64 hex characters without 0x prefix');
        }

        if (!walletAddress.startsWith('0x') || walletAddress.length !== 42) {
            throw new Error('Wallet address must be a valid Ethereum address (0x...)');
        }

        // Create .env content
        const envContent = `# BSC Testnet Token Creator Environment Variables

# Wallet Configuration
WALLET_ADDRESS=${walletAddress}
PRIVATE_KEY=${privateKey}

# Token Configuration
TOKEN_NAME=${tokenName}
TOKEN_SYMBOL=${tokenSymbol}
TOKEN_DECIMALS=${decimals}
INITIAL_SUPPLY=${initialSupply}

# Network Configuration
BSC_TESTNET_RPC=https://data-seed-prebsc-1-s1.binance.org:8545/
CHAIN_ID=97
GAS_LIMIT=2000000
GAS_PRICE=10000000000

# Optional: Explorer URLs
BSC_TESTNET_EXPLORER=https://testnet.bscscan.com

# Security Note: Never commit your actual .env file with real private keys!`;

        // Write to .env file
        const envPath = path.join(__dirname, '.env');
        fs.writeFileSync(envPath, envContent);

        console.log('\n✅ Configuration saved to .env file!');
        console.log('\n📋 Configuration Summary:');
        console.log(`Token Name: ${tokenName}`);
        console.log(`Token Symbol: ${tokenSymbol}`);
        console.log(`Decimals: ${decimals}`);
        console.log(`Initial Supply: ${initialSupply}`);
        console.log(`Wallet: ${walletAddress}`);
        
        console.log('\n🎯 Next Steps:');
        console.log('1. Get testnet BNB: https://testnet.binance.org/faucet-smart');
        console.log('2. Run deployment: npm run deploy');
        
        console.log('\n⚠️  Security Reminder:');
        console.log('- Keep your .env file secure');
        console.log('- Never share your private key');
        console.log('- This is for TESTNET only');

    } catch (error) {
        console.error('\n❌ Configuration failed:', error.message);
        process.exit(1);
    } finally {
        rl.close();
    }
}

configure();