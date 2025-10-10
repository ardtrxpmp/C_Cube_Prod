const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const solc = require('solc');

// Load environment variables
require('dotenv').config();

// Compile contract function
async function compileContract() {
    // Read the contract source code
    const contractPath = path.join(__dirname, '..', 'token-creator', 'contracts', 'CustomToken.sol');
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
                throw new Error('Compilation error: ' + error.formattedMessage);
            }
        });
    }
    
    const contract = output.contracts['CustomToken.sol']['CustomToken'];
    return {
        abi: contract.abi,
        bytecode: contract.evm.bytecode.object,
    };
}

// Deploy token function
async function deployToken(req, res) {
    try {
        console.log('🚀 Starting token deployment...');
        
        // Get data from request body
        const { tokenName, tokenSymbol, initialSupply, walletAddress } = req.body;
        
        // Validate required fields
        if (!tokenName || !tokenSymbol || !initialSupply || !walletAddress) {
            return res.status(400).json({
                error: 'Missing required fields: tokenName, tokenSymbol, initialSupply, walletAddress'
            });
        }
        
        // Validate wallet address
        if (!ethers.isAddress(walletAddress)) {
            return res.status(400).json({
                error: 'Invalid wallet address format'
            });
        }
        
        // Get private key from environment
        const privateKey = process.env.PRIVATE_KEY;
        if (!privateKey) {
            return res.status(500).json({
                error: 'Private key not configured in environment'
            });
        }
        
        // Network configuration
        const RPC_URL = process.env.BSC_TESTNET_RPC || 'https://data-seed-prebsc-1-s1.binance.org:8545/';
        const explorerBaseUrl = process.env.BSC_TESTNET_EXPLORER || 'https://testnet.bscscan.com';
        
        // Create provider and wallet
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const wallet = new ethers.Wallet(privateKey, provider);
        
        console.log(`💰 Deploying from wallet: ${wallet.address}`);
        
        // Check balance
        const balance = await provider.getBalance(wallet.address);
        console.log(`💳 Wallet balance: ${ethers.formatEther(balance)} BNB`);
        
        if (balance === 0n) {
            return res.status(400).json({
                error: 'Insufficient BNB balance for gas fees'
            });
        }
        
        // Compile contract
        const { abi, bytecode } = await compileContract();
        
        // Contract parameters
        const decimals = 18;
        
        console.log('🎯 Token Configuration:', {
            name: tokenName,
            symbol: tokenSymbol,
            decimals,
            supply: initialSupply,
            owner: walletAddress
        });
        
        // Create contract factory
        const contractFactory = new ethers.ContractFactory(abi, bytecode, wallet);
        
        // Estimate gas
        const deployTx = await contractFactory.getDeployTransaction(
            tokenName,
            tokenSymbol,
            decimals,
            initialSupply,
            walletAddress
        );
        
        const gasEstimate = await provider.estimateGas(deployTx);
        const gasPrice = await provider.getFeeData();
        
        console.log(`⛽ Estimated gas: ${gasEstimate.toString()}`);
        
        // Deploy contract
        console.log('📦 Deploying contract...');
        const contract = await contractFactory.deploy(
            tokenName,
            tokenSymbol,
            decimals,
            initialSupply,
            walletAddress,
            {
                gasLimit: gasEstimate * 120n / 100n, // Add 20% buffer
                gasPrice: gasPrice.gasPrice
            }
        );
        
        console.log('⏳ Waiting for deployment confirmation...');
        await contract.waitForDeployment();
        
        const contractAddress = await contract.getAddress();
        const transactionHash = contract.deploymentTransaction().hash;
        const explorerUrl = `${explorerBaseUrl}/address/${contractAddress}`;
        
        console.log('🎉 Token deployed successfully!');
        console.log(`Contract Address: ${contractAddress}`);
        console.log(`Transaction Hash: ${transactionHash}`);
        
        // Save deployment info
        const deploymentInfo = {
            contractAddress,
            transactionHash,
            tokenName,
            tokenSymbol,
            decimals,
            initialSupply,
            ownerAddress: walletAddress,
            network: 'BSC Testnet',
            chainId: 97,
            deployedAt: new Date().toISOString(),
            explorerUrl
        };
        
        // Save to file
        const deploymentDir = path.join(__dirname, '..', 'token-creator', 'deployments');
        if (!fs.existsSync(deploymentDir)) {
            fs.mkdirSync(deploymentDir, { recursive: true });
        }
        
        const filename = `${tokenSymbol}_${Date.now()}.json`;
        fs.writeFileSync(
            path.join(deploymentDir, filename),
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        // Return success response
        res.json({
            success: true,
            contractAddress,
            transactionHash,
            explorerUrl,
            deploymentInfo
        });
        
    } catch (error) {
        console.error('❌ Deployment failed:', error);
        
        let errorMessage = error.message;
        if (error.code === 'INSUFFICIENT_FUNDS') {
            errorMessage = 'Insufficient BNB balance for gas fees. Please add testnet BNB to your wallet.';
        }
        
        res.status(500).json({
            error: errorMessage
        });
    }
}

// Create Express router
const express = require('express');
const router = express.Router();

// POST route for token deployment
router.post('/', deployToken);

module.exports = router;