const solc = require('solc');
const { ethers } = require('ethers');
const fs = require('fs');

// BSC Testnet configuration
const BSC_TESTNET_RPC = 'https://data-seed-prebsc-1-s1.binance.org:8545/';
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Simple LCUBE token contract source
const LCUBE_SOURCE = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LCUBEToken {
    string public name = "LearnCube";
    string public symbol = "LCUBE";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    constructor() {
        totalSupply = 100000000 * 10**decimals; // 100M tokens
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }
    
    function transfer(address to, uint256 value) public returns (bool) {
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }
    
    function approve(address spender, uint256 value) public returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 value) public returns (bool) {
        require(balanceOf[from] >= value, "Insufficient balance");
        require(allowance[from][msg.sender] >= value, "Insufficient allowance");
        
        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;
        
        emit Transfer(from, to, value);
        return true;
    }
}
`;

function compileContract(source) {
    const input = {
        language: 'Solidity',
        sources: {
            'LCUBEToken.sol': {
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

    const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
    const contract = tempFile.contracts['LCUBEToken.sol']['LCUBEToken'];
    
    return {
        bytecode: contract.evm.bytecode.object,
        abi: contract.abi
    };
}

async function launchLCUBE() {
    try {
        console.log('\n🚀 LAUNCHING LCUBE TOKEN ON BSC TESTNET');
        console.log('=====================================');
        
        if (!PRIVATE_KEY) {
            throw new Error('Private key not found');
        }
        
        console.log('🔧 Compiling contract...');
        const { bytecode, abi } = compileContract(LCUBE_SOURCE);
        
        console.log('✅ Contract compiled successfully');
        
        // Connect to BSC Testnet
        const provider = new ethers.JsonRpcProvider(BSC_TESTNET_RPC);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        
        console.log(`📱 Deployer: ${wallet.address}`);
        
        // Check balance
        const balance = await provider.getBalance(wallet.address);
        const balanceInBNB = ethers.formatEther(balance);
        console.log(`💰 Balance: ${balanceInBNB} BNB`);
        
        if (parseFloat(balanceInBNB) < 0.01) {
            throw new Error('Insufficient BNB balance. Get test BNB from: https://testnet.binance.org/faucet-smart');
        }
        
        console.log('\n⏳ Deploying LCUBE contract...');
        
        // Create contract factory
        const contractFactory = new ethers.ContractFactory(abi, '0x' + bytecode, wallet);
        
        // Deploy contract
        console.log('📦 Broadcasting transaction...');
        const contract = await contractFactory.deploy({
            gasLimit: 1000000,
            gasPrice: ethers.parseUnits('5', 'gwei')
        });
        
        console.log(`🔄 Transaction hash: ${contract.deploymentTransaction().hash}`);
        console.log('⏳ Waiting for confirmation...');
        
        // Wait for deployment
        await contract.waitForDeployment();
        const contractAddress = await contract.getAddress();
        
        console.log('\n🎉 LCUBE TOKEN DEPLOYED SUCCESSFULLY!');
        console.log('===================================');
        console.log(`📄 Contract Address: ${contractAddress}`);
        console.log(`🔗 BSC Testnet Explorer: https://testnet.bscscan.com/address/${contractAddress}`);
        console.log(`🔗 Transaction: https://testnet.bscscan.com/tx/${contract.deploymentTransaction().hash}`);
        
        // Verify deployment
        console.log('\n📊 Verifying deployment...');
        const name = await contract.name();
        const symbol = await contract.symbol();
        const decimals = await contract.decimals();
        const totalSupply = await contract.totalSupply();
        const ownerBalance = await contract.balanceOf(wallet.address);
        
        console.log(`   Name: ${name}`);
        console.log(`   Symbol: ${symbol}`);
        console.log(`   Decimals: ${decimals}`);
        console.log(`   Total Supply: ${ethers.formatEther(totalSupply)} LCUBE`);
        console.log(`   Owner Balance: ${ethers.formatEther(ownerBalance)} LCUBE`);
        
        console.log('\n🔧 Integration Info:');
        console.log(`Contract Address: ${contractAddress}`);
        console.log(`Network: BSC Testnet (97)`);
        console.log(`RPC: ${BSC_TESTNET_RPC}`);
        
        // Update integration guide
        const integrationUpdate = `
// LCUBE Token Deployed!
const LCUBE_CONFIG = {
  testnet: {
    contractAddress: '${contractAddress}',
    rpcUrl: '${BSC_TESTNET_RPC}',
    chainId: 97,
    deployedAt: '${new Date().toISOString()}'
  }
};
`;
        
        fs.writeFileSync('LCUBE_DEPLOYMENT_RESULTS.js', integrationUpdate);
        console.log('✅ Deployment info saved to LCUBE_DEPLOYMENT_RESULTS.js');
        
        return {
            success: true,
            contractAddress,
            transactionHash: contract.deploymentTransaction().hash,
            name,
            symbol,
            totalSupply: ethers.formatEther(totalSupply)
        };
        
    } catch (error) {
        console.error('\n❌ DEPLOYMENT FAILED:', error.message);
        return { success: false, error: error.message };
    }
}

// Launch the token
launchLCUBE()
    .then(result => {
        if (result.success) {
            console.log('\n✅ LCUBE LAUNCH COMPLETED!');
            console.log(`🎯 YOUR TOKEN ADDRESS: ${result.contractAddress}`);
        } else {
            console.log('\n❌ Launch failed:', result.error);
        }
        process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
        console.error('Launch error:', error);
        process.exit(1);
    });