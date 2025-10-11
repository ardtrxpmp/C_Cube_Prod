const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const solc = require('solc');

// Load environment variables
require('dotenv').config();

// Save individual token file to GitHub database
async function saveTokenToGitHub(tokenData) {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO_OWNER = 'cyfocube';
    const REPO_NAME = 'C_DataBase';
    
    if (!GITHUB_TOKEN) {
        throw new Error('GitHub token not configured');
    }

    try {
        // Create filename based on contract address (lowercase, no 0x prefix)
        const contractAddress = tokenData.contractAddress.toLowerCase().replace('0x', '');
        const FILE_PATH = `tokens/${contractAddress}.json`;

        console.log(`Saving token data to: ${FILE_PATH}`);

        // Prepare the complete token data structure
        const completeTokenData = {
            tokenName: tokenData.tokenName,
            tokenSymbol: tokenData.tokenSymbol,
            description: tokenData.description || `${tokenData.tokenName} (${tokenData.tokenSymbol}) - BSC Token`,
            initialSupply: tokenData.initialSupply,
            walletAddress: tokenData.ownerAddress,
            twitter: tokenData.twitter || '',
            website: tokenData.website || '',
            telegram: tokenData.telegram || '',
            success: true,
            contractAddress: tokenData.contractAddress,
            transactionHash: tokenData.transactionHash,
            explorerUrl: tokenData.explorerUrl,
            deploymentInfo: {
                contractAddress: tokenData.contractAddress,
                transactionHash: tokenData.transactionHash,
                tokenName: tokenData.tokenName,
                tokenSymbol: tokenData.tokenSymbol,
                decimals: tokenData.decimals,
                initialSupply: tokenData.initialSupply,
                ownerAddress: tokenData.ownerAddress,
                network: tokenData.network,
                chainId: tokenData.chainId,
                deployedAt: tokenData.deployedAt,
                explorerUrl: tokenData.explorerUrl
            }
        };

        // Add image metadata if image exists
        if (tokenData.tokenImage) {
            const imageFileName = `${contractAddress}.png`;
            const imageUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/images/${imageFileName}`;
            
            completeTokenData.image = {
                fileName: imageFileName,
                url: imageUrl,
                githubPath: `images/${imageFileName}`,
                contractAddress: tokenData.contractAddress,
                uploadedAt: new Date().toISOString()
            };

            completeTokenData.metadata = {
                contractAddress: tokenData.contractAddress,
                hasImage: true,
                imageUrl: imageUrl,
                createdAt: new Date().toISOString(),
                dataFile: `${contractAddress}.json`
            };
        } else {
            completeTokenData.metadata = {
                contractAddress: tokenData.contractAddress,
                hasImage: false,
                imageUrl: null,
                createdAt: new Date().toISOString(),
                dataFile: `${contractAddress}.json`
            };
        }

        // Convert to base64 for GitHub API
        const base64Content = Buffer.from(JSON.stringify(completeTokenData, null, 2)).toString('base64');

        // Save the individual token file
        const response = await fetch(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: `Deploy token: ${tokenData.tokenName} (${tokenData.tokenSymbol})`,
                    content: base64Content
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('GitHub API Error:', errorText);
            throw new Error(`Failed to save token to GitHub: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Token data saved to GitHub successfully');

        // If there's an image, save it to the images folder
        if (tokenData.tokenImage) {
            console.log('Image data received:', typeof tokenData.tokenImage, tokenData.tokenImage ? tokenData.tokenImage.length : 'null');
            try {
                await saveTokenImageToGitHub(tokenData.tokenImage, contractAddress);
                console.log('Token image saved to GitHub successfully');
            } catch (imageError) {
                console.error('Failed to save image, but token data was saved:', imageError);
                // Don't throw error here - token data is already saved
            }
        } else {
            console.log('No image data provided in tokenData');
        }

        return {
            success: true,
            githubUrl: result.content.html_url,
            fileName: `${contractAddress}.json`,
            imageSaved: !!tokenData.tokenImage,
            message: 'Token successfully saved to database'
        };

    } catch (error) {
        console.error('Error saving token to GitHub:', error);
        throw error;
    }
}

// Save token image to GitHub
async function saveTokenImageToGitHub(imageData, contractAddress) {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO_OWNER = 'cyfocube';
    const REPO_NAME = 'C_DataBase';
    const IMAGE_PATH = `images/${contractAddress}.png`;

    try {
        // Handle both base64 string and buffer input
        let base64Image;
        if (typeof imageData === 'string') {
            // Already base64 string from frontend
            base64Image = imageData;
        } else {
            // Convert buffer to base64 (fallback)
            base64Image = imageData.toString('base64');
        }

        const response = await fetch(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${IMAGE_PATH}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: `Add token image: ${contractAddress}.png`,
                    content: base64Image
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('GitHub Image API Error:', errorText);
            throw new Error(`Failed to save image to GitHub: ${response.status} ${response.statusText}`);
        }

        console.log('Image saved to GitHub successfully');
        return await response.json();

    } catch (error) {
        console.error('Error saving image to GitHub:', error);
        throw error;
    }
}

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
        const { 
            tokenName, 
            tokenSymbol, 
            initialSupply, 
            walletAddress, 
            isMainnet = false,
            description = '',
            website = '',
            twitter = '',
            telegram = '',
            tokenImage = null
        } = req.body;
        
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
        
        // Network configuration based on isMainnet flag
        const RPC_URL = isMainnet 
            ? (process.env.BSC_MAINNET_RPC || 'https://bsc-dataseed.binance.org/')
            : (process.env.BSC_TESTNET_RPC || 'https://data-seed-prebsc-1-s1.binance.org:8545/');
        const explorerBaseUrl = isMainnet 
            ? (process.env.BSC_MAINNET_EXPLORER || 'https://bscscan.com')
            : (process.env.BSC_TESTNET_EXPLORER || 'https://testnet.bscscan.com');
        const networkName = isMainnet ? 'BSC Mainnet' : 'BSC Testnet';
        const chainId = isMainnet ? 56 : 97;
        
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
        
        // Save deployment info with additional metadata
        const deploymentInfo = {
            contractAddress,
            transactionHash,
            tokenName,
            tokenSymbol,
            decimals,
            initialSupply,
            ownerAddress: walletAddress,
            network: networkName,
            chainId: chainId,
            deployedAt: new Date().toISOString(),
            explorerUrl,
            description,
            website,
            twitter,
            telegram,
            tokenImage
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
        
        // Save to GitHub database
        try {
            await saveTokenToGitHub(deploymentInfo);
            console.log('💾 Token saved to GitHub database');
        } catch (gitError) {
            console.error('⚠️ Failed to save to GitHub database:', gitError.message);
            // Don't fail the deployment if GitHub save fails
        }
        
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