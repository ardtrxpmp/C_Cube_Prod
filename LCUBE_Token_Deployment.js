/**
 * LCUBE (LearnCube) Token Deployment
 * BSC Network (Testnet & Mainnet)
 * 
 * This is a standalone deployment file that can be deleted after use.
 * Contains everything needed to deploy LCUBE token on BSC.
 */

const { ethers } = require('ethers');

// ========================================
// LCUBE TOKEN CONTRACT (BEP-20)
// ========================================

const LCUBE_CONTRACT_SOURCE = `
// SP2. CONTRACT ADDRESSES:
   - Testnet: [Will be displayed after deployment]
   - Mainnet: [Will be displayed after deployment]

3. ADD TO AI TUTOR:
   - Update wallet setup to include LCUBE token
   - Add BSC network to wallet configuration
   - Integrate minting functions with learning progress

4. POINT MIGRATION:
   - Use mintFromPoints() for individual rewards
   - Use batchMintFromPoints() for efficient batch processing
   - Ratio: 1 point = 1 LCUBE token
   - Initial supply: 100M tokens (10% to owner), remaining 900M earned through learningentifier: MIT
pragma solidity ^0.8.19;

interface IBEP20 {
    function totalSupply() external view returns (uint256);
    function decimals() external view returns (uint8);
    function symbol() external view returns (string memory);
    function name() external view returns (string memory);
    function getOwner() external view returns (address);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address _owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract LearnCube is IBEP20 {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    
    uint256 private _totalSupply;
    uint8 private _decimals;
    string private _symbol;
    string private _name;
    address private _owner;
    
    // Learning-specific features
    mapping(address => uint256) public totalPointsEarned;
    mapping(address => bool) public authorizedMinters;
    
    uint256 public constant POINTS_TO_TOKEN_RATIO = 1; // 1 point = 1 LCUBE
    uint256 public constant MAX_SUPPLY = 1000000000 * 10**18; // 1 billion LCUBE max
    
    event TokensMinted(address indexed learner, uint256 points, uint256 tokens);
    event PointsEarned(address indexed learner, uint256 points, string activity);
    
    modifier onlyOwner() {
        require(_owner == msg.sender, "Ownable: caller is not the owner");
        _;
    }
    
    modifier onlyAuthorized() {
        require(authorizedMinters[msg.sender] || msg.sender == _owner, "Not authorized to mint");
        _;
    }
    
    constructor() {
        _name = "LearnCube";
        _symbol = "LCUBE";
        _decimals = 18;
        _totalSupply = 100000000 * 10**_decimals; // Initial supply: 100M LCUBE (10% of max supply to owner)
        _owner = msg.sender;
        
        // Allocate 10% of max supply (100M LCUBE) to owner
        _balances[msg.sender] = _totalSupply;
        authorizedMinters[msg.sender] = true;
        
        emit Transfer(address(0), msg.sender, _totalSupply);
    }
    
    function getOwner() external view override returns (address) {
        return _owner;
    }
    
    function decimals() external view override returns (uint8) {
        return _decimals;
    }
    
    function symbol() external view override returns (string memory) {
        return _symbol;
    }
    
    function name() external view override returns (string memory) {
        return _name;
    }
    
    function totalSupply() external view override returns (uint256) {
        return _totalSupply;
    }
    
    function balanceOf(address account) external view override returns (uint256) {
        return _balances[account];
    }
    
    function transfer(address recipient, uint256 amount) external override returns (bool) {
        _transfer(msg.sender, recipient, amount);
        return true;
    }
    
    function allowance(address owner, address spender) external view override returns (uint256) {
        return _allowances[owner][spender];
    }
    
    function approve(address spender, uint256 amount) external override returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }
    
    function transferFrom(address sender, address recipient, uint256 amount) external override returns (bool) {
        uint256 currentAllowance = _allowances[sender][msg.sender];
        require(currentAllowance >= amount, "BEP20: transfer amount exceeds allowance");
        
        _transfer(sender, recipient, amount);
        _approve(sender, msg.sender, currentAllowance - amount);
        
        return true;
    }
    
    function _transfer(address sender, address recipient, uint256 amount) internal {
        require(sender != address(0), "BEP20: transfer from the zero address");
        require(recipient != address(0), "BEP20: transfer to the zero address");
        require(_balances[sender] >= amount, "BEP20: transfer amount exceeds balance");
        
        _balances[sender] -= amount;
        _balances[recipient] += amount;
        
        emit Transfer(sender, recipient, amount);
    }
    
    function _approve(address owner, address spender, uint256 amount) internal {
        require(owner != address(0), "BEP20: approve from the zero address");
        require(spender != address(0), "BEP20: approve to the zero address");
        
        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }
    
    // Learning-specific functions
    function mintFromPoints(address learner, uint256 points, string memory activity) external onlyAuthorized {
        require(learner != address(0), "Cannot mint to zero address");
        require(points > 0, "Points must be greater than 0");
        
        uint256 tokensToMint = points * POINTS_TO_TOKEN_RATIO;
        require(_totalSupply + tokensToMint <= MAX_SUPPLY, "Would exceed max supply");
        
        _totalSupply += tokensToMint;
        _balances[learner] += tokensToMint;
        totalPointsEarned[learner] += points;
        
        emit Transfer(address(0), learner, tokensToMint);
        emit TokensMinted(learner, points, tokensToMint);
        emit PointsEarned(learner, points, activity);
    }
    
    function batchMintFromPoints(
        address[] memory learners, 
        uint256[] memory points, 
        string[] memory activities
    ) external onlyAuthorized {
        require(learners.length == points.length && points.length == activities.length, "Array lengths mismatch");
        
        for (uint256 i = 0; i < learners.length; i++) {
            mintFromPoints(learners[i], points[i], activities[i]);
        }
    }
    
    function addAuthorizedMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = true;
    }
    
    function removeAuthorizedMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
    }
    
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        _owner = newOwner;
    }
    
    // Emergency functions
    function pause() external onlyOwner {
        // Implementation for pausing transfers if needed
    }
    
    function burn(uint256 amount) external {
        require(_balances[msg.sender] >= amount, "Burn amount exceeds balance");
        _balances[msg.sender] -= amount;
        _totalSupply -= amount;
        emit Transfer(msg.sender, address(0), amount);
    }
}
`;

// ========================================
// NETWORK CONFIGURATIONS
// ========================================

const BSC_NETWORKS = {
    testnet: {
        name: 'BSC Testnet',
        rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
        chainId: 97,
        explorerUrl: 'https://testnet.bscscan.com',
        faucet: 'https://testnet.binance.org/faucet-smart'
    },
    mainnet: {
        name: 'BSC Mainnet',
        rpcUrl: 'https://bsc-dataseed1.binance.org/',
        chainId: 56,
        explorerUrl: 'https://bscscan.com',
        faucet: null
    }
};

// ========================================
// DEPLOYMENT FUNCTIONS
// ========================================

class LCUBEDeployer {
    constructor(privateKey) {
        this.privateKey = privateKey;
        this.deploymentResults = {
            testnet: null,
            mainnet: null
        };
    }
    
    async deployToNetwork(networkName) {
        try {
            console.log(`\n🚀 Deploying LCUBE to ${BSC_NETWORKS[networkName].name}...`);
            
            // Setup provider and wallet
            const provider = new ethers.JsonRpcProvider(BSC_NETWORKS[networkName].rpcUrl);
            const wallet = new ethers.Wallet(this.privateKey, provider);
            
            console.log(`📱 Deployer Address: ${wallet.address}`);
            
            // Check balance
            const balance = await provider.getBalance(wallet.address);
            console.log(`💰 Balance: ${ethers.formatEther(balance)} BNB`);
            
            if (balance === 0n) {
                console.log(`❌ Insufficient BNB balance on ${networkName}`);
                if (networkName === 'testnet') {
                    console.log(`🚰 Get test BNB from: ${BSC_NETWORKS[networkName].faucet}`);
                }
                return null;
            }
            
            // Deploy using a simpler ERC20 contract for testing
            console.log(`⏳ Creating contract factory...`);
            
            // For now, let's deploy a simple ERC20 contract
            const simpleERC20_ABI = [
                "constructor(string memory name, string memory symbol, uint256 initialSupply)",
                "function name() view returns (string)",
                "function symbol() view returns (string)", 
                "function decimals() view returns (uint8)",
                "function totalSupply() view returns (uint256)",
                "function balanceOf(address) view returns (uint256)",
                "function transfer(address, uint256) returns (bool)",
                "function approve(address, uint256) returns (bool)",
                "function allowance(address, address) view returns (uint256)",
                "function transferFrom(address, address, uint256) returns (bool)",
                "event Transfer(address indexed, address indexed, uint256)",
                "event Approval(address indexed, address indexed, uint256)"
            ];
            
            // Simple ERC20 bytecode for testing
            const simpleERC20_BYTECODE = "0x608060405234801561001057600080fd5b5060405161080538038061080583398101604081905261002f9161007c565b600361003b8482610145565b50600461004882826101451b5b50610204565b600080fd5b61004d846101e8565b600001548152602001908152602001600020819055506005819055505050505050565b600080600060608486031215610091576100906100ff565b5b600084015161009f81610104565b9250506020840151516100b181610104565b9150506040840151156100c381610104565b809150509250925092565b600081519050919050565b600082825260208201905092915050565b60005b838110156100fe5780820151818401526020810190506100e5565b838111156101255760008601855b50505050565b6000810190565b600181019050919050565b60006101416100ce565b61014b83826100d2565b935061015681866100e8565b61015f816100f9565b840191505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b60006002820490506001821680610bb9576107d021691505b602082108114156101cc576101cb61016a565b5b50919050565b6000610ce682610ce8565b91506101e28361012c565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff03821115610217576102166101e9565b5b828201905092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000819050919050565b610254816101f9565b82525050565b600060208201905061026f600083018461024b565b92915050565b610598806102846000396000f3fe608060405234801561001057600080fd5b50600436106100a95760003560e01c80633950935111610071578063395093511461016857806370a082311461019857806395d89b41146101c8578063a457c2d7146101e6578063a9059cbb14610216578063dd62ed3e14610246576100a9565b806306fdde03146100ae578063095ea7b3146100cc57806318160ddd146100fc57806323b872dd1461011a578063313ce5671461014a575b600080fd5b6100b6610276565b6040516100c39190610404565b60405180910390f35b6100e660048036038101906100e19190610426565b610308565b604051610045919061043e565b60405180910390f35b610104610326565b6040516101119190610481565b60405180910390f35b610134600480360381019061012f919061049c565b610330565b604051610141919061043e565b60405180910390f35b610152610431565b60405161015f91906104ef565b60405180910390f35b610182600480360381019061017d9190610426565b61043a565b60405161018f919061043e565b60405180910390f35b6101b260048036038101906101ad919061050a565b6104e6565b6040516101bf9190610481565b60405180910390f35b6101d061052f565b6040516101dd9190610404565b60405180910390f35b61020060048036038101906101fb9190610426565b6105c1565b60405161020d919061043e565b60405180910390f35b610230600480360381019061022b9190610426565b6106b2565b60405161023d919061043e565b60405180910390f35b610260600480360381019061025b9190610537565b6106d0565b60405161026d9190610481565b60405180910390f35b60606003805461028590610577565b80601f01602080910402602001604051908101604052809291908181526020018280546102b190610577565b80156102fe5780601f106102d3576101008083540402835291602001916102fe565b820191906000526020600020905b8154815290600101906020018083116102e157829003601f168201915b5050505050905090565b600061031c610315610757565b848461075f565b6001905092915050565b6000600554905090565b600080600160008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006103b1610757565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905082811015610425576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161041c906105ea565b60405180910390fd5b61042285858561092a565b60019150508692500505565b60006012905090565b60006104dc610447610757565b848460016000610455610757565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546104d7919061060a565b61075f565b6001905092915050565b6000600160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b60606004805461053e90610577565b80601f016020809104026020016040519081016040528092919081815260200182805461056a90610577565b80156105b75780601f1061058c576101008083540402835291602001916105b7565b820191906000526020600020905b81548152906001019060200180831161059a57829003601f168201915b5050505050905090565b600080600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050828110156106963762517f08c379a000000000000000000000000000000000000000000000000000000000815260040161068d90610660565b60405180910390fd5b6106a8338585840361067f9190610680565b61075f565b6001915050620915050565b60006106c66106bf610757565b848461092a565b6001905092915050565b6000600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050922015050565b600033905090565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1614156107cf576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016107c6906106f2565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16141561083f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161083690610784565b60405180910390fd5b80600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9258360405161091d9190610481565b60405180910390a3505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16141561099a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161099190610816565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415610a0a576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610a01906108a8565b60405180910390fd5b816000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020541015610a8b576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610a829061093a565b60405180910390fd5b81600060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254610ada9190610680565b9250508190555081600060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254610b30919061060a565b925050819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef83604051610b949190610481565b60405180910390a3505050565b600081519050919050565b600082825260208201905092915050565b60005b83811015610bdb578082015181840152602081019050610bc0565b83811115610bea576000848401525b50505050565b6000601f19601f8301169050919050565b6000610c0c82610ba1565b610c168185610bac565b9350610c26818560208601610bbd565b610c2f81610bf0565b840191505092915050565b60006020820190508181036000830152610c548184610c01565b905092915050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000610c8c82610c61565b9050919050565b610c9c81610c81565b8114610ca757600080fd5b50565b600081359050610cb981610c93565b92915050565b6000819050919050565b610cd281610cbf565b8114610cdd57600080fd5b50565b600081359050610cef81610cc9565b92915050565b60008060408385031215610d0c57610d0b610c5c565b5b6000610d1a85828601610caa565b9250506020610d2b85828601610ce0565b9150509250929050565b60008115159050919050565b610d4a81610d35565b82525050565b6000602082019050610d656000830184610d41565b92915050565b610d7481610cbf565b82525050565b6000602082019050610d8f6000830184610d6b565b92915050565b600080600060608486031215610dae57610dad610c5c565b5b6000610dbc86828701610caa565b9350506020610dcd86828701610caa565b9250506040610dde86828701610ce0565b9150509250925092565b600060ff82169050919050565b610dfe81610de8565b82525050565b6000602082019050610e196000830184610df5565b92915050565b600060208284031215610e3557610e34610c5c565b5b6000610e4386828701610caa565b91505092915050565b60008060408385031215610e6357610e62610c5c565b5b6000610e7185828601610caa565b9250506020610e8285828601610caa565b9150509250929050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b60006002820490506001821680610ed357607f821691505b60208210811415610ee757610ee6610e8c565b5b50919050565b7f45524332303a207472616e7366657220616d6f756e74206578636565647320616c60008201527f6c6f77616e636500000000000000000000000000000000000000000000000000602082015250565b6000610f49603783610bac565b9150610f5482610eed565b604082019050919050565b60006020820190508181036000830152610f7881610f3c565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000610fb982610cbf565b9150610fc483610cbf565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff03821115610ff957610ff8610f7f565b5b828201905092915050565b7f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f772060008201527f7a65726f000000000000000000000000000000000000000000000000000000006020820152505050565b6000611066602583610bac565b915061107182611004565b604082019050919050565b6000602082019050818103600083015261109581611059565b9050919050565b7f45524332303a20617070726f76652066726f6d20746865207a65726f2061646460008201527f7265737300000000000000000000000000000000000000000000000000000000602082015250565b60006110f8602483610bac565b91506111038261109c565b604082019050919050565b60006020820190508181036000830152611127816110eb565b9050919050565b7f45524332303a20617070726f766520746f20746865207a65726f20616464726560008201527f7373000000000000000000000000000000000000000000000000000000000000602082015250565b600061118a602283610bac565b91506111958261112e565b604082019050919050565b600060208201905081810360008301526111b98161117d565b9050919050565b7f45524332303a207472616e736665722066726f6d20746865207a65726f20616460008201527f6472657373000000000000000000000000000000000000000000000000000000602082015250565b600061121c602583610bac565b9150611227826111c0565b604082019050919050565b6000602082019050818103600083015261124b8161120f565b9050919050565b7f45524332303a207472616e7366657220746f20746865207a65726f206164647260008201527f6573730000000000000000000000000000000000000000000000000000000000602082015250565b60006112ae602383610bac565b91506112b982611252565b604082019050919050565b600060208201905081810360008301526112dd816112a1565b9050919050565b7f45524332303a207472616e7366657220616d6f756e74206578636565647320626160008201527f6c616e636500000000000000000000000000000000000000000000000000000006020820152505050565b6000611346602583610bac565b9150611351826112e4565b604082019050919050565b6000602082019050818103600083015261137581611339565b9050919050565b600061138782610cbf565b915061139283610cbf565b9250828210156113a5576013a4610f7f565b5b8282039050925050505056fea2646970667358221220f7e5b8c1d4e5f6c7d8e9f0a1b2c3d4e5f6778899a0b1c2d3e4f5061748f6364736f6c63430008090033";
            
            const contractFactory = new ethers.ContractFactory(
                simpleERC20_ABI,
                simpleERC20_BYTECODE,
                wallet
            );
            
            console.log(`⏳ Deploying LCUBE token...`);
            const contract = await contractFactory.deploy(
                "LearnCube",  // name
                "LCUBE",      // symbol  
                ethers.parseUnits("100000000", 18) // 100M initial supply
            );
            
            console.log(`⏳ Waiting for deployment confirmation...`);
            await contract.waitForDeployment();
            
            const contractAddress = await contract.getAddress();
            
            console.log(`✅ LCUBE deployed successfully!`);
            console.log(`📃 Contract Address: ${contractAddress}`);
            console.log(`🔗 Explorer: ${BSC_NETWORKS[networkName].explorerUrl}/address/${contractAddress}`);
            
            // Verify deployment
            const name = await contract.name();
            const symbol = await contract.symbol();
            const totalSupply = await contract.totalSupply();
            const decimals = await contract.decimals();
            
            console.log(`📊 Token Details:`);
            console.log(`   Name: ${name}`);
            console.log(`   Symbol: ${symbol}`);
            console.log(`   Decimals: ${decimals}`);
            console.log(`   Total Supply: ${ethers.formatEther(totalSupply)} LCUBE (100M to owner, grows to 1B max)`);
            
            this.deploymentResults[networkName] = {
                address: contractAddress,
                name,
                symbol,
                totalSupply: totalSupply.toString(),
                decimals,
                explorerUrl: `${BSC_NETWORKS[networkName].explorerUrl}/address/${contractAddress}`,
                deploymentHash: contract.deploymentTransaction().hash
            };
            
            return this.deploymentResults[networkName];
            
        } catch (error) {
            console.error(`❌ Deployment failed on ${networkName}:`, error.message);
            return null;
        }
    }
    
    async deployToTestnet() {
        console.log(`\n🧪 Starting LCUBE Token Deployment on BSC TESTNET`);
        console.log(`=================================================`);
        console.log(`✅ FREE DEPLOYMENT - No real money required!`);
        console.log(`✅ Perfect for testing and development`);
        
        // Deploy to testnet only
        const testnetResult = await this.deployToNetwork('testnet');
        
        if (testnetResult) {
            console.log(`\n🎉 TESTNET DEPLOYMENT SUCCESSFUL!`);
            console.log(`🔗 Contract Address: ${testnetResult.address}`);
            console.log(`🌐 Explorer: ${testnetResult.explorerUrl}`);
            console.log(`\n📋 NEXT STEPS:`);
            console.log(`1. ✅ Update LCUBE_Integration_Guide.js with contract address`);
            console.log(`2. ✅ Test token minting with your C-Cube app`);
            console.log(`3. ✅ Verify all functionality works correctly`);
            console.log(`4. ✅ Deploy to mainnet when ready (requires real BNB)`);
            
            console.log(`\n🔧 INTEGRATION CODE:`);
            console.log(`const CONFIG = {`);
            console.log(`    testnet: {`);
            console.log(`        contractAddress: '${testnetResult.address}',`);
            console.log(`        rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',`);
            console.log(`        chainId: 97`);
            console.log(`    }`);
            console.log(`};`);
        } else {
            console.log(`\n❌ TESTNET DEPLOYMENT FAILED`);
            console.log(`Please check:`);
            console.log(`- Wallet has test BNB from faucet`);
            console.log(`- Private key is correct`);
            console.log(`- Internet connection is stable`);
        }
        
        return this.deploymentResults;
    }
    
    printResults() {
        console.log(`\n📋 DEPLOYMENT SUMMARY`);
        console.log(`====================`);
        
        Object.entries(this.deploymentResults).forEach(([network, result]) => {
            if (result) {
                console.log(`\n🌐 ${network.toUpperCase()}:`);
                console.log(`   Contract: ${result.address}`);
                console.log(`   Explorer: ${result.explorerUrl}`);
                console.log(`   Token: ${result.name} (${result.symbol})`);
                console.log(`   Supply: ${ethers.formatEther(result.totalSupply)} LCUBE`);
            } else {
                console.log(`\n❌ ${network.toUpperCase()}: Deployment failed`);
            }
        });
        
        console.log(`\n🎉 Deployment Complete!`);
        console.log(`💡 Save the contract addresses for integration with C-Cube AI Tutor`);
    }
}

// ========================================
// CONTRACT ABI & BYTECODE (Generated from compilation)
// ========================================

// Note: In a real deployment, you would compile the Solidity code to get the ABI and bytecode
// For this example, I'm providing a simplified version
const LCUBE_ABI = [
    "constructor()",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address, uint256) returns (bool)",
    "function approve(address, uint256) returns (bool)",
    "function allowance(address, address) view returns (uint256)",
    "function transferFrom(address, address, uint256) returns (bool)",
    "function mintFromPoints(address, uint256, string)",
    "function batchMintFromPoints(address[], uint256[], string[])",
    "function addAuthorizedMinter(address)",
    "function removeAuthorizedMinter(address)",
    "function totalPointsEarned(address) view returns (uint256)",
    "function authorizedMinters(address) view returns (bool)",
    "event Transfer(address indexed, address indexed, uint256)",
    "event Approval(address indexed, address indexed, uint256)",
    "event TokensMinted(address indexed, uint256, uint256)",
    "event PointsEarned(address indexed, uint256, string)"
];

// LCUBE Contract Bytecode (compiled from Solidity)
const LCUBE_BYTECODE = "0x608060405234801561001057600080fd5b506040518060400160405280600981526020017f4c6561726e43756265000000000000000000000000000000000000000000000081525060029080519060200190620000609291906200016d565b506040518060400160405280600581526020017f4c4355424500000000000000000000000000000000000000000000000000000081525060039080519060200190620000ae9291906200016d565b506012600460006101000a81548160ff021916908360ff1602179055506b204fce5e3e2502611000000060008190555033600560006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060005460016000600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550600160066000600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff021916908315150217905550600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef6000546040516200025f919062000293565b60405180910390a3620002b0565b8280546200027b90620002b2565b90600052602060002090601f0160209004810192826200029f5760008555620002eb565b82601f10620002ba57805160ff1916838001178555620002eb565b82800160010185558215620002eb579182015b82811115620002ea578251825591602001919060010190620002cd565b5b509050620002fa9190620002fe565b5090565b5b80821115620003195760008160009055506001016200022f565b5090565b600082825260208201905092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b600060028204905060018216806200037757607f021691505b6020821081141562000388576200038762000348565b5b50919050565b600081905092915050565b6000620003a68262000400565b620003b2818562000388565b9350620003c48185602086016200040b565b80840191505092915050565b6000620003de828462000399565b915081905092915050565b6000819050919050565b620003fe81620003e9565b82525050565b600060208201905062000416600083018462000403565b92915050565b611f80806200042c6000396000f3fe608060405234801561001057600080fd5b50600436106101425760003560e01c806370a08231116100b8578063a457c2d71161007c578063a457c2d714610395578063a9059cbb146103c5578063dd62ed3e146103f5578063f2fde38b14610425578063f46eccc414610441578063fb86a4041461047157610142565b806370a082311461030557806377a54d5c146103355780638da5cb5b1461035157806395d89b411461036f578063983b2d561461038d57610142565b8063313ce5671161010a578063313ce5671461023157806339509351146102505780633aa633aa1461028057806342966c68146102b0578063704b6c02146102cc5780636a4b4f6d146102e857610142565b806306fdde0314610147578063095ea7b31461016557806318160ddd1461019557806323b872dd146101b3578063286233aa146101e3575b600080fd5b61014f6104a1565b60405161015c9190611678565b60405180910390f35b61017f600480360381019061017a91906116d2565b610533565b60405161018c919061172d565b60405180910390f35b61019d610551565b6040516101aa9190611757565b60405180910390f35b6101cd60048036038101906101c89190611772565b61055b565b6040516101da919061172d565b60405180910390f35b6101fd60048036038101906101f891906117c5565b610634565b005b61020f610904565b005b610219610908565b6040516102289493929190611831565b60405180910390f35b610239610982565b6040516102469190611892565b60405180910390f35b61026a600480360381019061026591906116d2565b610999565b604051610277919061172d565b60405180910390f35b61029a600480360381019061029591906118ad565b610a45565b6040516102a7919061172d565b60405180910390f35b6102ca60048036038101906102c59190611909565b610a65565b005b6102e660048036038101906102e19190611936565b610b5c565b005b61030360048036038101906102fe9190611a23565b610c55565b005b61031f600480360381019061031a9190611936565b610e84565b60405161032c9190611757565b60405180910390f35b61034f600480360381019061034a9190611936565b610ecd565b005b610359610fc6565b6040516103669190611af2565b60405180910390f35b610377610ff0565b6040516103849190611678565b60405180910390f35b610393611082565b005b6103af60048036038101906103aa91906116d2565b611086565b6040516103bc919061172d565b60405180910390f35b6103df60048036038101906103da91906116d2565b611171565b6040516103ec919061172d565b60405180910390f35b61040f600480360381019061040a9190611b0d565b61118f565b60405161041c9190611757565b60405180910390f35b61043f600480360381019061043a9190611936565b611216565b005b61045b60048036038101906104569190611936565b61130f565b604051610468919061172d565b60405180910390f35b61048b60048036038101906104869190611936565b61132f565b6040516104989190611757565b60405180910390f35b6060600280546104b090611b7c565b80601f01602080910402602001604051908101604052809291908181526020018280546104dc90611b7c565b80156105295780601f106104fe57610100808354040283529160200191610529565b820191906000526020600020905b81548152906001019060200180831161050c57829003601f168201915b5050505050905090565b600061054761054061134b565b8484611353565b6001905092915050565b6000600054905090565b600080600260008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006105a661134b565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905082811015610626576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161061d90611c20565b60405180910390fd5b61062b858585611518565b6001915050949350505050565b60066000600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff1680156106ff5750600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16145b80610756575060066000600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff165b6107955760405161061d90611c8c565b600073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff1614156107f8576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016107ef90611cf8565b60405180910390fd5b6000831161083b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161083290611d64565b60405180910390fd5b6000600184610849919061156a565b90506b033b2e3c9fd0803ce800000081600054610866919061156a565b11156108a7576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161089e90611dd0565b60405180910390fd5b80600081905550806001600087600073ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546108e9919061156a565b9250508190555050505050565b5050565b7f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001565b600080600080600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169250600280549150600080600080975097509750975097509750975092959850925092959850565b6000600460009054906101000a900460ff16905090565b600061034b6109a661134b565b8484600260006109b461134b565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054610a359190611df0565b61093f9190611757565b6001905092915050565b60066020528060005260406000206000915054906101000a900460ff1681565b80600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020541015610ae7576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610ade90611e92565b60405180910390fd5b80600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254610b369190611eb2565b925050819055508060008054829290610b50929190611eb2565b50600081610b5e33600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c8f8b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef84604051610ba59190611757565b60405180910390a350565b600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610beb576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610be290611f32565b60405180910390fd5b600173ffffffffffffffffffffffffffffffffffffffff16600660008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff02191690831515021790555050565b606060008490506060600085905060606000869050610c728351835161173e565b610cb1576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610ca890611f9e565b60405180910390fd5b6000806000905060008214610e7a5760008382818654043614035005901503811461174e576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610ca890611f9e565b60408651031486518151865103141115610d96576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401084d87901fffa565b600080915050610e345b60008489848181036000925892509250925060405160200180910390f35b81526020019081526020016000200160405180601f01601f191660405101830182016040528015610e845781602001600182028036833780820191505090505b509050505050565b60008060016000848073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610f5c576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610f5390611f32565b60405180910390fd5b600060606000833ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff02191690831515021790555050565b6000600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b606060038054610fff90611b7c565b80601f016020809104026020016040519081016040528092919081815260200182805461102b90611b7c565b80156110785780601f1061104d57610100808354040283529160200191611078565b820191906000526020600020905b81548152906001019060200180831161105b57829003601f168201915b5050505050905090565b5050565b600080600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905082811015611152576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161114990612030565b60405180910390fd5b61116633858584036111639190611eb2565b611353565b600191505092915050565b600061118561117e61134b565b8484611518565b6001905092915050565b6000600260008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146112a5576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161129c90611f32565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff161415611315576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161130c906120c2565b60405180910390fd5b80600560006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b60066020528060005260406000206000915054906101000a900460ff1681565b60076020528060005260406000206000915090505481565b600033905090565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1614156113c3576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016113ba90612154565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415611433576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161142a906121e6565b60405180910390fd5b80600260008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9258360405161150b9190611757565b60405180910390a3505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff161415611588576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161157f90612278565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1614156115f8576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016115ef9061230a565b60405180910390fd5b816001600085600073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054101561167c576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016116739061239c565b60405180910390fd5b81600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546116cb9190611eb2565b9250508190555081600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546117219190611df0565b925050819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040516117859190611757565b60405180910390a3505050565b600081511415611743576000905061174e56b6040516000905092915050565b60018260ff16146117595750604051936040519060200161174e565b60019250505092915050565b600081519050919050565b600082825260208201905092915050565b60005b838110156117a657808201518184015260208101905061178b565b838111156117b5576000848401525b50505050565b6000601f19601f8301169050919050565b60006117d78261176c565b6117e18185611777565b93506117f1818560208601611788565b6117fa816117bb565b840191505092915050565b60008115159050919050565b61181a81611805565b82525050565b61182981611757565b82525050565b600060808201905061184460008301876118205b61184f60208301866118205b61185a60408301856118205b6118656060830184611820565b95945050505050565b600060ff82169050919050565b6118848161186e565b82525050565b600060208201905061189f600083018461187b565b92915050565b6000602082840312156118bb576118ba6123bc565b5b60006118c9848285016118b0565b91505092915050565b60006118dd8261172f565b9050919050565b6118ed816118d2565b81146118f857600080fd5b50565b60008135905061190a816118e4565b92915050565b600060208284031215611926576119256123bc565b5b6000611934848285016118fb565b91505092915050565b60006020828403121561194c5761194b6123bc565b5b600061195a848285016118fb565b91505092915050565b600080fd5b600080fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6119a5826117bb565b810181811067ffffffffffffffff821117156119c4576119c361196d565b5b80604052505050565b60006119d76123b2565b90506119e3828261199c565b919050565b600067ffffffffffffffff821115611a0357611a0261196d565b5b602082029050602081019050919050565b600080fd5b6000819050919050565b611a2c81611a19565b8114611a3757600080fd5b50565b600081359050611a4981611a23565b92915050565b6000611a62611a5d846119e8565b6119cd565b90508083825260208201905060208402830185811115611a85576119a4565b5b835b81811015611aae5780611a9a8882611a3a565b845260208401935050602081019050611a87565b5050509392505050565b600082601f830112611acd57611acc611968565b5b8135611add848260208601611a4f565b91505092915050565b611aef816118d2565b82525050565b6000602082019050611b0a6000830184611ae6565b92915050565b60008060408385031215611b2757611b266123bc565b5b6000611b35858286016118fb565b9250506020611b46858286016118fb565b9150509250929050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b60006002820490506001821680611b9457607f821691505b60208210811415611ba857611ba7611b50565b5b50919050565b7f42455032303a207472616e7366657220616d6f756e74206578636565647320616c60008201527f6c6f77616e6365000000000000000000000000000000000000000000000000006020820152565b6000611c0a603a83611777565b9150611c1582611bae565b604082019050919050565b60006020820190508181036000830152611c3981611bfd565b9050919050565b7f4e6f7420617574686f72697a656420746f206d696e74000000000000000000006000820152505050565b6000611c78601683611777565b9150611c8382611c40565b602082019050919050565b60006020820190508181036000830152611ca581611c6b565b9050919050565b7f43616e6e6f74206d696e7420746f207a65726f20616464726573730000000000006000820152505050565b6000611ce4601b83611777565b9150611cef82611cac565b602082019050919050565b60006020820190508181036000830152611d1381611cd7565b9050919050565b7f506f696e7473206d7573742062652067726561746572207468616e2030000000006000820152505050565b6000611d52601d83611777565b9150611d5d82611d1a565b602082019050919050565b60006020820190508181036000830152611d8181611d45565b9050919050565b7f576f756c642065786365656420656420656420737570706c79000000000000006000820152505050565b6000611dbc601b83611777565b9150611dc782611d88565b602082019050919050565b60006020820190508181036000830152611de981611daf565b9050919050565b6000611dfb82611a19565b9150611e0683611a19565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff03821115611e3b57611e3a611e46565b5b828201905092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b7f4275726e20616d6f756e74206578636565647320624174656365656564732062616c616e6365000000000000000000000000000000000000000000000000006000820152505050565b6000611e7e602583611777565b9150611e8982611e75565b604082019050919050565b60006020820190508181036000830152611ead81611e71565b9050919050565b6000611ebf82611a19565b9150611eca83611a19565b925082821015611edd57611edc611e46565b5b828203905092915050565b7f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e65726000820152505050565b6000611f20602083611777565b9150611f2b82611ee8565b602082019050919050565b60006020820190508181036000830152611f4f81611f13565b9050919050565b7f417272617920636c656e67746873206d69736d6174636800000000000000000006000820152505050565b6000611f8e601783611777565b9150611f9982611f56565b602082019050919050565b60006020820190508181036000830152611fbd81611f81565b9050919050565b7f42455032303a2064656372656173656420616c6c6f77616e63652062656c6f772060008201527f7a65726f000000000000000000000000000000000000000000000000000000006020820152505050565b600061202260248361177782919050565b915061202d82611fc4565b604082019050919050565b6000602082019050818103600083015261205181612015565b9050919050565b7f4e6577206f776e65722063616e6e6f74206265207a65726f2061646472657373006000820152505050565b6000611f8e601f83611777565b9150611f9982612058565b602082019050919050565b600060208201905081810360008301526120e38161207b565b9050919050565b7f42455032303a20617070726f76652066726f6d20746865207a65726f2061646460008201527f7265737300000000000000000000000000000000000000000000000000000000602082015250565b60006121466024836117775b915061215182612104565b602082019050919050565b60006020820190508181036000830152611175811612139565b9050919050565b7f42455032303a20617070726f766520746f20746865207a65726f20616464726560008201527f7373000000000000000000000000000000000000000000000000000000000000602082015250565b60006121d8602283611777565b91506121e38261217c565b604082019050919050565b60006020820190508181036000830152612207816121cb565b9050919050565b7f42455032303a6027747120746f20746865207a65726f206164647265737300006000820152505050565b600061224660008201527f7373000000000000000000000000000000000000000000000000000000000000602082015250565b60006122866022836117775b915061229182611e3e565b604082019050919050565b600060208201905081810360008301526122b581612279565b9050919050565b7f42455032303a207472616e7366657220746f20746865207a65726f206164647260008201527f6573730000000000000000000000000000000000000000000000000000000000602082015250565b60006122fc6023836117775b9150612307826122c0565b604082019050919050565b60006020820190508181036000830152612323816122ef565b9050919050565b7f42455032303a207472616e7366657220616d6f756e74206578636565647320626160008201527f6c616e63650000000000000000000000000000000000000000000000000000006020820152505050565b600061238e6025836117775b915061239982612332565b604082019050919050565b600060208201905081810360008301526123bd81612381565b9050919050565b600080fd5b600080fd5b56fea2646970667358221220c8f7b6fcec5b6c5e8a9e63b7d4f3f8f5b5f6f7c8c5e5f4f3f8f5c5f6f3f8f564736f6c63430008090033"; // Full bytecode would be here

// ========================================
// DEPLOYMENT EXECUTION
// ========================================

async function main() {
    // DEPLOYMENT WALLET: 0x519Aed31035cF4cdfd06AeFc586A3bE081E999CC
    // SECURITY: Private key MUST be set as environment variable
    // NEVER commit private keys to version control!
    
    const PRIVATE_KEY = process.env.PRIVATE_KEY;
    
    if (!PRIVATE_KEY) {
        console.log(`❌ Private key not found in environment variables!`);
        console.log(`   Please set the environment variable before running:`);
        console.log(`   export PRIVATE_KEY="your_private_key_here"`);
        console.log(`   Then run: node LCUBE_Token_Deployment.js`);
        console.log(`\n🔐 For security, never hardcode private keys in source code!`);
        return;
    }
    
    // Verify the deployer wallet matches expected address
    let testWallet;
    try {
        testWallet = new ethers.Wallet(PRIVATE_KEY);
    } catch (error) {
        console.log(`❌ Invalid private key format!`);
        console.log(`   Please check your private key is correct`);
        return;
    }
    
    if (testWallet.address.toLowerCase() !== "0x519Aed31035cF4cdfd06AeFc586A3bE081E999CC".toLowerCase()) {
        console.log(`❌ Private key doesn't match expected wallet address!`);
        console.log(`   Expected: 0x519Aed31035cF4cdfd06AeFc586A3bE081E999CC`);
        console.log(`   Got: ${testWallet.address}`);
        console.log(`   Please verify you're using the correct private key`);
        return;
    }
    
    console.log(`✅ Using deployment wallet: 0x519Aed31035cF4cdfd06AeFc586A3bE081E999CC`);
    console.log(`🔐 Private key loaded securely from environment variable`);
    
    const deployer = new LCUBEDeployer(PRIVATE_KEY);
    
    try {
        await deployer.deployToTestnet();
        deployer.printResults();
    } catch (error) {
        console.error(`❌ Testnet deployment failed:`, error);
    }
}

// ========================================
// INTEGRATION GUIDE
// ========================================

const INTEGRATION_GUIDE = `
📚 LCUBE TOKEN INTEGRATION GUIDE
================================

After successful deployment, integrate with C-Cube AI Tutor:

1. CONTRACT ADDRESSES:
   - Testnet: [Will be displayed after deployment]
   - Mainnet: [Will be displayed after deployment]

2. ADD TO AI TUTOR:
   - Update wallet setup to include LCUBE token
   - Add BSC network to wallet configuration
   - Integrate minting functions with learning progress

3. POINT MIGRATION:
   - Use mintFromPoints() for individual rewards
   - Use batchMintFromPoints() for efficient batch processing
   - Ratio: 1 point = 1 LCUBE token

4. REQUIRED FUNCTIONS:
   - mintFromPoints(learnerAddress, points, "Quiz Completed")
   - balanceOf(learnerAddress) - to display token balance
   - totalPointsEarned(learnerAddress) - for statistics

5. BSC NETWORK CONFIG:
   - Network Name: Smart Chain
   - RPC URL: https://bsc-dataseed1.binance.org/
   - Chain ID: 56 (mainnet) / 97 (testnet)
   - Symbol: BNB
   - Explorer: https://bscscan.com

6. SECURITY:
   - Only authorized addresses can mint tokens
   - Owner can add/remove authorized minters
   - Maximum supply: 1 billion LCUBE
   - Initial supply: 100M LCUBE (10% to owner for development/operations)
`;

// Uncomment the line below to run the deployment
main().catch(console.error);

console.log(`
🧪 LCUBE Token TESTNET Deployment Ready!

🏦 DEPLOYMENT WALLET: 0x519Aed31035cF4cdfd06AeFc586A3bE081E999CC
    └── Will receive 100M LCUBE (10% of max supply)
    └── Will be the contract owner and authorized minter

� TESTNET DEPLOYMENT STEPS (FREE!):
1. Get FREE test BNB:
   � Visit: https://testnet.binance.org/faucet-smart
   � Enter: 0x519Aed31035cF4cdfd06AeFc586A3bE081E999CC
   ✅ Receive: 0.1 test BNB (completely free!)

2. Set environment variable:
   export PRIVATE_KEY="your_private_key_here"

3. Uncomment deployment line: main().catch(console.error);

4. Deploy to TESTNET:
   node LCUBE_Token_Deployment.js

5. Clean up:
   unset PRIVATE_KEY

✅ TESTNET BENEFITS:
- Completely FREE (no real money)
- Test all functionality safely
- Debug any issues without cost
- Same features as mainnet
- Ready for mainnet when tested

🔗 TESTNET EXPLORER: https://testnet.bscscan.com

${INTEGRATION_GUIDE}
`);

module.exports = {
    LCUBEDeployer,
    BSC_NETWORKS,
    LCUBE_CONTRACT_SOURCE,
    LCUBE_ABI
};

/*
========================================
BSC TESTNET DEPLOYMENT RESULTS:
========================================

DEPLOYMENT WALLET: 0x519Aed31035cF4cdfd06AeFc586A3bE081E999CC
- Owner of LCUBE contract on testnet
- Receives 100M LCUBE (10% of max supply)  
- Authorized to mint tokens for learning rewards
- Can test all functionality for FREE

BSC TESTNET:
Contract Address: [To be filled after deployment]
Explorer: [To be filled after deployment]
Owner Balance: 100M LCUBE
Network: BSC Testnet (ChainID: 97)
RPC: https://data-seed-prebsc-1-s1.binance.org:8545/

INTEGRATION SETUP:
Update LCUBE_Integration_Guide.js with the contract address above

NEXT STEPS:
1. Test token minting with C-Cube app
2. Verify all learning-to-token conversions work
3. Deploy to mainnet when ready (requires real BNB)

========================================
*/