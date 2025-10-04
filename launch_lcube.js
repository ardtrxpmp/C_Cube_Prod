const { ethers } = require('ethers');

// BSC Testnet configuration
const BSC_TESTNET_RPC = 'https://data-seed-prebsc-1-s1.binance.org:8545/';
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Simple LCUBE token contract
const LCUBE_CONTRACT = `
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

// Compiled contract bytecode (Solidity 0.8.0)
const LCUBE_BYTECODE = "0x608060405234801561001057600080fd5b506040518060400160405280600981526020017f4c6561726e4375626500000000000000000000000000000000000000000000008152506000908051906020019061005c9291906100f1565b506040518060400160405280600581526020017f4c43554245000000000000000000000000000000000000000000000000000000815250600190805190602001906100a89291906100f1565b506012600260006101000a81548160ff021916908360ff1602179055506012600a6100d39190610264565b6305f5e1006100e291906102b5565b6003819055506003543360015260006003549050600060015b602002602001820151600260009054906101000a900460ff166400"

const LCUBE_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "owner", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "spender", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "value", "type": "uint256"}
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "from", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "to", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "value", "type": "uint256"}
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}, {"internalType": "address", "name": "", "type": "address"}],
    "name": "allowance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "spender", "type": "address"}, {"internalType": "uint256", "name": "value", "type": "uint256"}],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "value", "type": "uint256"}],
    "name": "transfer",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "from", "type": "address"}, {"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "value", "type": "uint256"}],
    "name": "transferFrom",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

async function launchLCUBE() {
    try {
        console.log('\n🚀 LAUNCHING LCUBE TOKEN ON BSC TESTNET');
        console.log('=====================================');
        
        if (!PRIVATE_KEY) {
            throw new Error('Private key not found');
        }
        
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
        const contractFactory = new ethers.ContractFactory(LCUBE_ABI, LCUBE_BYTECODE, wallet);
        
        // Deploy contract
        console.log('📦 Broadcasting transaction...');
        const contract = await contractFactory.deploy({
            gasLimit: 2000000,
            gasPrice: ethers.parseUnits('10', 'gwei')
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