const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Compile contract function
async function compileContract() {
    const solc = require('solc');
    
    // Read the contract source code
    const contractPath = path.join(__dirname, 'contracts', 'CustomToken.sol');
    const source = fs.readFileSync(contractPath, 'utf8');
    
    // Solidity compiler input
    const input = {
        language: 'Solidity',
        sources: {
            'CustomToken.sol': {
                content: source,
            },
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*'],
                },
            },
        },
    };
    
    console.log('🔨 Compiling contract...');
    const output = JSON.parse(solc.compile(JSON.stringify(input)));
    
    if (output.errors) {
        output.errors.forEach(error => {
            if (error.severity === 'error') {
                console.error('❌ Compilation error:', error.formattedMessage);
                process.exit(1);
            } else {
                console.warn('⚠️ Compilation warning:', error.formattedMessage);
            }
        });
    }
    
    const contract = output.contracts['CustomToken.sol']['CustomToken'];
    console.log('✅ Contract compiled successfully!');
    
    return {
        abi: contract.abi,
        bytecode: contract.evm.bytecode.object,
    };
}

// Deploy contract function
async function deployToken() {
    try {
        console.log('🚀 Starting BSC Testnet Token Deployment...\n');
        
        // Validate environment variables
        const requiredEnvVars = [
            'WALLET_ADDRESS',
            'PRIVATE_KEY',
            'TOKEN_NAME',
            'TOKEN_SYMBOL',
            'INITIAL_SUPPLY'
        ];
        
        for (const envVar of requiredEnvVars) {
            if (!process.env[envVar]) {
                throw new Error(`❌ Missing environment variable: ${envVar}`);
            }
        }
        
        // Validate private key format
        const privateKey = process.env.PRIVATE_KEY;
        if (privateKey === 'your_private_key_here_without_0x_prefix' || 
            privateKey.length !== 64 || 
            !/^[a-fA-F0-9]{64}$/.test(privateKey)) {
            throw new Error(`❌ Invalid private key format. Please provide a valid 64-character hex private key without 0x prefix.`);
        }
        
        // Validate wallet address format
        const walletAddress = process.env.WALLET_ADDRESS;
        if (walletAddress === '0x1234567890123456789012345678901234567890' ||
            !ethers.isAddress(walletAddress)) {
            throw new Error(`❌ Invalid wallet address. Please provide a valid Ethereum address.`);
        }
        
        // Network configuration
        const RPC_URL = process.env.BSC_TESTNET_RPC || 'https://data-seed-prebsc-1-s1.binance.org:8545/';
        const CHAIN_ID = parseInt(process.env.CHAIN_ID) || 97;
        
        console.log('📡 Connecting to BSC Testnet...');
        console.log(`RPC URL: ${RPC_URL}`);
        console.log(`Chain ID: ${CHAIN_ID}\n`);
        
        // Create provider and wallet
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        
        console.log(`💰 Deploying from wallet: ${wallet.address}`);
        
        // Check balance
        const balance = await provider.getBalance(wallet.address);
        console.log(`💳 Wallet balance: ${ethers.formatEther(balance)} BNB`);
        
        if (balance === 0n) {
            console.log('⚠️ Warning: Wallet has no BNB for gas fees!');
            console.log('💡 Get testnet BNB from: https://testnet.binance.org/faucet-smart');
        }
        
        // Compile contract
        const { abi, bytecode } = await compileContract();
        
        // Contract parameters from environment variables
        const tokenName = process.env.TOKEN_NAME;
        const tokenSymbol = process.env.TOKEN_SYMBOL;
        const decimals = parseInt(process.env.TOKEN_DECIMALS) || 18;
        const initialSupply = process.env.INITIAL_SUPPLY;
        const ownerAddress = process.env.WALLET_ADDRESS;
        
        console.log('🎯 Token Configuration:');
        console.log(`Name: ${tokenName}`);
        console.log(`Symbol: ${tokenSymbol}`);
        console.log(`Decimals: ${decimals}`);
        console.log(`Initial Supply: ${initialSupply}`);
        console.log(`Owner: ${ownerAddress}\n`);
        
        // Create contract factory
        const contractFactory = new ethers.ContractFactory(abi, bytecode, wallet);
        
        // Deploy contract
        console.log('📦 Deploying contract...');
        
        // Estimate gas for deployment
        const deployTx = await contractFactory.getDeployTransaction(
            tokenName,
            tokenSymbol,
            decimals,
            initialSupply,
            ownerAddress
        );
        
        const gasEstimate = await provider.estimateGas(deployTx);
        const gasPrice = await provider.getFeeData();
        
        console.log(`⛽ Estimated gas: ${gasEstimate.toString()}`);
        console.log(`💰 Gas price: ${ethers.formatUnits(gasPrice.gasPrice, 'gwei')} gwei`);
        
        const contract = await contractFactory.deploy(
            tokenName,
            tokenSymbol,
            decimals,
            initialSupply,
            ownerAddress,
            {
                gasLimit: gasEstimate * 120n / 100n, // Add 20% buffer
                gasPrice: gasPrice.gasPrice
            }
        );
        
        console.log('⏳ Waiting for deployment confirmation...');
        await contract.waitForDeployment();
        
        const contractAddress = await contract.getAddress();
        
        console.log('\n🎉 TOKEN DEPLOYED SUCCESSFULLY! 🎉');
        console.log('=' .repeat(50));
        console.log(`📄 Contract Address: ${contractAddress}`);
        console.log(`🔗 Transaction Hash: ${contract.deploymentTransaction().hash}`);
        console.log(`🌐 BSC Testnet Explorer: ${process.env.BSC_TESTNET_EXPLORER}/address/${contractAddress}`);
        console.log(`📊 Token Details:`);
        console.log(`   Name: ${tokenName}`);
        console.log(`   Symbol: ${tokenSymbol}`);
        console.log(`   Total Supply: ${initialSupply} ${tokenSymbol}`);
        console.log('=' .repeat(50));
        
        // Save deployment info
        const deploymentInfo = {
            contractAddress,
            transactionHash: contract.deploymentTransaction().hash,
            tokenName,
            tokenSymbol,
            decimals,
            initialSupply,
            ownerAddress,
            network: 'BSC Testnet',
            chainId: CHAIN_ID,
            deployedAt: new Date().toISOString(),
            explorerUrl: `${process.env.BSC_TESTNET_EXPLORER}/address/${contractAddress}`
        };
        
        fs.writeFileSync(
            path.join(__dirname, 'deployment-info.json'),
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        console.log('💾 Deployment info saved to deployment-info.json');
        
        return contractAddress;
        
    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        
        if (error.code === 'INSUFFICIENT_FUNDS') {
            console.log('\n💡 Solution: Add testnet BNB to your wallet');
            console.log('🔗 BSC Testnet Faucet: https://testnet.binance.org/faucet-smart');
        }
        
        process.exit(1);
    }
}

// Run deployment if called directly
if (require.main === module) {
    deployToken();
}

module.exports = { deployToken, compileContract };