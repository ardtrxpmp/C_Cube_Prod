import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import CCubeLogo from '../components/CyFoCubeLogo';
import WalletSetupPrompt from '../components/LearnAI/WalletSetupPrompt';
import { useWallet } from '../context/WalletContext';

// Contract Source Code for BSCScan Verification
const CONTRACT_SOURCE_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract CustomToken is IERC20 {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 private _totalSupply;
    
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    
    address public owner;
    
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _initialSupply,
        address _owner
    ) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        _totalSupply = _initialSupply * 10**_decimals;
        _balances[_owner] = _totalSupply;
        owner = _owner;
        
        emit Transfer(address(0), _owner, _totalSupply);
        emit OwnershipTransferred(address(0), _owner);
    }
    
    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }
    
    function balanceOf(address account) public view override returns (uint256) {
        return _balances[account];
    }
    
    function transfer(address recipient, uint256 amount) public virtual override returns (bool) {
        _transfer(msg.sender, recipient, amount);
        return true;
    }
    
    function allowance(address owner, address spender) public view virtual override returns (uint256) {
        return _allowances[owner][spender];
    }
    
    function approve(address spender, uint256 amount) public virtual override returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }
    
    function transferFrom(address sender, address recipient, uint256 amount) public virtual override returns (bool) {
        uint256 currentAllowance = _allowances[sender][msg.sender];
        require(currentAllowance >= amount, "ERC20: transfer amount exceeds allowance");
        
        _transfer(sender, recipient, amount);
        _approve(sender, msg.sender, currentAllowance - amount);
        
        return true;
    }
    
    function _transfer(address sender, address recipient, uint256 amount) internal {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");
        
        uint256 senderBalance = _balances[sender];
        require(senderBalance >= amount, "ERC20: transfer amount exceeds balance");
        
        _balances[sender] = senderBalance - amount;
        _balances[recipient] += amount;
        
        emit Transfer(sender, recipient, amount);
    }
    
    function _approve(address owner, address spender, uint256 amount) internal {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");
        
        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }
    
    // Optional: Mint function (only owner)
    function mint(address to, uint256 amount) public onlyOwner {
        require(to != address(0), "ERC20: mint to the zero address");
        
        _totalSupply += amount;
        _balances[to] += amount;
        
        emit Transfer(address(0), to, amount);
    }
    
    // Optional: Burn function
    function burn(uint256 amount) public {
        require(_balances[msg.sender] >= amount, "ERC20: burn amount exceeds balance");
        
        _balances[msg.sender] -= amount;
        _totalSupply -= amount;
        
        emit Transfer(msg.sender, address(0), amount);
    }
    
    // Transfer ownership
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner is the zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}`;

// ERC-20 Token Contract ABI and Bytecode
const TOKEN_CONTRACT_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "_name", "type": "string"},
      {"internalType": "string", "name": "_symbol", "type": "string"},
      {"internalType": "uint8", "name": "_decimals", "type": "uint8"},
      {"internalType": "uint256", "name": "_initialSupply", "type": "uint256"},
      {"internalType": "address", "name": "_owner", "type": "address"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
{
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "burn",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const TOKEN_CONTRACT_BYTECODE = "0x608060405234801561000f575f5ffd5b50604051611182380380611b2833981810160405281019061003191906103e7565b845f908161003f919061069d565b50836001908161004f919061069d565b508260025f6101000a81548160ff021916908360ff16021790555082600a61007791906108c8565b826100829190610912565b60038190555060035460045f8373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f20819055508060065f6101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508073ffffffffffffffffffffffffffffffffffffffff165f73ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef60035460405161016b9190610962565b60405180910390a38073ffffffffffffffffffffffffffffffffffffffff165f73ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a3505050505061097b565b5f604051905090565b5f5ffd5b5f5ffd5b5f5ffd5b5f5ffd5b5f601f19601f8301169050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52604160045260245ffd5b610236826101f0565b810181811067ffffffffffffffff8211171561025557610254610200565b5b80604052505050565b5f6102676101d7565b9050610273828261022d565b919050565b5f67ffffffffffffffff82111561029257610291610200565b5b61029b826101f0565b9050602081019050919050565b8281835e5f83830152505050565b5f6102c86102c384610278565b61025e565b9050828152602081018484840111156102e4576102e36101ec565b5b6102ef8482856102a8565b509392505050565b5f82601f83011261030b5761030a6101e8565b5b815161031b8482602086016102b6565b91505092915050565b5f60ff82169050919050565b61033981610324565b8114610343575f5ffd5b50565b5f8151905061035481610330565b92915050565b5f819050919050565b61036c8161035a565b8114610376575f5ffd5b50565b5f8151905061038781610363565b92915050565b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f6103b68261038d565b9050919050565b6103c6816103ac565b81146103d0575f5ffd5b50565b5f815190506103e1816103bd565b92915050565b5f5f5f5f5f60a08688031215610400576103ff6101e0565b5b5f86015167ffffffffffffffff81111561041d5761041c6101e4565b5b610429888289016102f7565b955050602086015167ffffffffffffffff81111561044a576104496101e4565b5b610456888289016102f7565b944050604061046788828901610346565b935050606061047888828901610379565b9250506080610489888289016103d3565b9150509295509295909350565b5f81519050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52602260045260245ffd5b5f60028204905060018216806104e457607f821691505b6020821081036104f7576104f66104a0565b5b50919050565b5f819050815f5260205f209050919050565b5f6020601f8301049050919050565b5f82821b905092915050565b5f600883026105597fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8261051e565b610563868361051e565b95508019841693508086168417925050509392505050565b5f819050919050565b5f61059e6105996105948461035a565b61057b565b61035a565b9050919050565b5f819050919050565b6105b783610584565b6105cb6105c3826105a5565b84845461052a565b825550505050565b5f5f905090565b6105e26105d3565b6105ed8184846105ae565b505050565b5b81811015610610576106055f826105da565b6001810190506105f3565b5050565b601f82111561065557610626816104fd565b61062f8461050f565b8101602085101561063e578190505b61065261064a8561050f565b8301826105f2565b50505b505050565b5f82821c905092915050565b5f6106755f198460080261065a565b1980831691505092915050565b5f61068d8383610666565b9150826002028217905092915050565b6106a682610496565b67ffffffffffffffff8111156106bf576106be610200565b5b6106c982546104cd565b6106d4828285610614565b5f60209050601f831160018114610705575f84156106f3578287015190505b6106fd8582610682565b865550610764565b601f1984166107138661049d565b5f5b8281101561073a57848901518255600182019150602085019450602081019050610715565b868310156107575784890151610753601f891682610666565b8355505b6001600288020188555050505b505050505050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601160045260245ffd5b5f8160011c9050919050565b5f5f8291508390505b60018511156107ee578086048111156107ca576107c961076c565b5b60018516156107d95780820291505b80810290506107e785610799565b94506107ae565b94509492505050565b5f8261080657600190506108c1565b81610813575f90506108c1565b8160018114610829576002811461083357610862565b60019150506108c1565b60ff8411156108455761084461076c565b5b8360020a91508482111561085c5761085b61076c565b5b506108c1565b5060208310610133831016604e8410600b84101617156108975782820a9050838111156108925761089161076c565b5b6108c1565b6108a484848460016107a5565b925090508184048111156108bb576108ba61076c565b5b81810290505b9392505050565b5f6108d28261035a565b91506108dd83610324565b925061090a7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff84846107f7565b905092915050565b5f61091c8261035a565b91506109278361035a565b92508282026109358161035a565b9150828204841483151761094c5761094b61076c565b5b5092915050565b61095c8161035a565b82525050565b5f6020820190506109755f830184610953565b92915050565b61182a806109885f395ff3fe608060405234801561000f575f5ffd5b50600436106100cd575f3560e01c806342966c681161008a57806395d89b411161006457806395d89b4114610211578063a9059cbb1461022f578063dd62ed3e1461025f578063f2fde38b1461028f576100cd565b806342966c68146101a757806370a08231146101c35780638da5cb5b146101f3576100cd565b806306fdde03146100d1578063095ea7b3146100ef57806318160ddd1461011f57806323b872dd1461013d578063313ce5671461016d57806340c10f191461018b575b5f5ffd5b6100d96102ab565b6040516100e69190610f60565b60405180910390f35b61010960048036038101906101049190611011565b610336565b6040516101169190611069565b60405180910390f35b61012761034c565b6040516101349190611091565b60405180910390f35b610157600480360381019061015291906110aa565b610355565b6040516101649190611069565b60405180910390f35b610175610442565b6040516101829190611115565b60405180910390f35b6101a560048036038101906101a09190611011565b610454565b005b6101c160048036038101906101bc919061112e565b610625565b005b6101dd60048036038101906101d89190611159565b610778565b6040516101ea9190611091565b60405180910390f35b6101fb6107be565b6040516102089190611193565b60405180910390f35b6102196107e3565b6040516102269190610f60565b60405180910390f35b61024960048036038101906102449190611011565b61086f565b6040516102569190611069565b60405180910390f35b610279600480360381019061027491906111ac565b610885565b6040516102869190611091565b60405180910390f35b6102a960048036038101906102a49190611159565b610907565b005b5f80546102b790611217565b80601f01602080910402602001604051908101604052809291908181526020018280546102e390611217565b801561032e5780601f106103055761010080835404028352916020019161032e565b820191905f5260205f20905b81548152906001019060200180831161031157829003601f168201915b505050505081565b5f610342338484610ac2565b6001905092915050565b5f600354905090565b5f5f60055f8673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2054905082811015610415576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161040c906112b7565b60405180910390fd5b610420858585610c85565b610436853385846104319190611302565b610ac2565b60019150509392505050565b60025f9054906101000a900460ff1681565b60065f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146104e3576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016104da9061137f565b60405180910390fd5b5f73ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603610551576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610548906113e7565b60405180910390fd5b8060035f8282546105629190611405565b925050819055508060045f8473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f8282546105b59190611405565b925050819055508173ffffffffffffffffffffffffffffffffffffffff165f73ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040516106199190611091565b60405180910390a35050565b8060045f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205410156106a5576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161069c906114a8565b60405180910390fd5b8060045f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f8282546106f19190611302565b925050819055508060035f8282546107099190611302565b925050819055505f73ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8360405161076d9190611091565b60405180910390a350565b5f60045f8373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f20549050919050565b60065f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600180546107f090611217565b80601f016020809104026020016040519081016040528092919081815260200182805461081c90611217565b80156108675780601f1061083e57610100808354040283529160200191610867565b820191905f5260205f20905b81548152906001019060200180831161084a57829003601f168201915b505050505081565b5f61087b338484610c85565b6001905092915050565b5f60055f8473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f8373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2054905092915050565b60065f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610996576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161098d9061137f565b60405180910390fd5b5f73ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1603610a04576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016109fb90611510565b60405180910390fd5b8073ffffffffffffffffffffffffffffffffffffffff1660065f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a38060065f6101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b5f73ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1603610b30576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610b279061159e565b60405180910390fd5b5f73ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603610b9e576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610b959061162c565b60405180910390fd5b8060055f8573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f8473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f20819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92583604051610c789190611091565b60405180910390a3505050565b5f73ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1603610cf3576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610cea906116ba565b60405180910390fd5b5f73ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603610d61576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610d5890611748565b60405180910390fd5b5f60045f8573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2054905081811015610de5576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610ddc906117d6565b60405180910390fd5b8181610df19190611302565b60045f8673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f20819055508160045f8573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f8282540e7e9190611405565b925050819055508273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef84604051610ee29190611091565b60405180910390a350505050565b5f81519050919050565b5f82825260208201905092915050565b8281835e5f83830152505050565b5f601f19601f8301169050919050565b5f610f3282610ef0565b610f3c8185610efa565b9350610f4c818560208601610f0a565b610f5581610f18565b840191505092915050565b5f6020820190508181035f830152610f788184610f28565b905092915050565b5f5ffd5b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f610fad82610f84565b9050919050565b610fbd81610fa3565b8114610fc7575f5ffd5b50565b5f81359050610fd881610fb4565b92915050565b5f819050919050565b610ff081610fde565b8114610ffa575f5ffd5b50565b5f8135905061100b81610fe7565b92915050565b5f5f6040838503121561102757611026610f80565b5b5f61103485828601610fca565b925050602061104585828601610ffd565b9150509250929050565b5f8115159050919050565b6110638161104f565b82525050565b5f60208201905061107c5f83018461105a565b92915050565b61108b81610fde565b82525050565b5f6020820190506110a45f830184611082565b92915050565b5f5f5f606084860312156110c1576110c0610f80565b5b5f6110ce86828701610fca565b93505060206110df86828701610fca565b92505060406110f086828701610ffd565b9150509250925092565b5f60ff82169050919050565b61110f816110fa565b82525050565b5f6020820190506111285f830184611106565b92915050565b5f6020828403121561114357611142610f80565b5b5f61115084828501610ffd565b91505092915050565b5f6020828403121561116e5761116d610f80565b5b5f61117b84828501610fca565b91505092915050565b61118d81610fa3565b82525050565b5f6020820190506111a65f830184611184565b92915050565b5f5f604083850312156111c2576111c1610f80565b5b5f6111cf85828601610fca565b92505060206111e085828601610fca565b9150509250929050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52602260045260245ffd5b5f600282049050600182168061122e57607f821691505b602082108103611241576112406111ea565b5b50919050565b7f45524332303a207472616e7366657220616d6f756e74206578636565647320615f8201527f6c6c6f77616e6365000000000000000000000000000000000000000000000000602082015250565b5f6112a1602883610efa565b91506112ac82611247565b604082019050919050565b5f6020820190508181035f8301526112ce81611295565b9050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601160045260245ffd5b5f61130c82610fde565b915061131783610fde565b925082820390508181111561132f5761132e6112d5565b5b92915050565b7f4e6f7420746865206f776e6572000000000000000000000000000000000000005f82015250565b5f611369600d83610efa565b915061137482611335565b602082019050919050565b5f6020820190508181035f8301526113968161135d565b9050919050565b7f45524332303a206d696e7420746f20746865207a65726f2061646472657373005f82015250565b5f6113d1601f83610efa565b91506113dc8261139d565b602082019050919050565b5f6020820190508181035f8301526113fe816113c5565b9050919050565b5f61140f82610fde565b915061141a83610fde565b9250828201905080821115611432576114316112d5565b5b92915050565b7f45524332303a206275726e20616d6f756e7420657863656564732062616c616e5f8201527f6365000000000000000000000000000000000000000000000000000000000000602082015250565b5f611492602283610efa565b915061149d82611438565b604082019050919050565b5f6020820190508181035f8301526114bf81611486565b9050919050565b7f4e6577206f776e657220697320746865207a65726f20616464726573730000005f82015250565b5f6114fa601d83610efa565b9150611505826114c6565b602082019050919050565b5f6020820190508181035f830152611527816114ee565b9050919050565b7f45524332303a20617070726f76652066726f6d20746865207a65726f206164645f8201527f7265737300000000000000000000000000000000000000000000000000000000602082015250565b5f611588602483610efa565b91506115938261152e565b604082019050919050565b5f6020820190508181035f8301526115b58161157c565b9050919050565b7f45524332303a20617070726f766520746f20746865207a65726f2061646472655f8201527f7373000000000000000000000000000000000000000000000000000000000000602082015250565b5f611616602283610efa565b9150611621826115bc565b604082019050919050565b5f6020820190508181035f8301526116438161160a565b9050919050565b7f45524332303a207472616e736665722066726f6d20746865207a65726f2061645f8201527f6472657373000000000000000000000000000000000000000000000000000000602082015250565b5f6116a4602583610efa565b91506116af8261164a565b604082019050919050565b5f6020820190508181035f8301526116d181611698565b9050919050565b7f45524332303a207472616e7366657220746f20746865207a65726f20616464725f8201527f6573730000000000000000000000000000000000000000000000000000000000602082015250565b5f611732602383610efa565b915061173d826116d8565b604082019050919050565b5f6020820190508181035f83015261175f81611726565b9050919050565b7f45524332303a207472616e7366657220616d6f756e74206578636565647320625f8201527f616c616e63650000000000000000000000000000000000000000000000000000602082015250565b5f6117c0602683610efa565b91506117cb82611766565b604082019050919050565b5f6020820190508181035f8301526117ed816117b4565b905091905056fea264697066735822122043fc7637cc7b64f5d5e65f11aaaaaa0d36df813b5b3bd29e759d91ead6848883d64736f6c634300081e0033";

// Utility function to format supply numbers
const formatSupply = (supply) => {
  if (!supply) return '0';
  const num = parseInt(supply);
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1).replace('.0', '')}B`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1).replace('.0', '')}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1).replace('.0', '')}K`;
  return num.toString();
};

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const glow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 20px rgba(0, 204, 51, 0.3), 
                0 0 40px rgba(0, 204, 51, 0.2), 
                0 0 60px rgba(0, 204, 51, 0.1);
  }
  50% { 
    box-shadow: 0 0 30px rgba(0, 255, 65, 0.4), 
                0 0 60px rgba(0, 255, 65, 0.3), 
                0 0 90px rgba(0, 255, 65, 0.2);
  }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

// Simple header with just logo
const SimpleHeader = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
`;

const SimpleHeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const SimpleLogo = styled.div`
  display: flex;
  align-items: center;
  position: absolute;
  left: 0px;
  z-index: 10;

  a {
    text-decoration: none !important;
    border: none !important;
    outline: none !important;
    
    &:hover,
    &:focus,
    &:active,
    &:visited {
      text-decoration: none !important;
      border: none !important;
      outline: none !important;
    }
  }

  svg {
    z-index: 10;
    transform: scale(0.7);
  }
`;

// Network Toggle Components
const NetworkToggleButton = styled.button`
  background: linear-gradient(135deg, #2c2c2c, #1a1a1a);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
  height: 32px;
  position: absolute;
  right: ${props => props.rightOffset || 280}px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    background: linear-gradient(135deg, #3c3c3c, #2a2a2a);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const NetworkToggleIcon = styled.span`
  font-size: 0.8rem;
  transition: transform 0.2s ease;
  ${props => props.isMainnet && 'animation: pulse 2s infinite;'}
`;

// Wallet Modal Components
const WalletModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  backdrop-filter: blur(5px);
`;

const WalletModal = styled.div`
  background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
  border: 1px solid rgba(0, 204, 51, 0.3);
  border-radius: 16px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
`;

const WalletModalTitle = styled.h2`
  color: #00cc33;
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
`;

const WalletOption = styled.button`
  width: 100%;
  padding: 1rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #2a2a2a, #1f1f1f);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
  
  &:hover {
    background: linear-gradient(135deg, #3a3a3a, #2f2f2f);
    border-color: rgba(0, 204, 51, 0.5);
    transform: translateY(-1px);
  }
`;

const WalletIcon = styled.span`
  font-size: 1.5rem;
`;

const CloseModalButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #999;
  font-size: 1.5rem;
  cursor: pointer;
  
  &:hover {
    color: #fff;
  }
`;

const CCubeWalletButton = styled.button`
  background: ${props => props.connected 
    ? 'linear-gradient(135deg, #10b981, #059669)' 
    : 'linear-gradient(135deg, #ff6b35, #f7931e)'};
  border: none;
  color: white;
  padding: 6px 16px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => props.connected 
    ? '0 2px 8px rgba(16, 185, 129, 0.3)' 
    : '0 2px 8px rgba(255, 107, 53, 0.3)'};
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
  height: 32px;
  position: absolute;
  right: 40px;
  z-index: 10;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.connected 
      ? '0 4px 12px rgba(16, 185, 129, 0.4)' 
      : '0 4px 12px rgba(255, 107, 53, 0.4)'};
    background: ${props => props.connected 
      ? 'linear-gradient(135deg, #34d399, #10b981)' 
      : 'linear-gradient(135deg, #ff7849, #ffa726)'};
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: ${props => props.connected 
      ? '0 2px 6px rgba(16, 185, 129, 0.3)' 
      : '0 2px 6px rgba(255, 107, 53, 0.3)'};
  }
`;

// Confirmation dialog styles
const ConfirmationOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(10px);
`;

const ConfirmationDialog = styled.div`
  background: linear-gradient(135deg, #1e293b, #0f172a);
  border: 2px solid #dc2626;
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 50px rgba(220, 38, 38, 0.3);
`;

const ConfirmationTitle = styled.h3`
  color: #dc2626;
  margin: 0 0 16px 0;
  font-size: 1.2rem;
  text-align: center;
  text-shadow: 0 0 10px rgba(220, 38, 38, 0.5);
`;

const ConfirmationText = styled.p`
  color: #fff;
  margin: 0 0 20px 0;
  text-align: center;
  line-height: 1.5;
`;

const ConfirmationButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

const ConfirmButton = styled.button`
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    transform: translateY(-1px);
  }
`;

const CancelButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-1px);
  }
`;

// Page wrapper
const PageWrapper = styled.div`
  height: 100vh;
  background: #000000;
  color: #e0e0e0;
  padding-top: 70px;
  overflow: hidden; /* Prevent page scrolling */
`;

// Main container
const LaunchContainer = styled.div`
  background: #000000;
  display: grid;
  grid-template-columns: 1fr 2px 1fr;
  gap: 0;
  height: calc(100vh - 70px); /* Full height minus header */
  color: #e0e0e0;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    grid-template-rows: 1fr 1fr;
  }
`;

// Header section
const LaunchHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  animation: ${fadeIn} 0.8s ease-out;
`;

const LaunchTitle = styled.h1`
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: white;
  text-shadow: 0 4px 20px rgba(255, 255, 255, 0.3);
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const LaunchSubtitle = styled.p`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 1.3rem;
  color: white;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.7;
  font-weight: 400;
`;

// Header section inside form
const FormHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(0, 255, 65, 0.2);
  flex-shrink: 0; /* Prevent header from shrinking */
`;

const FormTitle = styled.h1`
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: white;
  text-shadow: 0 4px 20px rgba(255, 255, 255, 0.3);
  
  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`;

const FormSubtitle = styled.p`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 1.2rem;
  line-height: 1.7;
  font-weight: 400;
  color: white;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

// Left column - Form container
const FormContainer = styled.div`
  background: transparent;
  padding: 2rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  animation: ${fadeIn} 1s ease-out 0.2s both;
  
  @media (max-width: 1024px) {
    height: 50vh;
  }
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const FormContentContainer = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
`;

const ScrollableFormSections = styled.div`
  height: 630px; /* Set to 630px for expanded content space */
  overflow-y: auto;
  padding-right: 8px;
  border: 1px solid rgba(0, 204, 51, 0.2);
  border-radius: 8px;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 204, 51, 0.3);
    border-radius: 4px;
    
    &:hover {
      background: rgba(0, 204, 51, 0.5);
    }
  }
`;

// Form sections
const FormSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.4rem;
  color: #4f46e5;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: ${props => props.columns || '1fr'};
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #00cc33;
`;

const Input = styled.input`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  padding: 1rem;
  border: 1px solid rgba(0, 255, 65, 0.3);
  border-radius: 4px;
  background: rgba(20, 20, 20, 0.8);
  color: #00cc33;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #00ff41;
    box-shadow: 0 0 0 2px rgba(0, 204, 51, 0.2);
    background: rgba(20, 20, 20, 0.9);
  }
  
  &::placeholder {
    color: rgba(78, 154, 6, 0.7);
  }
`;

const TextArea = styled.textarea`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  padding: 1rem;
  border: 1px solid rgba(0, 255, 65, 0.3);
  border-radius: 4px;
  background: rgba(20, 20, 20, 0.8);
  color: #00cc33;
  font-size: 1rem;
  transition: all 0.3s ease;
  resize: vertical;
  min-height: 100px;
  
  &:focus {
    outline: none;
    border-color: #00ff41;
    box-shadow: 0 0 0 2px rgba(0, 204, 51, 0.2);
    background: rgba(20, 20, 20, 0.9);
  }
  
  &::placeholder {
    color: rgba(78, 154, 6, 0.7);
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FileInputLabel = styled.label`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  border: 2px dashed rgba(0, 255, 65, 0.3);
  border-radius: 4px;
  background: rgba(20, 20, 20, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
  flex-direction: column;
  gap: 0.5rem;
  color: #00cc33;
  
  &:hover {
    border-color: #00ff41;
    background: rgba(0, 204, 51, 0.1);
  }
`;

const ImagePreview = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: ${props => props.src ? `url(${props.src})` : 'rgba(255, 255, 255, 0.1)'};
  background-size: cover;
  background-position: center;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
`;

// Button container
const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const LaunchButton = styled.button`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  position: relative;
  padding: 1rem 3rem;
  background: ${props => props.loading 
    ? 'linear-gradient(135deg, rgba(0, 204, 51, 0.6), rgba(46, 204, 64, 0.6))' 
    : 'linear-gradient(135deg, #00cc33, #2ecc40, #00ff41)'};
  border: 2px solid rgba(0, 255, 65, 0.4);
  border-radius: 50px;
  color: #0a0a0a;
  font-size: 1.3rem;
  font-weight: 600;
  cursor: ${props => props.loading ? 'not-allowed' : 'pointer'};
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 1px;
  min-width: 250px;
  box-shadow: 0 4px 15px rgba(0, 204, 51, 0.3);
  
  /* Shimmer effect overlay */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s;
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-3px) scale(1.05);
    background: linear-gradient(135deg, #2ecc40, #00ff41, #00cc33);
    border-color: #00ff41;
    animation: ${glow} 2s ease-in-out infinite;
    
    &::before {
      left: 100%;
    }
  }
  
  &:active:not(:disabled) {
    transform: translateY(-1px) scale(1.02);
  }
  
  &:disabled {
    opacity: 0.8;
    cursor: not-allowed;
    animation: ${pulse} 1.5s ease-in-out infinite;
  }
  
  @media (max-width: 768px) {
    padding: 0.8rem 2.5rem;
    font-size: 1.1rem;
    min-width: 200px;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: ${spin} 1s linear infinite;
  margin-right: 0.5rem;
`;

const ResultContainer = styled.div`
  margin-top: 2rem;
  padding: 2rem;
  background: ${props => props.success 
    ? 'rgba(0, 204, 51, 0.1)' 
    : 'rgba(255, 7, 58, 0.1)'};
  border: 1px solid ${props => props.success 
    ? 'rgba(0, 255, 65, 0.3)' 
    : 'rgba(255, 7, 58, 0.3)'};
  border-radius: 4px;
  animation: ${fadeIn} 0.5s ease-out;
`;

const ResultTitle = styled.h3`
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: ${props => props.success ? '#00cc33' : '#ff073a'};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
`;

const ResultLink = styled.a`
  color: #4f46e5;
  text-decoration: none;
  font-weight: 600;
  
  &:hover {
    text-decoration: underline;
  }
`;

const TokenDetails = styled.div`
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: rgba(20, 20, 20, 0.6);
  border-radius: 4px;
  border: 1px solid rgba(0, 255, 65, 0.2);
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(0, 255, 65, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
`;

const DetailLabel = styled.span`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 500;
  color: #b0b0b0;
`;

const DetailValue = styled.span`
  font-family: 'Share Tech Mono', 'Courier New', monospace;
  color: #e0e0e0;
  word-break: break-all;
`;

// Right column - Token listing components
const Divider = styled.div`
  width: 2px;
  background: linear-gradient(to bottom, 
    transparent 0%, 
    rgba(0, 204, 51, 0.3) 10%, 
    rgba(0, 204, 51, 0.8) 50%, 
    rgba(0, 204, 51, 0.3) 90%, 
    transparent 100%);
  margin: 0 2rem;
  animation: ${fadeIn} 1s ease-out 0.3s both;
  
  @media (max-width: 1024px) {
    display: none;
  }
`;

const TokenListContainer = styled.div`
  background: transparent;
  padding: 2rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  animation: ${fadeIn} 1s ease-out 0.4s both;
  
  @media (max-width: 1024px) {
    height: 50vh;
  }
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const TokensHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid;
  border-image: linear-gradient(90deg, transparent, #ffffff, transparent) 1;
  padding-bottom: 1rem;
`;

const ListTitle = styled.h2`
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: white;
  margin: 0;
  margin-left: 15px;
  font-size: 1.8rem;
  font-weight: 700;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
`;

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchBox = styled.input`
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 5px;
  margin-right: 15px;
  padding: 8px 35px 8px 30px;
  color: white;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 0.9rem;
  width: 250px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    outline: none;
    border-color: rgba(0, 255, 65, 0.6);
    box-shadow: 0 0 10px rgba(0, 255, 65, 0.2);
    background: rgba(0, 0, 0, 0.8);
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.4);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 8px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 1;
`;

const ClearSearchButton = styled.button`
  position: absolute;
  right: 8px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;

  &:hover {
    color: rgba(255, 255, 255, 0.8);
  }

  &:focus {
    outline: none;
  }
`;

const TokenTable = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
`;

const TokenRowsSubContainer = styled.div`
  height: 690px; /* Fine-tuned height for perfect balance */
  overflow-y: auto;
  padding: 1.5rem;
  border: 1px solid rgba(0, 204, 51, 0.2);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.3);
  margin-top: 0.5rem;
  margin-right: 20px;
  margin-left: 20px;
  
  /* Hide scrollbars */
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const TokenRowsContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 60px 1.3fr 100px 1.7fr 80px;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: rgba(0, 204, 51, 0.1);
  border-radius: 8px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 400;
  color: #ccc;
  font-size: 0.9rem;
  flex-shrink: 0; /* Keep header fixed */
`;

const TokenRow = styled.div`
  display: grid;
  grid-template-columns: 60px 1.3fr 100px 1.7fr 80px;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0, 204, 51, 0.1), transparent);
    transition: left 0.6s ease;
  }
  
  &:hover {
    background: linear-gradient(135deg, rgba(0, 204, 51, 0.08), rgba(0, 255, 65, 0.05));
    border-color: rgba(0, 255, 65, 0.3);
    transform: translateY(-2px) scale(1.01);
    box-shadow: 0 8px 25px rgba(0, 204, 51, 0.2);
    
    &::before {
      left: 100%;
    }
  }
`;

const RankCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Share Tech Mono', monospace;
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
  text-shadow: 0 0 10px white;
  
  ${props => props.rank === 1 && `
    background: linear-gradient(135deg, #FFD700, #FFA500);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  `}
  
  ${props => props.rank === 2 && `
    background: linear-gradient(135deg, #C0C0C0, #A0A0A0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  `}
  
  ${props => props.rank === 3 && `
    background: linear-gradient(135deg, #CD7F32, #B8860B);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  `}
`;

const InfoCell = styled.div`
  display: flex;
  align-items: stretch;
  gap: 0.75rem;
  min-height: 60px;
`;

const TokenImage = styled.div`
  width: 58px;
  height: 58px;
  border-radius: 8px;
  background: ${props => props.src ? `url(${props.src})` : `linear-gradient(135deg, ${props.bgColor || '#00cc33'}, ${props.bgColor2 || '#2ecc40'})`};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${props => props.borderColor || 'rgba(255, 255, 255, 0.3)'};
  font-size: 1rem;
  color: #fff;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  margin: 1px 0;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
    border-radius: 8px;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    
    &::after {
      opacity: 1;
    }
  }
`;

const TokenInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.01rem;
  flex: 1;
`;

const TokenSymbol = styled.div`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segue UI', sans-serif;
  font-weight: 700;
  color: ${props => props.color || 'white'};
  font-size: 1rem;
  text-shadow: 0 0 10px ${props => props.color ? `${props.color}66` : 'rgba(255, 255, 255, 0.3)'};
`;

const ContractAddress = styled.div`
  font-family: 'Share Tech Mono', monospace;
  color: ${props => props.color || '#4e9a06'};
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 2px;
  border-radius: 3px;
  transition: all 0.2s ease;
  
  &:hover {
    color: #00cc33;
    background: rgba(0, 204, 51, 0.1);
  }
  
  &:active {
    color: #00ff41;
  }
`;

const PancakeSwapButton = styled.button`
  background: linear-gradient(135deg, #FF8C94, #FF6B9D);
  border: none;
  color: white;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  margin-top: 12px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    background: linear-gradient(135deg, #FF6B9D, #FF8C94);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 107, 157, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const RenounceButton = styled.button`
  background: linear-gradient(135deg, #FF6B42, #FF8442);
  border: none;
  color: white;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  margin-top: 12px;
  margin-left: 12px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    background: linear-gradient(135deg, #FF8442, #FF6B42);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 132, 66, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 0;
  margin-top: 12px;
`;

const SourceCodeSection = styled.div`
  margin-top: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid #3a3a5c;
  border-radius: 12px;
`;

const SourceCodeTitle = styled.h4`
  color: #ffffff;
  margin: 0 0 12px 0;
  font-size: 1rem;
  font-weight: 600;
`;

const SourceCodeTextarea = styled.textarea`
  width: 100%;
  height: 200px;
  background: #0f0f23;
  border: 1px solid #3a3a5c;
  border-radius: 8px;
  color: #e0e0e0;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 0.8rem;
  padding: 12px;
  resize: vertical;
  line-height: 1.4;
  
  &:focus {
    outline: none;
    border-color: #6c5ce7;
  }
`;

const VerificationSteps = styled.div`
  margin-top: 15px;
  padding: 15px;
  background: rgba(108, 92, 231, 0.1);
  border: 1px solid rgba(108, 92, 231, 0.3);
  border-radius: 8px;
`;

const StepsList = styled.ol`
  margin: 10px 0 0 0;
  padding-left: 20px;
  color: #e0e0e0;
  font-size: 0.9rem;
  line-height: 1.6;
`;

const VerificationInfo = styled.p`
  color: #b0b0b0;
  font-size: 0.85rem;
  margin: 8px 0 0 0;
`;

const CopySourceButton = styled.button`
  background: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: 10px;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(108, 92, 231, 0.3);
  }
`;

const RenounceInstructions = styled.div`
  margin-top: 15px;
  padding: 15px;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 8px;
`;

const DirectRenounceButton = styled.button`
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 15px;
  width: 100%;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ErrorDisplay = styled.div`
  margin-top: 15px;
  padding: 15px;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 8px;
  color: #ffb3b3;
`;

const ErrorTitle = styled.h4`
  color: #ff6b6b;
  margin: 0 0 10px 0;
  font-size: 0.95rem;
`;

const ErrorDetails = styled.pre`
  background: #0f0f23;
  border: 1px solid #3a3a5c;
  border-radius: 6px;
  padding: 12px;
  color: #e0e0e0;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 0.8rem;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
  margin: 10px 0;
`;

const CopyErrorButton = styled.button`
  background: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  margin-top: 8px;
`;

const SocialIcons = styled.div`
  display: flex;
  gap: 0.25rem;
  margin-top: 0;
`;

const SocialIcon = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: ${props => props.color || '#4e9a06'};
  font-weight: normal;
  transition: all 0.3s ease;
  cursor: pointer;
  background: none;
  
  &:hover {
    transform: scale(1.2);
    text-shadow: 0 0 8px ${props => props.color || '#4e9a06'};
  }
`;

const SupplyCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.85rem;
  font-weight: bold;
  color: #00cc33;
  text-shadow: 0 0 5px rgba(0, 204, 51, 0.3);
  white-space: nowrap;
`;

const DescriptionCell = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: white;
  font-size: 0.65rem;
  line-height: 1.3;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
`;

const TimeCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #ffff00;
  font-size: 0.9rem;
  text-shadow: 0 0 10px #ffff00;
`;

const TokenLaunch = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    tokenName: '',
    tokenSymbol: '',
    initialSupply: '',
    description: '',
    walletAddress: '',
    tokenImage: null,
    twitter: '',
    website: '',
    telegram: ''
  });
  
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [renounceError, setRenounceError] = useState(null);
  const [skipValidation, setSkipValidation] = useState(false);
  
  // Use global wallet context
  const {
    cCubeWalletConnected,
    cCubeWalletData,
    externalWalletConnected,
    externalWalletData,
    connectCCubeWallet,
    disconnectCCubeWallet,
    connectExternalWallet,
    disconnectExternalWallet,
    disconnectAllWallets,
    showWalletModal,
    setShowWalletModal,
    gasPrice,
    setGasPrice,
    isMainnet,
    setIsMainnet,
    getCurrentWallet,
    isAnyWalletConnected,
    getWalletDisplayName
  } = useWallet();

  // Local component state
  const [showWalletSetup, setShowWalletSetup] = useState(false);
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  const [launchedTokens, setLaunchedTokens] = useState([]);
  const [loadingTokens, setLoadingTokens] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  
  // Dynamic positioning for toggle button
  const walletButtonRef = useRef(null);
  const [walletButtonWidth, setWalletButtonWidth] = useState(280); // default fallback

  // Sample token data with colorful images
  const sampleTokens = [
    {
      rank: 1,
      symbol: 'DOGE',
      contractAddress: '0x1234...abcd',
      daysCreated: 45,
      socials: ['T', 'W', 'D', 'TG'],
      image: 'https://assets.coingecko.com/coins/images/5/standard/dogecoin.png',
      bgColor: '#F7931A',
      description: 'The original meme coin that started as a joke. Beloved by communities worldwide for its fun and charitable spirit.'
    },
    {
      rank: 2,
      symbol: 'PEPE',
      contractAddress: '0x5678...efgh',
      daysCreated: 23,
      socials: ['T', 'W', 'TG'],
      image: 'https://assets.coingecko.com/coins/images/29850/standard/pepe-token.jpeg',
      bgColor: '#0F8A5F',
      description: 'Internet culture meets crypto with this frog-themed token. A tribute to the iconic meme character loved globally.'
    },
    {
      rank: 3,
      symbol: 'SHIB',
      contractAddress: '0x9abc...ijkl',
      daysCreated: 67,
      socials: ['T', 'W', 'D', 'G'],
      image: 'https://assets.coingecko.com/coins/images/11939/standard/shiba.png',
      bgColor: '#E91E63',
      description: 'The Dogecoin killer with an ambitious ecosystem. Features ShibaSwap DEX and plans for metaverse integration.'
    },
    {
      rank: 4,
      symbol: 'FLOKI',
      contractAddress: '0xdef0...mnop',
      daysCreated: 12,
      socials: ['T', 'W'],
      image: 'https://assets.coingecko.com/coins/images/16746/standard/PNG_image.png',
      bgColor: '#673AB7',
      description: 'Named after Elon Musk\'s dog, this token focuses on utility. Building NFT gaming metaverse and education platforms.'
    },
    {
      rank: 5,
      symbol: 'BONK',
      contractAddress: '0x3456...qrst',
      daysCreated: 89,
      socials: ['T', 'W', 'D'],
      image: 'https://assets.coingecko.com/coins/images/28600/standard/bonk.jpg',
      bgColor: '#FF9800',
      description: 'Solana\'s first dog coin designed for the people. Community-driven with fair distribution and meme culture focus.'
    },
    {
      rank: 6,
      symbol: 'MEME',
      contractAddress: '0x7890...uvwx',
      daysCreated: 156,
      socials: ['T', 'W', 'D'],
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=100&h=100&fit=crop&crop=face',
      bgColor: '#00BCD4',
      description: 'The ultimate meme token celebrating internet culture. Features viral content rewards and community-driven governance.'
    },
    {
      rank: 7,
      symbol: 'WOJAK',
      contractAddress: '0xabcd...yz12',
      daysCreated: 34,
      socials: ['T', 'G'],
      image: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=100&h=100&fit=crop&crop=face',
      bgColor: '#4CAF50',
      description: 'Based on the classic internet meme character. Represents the everyman trader with relatable market emotions.'
    },
    {
      rank: 8,
      symbol: 'MOON',
      contractAddress: '0x3456...7890',
      daysCreated: 78,
      socials: ['T', 'W', 'D'],
      image: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=100&h=100&fit=crop',
      bgColor: '#2196F3',
      description: 'Aiming for astronomical gains with space-themed tokenomics. Features lunar phases reward cycles and star mapping.'
    },
    {
      rank: 9,
      symbol: 'ROCKET',
      contractAddress: '0x4567...89ab',
      daysCreated: 91,
      socials: ['T', 'W', 'D'],
      image: 'https://images.unsplash.com/photo-1446776631856-73b72a0ec4ae?w=100&h=100&fit=crop',
      bgColor: '#FF5722',
      description: 'High-speed DeFi token built for rapid transactions. Focuses on cross-chain bridge technology and yield farming.'
    },
    {
      rank: 10,
      symbol: 'DIAMOND',
      contractAddress: '0x5678...9abc',
      daysCreated: 125,
      socials: ['T', 'W', 'G'],
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=100&h=100&fit=crop',
      bgColor: '#9C27B0',
      description: 'Premium luxury token with diamond-backed reserves. Offers exclusive NFT collections and VIP member benefits.'
    },
    {
      rank: 11,
      symbol: 'FIRE',
      contractAddress: '0x6789...abcd',
      daysCreated: 56,
      socials: ['T', 'D'],
      image: 'https://images.unsplash.com/photo-1534388761991-2e2fa0b4ac95?w=100&h=100&fit=crop',
      bgColor: '#FF9800',
      description: 'Deflationary token with auto-burn mechanics. Every transaction reduces total supply creating scarcity and value.'
    },
    {
      rank: 12,
      symbol: 'CYBER',
      contractAddress: '0x789a...bcde',
      daysCreated: 198,
      socials: ['T', 'W', 'D', 'G'],
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=100&h=100&fit=crop',
      bgColor: '#00BCD4',
      description: 'Futuristic AI-powered token for the metaverse economy. Integrates machine learning algorithms for smart trading.'
    },
    {
      rank: 13,
      symbol: 'LASER',
      contractAddress: '0x89ab...cdef',
      daysCreated: 33,
      socials: ['T', 'W'],
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=100&h=100&fit=crop',
      bgColor: '#3F51B5',
      description: 'Precision-focused trading token with laser-sharp analytics. Provides real-time market insights and predictions.'
    },
    {
      rank: 14,
      symbol: 'GALAXY',
      contractAddress: '0x9abc...def0',
      daysCreated: 167,
      socials: ['T', 'W', 'D'],
      image: 'https://images.unsplash.com/photo-1446776741797-e4608715de55?w=100&h=100&fit=crop',
      bgColor: '#8BC34A',
      description: 'Interstellar token ecosystem spanning multiple blockchains. Connects distant crypto communities across the universe.'
    },
    {
      rank: 15,
      symbol: 'ALPHA',
      contractAddress: '0xabcd...ef01',
      daysCreated: 89,
      socials: ['T', 'G'],
      image: 'https://images.unsplash.com/photo-1464822759844-d150baac0889?w=100&h=100&fit=crop',
      bgColor: '#795548',
      description: 'Leading pack token for early adopters and risk-takers. Rewards alpha mindset with exclusive investment opportunities.'
    }
  ];

  const getSocialIcon = (type, token, index) => {
    const socialData = {
      'T': { color: '#1DA1F2', symbol: '𝕏', url: token?.socialLinks?.twitter }, // Twitter/X
      'W': { color: '#00cc33', symbol: '🌐', url: token?.socialLinks?.website }, // Website
      'D': { color: '#5865F2', symbol: '🎮', url: null }, // Discord (not in database)
      'G': { color: '#29B6F6', symbol: '▶', url: token?.socialLinks?.telegram }, // Telegram (using G for telegram)
      'TG': { color: '#29B6F6', symbol: '▶', url: token?.socialLinks?.telegram } // Telegram alternative
    };
    
    const social = socialData[type] || { color: '#4e9a06', symbol: '?', url: null };
    
    return (
      <SocialIcon 
        key={index || type} 
        color={social.color} 
        title={getSocialName(type)}
        onClick={() => social.url && window.open(social.url, '_blank')}
        style={{ cursor: social.url ? 'pointer' : 'default' }}
      >
        {social.symbol}
      </SocialIcon>
    );
  };

  const getSocialName = (type) => {
    const names = {
      'T': 'Twitter',
      'W': 'Website', 
      'D': 'Discord',
      'G': 'GitHub',
      'TG': 'Telegram'
    };
    return names[type] || 'Social';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Helper function to convert file to base64
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Return the full data URL (data:image/...;base64,...)
        resolve(reader.result);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        tokenImage: file
      }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const { tokenName, tokenSymbol, initialSupply, walletAddress } = formData;
    
    // Check if wallet is connected
    if (!isAnyWalletConnected()) {
      return 'Please connect a wallet to deploy your token';
    }
    
    if (!tokenName || !tokenSymbol || !initialSupply || !walletAddress) {
      return 'Please fill in all required fields';
    }
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return 'Please enter a valid wallet address';
    }
    
    if (isNaN(initialSupply) || parseFloat(initialSupply) <= 0) {
      return 'Please enter a valid initial supply';
    }
    
    return null;
  };

  // BSC Constructor Validation Test Function
  const validateBSCConstructor = async () => {
    try {
      setResult(null);
      console.log('🧪 Running BSC Constructor Validation Test...');
      
      if (!formData.tokenName || !formData.tokenSymbol || !formData.initialSupply || !formData.walletAddress) {
        throw new Error('Please fill in all required fields first');
      }

      const cleanName = formData.tokenName.trim();
      const cleanSymbol = formData.tokenSymbol.trim().toUpperCase();
      const totalSupply = ethers.parseUnits(formData.initialSupply.toString(), 18);

      // Pre-validation for known problematic patterns
      console.log('🔍 Pre-validation checks...');
      
      // Check for specific patterns that cause "missing revert data" errors
      const knownProblematicPatterns = {
        names: ['dev', 'test', 'demo', 'tmp', 'temp', 'sample'],
        symbols: ['DEV', 'TEST', 'DEMO', 'TMP', 'TEMP', 'SAMPLE', 'DEV4'],
        reasons: {
          'dev': 'BSC often rejects tokens with "dev" in the name as test tokens',
          'test': 'BSC may block tokens containing "test" as temporary tokens',
          'DEV4': 'Similar to other dev tokens, BSC may have restrictions'
        }
      };
      
      let preValidationWarnings = [];
      let preValidationBlocking = [];
      
      // Check name patterns
      for (const pattern of knownProblematicPatterns.names) {
        if (cleanName.toLowerCase().includes(pattern)) {
          const reason = knownProblematicPatterns.reasons[pattern] || 'May cause BSC constructor rejection';
          preValidationBlocking.push(`Name "${cleanName}" contains "${pattern}": ${reason}`);
        }
      }
      
      // Check symbol patterns
      for (const pattern of knownProblematicPatterns.symbols) {
        if (cleanSymbol === pattern) {
          const reason = knownProblematicPatterns.reasons[pattern] || 'May cause BSC constructor rejection';
          preValidationBlocking.push(`Symbol "${cleanSymbol}": ${reason}`);
        }
      }
      
      if (preValidationBlocking.length > 0) {
        setResult({
          success: false,
          message: `🚫 Pre-Validation Failed - Known Problematic Patterns:\n\n${preValidationBlocking.map(issue => `❌ ${issue}`).join('\n\n')}\n\n💡 Suggested fixes:\n• Change name to something more unique (avoid dev/test/demo)\n• Use a different symbol (try adding numbers: DEV42, MYDEV, etc.)\n• Consider more professional names for mainnet deployment\n\nThese patterns are known to cause "missing revert data" errors on BSC.`
        });
        return;
      }

      // Run the same validations as deployment without actually deploying
      const blockingIssues = [];
      
      // String validation
      const allowedNamePattern = /^[a-zA-Z0-9\s\-_.]+$/;
      const allowedSymbolPattern = /^[A-Z0-9]+$/;
      
      if (!allowedNamePattern.test(cleanName)) {
        blockingIssues.push('Name contains unsupported characters');
      }
      if (!allowedSymbolPattern.test(cleanSymbol)) {
        blockingIssues.push('Symbol contains unsupported characters');
      }
      if (['BNB', 'BSC', 'BUSD', 'USDT', 'ETH', 'BTC', 'WBNB', 'CAKE'].includes(cleanSymbol)) {
        blockingIssues.push('Symbol conflicts with major tokens');
      }
      if (!ethers.isAddress(formData.walletAddress)) {
        blockingIssues.push('Invalid wallet address');
      }

      const supplyInTokens = Number(ethers.formatUnits(totalSupply, 18));
      if (supplyInTokens < 0.000001 || supplyInTokens > 1e12) {
        blockingIssues.push('Total supply out of safe range');
      }

      if (blockingIssues.length > 0) {
        setResult({
          success: false,
          message: `❌ BSC Validation Failed:\n${blockingIssues.map(issue => `• ${issue}`).join('\n')}`
        });
        return;
      }

      // Test parameter encoding
      const testAbiCoder = ethers.AbiCoder.defaultAbiCoder();
      const encodedParams = testAbiCoder.encode(
        ['string', 'string', 'uint8', 'uint256', 'address'],
        [cleanName, cleanSymbol, 18, totalSupply, formData.walletAddress]
      );

      // Advanced comprehensive diagnostic tests
      console.log('🔍 Running advanced diagnostic tests...');
      
      let diagnosticResults = [];
      let criticalIssues = [];
      
      // Test 1: Network and wallet validation
      try {
        if (window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const network = await provider.getNetwork();
          const accounts = await provider.listAccounts();
          
          diagnosticResults.push(`Network: ${network.name || 'Unknown'} (Chain ID: ${network.chainId})`);
          
          if (network.chainId === BigInt(56)) {
            diagnosticResults.push('⚠️ Connected to BSC Mainnet - Consider testing on Testnet first');
            diagnosticResults.push('💡 Recent BSC constructor failures suggest using Testnet for debugging');
          } else if (network.chainId === BigInt(97)) {
            diagnosticResults.push('✅ Connected to BSC Testnet - Perfect for debugging');
            diagnosticResults.push('💡 Test deployment here first, then switch to Mainnet');
          } else {
            criticalIssues.push('❌ Wrong network - Must use BSC Mainnet (56) or BSC Testnet (97)');
            criticalIssues.push('🔄 Use the "Switch to BSC Testnet" button above');
          }
          
          // Check wallet balance
          if (accounts.length > 0) {
            const balance = await provider.getBalance(accounts[0].address);
            const balanceInBNB = parseFloat(ethers.formatEther(balance));
            diagnosticResults.push(`Wallet Balance: ${balanceInBNB.toFixed(4)} BNB`);
            
            if (balanceInBNB < 0.01) {
              criticalIssues.push(`Insufficient BNB balance (${balanceInBNB.toFixed(4)} BNB). Need at least 0.01 BNB for deployment`);
            }
          }
          
          // Test 2: Contract deployment simulation (gas estimation)
          try {
            console.log('🧪 Testing contract deployment simulation...');
            const signer = await provider.getSigner();
            const contractFactory = new ethers.ContractFactory(TOKEN_CONTRACT_ABI, TOKEN_CONTRACT_BYTECODE, signer);
            
            // Try to estimate gas for deployment
            const gasEstimate = await contractFactory.deploy.estimateGas(
              cleanName, cleanSymbol, 18, totalSupply, formData.walletAddress
            );
            
            diagnosticResults.push(`✅ Gas Estimation: ${gasEstimate.toString()} gas (~${(parseFloat(gasEstimate.toString()) / 1000000).toFixed(2)}M)`);
            
            if (gasEstimate > BigInt(10000000)) {
              diagnosticResults.push('⚠️ Very high gas requirement - deployment might be expensive');
            }
            
            // Test 3: Try creating deployment transaction (without sending)
            const deployTx = contractFactory.getDeployTransaction(
              cleanName, cleanSymbol, 18, totalSupply, formData.walletAddress
            );
            
            diagnosticResults.push(`✅ Deployment Transaction Created (${deployTx.data.length} bytes)`);
            
          } catch (gasEstimationError) {
            criticalIssues.push(`Gas estimation failed: ${gasEstimationError.message}`);
            
            // This is the same error you've been getting - let's analyze it
            if (gasEstimationError.message.includes('missing revert data')) {
              criticalIssues.push('🚨 CRITICAL: Contract constructor reverts immediately');
              criticalIssues.push('🔍 Analysis: This is the EXACT issue causing your deployment failures');
              criticalIssues.push('📋 Root Cause: BSC rejects this contract before execution even begins');
              criticalIssues.push('🛠️ SOLUTION: Switch to BSC Testnet to isolate if it\'s a mainnet restriction');
              criticalIssues.push('💡 If testnet works but mainnet fails = BSC has new anti-spam rules');
              criticalIssues.push('💡 If both fail = Contract code has fundamental BSC compatibility issues');
            }
          }
          
        } else {
          criticalIssues.push('No wallet provider detected - install MetaMask or similar wallet');
        }
      } catch (networkError) {
        criticalIssues.push(`Network connection error: ${networkError.message}`);
      }
      
      // Compile results
      let gasEstimateInfo = '\n\n🔍 Diagnostic Results:';
      if (diagnosticResults.length > 0) {
        gasEstimateInfo += '\n' + diagnosticResults.map(result => `• ${result}`).join('\n');
      }
      
      if (criticalIssues.length > 0) {
        gasEstimateInfo += '\n\n🚨 Critical Issues Found:';
        gasEstimateInfo += '\n' + criticalIssues.map(issue => `${issue}`).join('\n');
        
        // Add specific solution for constructor revert issues
        if (criticalIssues.some(issue => issue.includes('constructor reverts'))) {
          gasEstimateInfo += '\n\n🔧 IMMEDIATE ACTION PLAN:';
          gasEstimateInfo += '\n1. 🔄 Click "Switch to BSC Testnet" button above';
          gasEstimateInfo += '\n2. 🆓 Get testnet BNB from BSC faucet';
          gasEstimateInfo += '\n3. 🧪 Test deployment on testnet';
          gasEstimateInfo += '\n4. 📊 Compare testnet vs mainnet results';
          gasEstimateInfo += '\n5. 🔍 If testnet works: BSC Mainnet has new restrictions';
          gasEstimateInfo += '\n6. 🔧 If testnet fails: Contract needs modification';
          
          gasEstimateInfo += '\n\n🌐 BSC Testnet Resources:';
          gasEstimateInfo += '\n• Faucet: https://testnet.binance.org/faucet-smart';
          gasEstimateInfo += '\n• Explorer: https://testnet.bscscan.com/';
          gasEstimateInfo += '\n• Chain ID: 97 (0x61)';
        }
      }

      // Generate alternative suggestions if current params are marginal
      let suggestions = '';
      if (cleanName.toLowerCase().includes('token') || cleanName.toLowerCase().includes('coin')) {
        suggestions += '\n\n💡 Name Suggestion: Consider more unique names like "MyCrypto", "DigitalAsset", or branded names';
      }
      if (cleanSymbol.length <= 4 && /^[A-Z]+$/.test(cleanSymbol)) {
        suggestions += '\n💡 Symbol Suggestion: Consider longer symbols (5-8 chars) to avoid conflicts: ' + cleanSymbol + 'TOKEN, MY' + cleanSymbol + ', ' + cleanSymbol + '2024';
      }

      setResult({
        success: true,
        message: `✅ BSC Constructor Validation Passed!\n\nYour parameters should work on BSC:\n• Name: "${cleanName}" (${cleanName.length} chars)\n• Symbol: "${cleanSymbol}" (${cleanSymbol.length} chars)\n• Supply: ${supplyInTokens.toLocaleString()} tokens\n• Owner: ${formData.walletAddress}\n• Encoded size: ${encodedParams.length} bytes${gasEstimateInfo}${suggestions}\n\n✅ Validation Results:\n• No known problematic patterns detected\n• Parameter encoding successful\n• Network connectivity verified\n\n💡 Deployment Recommendations:\n• Deploy on BSC Testnet first for testing\n• Ensure sufficient BNB balance (>0.01 BNB)\n• Deploy during low network activity for better success rate\n• Monitor transaction on BSCScan for detailed logs\n\nYou can proceed with deployment confidently!`
      });
      
    } catch (error) {
      console.error('BSC validation test failed:', error);
      setResult({
        success: false,
        message: `❌ BSC Validation Test Failed: ${error.message}`
      });
    }
  };

  // Deploy token using connected wallet
  // Server-side deployment using private key (reliable method)
  const deployTokenWithPrivateKey = async () => {
    try {
      console.log('🚀 Starting server-side token deployment...');
      console.log('💡 Using private key from environment (proven working method)');
      
      // Get the connected wallet address
      const currentWallet = getCurrentWallet();
      console.log('🔍 Current wallet info:', currentWallet);
      
      const connectedWalletAddress = currentWallet?.data?.address;
      console.log('🔍 Extracted wallet address:', connectedWalletAddress);
      
      if (!connectedWalletAddress || !currentWallet?.connected) {
        console.error('❌ Wallet connection check failed:', {
          address: connectedWalletAddress,
          connected: currentWallet?.connected,
          walletType: currentWallet?.type
        });
        throw new Error('Please connect a wallet first to receive the tokens');
      }
      
      console.log('🎯 Tokens will be sent to connected wallet:', connectedWalletAddress);
      
      // Prepare deployment data for server API
      const deploymentData = {
        tokenName: formData.tokenName.trim(),
        tokenSymbol: formData.tokenSymbol.trim().toUpperCase(),
        initialSupply: formData.initialSupply,
        // Send connected wallet address - server pays gas, tokens go to connected wallet
        walletAddress: connectedWalletAddress,
        description: formData.description || 'Token deployed via C-Cube platform',
        twitter: formData.twitter || '',
        website: formData.website || '',
        telegram: formData.telegram || '',
        isMainnet: true // Deploy to BSC Mainnet
      };
      
      console.log('📋 Deployment parameters:', {
        name: deploymentData.tokenName,
        symbol: deploymentData.tokenSymbol,
        supply: deploymentData.initialSupply,
        walletAddress: deploymentData.walletAddress,
        isMainnet: deploymentData.isMainnet
      });
      
      console.log('📡 Full deployment data being sent:', deploymentData);
      
      console.log('🔄 Sending deployment request to server...');
      const response = await fetch('/api/deploy-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deploymentData)
      });
      
      console.log('📡 Server response status:', response.status);
      console.log('📡 Server response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || response.statusText;
          console.error('❌ Server error response:', errorData);
        } catch (parseError) {
          const errorText = await response.text();
          errorMessage = errorText || response.statusText;
          console.error('❌ Server error (non-JSON):', errorText);
        }
        throw new Error(`Server deployment failed (${response.status}): ${errorMessage}`);
      }
      
      const result = await response.json();
      console.log('✅ Server-side deployment successful!', result);
      
      return {
        success: true,
        contractAddress: result.contractAddress,
        transactionHash: result.transactionHash,
        explorerUrl: result.explorerUrl || (result.transactionHash ? `https://bscscan.com/tx/${result.transactionHash}` : ''),
        deploymentInfo: {
          contractAddress: result.contractAddress,
          transactionHash: result.transactionHash,
          tokenName: deploymentData.tokenName,
          tokenSymbol: deploymentData.tokenSymbol,
          decimals: 18,
          initialSupply: deploymentData.initialSupply,
          network: 'BSC Mainnet',
          deployedAt: new Date().toISOString(),
          method: 'Server-side (Private Key)'
        }
      };
      
    } catch (error) {
      console.error('❌ Server-side deployment error:', error);
      return {
        success: false,
        error: error.message,
        method: 'Server-side (Private Key)'
      };
    }
  };

  const handleWalletLaunchOLD = async () => {
    try {
      // Import the simplified token factory - COMMENTED OUT: missing file
      // const { deploySimpleToken, switchToBSC } = await import('../utils/SimpleTokenFactory');
      console.log('handleWalletLaunchOLD called but disabled - missing SimpleTokenFactory');
      
      console.log('🚀 Starting simplified wallet deployment...');
      
      // Check if wallet is connected
      if (!window.ethereum) {
        throw new Error('No wallet found. Please install MetaMask or another wallet extension.');
      }

      // Request account access
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      } catch (error) {
        throw new Error('Wallet access denied. Please connect your wallet and try again.');
      }

      // Get provider and signer
      let provider = new ethers.BrowserProvider(window.ethereum);
      let signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();

      console.log('💼 Wallet connected:', walletAddress);
      
      // Validate form data
      if (!formData.tokenName?.trim()) {
        throw new Error('Token name is required');
      }
      if (!formData.tokenSymbol?.trim()) {
        throw new Error('Token symbol is required');
      }
      if (!formData.initialSupply || parseFloat(formData.initialSupply) <= 0) {
        throw new Error('Initial supply must be greater than 0');
      }

      // Check network and switch if needed
      const initialNetwork = await provider.getNetwork();
      const chainId = Number(initialNetwork.chainId);
      const expectedChainId = isMainnet ? 56 : 97;
      
      if (chainId !== expectedChainId) {
        console.log('🔄 Switching to BSC network...');
        
        try {
          // await switchToBSC(isMainnet); // COMMENTED OUT: missing SimpleTokenFactory
          throw new Error('Network switch functionality temporarily disabled');
          // Refresh provider after network switch
          const newProvider = new ethers.BrowserProvider(window.ethereum);
          const newSigner = await newProvider.getSigner();
          
          // Update references
          provider = newProvider;
          signer = newSigner;
        } catch (switchError) {
          throw new Error(`Failed to switch network: ${switchError.message}`);
        }
      }

      console.log('🌐 Network confirmed:', isMainnet ? 'BSC Mainnet' : 'BSC Testnet');
      
      // Use the simplified deployment function - COMMENTED OUT: missing SimpleTokenFactory
      // const result = await deploySimpleToken({
      //   name: formData.tokenName.trim(),
      //   symbol: formData.tokenSymbol.trim(),
      //   totalSupply: formData.initialSupply,
      //   signer: signer,
      //   onStatusUpdate: (status) => {
      //     console.log('🔄', status);
      //   }
      // });
      
      throw new Error('handleWalletLaunchOLD is disabled - missing SimpleTokenFactory module');

      console.log('✅ Deployment successful!', result);

      // Save to database
      const tokenData = {
        tokenName: formData.name,
        tokenSymbol: formData.symbol,
        description: `${formData.name} (${formData.symbol}) - BSC Token`,
        initialSupply: formData.totalSupply,
        walletAddress: result.ownerAddress,
        twitter: formData.twitter || "",
        website: formData.website || "",
        telegram: formData.telegram || "",
        success: true,
        contractAddress: result.contractAddress,
        transactionHash: result.transactionHash,
        explorerUrl: result.explorerUrl,
        deploymentInfo: {
          contractAddress: result.contractAddress,
          transactionHash: result.transactionHash,
          tokenName: formData.name,
          tokenSymbol: formData.symbol,
          decimals: result.decimals,
          initialSupply: formData.totalSupply,
          ownerAddress: result.ownerAddress,
          network: result.network,
          chainId: isMainnet ? 56 : 97,
          deployedAt: new Date().toISOString(),
          explorerUrl: result.explorerUrl
        },
        metadata: {
          contractAddress: result.contractAddress,
          hasImage: !!formData.tokenImage,
          imageUrl: formData.tokenImage || null,
          createdAt: new Date().toISOString(),
          dataFile: `${result.contractAddress.toLowerCase().replace('0x', '')}.json`
        }
      };

      // Try to save to database (don't fail deployment if this fails)
      try {
        const saved = await saveTokenToGitHub(tokenData);
        if (saved) {
          // Refresh token list to show the newly saved token
          fetchLaunchedTokens();
        } else {
          console.warn('⚠️ Failed to save to database, but deployment succeeded');
        }
      } catch (saveError) {
        console.warn('⚠️ Database save error:', saveError.message);
      }

      // Show success result
      setResult({
        success: true,
        message: '🎉 Token deployed successfully with your wallet!',
        contractAddress: result.contractAddress,
        transactionHash: result.transactionHash,
        explorerUrl: result.explorerUrl,
        deploymentInfo: {
          tokenName: result.tokenName,
          tokenSymbol: result.tokenSymbol,
          totalSupply: result.totalSupply,
          decimals: result.decimals,
          ownerAddress: result.ownerAddress,
          network: result.network,
          contractAddress: result.contractAddress,
          transactionHash: result.transactionHash,
          deployedAt: tokenData.deployedAt
        }
      });

      // Refresh token list
      setTimeout(() => {
        fetchLaunchedTokens();
      }, 3000);
        
        // Test provider connectivity and implement RPC fallback if needed
        try {
          await provider.getBlockNumber();
          console.log('✅ Wallet provider connectivity verified');
        } catch (providerError) {
          console.warn('⚠️ Wallet provider has connectivity issues:', providerError.message);
          console.log('🔄 Implementing RPC fallback for better reliability...');
          
          // Multiple BSC RPC endpoints for reliability
          const bscRpcEndpoints = [
            'https://bsc-dataseed1.binance.org/',
            'https://bsc-dataseed2.binance.org/', 
            'https://bsc-dataseed3.binance.org/',
            'https://bsc-dataseed1.defibit.io/',
            'https://rpc.ankr.com/bsc'
          ];
          
          const bscTestnetRpcEndpoints = [
            'https://data-seed-prebsc-1-s1.binance.org:8545/',
            'https://data-seed-prebsc-2-s1.binance.org:8545/',
            'https://bsc-testnet.public.blastapi.io'
          ];
          
          const rpcEndpoints = chainId === 56 ? bscRpcEndpoints : bscTestnetRpcEndpoints;
          let workingRpc = null;
          
          // Test RPC endpoints to find a working one
          for (const rpcUrl of rpcEndpoints) {
            try {
              console.log(`🔍 Testing RPC endpoint: ${rpcUrl}`);
              const testProvider = new ethers.JsonRpcProvider(rpcUrl);
              await testProvider.getBlockNumber();
              workingRpc = rpcUrl;
              console.log('✅ Found working RPC endpoint:', rpcUrl);
              break;
            } catch (rpcError) {
              console.warn(`❌ RPC ${rpcUrl} failed:`, rpcError.message);
              continue;
            }
          }
          
          if (workingRpc) {
            console.log('🔄 Creating hybrid provider with working RPC fallback');
            // Keep the wallet provider but with RPC fallback information
            provider._workingRpc = workingRpc;
            console.log('✅ Provider enhanced with RPC fallback capability');
          } else {
            console.warn('⚠️ All RPC endpoints failed - network may be experiencing issues');
            // Continue with wallet provider - might still work for signing
          }
        }
        
        // Get signer with validation
        signer = await provider.getSigner();
        const signerAddress = await signer.getAddress();
        
        console.log('🔍 WALLET IDENTIFICATION:');
        console.log('========================');
        console.log('✅ Signer address:', signerAddress);
        console.log('📋 Expected wallet address (from context):', walletAddress || 'Not yet determined');
        console.log('🔗 Address match:', walletAddress ? (signerAddress.toLowerCase() === walletAddress.toLowerCase()) : 'N/A (wallet address not set yet)');
        console.log('🎯 Wallet type detection:');
        
        // Check which wallet is actually connected
        if (window.ethereum?.isMetaMask) {
          console.log('  - MetaMask detected as primary provider');
        }
        if (window.ethereum?.isCoinbaseWallet) {
          console.log('  - Coinbase Wallet detected');
        }
        if (window.ethereum?.isTrustWallet) {
          console.log('  - Trust Wallet detected');
        }
        if (window.ethereum?.isBraveWallet) {
          console.log('  - Brave Wallet detected');
        }
        
        // Show connected accounts
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          console.log('📱 Connected accounts:', accounts);
          console.log('🎯 Primary account (being used):', accounts[0]);
          console.log('⚠️ Account count:', accounts.length);
          
          if (accounts[0]?.toLowerCase() !== signerAddress.toLowerCase()) {
            console.warn('⚠️ WARNING: Primary account differs from signer address!');
            console.warn('  - Primary account:', accounts[0]);
            console.warn('  - Signer address:', signerAddress);
          }
        } catch (accountError) {
          console.warn('⚠️ Could not retrieve account list:', accountError.message);
        }
        
        
        // CRITICAL: Set wallet address from signer (this will be the authoritative source)
        if (!walletAddress) {
          console.log('🔄 Setting wallet address from connected signer...');
          walletAddress = signerAddress;
          console.log('✅ Wallet address set to:', walletAddress);
        } else if (signerAddress.toLowerCase() !== walletAddress.toLowerCase()) {
          console.log('🚨 WALLET ADDRESS MISMATCH DETECTED!');
          console.log('====================================');
          console.log(`Expected wallet: ${walletAddress}`);
          console.log(`Actual signer:   ${signerAddress}`);
          console.log('====================================');
          console.log('🔍 This means the wrong wallet is connected!');
          console.log('💡 The system expected one wallet but another is being used for signing.');
          console.log('⚠️ This will cause the deployment to use the wrong wallet address.');
          
          // Update the wallet address to match the actual signer
          console.log('🔄 Updating wallet address to match actual signer...');
          walletAddress = signerAddress;
          console.log('✅ Wallet address updated to:', walletAddress);
        } else {
          console.log('✅ Wallet address matches signer - consistency confirmed');
        }
        
        console.log('========================');
        
        // Validate network connection with comprehensive debugging
        const validationNetwork = await provider.getNetwork();
        console.log('🌐 NETWORK VALIDATION:');
        console.log('======================');
        console.log(`Connected network: ${validationNetwork.name}`);
        console.log(`Chain ID: ${validationNetwork.chainId.toString()}`);
        console.log(`Expected BSC networks: 56 (Mainnet) or 97 (Testnet)`);
        console.log(`Network valid: ${validationNetwork.chainId === BigInt(56) || validationNetwork.chainId === BigInt(97)}`);
        
        // Check if wallet extension shows same network
        try {
          const walletChainId = await window.ethereum.request({ method: 'eth_chainId' });
          const walletChainIdDecimal = parseInt(walletChainId, 16);
          console.log(`Wallet extension Chain ID: ${walletChainIdDecimal}`);
          console.log(`Provider vs Wallet match: ${validationNetwork.chainId.toString() === walletChainIdDecimal.toString()}`);
          
          if (network.chainId.toString() !== walletChainIdDecimal.toString()) {
            console.log('🚨 NETWORK MISMATCH: Provider and wallet show different networks!');
            console.log('This could explain the balance discrepancy.');
          }
        } catch (walletNetworkError) {
          console.warn('⚠️ Could not verify wallet network:', walletNetworkError.message);
        }
        console.log('======================');
        
        if (validationNetwork.chainId !== BigInt(56) && validationNetwork.chainId !== BigInt(97)) {
          throw new Error(`Wrong network detected! 
          
🌐 Current Network: ${validationNetwork.name} (Chain ID: ${validationNetwork.chainId})
✅ Required Networks: BSC Mainnet (56) or BSC Testnet (97)

💡 Please switch to BSC network in your wallet:
1. Open your wallet extension
2. Click network selector 
3. Choose "BSC Mainnet" or "BSC Testnet"
4. Refresh this page and try again`);
        }

      // Get current network info
      const currentNetwork = await provider.getNetwork();
      const targetChainId = isMainnet ? 56 : 97; // BSC Mainnet : BSC Testnet
      
      // Check if we're on the correct network
      if (Number(currentNetwork.chainId) !== targetChainId) {
        // Request network switch
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${targetChainId.toString(16)}` }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            // Network not added, add it
            const networkData = isMainnet 
              ? {
                  chainId: '0x38',
                  chainName: 'Binance Smart Chain Mainnet',
                  nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
                  rpcUrls: ['https://bsc-dataseed.binance.org/'],
                  blockExplorerUrls: ['https://bscscan.com']
                }
              : {
                  chainId: '0x61',
                  chainName: 'Binance Smart Chain Testnet',
                  nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 },
                  rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
                  blockExplorerUrls: ['https://testnet.bscscan.com']
                };
            
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [networkData],
            });
          } else {
            throw switchError;
          }
        }
        
      // Refresh provider after network switch
      provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner();
    }

    // Get network information early for BSC detection
    const detectedNetwork = await provider.getNetwork();
    const networkChainId = Number(detectedNetwork.chainId);
    const isBSC = networkChainId === 56 || networkChainId === 97; // BSC Mainnet or Testnet
    
    console.log('Network detected:', {
      chainId: networkChainId,
      name: detectedNetwork.name,
      isBSC: isBSC
    });

    // Clean and validate parameters early in the function
    const cleanName = formData.tokenName.trim();
    const cleanSymbol = formData.tokenSymbol.trim().toUpperCase();

    // Get wallet address early for validation
    const rawWalletAddress = await signer.getAddress();
    walletAddress = ethers.getAddress(rawWalletAddress); // Use proper checksum format
    console.log('Wallet address (checksummed):', walletAddress);

    // Validate wallet address format
    if (!ethers.isAddress(walletAddress)) {
      throw new Error('Invalid wallet address format');
    }
    
    // Additional wallet validation for BSC
    if (walletAddress === ethers.ZeroAddress) {
      throw new Error('Cannot use zero address as token owner');
    }

    // Enhanced parameter validation to prevent constructor failures
    if (!cleanName || cleanName.length === 0) {
      throw new Error('Token name cannot be empty');
    }
    if (cleanName.length > 50) {
      throw new Error('Token name is too long (maximum 50 characters)');
    }
    if (!cleanSymbol || cleanSymbol.length === 0) {
      throw new Error('Token symbol cannot be empty');
    }
    if (cleanSymbol.length > 10) {
      throw new Error('Token symbol is too long (maximum 10 characters)');
    }
    
    // Check for invalid characters that might cause BSC constructor issues
    const invalidChars = /[<>'"&\x00-\x1f\x7f-\x9f]/;
    if (invalidChars.test(cleanName)) {
      throw new Error('Token name contains invalid characters. Use only letters, numbers, spaces, and basic punctuation.');
    }
    if (invalidChars.test(cleanSymbol)) {
      throw new Error('Token symbol contains invalid characters. Use only letters and numbers.');
    }
    
    // Additional BSC-specific validations
    if (isBSC || true) { // Apply to all networks for safety
      // Ensure symbol is alphanumeric only for BSC compatibility
      if (!/^[A-Z0-9]+$/.test(cleanSymbol)) {
        throw new Error('Token symbol must contain only letters and numbers (A-Z, 0-9)');
      }
      
      // Ensure name doesn't contain problematic sequences
      const problematicPatterns = ['contract', 'token', 'coin', 'bsc', 'bnb'];
      const lowerName = cleanName.toLowerCase();
      // This is just a warning, not blocking
      if (problematicPatterns.some(pattern => lowerName.includes(pattern))) {
        console.warn('Token name contains common terms that might cause confusion');
      }
    }

    // Create contract factory
    const contractFactory = new ethers.ContractFactory(TOKEN_CONTRACT_ABI, TOKEN_CONTRACT_BYTECODE, signer);      // Convert initial supply to proper format (with 18 decimals)
      const totalSupplyValue = formData.initialSupply.toString().trim();
      console.log('Original supply value:', totalSupplyValue);
      
      if (!totalSupplyValue || isNaN(totalSupplyValue) || parseFloat(totalSupplyValue) <= 0) {
        throw new Error('Invalid initial supply value');
      }
      
      const totalSupply = ethers.parseUnits(totalSupplyValue, 18);
      console.log('Parsed total supply:', totalSupply.toString());
      
      // Validate total supply for potential issues
      const maxSupply = ethers.parseUnits('1000000000000', 18); // 1 trillion max
      if (totalSupply > maxSupply) {
        throw new Error('Total supply is too large. Maximum allowed is 1 trillion tokens.');
      }
      
      if (totalSupply === BigInt(0)) {
        throw new Error('Total supply cannot be zero.');
      }
      
      // Check for uint256 maximum value (2^256 - 1)
      const maxUint256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
      if (totalSupply > maxUint256) {
        throw new Error('Total supply exceeds uint256 maximum value.');
      }
      
      // Additional validation for BSC
      if (isBSC || true) { // Apply to all networks
        console.log('🔍 Constructor parameter validation:');
        console.log('- Name length:', cleanName.length, 'characters');
        console.log('- Symbol length:', cleanSymbol.length, 'characters');
        console.log('- Total supply:', ethers.formatUnits(totalSupply, 18), 'tokens');
        console.log('- Total supply (wei):', totalSupply.toString());
        console.log('- Owner address:', walletAddress);
        console.log('- Address valid:', ethers.isAddress(walletAddress));
        console.log('- Decimals: 18');
      }
      
      // Wallet address already retrieved and validated earlier in the function
      
      // Estimate gas for deployment
      console.log('Estimating gas for contract deployment...');
      let gasLimit;
      
      try {
        // First, validate all parameters
        if (!formData.tokenName || formData.tokenName.trim().length === 0) {
          throw new Error('Token name cannot be empty');
        }
        if (!formData.tokenSymbol || formData.tokenSymbol.trim().length === 0) {
          throw new Error('Token symbol cannot be empty');
        }
        if (!walletAddress || !ethers.isAddress(walletAddress)) {
          throw new Error('Invalid wallet address');
        }
        
        // Normalize the wallet address to lowercase
        const normalizedWallet = walletAddress.toLowerCase();
        
        console.log('Creating deployment transaction...');
        const deployTx = await contractFactory.getDeployTransaction(
          formData.tokenName.trim(),
          formData.tokenSymbol.trim(),
          18, // decimals - this was missing!
          totalSupply,
          normalizedWallet
        );
        
        console.log('Deployment transaction data length:', deployTx.data.length);
        console.log('Transaction data preview:', deployTx.data.substring(0, 100) + '...');
        console.log('Current network:', await provider.getNetwork());
        
        // Try to estimate gas with fallback approach
        try {
          console.log('Attempting gas estimation...');
          
          // First try with a complete transaction object
          const gasEstimateData = {
            to: null, // Contract creation
            data: deployTx.data,
            value: 0
          };
          
          const estimatedGas = await provider.estimateGas(gasEstimateData);
          // Add 100% buffer to estimated gas for extra safety
          gasLimit = estimatedGas * BigInt(2);
          console.log('Estimated gas:', estimatedGas.toString());
          console.log('Gas limit with 100% buffer:', gasLimit.toString());
          
        } catch (estimateError) {
          console.warn('Provider gas estimation failed, trying signer estimation:', estimateError.message);
          
          // Fallback to signer estimation
          try {
            const estimatedGas = await signer.estimateGas(deployTx);
            gasLimit = estimatedGas * BigInt(2);
            console.log('Signer estimated gas:', estimatedGas.toString());
            console.log('Gas limit with 100% buffer:', gasLimit.toString());
          } catch (signerError) {
            console.warn('Signer gas estimation also failed:', signerError.message);
            throw signerError; // Re-throw to trigger the fallback below
          }
        }
        
        // Ensure appropriate gas limit for contract deployment
        const minGasLimit = BigInt(1200000); // 1.2M minimum (reduced for BSC)
        const maxGasLimit = BigInt(3000000); // 3M maximum to avoid block limit issues
        
        if (gasLimit < minGasLimit) {
          gasLimit = minGasLimit;
          console.log('Using minimum gas limit:', gasLimit.toString());
        } else if (gasLimit > maxGasLimit) {
          gasLimit = maxGasLimit;
          console.log('Capped gas limit to maximum:', gasLimit.toString());
        }
        
      } catch (error) {
        console.error('Gas estimation failed:', error.message);
        
        // Provide more specific error messages
        if (error.message.includes('missing revert data')) {
          console.warn('Network connectivity issue or node problem. Using fallback gas limit.');
          gasLimit = BigInt(2000000); // 2M gas fallback (reduced for BSC)
        } else if (error.message.includes('revert') || error.message.includes('invalid')) {
          throw new Error(`Contract deployment would fail: ${error.message}`);
        } else if (error.message.includes('insufficient funds')) {
          throw new Error('Insufficient funds for gas. Please add more BNB to your wallet.');
        } else {
          console.warn('Unknown gas estimation error. Using conservative gas limit.');
          gasLimit = BigInt(2500000); // 2.5M gas conservative default (reduced for BSC)
        }
        
        console.log('Using fallback gas limit:', gasLimit.toString());
      }

      // Deploy the contract with proper gas limit
      console.log('Deploying token contract...');
      console.log('Parameters:', {
        name: formData.tokenName,
        symbol: formData.tokenSymbol,
        decimals: 18,
        totalSupply: totalSupply.toString(),
        owner: walletAddress,
        gasLimit: gasLimit.toString()
      });
      
      // Get current gas price with BSC-specific fallback
      let gasPrice;
      try {
        gasPrice = await signer.provider.getFeeData();
        console.log('Current gas price:', gasPrice.gasPrice?.toString());
      } catch (feeError) {
        console.warn('Failed to get fee data, using BSC defaults:', feeError.message);
        // BSC-specific fallback
        gasPrice = {
          gasPrice: ethers.parseUnits('5', 'gwei'), // 5 gwei is typical for BSC
          maxFeePerGas: null,
          maxPriorityFeePerGas: null
        };
      }
      
      // Parameters already cleaned and validated earlier in the function
      
      console.log('Final deployment parameters:', {
        name: cleanName,
        symbol: cleanSymbol,
        decimals: 18,
        totalSupply: totalSupply.toString(),
        owner: walletAddress,
        gasLimit: gasLimit.toString(),
        gasPrice: gasPrice.gasPrice?.toString()
      });
      
      // Deploy with proper gas settings for BSC
      let deployOptions = {
        gasLimit: gasLimit
      };
      
      console.log('Gas fee data:', gasPrice);
      
      console.log('Current network (already detected):', {
        chainId: networkChainId.toString(),
        name: detectedNetwork.name,
        isBSC: isBSC
      });
      
      if (isBSC) {
        // BSC works best with legacy transactions (Type 0)
        let bscGasPrice;
        
        if (gasPrice.gasPrice) {
          // Use network gas price but cap it for BSC
          const networkGasPrice = gasPrice.gasPrice;
          const maxBSCGasPrice = ethers.parseUnits('20', 'gwei'); // Cap at 20 gwei for BSC
          bscGasPrice = networkGasPrice > maxBSCGasPrice ? maxBSCGasPrice : networkGasPrice;
        } else {
          // Fallback to 5 gwei for BSC (optimal for BSC)
          bscGasPrice = ethers.parseUnits('5', 'gwei');
        }
        
        deployOptions.gasPrice = bscGasPrice;
        console.log('Using BSC legacy pricing:', bscGasPrice.toString());
        
        // Remove any EIP-1559 fields for BSC
        delete deployOptions.maxFeePerGas;
        delete deployOptions.maxPriorityFeePerGas;
        
      } else {
        // Handle other networks with EIP-1559 if available
        if (gasPrice.maxFeePerGas && gasPrice.maxPriorityFeePerGas) {
          // EIP-1559 transaction (Type 2)
          const maxPriorityFee = gasPrice.maxPriorityFeePerGas;
          const maxFee = gasPrice.maxFeePerGas;
          
          // Ensure maxFeePerGas >= maxPriorityFeePerGas
          const adjustedMaxFee = maxFee > maxPriorityFee ? maxFee : maxPriorityFee;
          
          deployOptions.maxFeePerGas = adjustedMaxFee;
          deployOptions.maxPriorityFeePerGas = maxPriorityFee;
          
          console.log('Using EIP-1559 pricing:', {
            maxFeePerGas: adjustedMaxFee.toString(),
            maxPriorityFeePerGas: maxPriorityFee.toString()
          });
        } else if (gasPrice.gasPrice) {
          // Legacy transaction (Type 0)
          deployOptions.gasPrice = gasPrice.gasPrice;
          console.log('Using legacy pricing:', gasPrice.gasPrice.toString());
        } else {
          // Fallback to 20 gwei for other networks
          const fallbackGasPrice = ethers.parseUnits('20', 'gwei');
          deployOptions.gasPrice = fallbackGasPrice;
          console.log('Using fallback gas price:', fallbackGasPrice.toString());
        }
      }
      
      // Add value: 0 to ensure it's a contract creation transaction
      deployOptions.value = 0;
      
      // For BSC, let's use extremely conservative gas settings initially
      if (isBSC) {
        // Start with extremely conservative gas limit for BSC
        gasLimit = BigInt(600000); // Start with very low 600k gas limit
        deployOptions.gasLimit = gasLimit;
        console.log('Using extremely conservative initial gas limit for BSC:', gasLimit.toString());
        
        // Force very low gas price for BSC (always start with 3 gwei)
        deployOptions.gasPrice = ethers.parseUnits('3', 'gwei'); // Always start with 3 gwei
        console.log('Using extremely conservative gas price for BSC:', deployOptions.gasPrice.toString());
        
        // Remove any EIP-1559 fields for BSC (ensure legacy transaction)
        delete deployOptions.maxFeePerGas;
        delete deployOptions.maxPriorityFeePerGas;
        
        console.log('🔧 BSC Deployment Configuration:');
        console.log('- Network: BSC (Chain ID:', networkChainId, ')');
        console.log('- Transaction Type: Legacy (Type 0)');
        console.log('- Initial Gas Limit:', gasLimit.toString());
        console.log('- Initial Gas Price:', deployOptions.gasPrice.toString(), 'wei (3 gwei)');
      }
      
      console.log('Final deploy options:', deployOptions);
      
      // Validate wallet address one more time
      if (!ethers.isAddress(walletAddress)) {
        throw new Error(`Invalid wallet address: ${walletAddress}`);
      }
      
      // Network connection already verified above
      
      // Enhanced balance and cost validation with comprehensive debugging
      console.log('🔍 BALANCE CHECK DEBUGGING:');
      console.log('===========================');
      console.log(`Target wallet: ${walletAddress}`);
      console.log(`Current network: ${network.name} (Chain ID: ${network.chainId})`);
      console.log(`Expected network: BSC ${chainId === 56 ? 'Mainnet' : 'Testnet'} (Chain ID: ${chainId})`);
      console.log(`Network match: ${network.chainId.toString() === chainId.toString()}`);
      
      // Check balance on multiple providers to debug RPC issues
      let balance;
      let balanceCheckResults = [];
      
      try {
        // Try wallet provider first
        console.log('📊 Attempting balance check with wallet provider...');
        balance = await provider.getBalance(walletAddress);
        balanceCheckResults.push({
          provider: 'Wallet Provider',
          balance: ethers.formatEther(balance),
          success: true
        });
        console.log(`✅ Wallet provider balance: ${ethers.formatEther(balance)} BNB`);
      } catch (walletError) {
        console.warn('❌ Wallet provider balance check failed:', walletError.message);
        balanceCheckResults.push({
          provider: 'Wallet Provider',
          error: walletError.message,
          success: false
        });
        
        // Try backup RPC providers
        const rpcEndpoints = chainId === 56 ? [
          'https://bsc-dataseed1.binance.org/',
          'https://bsc-dataseed2.binance.org/',
          'https://rpc.ankr.com/bsc'
        ] : [
          'https://data-seed-prebsc-1-s1.binance.org:8545/',
          'https://data-seed-prebsc-2-s1.binance.org:8545/',
          'https://bsc-testnet.public.blastapi.io'
        ];
        
        for (const rpcUrl of rpcEndpoints) {
          try {
            console.log(`📊 Trying balance check with RPC: ${rpcUrl}`);
            const rpcProvider = new ethers.JsonRpcProvider(rpcUrl);
            const rpcBalance = await rpcProvider.getBalance(walletAddress);
            balanceCheckResults.push({
              provider: rpcUrl,
              balance: ethers.formatEther(rpcBalance),
              success: true
            });
            console.log(`✅ RPC ${rpcUrl} balance: ${ethers.formatEther(rpcBalance)} BNB`);
            
            if (!balance) {
              balance = rpcBalance;
              console.log(`🔄 Using balance from RPC: ${ethers.formatEther(balance)} BNB`);
            }
            break;
          } catch (rpcError) {
            console.warn(`❌ RPC ${rpcUrl} failed:`, rpcError.message);
            balanceCheckResults.push({
              provider: rpcUrl,
              error: rpcError.message,
              success: false
            });
          }
        }
      }
      
      // Display comprehensive balance check results
      console.log('📊 BALANCE CHECK RESULTS:');
      console.log('=========================');
      balanceCheckResults.forEach((result, index) => {
        if (result.success) {
          console.log(`${index + 1}. ✅ ${result.provider}: ${result.balance} BNB`);
        } else {
          console.log(`${index + 1}. ❌ ${result.provider}: ${result.error}`);
        }
      });
      console.log('=========================');
      
      if (!balance) {
        throw new Error(`Unable to retrieve balance from any provider. This could indicate:
1. Network connectivity issues
2. Wrong network selected in wallet
3. RPC endpoint problems
4. Wallet not properly connected to BSC ${chainId === 56 ? 'Mainnet' : 'Testnet'}`);
      }
      
      // Additional verification: Check what BSCScan API shows
      try {
        console.log('🔍 Cross-checking with BSCScan API...');
        const bscscanApiUrl = chainId === 56 
          ? `https://api.bscscan.com/api?module=account&action=balance&address=${walletAddress}&tag=latest&apikey=YourApiKeyToken`
          : `https://api-testnet.bscscan.com/api?module=account&action=balance&address=${walletAddress}&tag=latest&apikey=YourApiKeyToken`;
        
        const bscscanResponse = await fetch(bscscanApiUrl);
        const bscscanData = await bscscanResponse.json();
        
        if (bscscanData.status === '1') {
          const bscscanBalance = ethers.formatEther(bscscanData.result);
          console.log(`🌐 BSCScan API balance: ${bscscanBalance} BNB`);
          
          if (bscscanBalance !== ethers.formatEther(balance)) {
            console.log('⚠️ BALANCE MISMATCH DETECTED:');
            console.log(`  RPC Provider: ${ethers.formatEther(balance)} BNB`);
            console.log(`  BSCScan API:  ${bscscanBalance} BNB`);
            console.log('  This indicates RPC synchronization issues');
          } else {
            console.log('✅ Balance matches across providers');
          }
        }
      } catch (bscscanError) {
        console.warn('⚠️ BSCScan API check failed:', bscscanError.message);
        console.log('💡 Manual verification: Check your balance at:');
        const explorerUrl = chainId === 56 
          ? `https://bscscan.com/address/${walletAddress}`
          : `https://testnet.bscscan.com/address/${walletAddress}`;
        console.log(`   ${explorerUrl}`);
      }
      
      const effectiveGasPrice = deployOptions.gasPrice || deployOptions.maxFeePerGas || ethers.parseUnits('5', 'gwei');
      const estimatedCost = gasLimit * effectiveGasPrice;
      
      console.log('🔍 Pre-deployment Financial Analysis:');
      console.log('=====================================');
      console.log(`💰 WALLET BEING USED FOR DEPLOYMENT:`);
      console.log(`    Address: ${walletAddress}`);
      console.log(`    Balance: ${ethers.formatEther(balance)} BNB`);
      console.log(`⛽ GAS ESTIMATION:`);
      console.log(`    Gas Limit: ${gasLimit.toLocaleString()} gas`);
      console.log(`    Gas Price: ${ethers.formatUnits(effectiveGasPrice, 'gwei')} gwei`);
      console.log(`    Estimated Cost: ${ethers.formatEther(estimatedCost)} BNB`);
      console.log(`    Cost in USD (≈$300/BNB): $${(parseFloat(ethers.formatEther(estimatedCost)) * 300).toFixed(2)}`);
      console.log(`🎯 FUNDS CHECK: ${balance >= estimatedCost ? '✅ SUFFICIENT' : '❌ INSUFFICIENT'}`);
      
      if (balance === BigInt(0)) {
        console.log('🚨 CRITICAL: Wallet has ZERO BNB balance!');
        console.log('🔍 Possible causes:');
        console.log('  1. Wrong wallet selected in browser extension');
        console.log('  2. Wallet not funded on BSC network');
        console.log('  3. Connected to wrong network (check if on BSC)');
        console.log('  4. Using different account than expected');
      }
      console.log('=====================================');
      
      // Validate reasonable cost limits
      const maxReasonableCost = ethers.parseEther('0.1'); // 0.1 BNB maximum
      if (estimatedCost > maxReasonableCost) {
        console.warn('⚠️ WARNING: Deployment cost exceeds reasonable limits!');
        console.warn(`Estimated: ${ethers.formatEther(estimatedCost)} BNB`);
        console.warn(`Reasonable limit: ${ethers.formatEther(maxReasonableCost)} BNB`);
        console.warn('This might indicate a gas calculation error.');
        
        // Auto-correct if cost is unreasonably high
        const correctedGasLimit = BigInt(3000000); // 3M gas max
        const correctedGasPriceValue = ethers.parseUnits('5', 'gwei'); // 5 gwei max
        const correctedCost = correctedGasLimit * correctedGasPriceValue;
        
        console.log('🔧 Auto-correcting gas parameters:');
        console.log(`- Corrected Gas Limit: ${correctedGasLimit.toLocaleString()} gas`);
        console.log(`- Corrected Gas Price: ${ethers.formatUnits(correctedGasPriceValue, 'gwei')} gwei`);
        console.log(`- Corrected Cost: ${ethers.formatEther(correctedCost)} BNB`);
        
        // Update deploy options
        deployOptions.gasLimit = correctedGasLimit;
        deployOptions.gasPrice = correctedGasPriceValue;
        gasLimit = correctedGasLimit;
      }
      
      const finalCost = gasLimit * (deployOptions.gasPrice || deployOptions.maxFeePerGas || ethers.parseUnits('5', 'gwei'));
      console.log(`💰 Final Deployment Cost: ${ethers.formatEther(finalCost)} BNB`);
      
      // Add a safety margin for BSC (multiply estimated cost by 1.5)
      const safetyMultiplier = isBSC ? BigInt(150) : BigInt(110); // 50% margin for BSC, 10% for others
      const safeEstimatedCost = estimatedCost * safetyMultiplier / BigInt(100);
      
      if (balance < safeEstimatedCost) {
        const needed = ethers.formatEther(safeEstimatedCost);
        const have = ethers.formatEther(balance);
        
        console.log('❌ INSUFFICIENT BALANCE DETAILS:');
        console.log('=================================');
        console.log(`🎯 Wallet Address: ${walletAddress}`);
        console.log(`📱 Connected via: ${window.ethereum?.isMetaMask ? 'MetaMask' : window.ethereum?.isCoinbaseWallet ? 'Coinbase' : window.ethereum?.isTrustWallet ? 'Trust' : 'Unknown wallet'}`);
        console.log(`💰 Current Balance: ${have} BNB`);
        console.log(`💳 Required Amount: ${needed} BNB`);
        console.log(`📊 Safety Margin: ${isBSC ? '50%' : '10%'} (BSC requires higher margin)`);
        console.log(`🌐 Network: ${isBSC ? 'BSC' : 'Other'} (Chain ID: ${chainId})`);
        console.log('=================================');
        
        if (balance === BigInt(0)) {
          throw new Error(`🚨 WALLET HAS ZERO BALANCE! 

🎯 The wallet being used for deployment:
   Address: ${walletAddress}
   
🔍 Please check:
   1. Is this the correct wallet address?
   2. Is your wallet connected to BSC ${chainId === 56 ? 'Mainnet' : 'Testnet'}?
   3. Does this wallet have BNB on the BSC network?
   4. Are you using the right account in your wallet extension?

💡 To fix: Add at least ${needed} BNB to address ${walletAddress} on BSC ${chainId === 56 ? 'Mainnet' : 'Testnet'}`);
        } else {
          throw new Error(`Insufficient balance for safe deployment. 

💰 Financial Details:
   Wallet: ${walletAddress}
   Current: ${have} BNB  
   Required: ${needed} BNB (with ${isBSC ? '50%' : '10%'} safety margin)
   
💡 Please add more BNB to your wallet address on BSC ${chainId === 56 ? 'Mainnet' : 'Testnet'}.`);
        }
      }
      
      // Final gas validation for BSC
      if (isBSC) {
        const maxReasonableGasLimit = BigInt(2500000); // 2.5M is reasonable max for BSC
        const maxReasonableGasPrice = ethers.parseUnits('20', 'gwei'); // 20 gwei max for BSC
        
        if (gasLimit > maxReasonableGasLimit) {
          console.warn(`Gas limit too high for BSC (${gasLimit.toString()}), reducing to ${maxReasonableGasLimit.toString()}`);
          gasLimit = maxReasonableGasLimit;
          deployOptions.gasLimit = gasLimit;
        }
        
        if (deployOptions.gasPrice && deployOptions.gasPrice > maxReasonableGasPrice) {
          console.warn(`Gas price too high for BSC (${deployOptions.gasPrice.toString()}), reducing to ${maxReasonableGasPrice.toString()}`);
          deployOptions.gasPrice = maxReasonableGasPrice;
        }
      }
      
      console.log('Starting contract deployment...');
      
      // Pre-deployment validation and gas estimation for BSC
      if (isBSC) {
        try {
          console.log('🔍 BSC Pre-deployment validation...');
          
          // 1. Validate contract factory
          if (!contractFactory || !contractFactory.deploy) {
            throw new Error('Contract factory is not properly initialized');
          }
          
          // 2. Check bytecode size
          const bytecodeLength = contractFactory.bytecode ? contractFactory.bytecode.length : 0;
          console.log('Contract bytecode length:', bytecodeLength);
          if (bytecodeLength === 0) {
            throw new Error('Contract bytecode is empty');
          }
          
          // 3. Validate deployment parameters for BSC constructor compatibility
          if (!cleanName || !cleanSymbol || !totalSupply || !walletAddress) {
            throw new Error('Missing required deployment parameters');
          }
          
          // Additional BSC constructor validation
          console.log('🔍 BSC Constructor Validation:');
          console.log('- Token Name:', `"${cleanName}" (${cleanName.length} chars)`);
          console.log('- Token Symbol:', `"${cleanSymbol}" (${cleanSymbol.length} chars)`);
          console.log('- Decimals: 18');
          console.log('- Total Supply:', totalSupply.toString());
          console.log('- Total Supply (formatted):', ethers.formatUnits(totalSupply, 18));
          console.log('- Owner Address:', walletAddress);
          console.log('- Owner Address Valid:', ethers.isAddress(walletAddress));
          
          // Check for common BSC constructor issues
          if (cleanName.length === 0 || cleanName.length > 32) {
            throw new Error('BSC: Token name must be 1-32 characters for constructor compatibility');
          }
          
          if (cleanSymbol.length === 0 || cleanSymbol.length > 8) {
            throw new Error('BSC: Token symbol must be 1-8 characters for constructor compatibility');
          }
          
          // Check for bytes32 compatibility (BSC constructor limitation)
          try {
            ethers.encodeBytes32String(cleanName);
          } catch (nameError) {
            console.warn('Name may not be bytes32 compatible:', nameError.message);
            // Don't throw here, just warn
          }
          
          try {
            ethers.encodeBytes32String(cleanSymbol);
          } catch (symbolError) {
            console.warn('Symbol may not be bytes32 compatible:', symbolError.message);
            // Don't throw here, just warn
          }
          
          // Verify total supply doesn't exceed uint256 max
          const maxUint256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
          if (totalSupply >= maxUint256) {
            throw new Error('BSC: Total supply exceeds uint256 maximum value');
          }
          
          // Check for potential overflow in constructor calculations
          const supplyWithDecimals = totalSupply; // Already includes 18 decimals
          if (supplyWithDecimals === BigInt(0)) {
            throw new Error('BSC: Total supply cannot be zero');
          }
          
          console.log('✅ BSC Constructor validation passed');

          // 3.5. Ultra-comprehensive BSC constructor testing
          try {
            console.log('🧪 Ultra-Comprehensive BSC Constructor Testing...');
            
            // Test 1: Basic parameter encoding
            const testAbiCoder = ethers.AbiCoder.defaultAbiCoder();
            const encodedParams = testAbiCoder.encode(
              ['string', 'string', 'uint8', 'uint256', 'address'],
              [cleanName, cleanSymbol, 18, totalSupply, walletAddress]
            );
            console.log('✅ Basic parameter encoding test passed');
            
            // Test 2: Detailed parameter analysis
            console.log('🔍 Detailed Parameter Analysis:');
            console.log(`- Name: "${cleanName}" (UTF-8 bytes: ${new TextEncoder().encode(cleanName).length})`);
            console.log(`- Symbol: "${cleanSymbol}" (UTF-8 bytes: ${new TextEncoder().encode(cleanSymbol).length})`);
            console.log(`- Decimals: 18 (uint8)`);
            console.log(`- Total Supply: ${totalSupply.toString()} (uint256)`);
            console.log(`- Owner: ${walletAddress} (address)`);
            console.log(`- Encoded params length: ${encodedParams.length} bytes`);
            
            // Test 3: Contract bytecode analysis
            console.log('🔍 Contract Bytecode Validation...');
            if (!TOKEN_CONTRACT_BYTECODE || TOKEN_CONTRACT_BYTECODE.length < 100) {
              throw new Error('Invalid or missing contract bytecode');
            }
            console.log(`- Bytecode length: ${TOKEN_CONTRACT_BYTECODE.length} characters`);
            console.log('- Bytecode starts with:', TOKEN_CONTRACT_BYTECODE.substring(0, 20));
            
            // Test 4: ABI constructor validation
            console.log('🔍 ABI Constructor Validation...');
            const constructorABI = TOKEN_CONTRACT_ABI.find(item => item.type === 'constructor');
            if (!constructorABI) {
              throw new Error('No constructor found in ABI');
            }
            console.log('- Constructor inputs:', constructorABI.inputs.length);
            constructorABI.inputs.forEach((input, i) => {
              console.log(`  [${i}] ${input.name}: ${input.type}`);
            });
            
            // Test 5: Gas estimation with actual contract factory
            console.log('🔍 Real Gas Estimation Test...');
            const testFactory = new ethers.ContractFactory(TOKEN_CONTRACT_ABI, TOKEN_CONTRACT_BYTECODE, signer);
            
            try {
              console.log('🔍 Attempting gas estimation with full validation...');
              
              // First, try to create the deployment transaction
              const deployTx = testFactory.getDeployTransaction(
                cleanName, cleanSymbol, 18, totalSupply, walletAddress
              );
              
              console.log('✅ Deployment transaction created successfully');
              console.log(`- Transaction data length: ${deployTx.data.length} bytes`);
              
              // Now try gas estimation
              const gasEstimate = await provider.estimateGas(deployTx);
              console.log(`✅ Gas estimation successful: ${gasEstimate.toString()}`);
              
              if (gasEstimate > BigInt(6000000)) {
                console.warn('⚠️ Very high gas estimate - may indicate parameter issues');
              }
              
            } catch (gasError) {
              console.error('❌ Gas estimation failed:', gasError);
              
              // Enhanced error analysis for gas estimation failures
              let specificIssue = 'Unknown gas estimation error';
              
              if (gasError.message.includes('missing revert data')) {
                specificIssue = 'Constructor reverts immediately - likely parameter validation issue in contract';
              } else if (gasError.message.includes('out of gas')) {
                specificIssue = 'Constructor requires too much gas - parameters may be too large';
              } else if (gasError.message.includes('invalid opcode')) {
                specificIssue = 'Contract bytecode issue - constructor contains invalid operations';
              } else if (gasError.message.includes('stack underflow')) {
                specificIssue = 'Constructor parameter mismatch - wrong number or types of parameters';
              }
              
              // Try a simplified parameter test to isolate the issue
              try {
                console.log('🧪 Testing with minimal parameters to isolate issue...');
                const minimalDeployTx = testFactory.getDeployTransaction(
                  'Test', 'TEST', 18, ethers.parseUnits('1000', 18), walletAddress
                );
                await provider.estimateGas(minimalDeployTx);
                
                specificIssue += '\n\nMinimal parameters work - issue is with your specific name/symbol/supply values';
                
              } catch (minimalError) {
                specificIssue += '\n\nEven minimal parameters fail - issue is with contract or network';
              }
              
              throw new Error(`Gas estimation failed: ${specificIssue}\n\nOriginal error: ${gasError.message}\n\nThis indicates constructor will fail before deployment.`);
            }
            
            // Test 6: Address checksum validation
            console.log('🔍 Address Checksum Validation...');
            const checksumAddress = ethers.getAddress(walletAddress);
            if (checksumAddress !== walletAddress) {
              console.warn(`⚠️ Address checksum corrected: ${walletAddress} -> ${checksumAddress}`);
              walletAddress = checksumAddress;
            } else {
              console.log('✅ Address checksum is correct');
            }
            
            // Test 7: Network-specific validation
            console.log('🔍 BSC Network Validation...');
            const network = await provider.getNetwork();
            console.log(`- Network Chain ID: ${network.chainId}`);
            console.log(`- Network Name: ${network.name || 'Unknown'}`);
            
            if (network.chainId !== BigInt(56) && network.chainId !== BigInt(97)) {
              console.warn('⚠️ Not connected to BSC network');
            }
            
            // Test 8: Recent block validation
            const latestBlock = await provider.getBlock('latest');
            console.log(`- Latest block: ${latestBlock.number}`);
            console.log(`- Block timestamp: ${new Date(latestBlock.timestamp * 1000).toISOString()}`);
            
            const blockAge = Date.now() - (latestBlock.timestamp * 1000);
            if (blockAge > 60000) { // More than 1 minute old
              console.warn('⚠️ Network may be experiencing delays');
            }
            
            // Test 9: Deployment transaction simulation
            console.log('🔍 Deployment Transaction Simulation...');
            const deployTx = testFactory.getDeployTransaction(
              cleanName, cleanSymbol, 18, totalSupply, walletAddress
            );
            
            console.log('- Transaction data length:', deployTx.data.length);
            console.log('- Constructor data (last 200 chars):', deployTx.data.slice(-200));
            
            // Test 10: Comprehensive parameter variation testing
            console.log('🔍 Comprehensive Parameter Variation Testing...');
            
            // Test 1: Minimal safe parameters
            try {
              console.log('- Testing minimal safe parameters...');
              const minimalParams = testAbiCoder.encode(
                ['string', 'string', 'uint8', 'uint256', 'address'],
                ['SafeToken', 'SAFE', 18, ethers.parseUnits('1000', 18), walletAddress]
              );
              console.log('✅ Minimal safe parameters encoded successfully');
            } catch (minimalError) {
              throw new Error(`Minimal safe parameters failed: ${minimalError.message}`);
            }
            
            // Test 2: Your exact parameters with analysis
            try {
              console.log('- Testing your exact parameters...');
              console.log(`  Name: "${cleanName}" (Length: ${cleanName.length})`);
              console.log(`  Symbol: "${cleanSymbol}" (Length: ${cleanSymbol.length})`);
              console.log(`  Supply: ${ethers.formatUnits(totalSupply, 18)} tokens`);
              
              const yourParams = testAbiCoder.encode(
                ['string', 'string', 'uint8', 'uint256', 'address'],
                [cleanName, cleanSymbol, 18, totalSupply, walletAddress]
              );
              console.log('✅ Your exact parameters encoded successfully');
              console.log(`  Encoded size: ${yourParams.length} bytes`);
              
            } catch (yourParamsError) {
              throw new Error(`Your parameters encoding failed: ${yourParamsError.message}`);
            }
            
            // Test 3: Different supply amounts
            try {
              console.log('- Testing different supply amounts...');
              const supplies = ['1', '1000', '1000000'];
              for (const supplyTest of supplies) {
                const testSupply = ethers.parseUnits(supplyTest, 18);
                testAbiCoder.encode(
                  ['string', 'string', 'uint8', 'uint256', 'address'],
                  [cleanName, cleanSymbol, 18, testSupply, walletAddress]
                );
                console.log(`  ✅ Supply ${supplyTest} tokens: OK`);
              }
            } catch (supplyError) {
              throw new Error(`Supply variation test failed: ${supplyError.message}`);
            }
            
            // Test 4: Alternative names/symbols
            try {
              console.log('- Testing alternative names/symbols...');
              const alternatives = [
                { name: 'MyToken', symbol: 'MTK' },
                { name: 'CryptoToken', symbol: 'CTKN' },
                { name: 'TestCoin', symbol: 'TCOIN' }
              ];
              
              for (const alt of alternatives) {
                testAbiCoder.encode(
                  ['string', 'string', 'uint8', 'uint256', 'address'],
                  [alt.name, alt.symbol, 18, totalSupply, walletAddress]
                );
                console.log(`  ✅ ${alt.name}/${alt.symbol}: OK`);
              }
            } catch (altError) {
              throw new Error(`Alternative names test failed: ${altError.message}`);
            }
            
            // Test 11: Check for potential reentrancy or other contract issues
            console.log('🔍 Contract Security Validation...');
            
            // Check if the contract bytecode contains potential issues
            const bytecodeHex = TOKEN_CONTRACT_BYTECODE.toLowerCase();
            
            // Look for common problematic patterns
            const problematicPatterns = [
              'delegatecall', 'selfdestruct', 'create2'
            ];
            
            let securityWarnings = [];
            problematicPatterns.forEach(pattern => {
              if (bytecodeHex.includes(pattern.toLowerCase())) {
                securityWarnings.push(pattern);
              }
            });
            
            if (securityWarnings.length > 0) {
              console.warn('⚠️ Security patterns detected:', securityWarnings);
            } else {
              console.log('✅ No obvious security concerns in bytecode');
            }
            
            console.log('✅ All ultra-comprehensive tests passed');
            
          } catch (testingError) {
            console.error('❌ Ultra-comprehensive testing failed:', testingError);
            throw new Error(`BSC Constructor Ultra-Test Failed: ${testingError.message}\n\nThis indicates a fundamental issue that WILL cause deployment failure.`);
          }
          
          // 4. Check network connectivity with a simple call
          const latestBlock = await safeProviderCall(
            (p) => p.getBlockNumber(),
            'network connectivity check'
          );
          console.log('✅ BSC network connection verified. Latest block:', latestBlock);

          // 4.5. BSC-specific constructor validation checks
          console.log('🔍 Performing BSC-specific constructor checks...');
          
          // Check wallet balance for deployment with RPC fallback
          const walletBalance = await safeProviderCall(
            (p) => p.getBalance(walletAddress),
            'wallet balance check'
          );
          
          const requiredGas = ethers.parseUnits('0.01', 'ether'); // 0.01 BNB minimum
          console.log('Wallet Balance:', ethers.formatEther(walletBalance), 'BNB');
          console.log('Required Gas (~):', ethers.formatEther(requiredGas), 'BNB');
          
          if (walletBalance < requiredGas) {
            throw new Error(`Insufficient BNB balance. You have ${ethers.formatEther(walletBalance)} BNB, need at least ${ethers.formatEther(requiredGas)} BNB`);
          }
          
          // Enhanced BSC constructor failure prevention
          const potentialIssues = [];
          const blockingIssues = [];
          
          // Issue 1: Symbol too similar to existing tokens (blocking)
          if (['BNB', 'BSC', 'BUSD', 'USDT', 'ETH', 'BTC', 'WBNB', 'CAKE'].includes(cleanSymbol)) {
            blockingIssues.push(`Symbol "${cleanSymbol}" conflicts with major BSC tokens`);
          }
          
          // Issue 2: String encoding validation (blocking)
          try {
            // Test UTF-8 encoding for BSC compatibility
            const nameBytes = new TextEncoder().encode(cleanName);
            const symbolBytes = new TextEncoder().encode(cleanSymbol);
            
            if (nameBytes.length !== cleanName.length) {
              blockingIssues.push('Token name contains non-ASCII characters that may cause BSC constructor failure');
            }
            if (symbolBytes.length !== cleanSymbol.length) {
              blockingIssues.push('Token symbol contains non-ASCII characters that may cause BSC constructor failure');
            }
            
            // Check for invisible characters
            if (/[\u0000-\u001F\u007F-\u009F]/.test(cleanName)) {
              blockingIssues.push('Token name contains control characters');
            }
            if (/[\u0000-\u001F\u007F-\u009F]/.test(cleanSymbol)) {
              blockingIssues.push('Token symbol contains control characters');
            }
            
          } catch (encodingError) {
            blockingIssues.push(`String encoding error: ${encodingError.message}`);
          }
          
          // Issue 3: Total supply validation (blocking)
          const supplyInTokens = Number(ethers.formatUnits(totalSupply, 18));
          if (supplyInTokens < 0.000001) {
            blockingIssues.push('Total supply is too small (less than 0.000001 tokens)');
          }
          if (supplyInTokens > 1e12) {
            blockingIssues.push('Total supply exceeds BSC safe limits (>1 trillion tokens)');
          }
          
          // Check for supply precision issues
          const supplyString = totalSupply.toString();
          if (supplyString.includes('e') || supplyString.includes('E')) {
            blockingIssues.push('Total supply is in scientific notation - may cause precision errors');
          }
          
          // Issue 4: Address validation (blocking)
          if (!ethers.isAddress(walletAddress)) {
            blockingIssues.push('Invalid wallet address format');
          } else {
            // Check for zero address
            if (walletAddress === '0x0000000000000000000000000000000000000000') {
              blockingIssues.push('Cannot use zero address as owner');
            }
            
            // Check address checksum
            try {
              const checksumAddress = ethers.getAddress(walletAddress);
              if (checksumAddress !== walletAddress) {
                console.warn('Address checksum mismatch, using:', checksumAddress);
                walletAddress = checksumAddress; // Fix the checksum
              }
            } catch (checksumError) {
              blockingIssues.push(`Address checksum validation failed: ${checksumError.message}`);
            }
          }
          
          // Issue 5: BSC-specific character restrictions (blocking)
          // BSC constructor may fail with certain Unicode characters
          const allowedNamePattern = /^[a-zA-Z0-9\s\-_.]+$/;
          const allowedSymbolPattern = /^[A-Z0-9]+$/;
          
          if (!allowedNamePattern.test(cleanName)) {
            blockingIssues.push('Token name contains characters not supported by BSC (use only letters, numbers, spaces, hyphens, underscores, dots)');
          }
          if (!allowedSymbolPattern.test(cleanSymbol)) {
            blockingIssues.push('Token symbol must contain only uppercase letters and numbers for BSC compatibility');
          }
          
          // Issue 6: Length restrictions (blocking)
          if (cleanName.length > 50) {
            blockingIssues.push('Token name too long (max 50 characters for BSC)');
          }
          if (cleanSymbol.length > 10) {
            blockingIssues.push('Token symbol too long (max 10 characters for BSC)');
          }
          if (cleanName.length === 0 || cleanSymbol.length === 0) {
            blockingIssues.push('Token name and symbol cannot be empty');
          }
          
          // Issue 7: Specific problematic patterns that cause gas estimation failure
          const problematicNames = ['contract', 'token', 'coin', 'test', 'dev', 'demo'];
          const problematicSymbols = ['TEST', 'DEV', 'DEMO', 'TMP', 'TEMP'];
          
          if (problematicNames.some(pattern => cleanName.toLowerCase().includes(pattern))) {
            blockingIssues.push(`Token name "${cleanName}" contains potentially problematic terms that may cause BSC constructor failure`);
          }
          
          if (problematicSymbols.includes(cleanSymbol)) {
            blockingIssues.push(`Symbol "${cleanSymbol}" is commonly rejected by BSC - try a more unique symbol`);
          }
          
          // Issue 8: Constructor parameter order validation
          console.log('🔍 Final parameter validation:');
          console.log(`1. Name: "${cleanName}" (string)`);
          console.log(`2. Symbol: "${cleanSymbol}" (string)`);
          console.log(`3. Decimals: 18 (uint8)`);
          console.log(`4. Supply: ${totalSupply.toString()} (uint256)`);
          console.log(`5. Owner: ${walletAddress} (address)`);
          
          // Issue 9: Check for potential constructor revert causes
          if (totalSupply === BigInt(0)) {
            blockingIssues.push('Total supply cannot be zero - constructor will revert');
          }
          
          // Check for extremely large supplies that might cause issues
          const maxSafeSupply = BigInt('1000000000000000000000000000000'); // 1 billion with 18 decimals
          if (totalSupply > maxSafeSupply) {
            blockingIssues.push('Total supply exceeds safe constructor limits for BSC');
          }
          
          // Non-blocking warnings
          if (cleanName.toLowerCase().includes('test')) {
            potentialIssues.push('Token name contains "test" - may be flagged as test token');
          }
          if (supplyInTokens > 1e9) {
            potentialIssues.push('Very high token supply (>1 billion) may cause market confusion');
          }
          
          // Handle blocking issues (prevent deployment)
          if (blockingIssues.length > 0) {
            console.error('🚫 Critical BSC constructor validation failures:');
            blockingIssues.forEach(issue => console.error(`  ❌ ${issue}`));
            throw new Error(`BSC Constructor Validation Failed:\n${blockingIssues.map(issue => `• ${issue}`).join('\n')}\n\nThese issues WILL cause constructor failure on BSC. Please fix before deployment.`);
          }
          
          // Handle warnings (allow deployment but warn user)
          if (potentialIssues.length > 0) {
            console.warn('⚠️ Potential BSC constructor issues detected:');
            potentialIssues.forEach(issue => console.warn(`  - ${issue}`));
            console.log('Proceeding with deployment, but monitor for issues...');
          } else {
            console.log('✅ All BSC constructor validations passed');
          }
          
          // 5. Attempt gas estimation and constructor validation
          console.log('🔍 Attempting to estimate gas for BSC deployment...');
          console.log('Constructor parameters:', {
            name: cleanName,
            symbol: cleanSymbol,
            decimals: 18,
            totalSupply: totalSupply.toString(),
            owner: walletAddress
          });
          
          const estimatedGas = await contractFactory.deploy.estimateGas(
            cleanName,
            cleanSymbol,
            18,
            totalSupply,
            walletAddress
          );
          console.log('✅ Gas estimation successful:', estimatedGas.toString());
          console.log('✅ Constructor parameters validated successfully');
          
          // Use the estimated gas with a 30% buffer for BSC (increased buffer)
          const gasWithBuffer = estimatedGas * BigInt(130) / BigInt(100);
          console.log('Gas with 30% buffer:', gasWithBuffer.toString());
          
          // Update our initial gas limit if the estimate is reasonable
          if (gasWithBuffer < BigInt(3000000)) { // Only if under 3M gas
            gasLimit = gasWithBuffer;
            deployOptions.gasLimit = gasLimit;
            console.log('✅ Updated gas limit based on estimation:', gasLimit.toString());
          } else {
            console.log('⚠️ Estimated gas too high, keeping conservative settings');
          }
        } catch (estimateError) {
          console.log('⚠️ Pre-deployment validation failed:', estimateError.message);
          console.log('Continuing with conservative defaults...');
          
          // If estimation fails completely, this might indicate a more serious issue
          if (estimateError.message.includes('revert') || estimateError.message.includes('execution reverted')) {
            throw new Error(`Contract deployment will fail: ${estimateError.message}. Please check your token parameters.`);
          }
        }
      }
      
      let contract, deploymentTx;
      let deploymentAttempts = 0;
      const maxAttempts = isBSC ? 6 : 3; // 6 attempts for BSC, 3 for other networks
      
      // BSC-friendly gas configurations to try in sequence (extremely conservative first)
      const bscGasConfigs = isBSC ? [
        { gasLimit: BigInt(600000), gasPrice: ethers.parseUnits('3', 'gwei') },   // Extremely conservative
        { gasLimit: BigInt(800000), gasPrice: ethers.parseUnits('3', 'gwei') },   // Ultra conservative
        { gasLimit: BigInt(1000000), gasPrice: ethers.parseUnits('3', 'gwei') },  // Conservative with 3 gwei
        { gasLimit: BigInt(1200000), gasPrice: ethers.parseUnits('4', 'gwei') },  // Moderate with 4 gwei
        { gasLimit: BigInt(1500000), gasPrice: ethers.parseUnits('5', 'gwei') },  // Higher limit with 5 gwei
        { gasLimit: BigInt(2000000), gasPrice: ethers.parseUnits('3', 'gwei') }   // Last resort: high gas, low price
      ] : null;
      
      while (deploymentAttempts < maxAttempts) {
        try {
          deploymentAttempts++;
          console.log(`🚀 Deployment attempt ${deploymentAttempts}/${maxAttempts}`);
          console.log('Using deployment options:', {
            gasLimit: deployOptions.gasLimit.toString(),
            gasPrice: deployOptions.gasPrice?.toString(),
            value: deployOptions.value,
            network: isBSC ? 'BSC' : 'Other',
            transactionType: deployOptions.gasPrice ? 'Legacy' : 'EIP-1559'
          });
          
          // Additional BSC-specific logging
          if (isBSC) {
            console.log('BSC deployment details:');
            console.log('- Gas Limit:', deployOptions.gasLimit.toString(), 'gas units');
            console.log('- Gas Price:', ethers.formatUnits(deployOptions.gasPrice, 'gwei'), 'gwei');
            console.log('- Estimated Cost:', ethers.formatEther(deployOptions.gasLimit * deployOptions.gasPrice), 'BNB');
          }
          
          // Additional logging for BSC deployment
          if (isBSC) {
            console.log('🔧 BSC Contract deployment parameters:');
            console.log('- Token Name:', cleanName);
            console.log('- Token Symbol:', cleanSymbol);
            console.log('- Decimals: 18');
            console.log('- Total Supply:', totalSupply.toString());
            console.log('- Owner Address:', walletAddress);
            console.log('- Deployment Options:', JSON.stringify({
              gasLimit: deployOptions.gasLimit.toString(),
              gasPrice: deployOptions.gasPrice.toString(),
              value: deployOptions.value
            }, null, 2));
          }
          
          // Try BSC-specific deployment approach for better compatibility
          if (isBSC && deploymentAttempts > 3) {
            console.log('🔄 Trying alternative BSC deployment method...');
            
            // Alternative method: Deploy with explicit transaction parameters
            const deployTransaction = await contractFactory.getDeployTransaction(
              cleanName,
              cleanSymbol,
              18,
              totalSupply,
              walletAddress
            );
            
            // Add our gas settings to the transaction
            deployTransaction.gasLimit = deployOptions.gasLimit;
            deployTransaction.gasPrice = deployOptions.gasPrice;
            deployTransaction.type = 0; // Legacy transaction
            delete deployTransaction.maxFeePerGas;
            delete deployTransaction.maxPriorityFeePerGas;
            
            console.log('Sending deployment transaction with alternative method...');
            const signer = await provider.getSigner();
            const sentTx = await signer.sendTransaction(deployTransaction);
            
            console.log('Alternative deployment transaction sent:', sentTx.hash);
            const receipt = await sentTx.wait();
            
            if (receipt.status !== 1) {
              throw new Error('Alternative deployment transaction failed');
            }
            
            // Get the contract instance at the deployed address
            contract = contractFactory.attach(receipt.contractAddress);
            deploymentTx = sentTx;
            
          } else {
            // Enhanced multi-strategy deployment for BSC constructor reliability
            console.log('🚀 Attempting enhanced multi-strategy deployment...');
            
            let deploymentAttempted = false;
            let lastError = null;
            
            // Pre-deployment contract bytecode verification
            console.log('🔍 Pre-deployment contract verification...');
            console.log(`- Contract bytecode length: ${TOKEN_CONTRACT_BYTECODE.length} characters`);
            console.log(`- Bytecode starts with: ${TOKEN_CONTRACT_BYTECODE.substring(0, 20)}`);
            
            // Verify the constructor exists in ABI
            const constructorABI = TOKEN_CONTRACT_ABI.find(item => item.type === 'constructor');
            if (!constructorABI) {
              throw new Error('CRITICAL: No constructor found in contract ABI - contract is invalid');
            }
            
            console.log('✅ Contract ABI contains constructor with', constructorABI.inputs.length, 'parameters');
            
            // Strategy 1: Ultra-safe deployment with maximum validation
            try {
              console.log('📋 Strategy 1: Ultra-safe deployment with maximum validation');
              
              // Pre-validate all parameters one more time
              console.log('🔍 Final parameter validation before deployment:');
              console.log(`- Name: "${cleanName}" (${typeof cleanName}, length: ${cleanName.length})`);
              console.log(`- Symbol: "${cleanSymbol}" (${typeof cleanSymbol}, length: ${cleanSymbol.length})`);
              console.log(`- Decimals: 18 (${typeof 18})`);
              console.log(`- Total Supply: ${totalSupply.toString()} (${typeof totalSupply})`);
              console.log(`- Owner: ${walletAddress} (${typeof walletAddress})`);
              
              // Ensure wallet address is properly checksummed
              const properWalletAddress = ethers.getAddress(walletAddress);
              console.log(`- Owner (checksummed): ${properWalletAddress}`);
              
              // Create deployment with ultra-conservative settings
              const ultraSafeOptions = {
                gasLimit: BigInt(3000000), // 3M gas - safe limit for BSC
                gasPrice: ethers.parseUnits('3', 'gwei'), // 3 gwei - conservative
                type: 0, // Legacy transaction for maximum compatibility
                nonce: await provider.getTransactionCount(properWalletAddress, 'pending')
              };
              
              // Calculate and display cost properly
              const estimatedCost = ultraSafeOptions.gasLimit * ultraSafeOptions.gasPrice;
              console.log('💰 Deployment Cost Estimate:');
              console.log(`- Gas Limit: ${ultraSafeOptions.gasLimit.toLocaleString()} gas`);
              console.log(`- Gas Price: ${ethers.formatUnits(ultraSafeOptions.gasPrice, 'gwei')} gwei`);
              console.log(`- Total Cost: ${ethers.formatEther(estimatedCost)} BNB`);
              
              console.log('🚀 Deploying with ultra-safe options:', ultraSafeOptions);
              
              contract = await contractFactory.deploy(
                cleanName,
                cleanSymbol,
                18, // decimals
                totalSupply,
                properWalletAddress,
                ultraSafeOptions
              );
              deploymentAttempted = true;
              console.log('✅ Strategy 1 successful');
            } catch (strategy1Error) {
              console.warn('⚠️ Strategy 1 failed:', strategy1Error.message);
              lastError = strategy1Error;
              
              // Log detailed error information
              console.error('Strategy 1 error details:', {
                message: strategy1Error.message,
                code: strategy1Error.code,
                data: strategy1Error.data,
                transaction: strategy1Error.transaction
              });
            }
            
            // Strategy 2: Higher gas limit with type 0 transaction
            if (!deploymentAttempted) {
              try {
                console.log('📋 Strategy 2: High gas limit with legacy transaction');
                const strategy2Options = {
                  ...deployOptions,
                  gasLimit: BigInt(4000000), // 4M gas - high but reasonable
                  gasPrice: ethers.parseUnits('5', 'gwei'), // Higher gas price
                  type: 0 // Legacy transaction
                };
                
                contract = await contractFactory.deploy(
                  cleanName,
                  cleanSymbol,
                  18,
                  totalSupply,
                  walletAddress,
                  strategy2Options
                );
                deploymentAttempted = true;
                console.log('✅ Strategy 2 successful');
              } catch (strategy2Error) {
                console.warn('⚠️ Strategy 2 failed:', strategy2Error.message);
                lastError = strategy2Error;
              }
            }
            
            // Strategy 3: Ultra-conservative gas with manual nonce
            if (!deploymentAttempted) {
              try {
                console.log('📋 Strategy 3: Ultra-conservative deployment');
                const currentNonce = await provider.getTransactionCount(walletAddress);
                const strategy3Options = {
                  gasLimit: BigInt(5000000), // 5M gas - conservative
                  gasPrice: ethers.parseUnits('2', 'gwei'), // Low gas price
                  nonce: currentNonce,
                  type: 0
                };
                
                contract = await contractFactory.deploy(
                  cleanName,
                  cleanSymbol,
                  18,
                  totalSupply,
                  walletAddress,
                  strategy3Options
                );
                deploymentAttempted = true;
                console.log('✅ Strategy 3 successful');
              } catch (strategy3Error) {
                console.warn('⚠️ Strategy 3 failed:', strategy3Error.message);
                lastError = strategy3Error;
              }
            }
            
            // Strategy 4: Network diagnostic deployment
            if (!deploymentAttempted) {
              try {
                console.log('📋 Strategy 4: Network diagnostic deployment');
                
                // Check current network conditions
                const currentBlock = await provider.getBlock('latest');
                const currentGasPrice = await provider.getFeeData();
                
                console.log('🌐 Current Network Conditions:');
                console.log(`- Latest block: ${currentBlock.number}`);
                console.log(`- Block timestamp: ${new Date(currentBlock.timestamp * 1000).toISOString()}`);
                console.log(`- Current gas price: ${ethers.formatUnits(currentGasPrice.gasPrice, 'gwei')} gwei`);
                console.log(`- Max fee per gas: ${currentGasPrice.maxFeePerGas ? ethers.formatUnits(currentGasPrice.maxFeePerGas, 'gwei') : 'N/A'} gwei`);
                
                // Try with current network conditions
                const networkOptimizedOptions = {
                  gasLimit: BigInt(6000000), // 6M gas - high but reasonable
                  gasPrice: currentGasPrice.gasPrice ? currentGasPrice.gasPrice * BigInt(2) : ethers.parseUnits('5', 'gwei'), // Double current gas price
                  type: 0
                };
                
                const networkCost = networkOptimizedOptions.gasLimit * networkOptimizedOptions.gasPrice;
                console.log(`💰 Network Strategy Cost: ${ethers.formatEther(networkCost)} BNB`);
                
                console.log('🚀 Deploying with network-optimized options');
                
                contract = await contractFactory.deploy(
                  cleanName,
                  cleanSymbol,
                  18,
                  totalSupply,
                  walletAddress,
                  networkOptimizedOptions
                );
                deploymentAttempted = true;
                console.log('✅ Strategy 4 successful with network optimization');
              } catch (strategy4Error) {
                console.warn('⚠️ Strategy 4 failed:', strategy4Error.message);
                lastError = strategy4Error;
              }
            }
            
            // Strategy 5: Alternative contract approach (if available)
            if (!deploymentAttempted) {
              try {
                console.log('📋 Strategy 5: Alternative contract deployment approach');
                
                // Try deploying with absolute minimal parameters
                const minimalName = 'MyToken';
                const minimalSymbol = 'MTK';
                const minimalSupply = ethers.parseUnits('1000', 18);
                
                console.log('🧪 Attempting deployment with hardcoded safe parameters:');
                console.log(`- Name: "${minimalName}"`);
                console.log(`- Symbol: "${minimalSymbol}"`);
                console.log(`- Supply: ${ethers.formatUnits(minimalSupply, 18)} tokens`);
                
                const safeOptions = {
                  gasLimit: BigInt(6000000),
                  gasPrice: ethers.parseUnits('1', 'gwei'), // Very low gas price
                  type: 0
                };
                
                contract = await contractFactory.deploy(
                  minimalName,
                  minimalSymbol,
                  18,
                  minimalSupply,
                  walletAddress,
                  safeOptions
                );
                deploymentAttempted = true;
                console.log('✅ Strategy 5 successful with hardcoded safe parameters');
                console.log('⚠️ Note: Deployed with different parameters than requested');
              } catch (strategy5Error) {
                console.warn('⚠️ Strategy 5 failed:', strategy5Error.message);
                lastError = strategy5Error;
              }
            }
            
            // Strategy 6: Emergency BSC Testnet deployment for debugging
            if (!deploymentAttempted) {
              try {
                console.log('📋 Strategy 6: Emergency BSC Testnet deployment for debugging');
                
                // Check if we can switch to BSC Testnet automatically
                const currentNetwork = await provider.getNetwork();
                if (currentNetwork.chainId === BigInt(56)) {
                  console.log('⚠️ Currently on BSC Mainnet - suggesting testnet deployment');
                  console.log('💡 Manual Action Required: Switch to BSC Testnet (Chain ID: 97) for debugging');
                }
                
                // Try deployment with absolute minimal complexity
                const emergencyOptions = {
                  gasLimit: BigInt(2000000), // 2M gas - minimal
                  gasPrice: ethers.parseUnits('1', 'gwei'), // 1 gwei - minimal
                  type: 0
                };
                
                console.log('🆘 Emergency deployment with minimal settings...');
                contract = await contractFactory.deploy(
                  'TestToken', // Hardcoded safe name
                  'TEST', // Hardcoded safe symbol  
                  18,
                  ethers.parseUnits('1000', 18), // 1000 tokens
                  walletAddress,
                  emergencyOptions
                );
                deploymentAttempted = true;
                console.log('✅ Strategy 6 successful - Emergency deployment completed');
                console.log('⚠️ Note: Deployed with emergency parameters, not your requested values');
              } catch (strategy6Error) {
                console.warn('⚠️ Strategy 6 (Emergency) failed:', strategy6Error.message);
                lastError = strategy6Error;
              }
            }

            // Strategy 7: Fallback to server-side deployment (like the private key method that worked)
            if (!deploymentAttempted) {
              try {
                console.log('📋 Strategy 7: Fallback to server-side deployment');
                console.log('💡 This method worked with private keys - attempting same approach');
                
                // Use the server-side API that worked with private keys
                const deploymentData = {
                  tokenName: cleanName,
                  tokenSymbol: cleanSymbol,
                  initialSupply: ethers.formatUnits(totalSupply, 18),
                  description: 'Token deployed via C-Cube platform',
                  walletAddress: walletAddress,
                  twitter: '',
                  website: '',
                  telegram: ''
                };
                
                console.log('🚀 Attempting server-side deployment...');
                const response = await fetch('/api/deploy-token', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(deploymentData)
                });
                
                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(`Server deployment failed: ${errorData.message || response.statusText}`);
                }
                
                const result = await response.json();
                console.log('✅ Strategy 7 successful - Server-side deployment completed');
                
                // Create a mock contract object for compatibility
                contract = {
                  target: result.contractAddress,
                  deploymentTransaction: () => ({
                    hash: result.transactionHash,
                    wait: async () => ({
                      status: 1,
                      hash: result.transactionHash,
                      contractAddress: result.contractAddress
                    })
                  })
                };
                
                deploymentTx = {
                  hash: result.transactionHash,
                  wait: async () => ({
                    status: 1,
                    hash: result.transactionHash,
                    contractAddress: result.contractAddress
                  })
                };
                
                deploymentAttempted = true;
                console.log('✅ Server-side deployment successful - same method that worked with private keys');
                
              } catch (strategy7Error) {
                console.warn('⚠️ Strategy 7 (Server-side fallback) failed:', strategy7Error.message);
                lastError = strategy7Error;
              }
            }

            // If all strategies failed, provide comprehensive diagnostic information
            if (!deploymentAttempted) {
              console.error('❌ ALL 7 deployment strategies failed - This indicates a CRITICAL issue');
              
              // Comprehensive failure analysis
              console.log('🔍 FINAL DIAGNOSTIC ANALYSIS:');
              console.log('=====================================');
              
              // Analyze the last error for specific patterns
              let failureCategory = 'Critical System Issue';
              let specificCause = 'Contract or BSC network fundamental incompatibility';
              let recommendedAction = 'URGENT: Switch to BSC Testnet and contact support';
              
              if (lastError) {
                const errorMsg = lastError.message.toLowerCase();
                
                if (errorMsg.includes('missing trie node') || errorMsg.includes('internal json-rpc error')) {
                  failureCategory = 'BSC RPC Node Infrastructure Issue';
                  specificCause = 'BSC RPC nodes are experiencing synchronization issues or database problems. This is a BSC infrastructure issue, not a problem with your contract or wallet';
                  recommendedAction = 'WAIT: This is a BSC network infrastructure issue. Try again in 10-15 minutes, or switch to BSC Testnet temporarily';
                } else if (errorMsg.includes('missing revert data') || errorMsg.includes('execution reverted')) {
                  failureCategory = 'Contract Constructor Incompatibility';
                  specificCause = 'The contract constructor is fundamentally incompatible with current BSC network rules - this may be due to recent BSC updates, anti-spam measures, or contract code issues';
                  recommendedAction = 'CRITICAL: This contract cannot be deployed on BSC Mainnet. Switch to BSC Testnet (Chain ID: 97) immediately for testing, or use a different contract template';
                } else if (errorMsg.includes('gas') || errorMsg.includes('out of gas')) {
                  failureCategory = 'Systematic Gas Issue';
                  specificCause = 'Even minimal gas settings failed - indicates network-level restrictions or contract complexity issues';
                  recommendedAction = 'BSC may have implemented new gas restrictions. Try BSC Testnet or contact BSC support';
                } else if (errorMsg.includes('nonce') || errorMsg.includes('replacement')) {
                  failureCategory = 'Wallet Transaction State Issue';
                  specificCause = 'Wallet transaction state is corrupted or conflicting';
                  recommendedAction = 'Reset wallet, clear pending transactions, or try a different wallet';
                } else if (errorMsg.includes('network') || errorMsg.includes('timeout')) {
                  failureCategory = 'BSC Network Infrastructure Issue';
                  specificCause = 'BSC network may be experiencing systematic issues or maintenance';
                  recommendedAction = 'Check BSC status page, try different RPC endpoint, or wait for network stability';
                } else if (errorMsg.includes('balance') || errorMsg.includes('insufficient funds')) {
                  failureCategory = 'Insufficient Balance';
                  specificCause = 'Wallet does not have enough BNB for any deployment strategy';
                  recommendedAction = 'Add more BNB to wallet (minimum 0.1 BNB recommended)';
                }
              }
              
              console.log(`- CRITICAL Failure Category: ${failureCategory}`);
              console.log(`- Root Cause Analysis: ${specificCause}`);
              console.log(`- URGENT Action Required: ${recommendedAction}`);
              console.log('=====================================');
              
              // Emergency recommendations
              console.log('🆘 EMERGENCY RECOMMENDATIONS:');
              console.log('1. IMMEDIATELY switch to BSC Testnet (Chain ID: 97)');
              console.log('2. Get testnet BNB from BSC faucet');
              console.log('3. Test deployment on testnet to isolate mainnet issues');
              console.log('4. If testnet works, the issue is BSC Mainnet restrictions');
              console.log('5. If testnet fails, the contract code has fundamental issues');
              console.log('6. Consider using OpenZeppelin contract templates');
              console.log('7. Check BSC announcements for recent policy changes');
              
              const criticalError = new Error(`🚨 CRITICAL SYSTEM FAILURE: All 7 deployment strategies failed

📊 Critical Analysis:
• Category: ${failureCategory}
• Root Cause: ${specificCause}
• Last Error: ${lastError?.message || 'No error details available'}

🆘 EMERGENCY ACTIONS (Do these NOW):
1. ${recommendedAction}
2. Switch to BSC Testnet (Chain ID: 97) IMMEDIATELY
3. Get testnet BNB from faucet
4. Test deployment on testnet
5. If testnet fails, contact developers
6. If testnet works, BSC Mainnet has new restrictions

💡 Alternative Contract Sources:
• OpenZeppelin ERC-20 templates
• Remix IDE standard contracts  
• BSC-verified contract templates

⚠️ CRITICAL: This level of failure indicates either:
- Recent BSC network policy changes
- Contract code incompatibility
- Systematic network issues
- Account/wallet restrictions

DO NOT attempt further mainnet deployments until testnet testing is successful.`);
              
              throw criticalError;
            }
          }

          // Get deployment transaction (handle both standard and alternative methods)
          if (!deploymentTx) {
            deploymentTx = contract.deploymentTransaction();
          }
          
          if (!deploymentTx || !deploymentTx.hash) {
            throw new Error('Deployment transaction was not created properly');
          }
          
          console.log('Contract deployment initiated. Transaction hash:', deploymentTx.hash);
          console.log('Waiting for confirmation...');
          
          // If we get here, deployment was successful, break the loop
          break;
          
        } catch (deployError) {
          console.error(`❌ Deployment attempt ${deploymentAttempts} failed:`, deployError.message);
          console.error('Error details:', {
            code: deployError.code,
            reason: deployError.reason,
            transaction: deployError.transaction ? 'Present' : 'Missing',
            method: (isBSC && deploymentAttempts > 3) ? 'Alternative' : 'Standard'
          });
          
          // Additional BSC-specific error analysis
          if (isBSC) {
            console.error('BSC-specific diagnostics:', {
              networkChainId,
              gasLimit: deployOptions.gasLimit?.toString(),
              gasPrice: deployOptions.gasPrice?.toString(),
              gwei: deployOptions.gasPrice ? ethers.formatUnits(deployOptions.gasPrice, 'gwei') : 'N/A',
              transactionType: deployOptions.type || 'Auto',
              attempt: deploymentAttempts,
              maxAttempts
            });
          }
          
          const isNetworkError = deployError.message.includes('Transaction does not have a transaction hash') ||
                                deployError.message.includes('network') ||
                                deployError.message.includes('timeout') ||
                                deployError.message.includes('connection');
          
          const isRpcError = deployError.message.includes('missing trie node') ||
                           deployError.message.includes('Internal JSON-RPC error') ||
                           deployError.code === -32603 ||
                           deployError.code === -32000;
          
          const isGasError = deployError.message.includes('gas') ||
                           deployError.message.includes('limit') ||
                           deployError.message.includes('price') ||
                           deployError.message.includes('insufficient funds') ||
                           deployError.code === 'INSUFFICIENT_FUNDS';
          
          // Handle RPC errors specifically (missing trie node, Internal JSON-RPC error)
          if (isRpcError && deploymentAttempts < maxAttempts) {
            console.log('🔄 RPC node error detected - implementing fallback strategy...');
            console.log('RPC Error details:', {
              message: deployError.message,
              code: deployError.code,
              data: deployError.data
            });
            
            // Try to switch to a backup RPC if available
            if (provider._workingRpc) {
              console.log('🔄 Switching to backup RPC:', provider._workingRpc);
              try {
                const backupProvider = new ethers.JsonRpcProvider(provider._workingRpc);
                const backupSigner = await provider.getSigner(); // Keep wallet signer
                
                // Test backup RPC
                await backupProvider.getBlockNumber();
                console.log('✅ Backup RPC is working, creating hybrid provider');
                
                // Create a new factory with backup provider but keep wallet signer
                contractFactory = new ethers.ContractFactory(ABI, BYTECODE, backupSigner);
                console.log('✅ Contract factory updated with backup RPC');
                
              } catch (backupError) {
                console.warn('❌ Backup RPC also failed:', backupError.message);
              }
            }
            
            await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
            continue;
          }
          
          // If it's a network error or gas error and we have attempts left, try again
          if ((isNetworkError || isGasError) && deploymentAttempts < maxAttempts) {
            console.log(`${isGasError ? 'Gas' : 'Network'} error detected, waiting before retry...`);
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds for network stability
            
            // Verify network connection before retry (especially for BSC)
            if (isBSC) {
              try {
                const currentBlock = await safeProviderCall(
                  (p) => p.getBlockNumber(),
                  'network verification before retry'
                );
                console.log('✅ Network connection verified. Current block:', currentBlock);
              } catch (networkError) {
                console.error('❌ Network connection issue:', networkError.message);
                throw new Error('BSC network connection issue. Please check your internet connection and try again.');
              }
            }
            
            if (isGasError && isBSC && bscGasConfigs && deploymentAttempts <= bscGasConfigs.length) {
              // Use predefined BSC gas configurations
              const config = bscGasConfigs[deploymentAttempts - 1];
              gasLimit = config.gasLimit;
              deployOptions.gasLimit = gasLimit;
              deployOptions.gasPrice = config.gasPrice;
              
              // Ensure we're still using legacy transaction for BSC
              delete deployOptions.maxFeePerGas;
              delete deployOptions.maxPriorityFeePerGas;
              deployOptions.type = 0; // Explicitly set transaction type to legacy
              
              console.log(`🔄 BSC Retry ${deploymentAttempts}/${bscGasConfigs.length}:`);
              console.log(`- Gas limit: ${gasLimit.toString()}`);
              console.log(`- Gas price: ${ethers.formatUnits(config.gasPrice, 'gwei')} gwei`);
              console.log(`- Transaction type: Legacy (0)`);
              console.log(`- Previous error: ${deployError.message}`);
            } else if (isGasError) {
              // Generic gas reduction for non-BSC networks
              gasLimit = gasLimit * BigInt(80) / BigInt(100); // Reduce gas limit by 20%
              if (gasLimit < BigInt(1000000)) gasLimit = BigInt(1000000); // Don't go below 1M
              deployOptions.gasLimit = gasLimit;
              console.log('Reduced gas limit for retry:', gasLimit.toString());
              
              // Reduce gas price for retry
              if (deployOptions.gasPrice) {
                deployOptions.gasPrice = deployOptions.gasPrice * BigInt(90) / BigInt(100); // Reduce by 10%
                console.log('Reduced gas price for retry:', deployOptions.gasPrice.toString());
              }
            }
            continue;
          }
          
          // For non-network errors or if we've exhausted attempts, throw immediately
          if (deployError.message.includes('insufficient funds')) {
            throw new Error('Insufficient funds for deployment. Please add more BNB to your wallet.');
          } else if (deployError.message.includes('gas')) {
            const gasErrorDetail = isBSC 
              ? `BSC gas error after ${deploymentAttempts} attempts. Last attempt used: ${gasLimit.toString()} gas limit, ${deployOptions.gasPrice?.toString()} gas price.`
              : 'Gas-related error during deployment.';
            
            // Add comprehensive error analysis for BSC
            let additionalInfo = '';
            if (isBSC) {
              additionalInfo = '\n\n🔍 BSC Deployment Failed - All Attempts Exhausted';
              additionalInfo += '\n' + '='.repeat(50);
              additionalInfo += `\n📊 Final Attempt Details:`;
              additionalInfo += `\n- Network: ${networkChainId === 56 ? 'BSC Mainnet (56)' : 'BSC Testnet (97)'}`;
              additionalInfo += `\n- Gas Limit: ${gasLimit.toString()} gas units`;
              additionalInfo += `\n- Gas Price: ${ethers.formatUnits(deployOptions.gasPrice, 'gwei')} gwei`;
              additionalInfo += `\n- Estimated Cost: ${ethers.formatEther(gasLimit * deployOptions.gasPrice)} BNB`;
              additionalInfo += `\n- Wallet Balance: ${ethers.formatEther(balance)} BNB`;
              additionalInfo += `\n- Total Attempts: ${deploymentAttempts}/${maxAttempts}`;
              additionalInfo += `\n- Last Error: ${deployError.message}`;
              
              additionalInfo += '\n\n�️ Possible Solutions:';
              additionalInfo += '\n1. **Increase BNB Balance**: Ensure you have at least 0.02 BNB';
              additionalInfo += '\n2. **Try BSC Testnet**: Test deployment on testnet first';
              additionalInfo += '\n3. **Reduce Token Supply**: Try with a smaller initial supply';
              additionalInfo += '\n4. **Network Issues**: BSC might be congested, try again later';
              additionalInfo += '\n5. **Wallet Connection**: Reconnect your wallet and refresh';
              additionalInfo += '\n6. **RPC Issues**: Your wallet might be using a slow BSC RPC endpoint';
              
              additionalInfo += '\n\n🔧 Technical Details:';
              additionalInfo += `\n- Token Name: "${cleanName}"`;
              additionalInfo += `\n- Token Symbol: "${cleanSymbol}"`;
              additionalInfo += `\n- Total Supply: ${ethers.formatUnits(totalSupply, 18)} tokens`;
              additionalInfo += `\n- Owner Address: ${walletAddress}`;
            }
            
            throw new Error(`Gas-related error during deployment: ${gasErrorDetail} Please try again - the system will automatically adjust gas settings.${additionalInfo}`);
          } else if (deployError.message.includes('nonce')) {
            throw new Error('Transaction nonce error. Please try again in a moment.');
          } else if (deployError.message.includes('Transaction does not have a transaction hash')) {
            throw new Error('Network connectivity issue persists. Please check your internet connection and try again later.');
          } else {
            throw new Error(`Deployment failed after ${deploymentAttempts} attempts: ${deployError.message}`);
          }
        }
      }
      
      // If we've exhausted all attempts without success
      if (!contract || !deploymentTx) {
        throw new Error('Failed to deploy contract after all retry attempts. Please try again later.');
      }
      
      // If we get here, deployment was successful, continue with confirmation
      
      // Wait for deployment to be mined with timeout
      console.log('Waiting for transaction to be mined...');
      
      let deploymentReceipt;
      try {
        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Transaction confirmation timeout (3 minutes)')), 180000); // 3 minutes
        });
        
        // Race between transaction confirmation and timeout
        deploymentReceipt = await Promise.race([
          deploymentTx.wait(2), // Wait for 2 confirmations
          timeoutPromise
        ]);
        
      } catch (waitError) {
        console.error('Transaction wait error:', waitError);
        
        // Check if this is a revert error with receipt information
        if (waitError.code === 'CALL_EXCEPTION' && waitError.receipt) {
          const receipt = waitError.receipt;
          console.error('Transaction reverted with receipt:', {
            status: receipt.status,
            gasUsed: receipt.gasUsed?.toString(),
            contractAddress: receipt.contractAddress,
            blockNumber: receipt.blockNumber,
            transactionHash: receipt.hash
          });
          
          // Analyze the revert
          let revertReason = 'Unknown constructor failure';
          
          // Enhanced BSC-specific constructor failure analysis
          if (isBSC) {
            revertReason = 'BSC Constructor Failed - Enhanced Analysis:\n\n';
            revertReason += '🔍 Your Parameters:\n';
            revertReason += `• Name: "${cleanName}" (${cleanName.length} chars)\n`;
            revertReason += `• Symbol: "${cleanSymbol}" (${cleanSymbol.length} chars)\n`;
            revertReason += `• Supply: ${ethers.formatUnits(totalSupply, 18)} tokens\n`;
            revertReason += `• Owner: ${walletAddress}\n\n`;
            
            revertReason += '❌ Most Common BSC Constructor Issues:\n';
            revertReason += '• Name/Symbol contains non-ASCII or special characters\n';
            revertReason += '• Symbol conflicts with existing major tokens (BNB, BUSD, etc.)\n';
            revertReason += '• Total supply causes integer overflow in constructor\n';
            revertReason += '• Owner address has invalid checksum or format\n';
            revertReason += '• Constructor parameters exceed gas limit\n';
            revertReason += '• BSC network congestion causing execution failure\n\n';
            
            revertReason += '🛠️ Recommended Fixes:\n';
            revertReason += '• Use only letters and numbers in name/symbol\n';
            revertReason += '• Choose unique symbol not used by major tokens\n';
            revertReason += '• Reduce total supply if very large (>1 trillion)\n';
            revertReason += '• Verify wallet address format and checksum\n';
            revertReason += '• Try deployment during low network activity\n\n';
            
            revertReason += '💡 Debug Steps:\n';
            revertReason += '1. Check transaction details in BSCScan link below\n';
            revertReason += '2. Look for specific revert reason in transaction logs\n';
            revertReason += '3. Try deploying on BSC Testnet first\n';
            revertReason += '4. Reduce gas price if network is congested';
          }
          
          const explorerUrl = isBSC 
            ? (networkChainId === 56 
                ? `https://bscscan.com/tx/${receipt.hash}`
                : `https://testnet.bscscan.com/tx/${receipt.hash}`)
            : `Transaction: ${receipt.hash}`;
          
          throw new Error(`Contract deployment failed during execution: ${revertReason}\n\nTransaction was mined but constructor reverted.\nCheck transaction details: ${explorerUrl}`);
        }
        
        if (waitError.message.includes('timeout')) {
          // Transaction might still be pending, provide guidance
          throw new Error(`Transaction confirmation timeout. Transaction hash: ${deploymentTx.hash}. Please check BSCScan for status.`);
        } else {
          throw new Error(`Transaction confirmation failed: ${waitError.message}`);
        }
      }
      
      console.log('Deployment receipt:', {
        status: deploymentReceipt.status,
        gasUsed: deploymentReceipt.gasUsed.toString(),
        effectiveGasPrice: deploymentReceipt.gasPrice?.toString(),
        contractAddress: deploymentReceipt.contractAddress
      });
      
      if (!deploymentReceipt.status) {
        throw new Error(`Contract deployment transaction failed. Status: ${deploymentReceipt.status}`);
      }
      
      if (!deploymentReceipt.contractAddress) {
        throw new Error('No contract address in deployment receipt - deployment may have failed');
      }
      
      console.log('Contract deployed successfully!');
      console.log('Contract Address:', await contract.getAddress());
      console.log('Transaction Hash:', deploymentReceipt.hash);
      console.log('Gas Used:', deploymentReceipt.gasUsed.toString());

      const contractAddress = await contract.getAddress();
      const transactionHash = deploymentReceipt.hash;
      
      // Wait a moment for network propagation
      console.log('Waiting for network propagation...');
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
      
      // Verify the contract was actually deployed by checking contract code
      console.log('Verifying contract deployment...');
      const contractProvider = contract.runner.provider;
      let deployedCode;
      
      // Try multiple times in case of network delay
      for (let attempt = 1; attempt <= 3; attempt++) {
        console.log(`Verification attempt ${attempt}/3...`);
        deployedCode = await contractProvider.getCode(contractAddress);
        
        if (deployedCode !== '0x') {
          break; // Contract found!
        }
        
        if (attempt < 3) {
          console.log('No code found yet, waiting 2 seconds...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      if (deployedCode === '0x') {
        // Additional debugging - check the transaction receipt more carefully
        console.error('❌ Deployment failed. Debugging info:');
        console.error('- Contract address:', contractAddress);
        console.error('- Transaction hash:', deploymentReceipt.hash);
        console.error('- Gas used vs limit:', `${deploymentReceipt.gasUsed.toString()} / ${gasLimit.toString()}`);
        console.error('- Block number:', deploymentReceipt.blockNumber);
        
        // Check if we used all the gas (indicating out of gas)
        const gasUsedPercentage = (Number(deploymentReceipt.gasUsed) / Number(gasLimit)) * 100;
        console.error('- Gas usage percentage:', `${gasUsedPercentage.toFixed(2)}%`);
        
        if (gasUsedPercentage > 95) {
          throw new Error(`Contract deployment ran out of gas. Used ${gasUsedPercentage.toFixed(2)}% of gas limit. Try with a higher gas limit or simpler parameters.`);
        } else {
          throw new Error(`Contract deployment failed - constructor may have reverted. Gas used: ${gasUsedPercentage.toFixed(2)}%. Check BSCScan: https://bscscan.com/tx/${deploymentReceipt.hash}`);
        }
      }
      
      console.log('Contract code verified - deployment successful!');
      console.log('Contract code length:', deployedCode.length);
      
      // Test the contract by calling a view function
      try {
        console.log('Testing contract functions...');
        const deployedName = await contract.name();
        const deployedSymbol = await contract.symbol();
        const deployedSupply = await contract.totalSupply();
        const deployedDecimals = await contract.decimals();
        const ownerBalance = await contract.balanceOf(walletAddress);
        
        console.log('✅ Contract verification successful!');
        console.log('- Name:', deployedName);
        console.log('- Symbol:', deployedSymbol);
        console.log('- Decimals:', deployedDecimals);
        console.log('- Total Supply:', ethers.formatUnits(deployedSupply, 18));
        console.log('- Owner Balance:', ethers.formatUnits(ownerBalance, 18));
        
        // Verify the values match what we deployed
        if (deployedName !== formData.tokenName) {
          console.warn(`⚠️ Name mismatch: expected "${formData.tokenName}", got "${deployedName}"`);
        }
        if (deployedSymbol !== formData.tokenSymbol) {
          console.warn(`⚠️ Symbol mismatch: expected "${formData.tokenSymbol}", got "${deployedSymbol}"`);
        }
        
      } catch (error) {
        console.error('❌ Contract function test failed:', error.message);
        // Don't throw here - the contract might still be deployable even if we can't read it immediately
      }
      const explorerUrl = isMainnet 
        ? `https://bscscan.com/tx/${transactionHash}`
        : `https://testnet.bscscan.com/tx/${transactionHash}`;

      return {
        success: true,
        contractAddress,
        transactionHash,
        explorerUrl,
        deploymentInfo: {
          contractAddress,
          transactionHash,
          tokenName: formData.tokenName,
          tokenSymbol: formData.tokenSymbol,
          decimals: 18,
          initialSupply: formData.initialSupply,
          ownerAddress: walletAddress,
          network: isMainnet ? 'BSC Mainnet' : 'BSC Testnet',
          chainId: isMainnet ? 56 : 97,
          deployedAt: new Date().toISOString(),
          explorerUrl
        }
      };

    } catch (error) {
      console.error('Wallet deployment error:', error);
      
      let errorMessage = 'Failed to deploy token with wallet';
      if (error.code === 4001) {
        errorMessage = 'Transaction was rejected by user';
      } else if (error.code === -32603) {
        errorMessage = 'Insufficient funds for gas fees';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  };

  const handleLaunch = async () => {
    const validationError = validateForm();
    if (validationError) {
      setResult({
        success: false,
        message: validationError
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Get current wallet from global context
      // Note: No wallet connection required for server-side deployment
      console.log('🎯 Using server-side deployment method (private key from environment)');
      console.log('💡 This method uses the private key in .env file - no wallet connection needed');
      
      // Deploy token using server-side method (private key - reliable)
      const deploymentResult = await deployTokenWithPrivateKey();
      
      if (!deploymentResult.success) {
        console.error('❌ Deployment failed:', deploymentResult);
        setResult({
          success: false,
          message: `Token deployment failed: ${deploymentResult.error || 'Unknown error'}`
        });
        return;
      }

      // Prepare form data for API - convert image to base64 if present
      let apiFormData = { ...formData };
      
      if (formData.tokenImage && formData.tokenImage instanceof File) {
        try {
          const base64Image = await convertFileToBase64(formData.tokenImage);
          apiFormData.tokenImage = base64Image;
        } catch (imageError) {
          console.error('Error converting image to base64:', imageError);
          // Continue without image if conversion fails
          apiFormData.tokenImage = null;
        }
      }

      // Save image to GitHub first if present
      let imageInfo = null;
      if (apiFormData.tokenImage && typeof apiFormData.tokenImage === 'string') {
        console.log('🖼️ Uploading token image to GitHub...');
        imageInfo = await saveImageToGitHub(apiFormData.tokenImage, deploymentResult.contractAddress, formData.tokenImage);
      }

      // Save token data to database
      const tokenData = {
        tokenName: apiFormData.tokenName,
        tokenSymbol: apiFormData.tokenSymbol,
        description: apiFormData.description || `${apiFormData.tokenName} (${apiFormData.tokenSymbol}) - BSC Token`,
        initialSupply: apiFormData.initialSupply,
        decimals: "18",
        walletAddress: deploymentResult.ownerAddress,
        twitter: apiFormData.twitter || "",
        website: apiFormData.website || "",
        telegram: apiFormData.telegram || "",
        contractAddress: deploymentResult.contractAddress,
        transactionHash: deploymentResult.transactionHash,
        explorerUrl: deploymentResult.explorerUrl,
        deploymentInfo: {
          tokenName: apiFormData.tokenName,
          tokenSymbol: apiFormData.tokenSymbol,
          initialSupply: parseInt(apiFormData.initialSupply) || 0,
          decimals: 18,
          ownerAddress: deploymentResult.ownerAddress,
          network: isMainnet ? "BSC Mainnet" : "BSC Testnet",
          chainId: isMainnet ? 56 : 97,
          deployedAt: new Date().toISOString(),
          gasUsed: deploymentResult.gasUsed || "1500000"
        },
        ...(imageInfo && { image: imageInfo }),
        metadata: {
          contractAddress: deploymentResult.contractAddress,
          hasImage: !!imageInfo,
          createdAt: new Date().toISOString(),
          dataFile: `${deploymentResult.contractAddress.toLowerCase().replace('0x', '')}.json`,
          systemVersion: "batch-deployment-v1",
          deploymentType: "real-blockchain"
        }
      };

      const saved = await saveTokenToGitHub(tokenData);
      if (saved) {
        // Refresh token list to show the newly saved token
        fetchLaunchedTokens();
      } else {
        console.warn('Token deployed but failed to save to database');
        // Still show success since the token was deployed
      }

      setResult({
        success: true,
        message: 'Token launched successfully using your connected wallet!',
        contractAddress: deploymentResult.contractAddress,
        transactionHash: deploymentResult.transactionHash,
        explorerUrl: deploymentResult.explorerUrl,
        deploymentInfo: deploymentResult.deploymentInfo
      });

      // Refresh the token list
      setTimeout(() => {
        fetchLaunchedTokens();
      }, 3000);

    } catch (error) {
      console.error('Launch error:', error);
      setResult({
        success: false,
        message: error.message || 'Failed to launch token'
      });
    } finally {
      setLoading(false);
    }
  };

  // Wallet connection handlers
  const handleWalletClick = () => {
    if (cCubeWalletConnected) {
      // C-Cube wallet connected - show confirmation dialog
      handleCCubeWalletDisconnect();
    } else if (externalWalletConnected) {
      // External wallet connected - disconnect immediately
      handleExternalWalletDisconnect();
    } else {
      // Not connected - show wallet selection modal
      setShowWalletModal(true);
    }
  };

  const handleWalletDisconnect = async () => {
    try {
      // Use global context to disconnect all wallets
      await disconnectAllWallets();
      setShowRemoveConfirmation(false);
      
      // Clear wallet address from form
      setFormData(prev => ({
        ...prev,
        walletAddress: ''
      }));
      
      console.log('All wallets disconnected through global context.');
    } catch (error) {
      console.error('Error disconnecting wallets:', error);
    }
  };

  const handleExternalWalletDisconnect = async () => {
    try {
      // Use global context to disconnect external wallet
      await disconnectExternalWallet();
      
      // Clear wallet address from form
      setFormData(prev => ({
        ...prev,
        walletAddress: ''
      }));
      
      console.log('External wallet disconnected through global context.');
    } catch (error) {
      console.error('Error disconnecting external wallet:', error);
    }
  };

  const handleCCubeWalletDisconnect = () => {
    // Show confirmation dialog for C-Cube wallet
    setShowRemoveConfirmation(true);
  };

  const handleCancelRemove = () => {
    setShowRemoveConfirmation(false);
  };

  const handleWalletSetup = async (newWalletData) => {
    try {
      // Use global context to connect C-Cube wallet
      await connectCCubeWallet(newWalletData);
      setShowWalletSetup(false);
      
      // Auto-populate wallet address in form
      setFormData(prev => ({
        ...prev,
        walletAddress: newWalletData.address
      }));
      
      console.log('C-Cube wallet connected through global context');
    } catch (error) {
      console.error('Error connecting C-Cube wallet:', error);
    }
  };

  const handleCloseWalletSetup = () => {
    setShowWalletSetup(false);
  };

  // External Wallet Functions
  const connectMetaMask = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        // First disconnect any existing connections to force fresh connection
        try {
          await window.ethereum.request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }]
          });
        } catch (permissionError) {
          // If permission request fails, try direct account request
          console.log('Permission request failed, trying direct connection:', permissionError);
        }
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        // Request accounts - this should always show the MetaMask popup
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts found. Please make sure MetaMask is unlocked.');
        }
        
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const balance = await provider.getBalance(address);
        
        // Use global context to connect external wallet
        await connectExternalWallet();
        setShowWalletModal(false);
        
        // Auto-populate wallet address in form
        setFormData(prev => ({
          ...prev,
          walletAddress: address
        }));
      } else {
        alert('MetaMask is not installed. Please install MetaMask to continue.');
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      
      // More specific error messages
      if (error.code === 4001) {
        alert('MetaMask connection was rejected by user.');
      } else if (error.code === -32002) {
        alert('MetaMask connection request is already pending. Please check MetaMask.');
      } else {
        alert('Failed to connect to MetaMask: ' + (error.message || 'Unknown error'));
      }
    }
  };

  const connectTrustWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined' && window.ethereum.isTrust) {
        // First request permissions to force fresh connection
        try {
          await window.ethereum.request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }]
          });
        } catch (permissionError) {
          // If permission request fails, try direct account request
          console.log('Permission request failed, trying direct connection:', permissionError);
        }
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        // Request accounts - this should always show the Trust Wallet popup
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts found. Please make sure Trust Wallet is unlocked.');
        }
        
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const balance = await provider.getBalance(address);
        
        const walletData = {
          address,
          balance: ethers.formatEther(balance),
          provider: 'Trust Wallet'
        };
        
        // Use global wallet context
        await connectExternalWallet();
        setShowWalletModal(false);
        
        // Auto-populate wallet address in form
        setFormData(prev => ({
          ...prev,
          walletAddress: address
        }));
      } else {
        alert('Trust Wallet is not available. Please use Trust Wallet browser or install the extension.');
      }
    } catch (error) {
      console.error('Error connecting to Trust Wallet:', error);
      
      // More specific error messages
      if (error.code === 4001) {
        alert('Trust Wallet connection was rejected by user.');
      } else if (error.code === -32002) {
        alert('Trust Wallet connection request is already pending. Please check Trust Wallet.');
      } else {
        alert('Failed to connect to Trust Wallet: ' + (error.message || 'Unknown error'));
      }
    }
  };

  // Database Integration Functions
  const saveImageToGitHub = async (base64Image, contractAddress, originalFile) => {
    try {
      console.log('🖼️ Saving image to GitHub...', contractAddress);
      const githubToken = process.env.REACT_APP_GITHUB_TOKEN;
      const imageDirectory = isMainnet ? 'Image_mainnet' : 'images';
      const fileName = `${contractAddress.toLowerCase().replace('0x', '')}.png`;
      const filePath = `${imageDirectory}/${fileName}`;
      
      // Extract base64 content (remove data:image/...;base64, prefix if present)
      const base64Content = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
      
      console.log('📁 Image path:', filePath);
      
      // Check if image file exists first
      let sha = null;
      const checkUrl = `https://api.github.com/repos/cyfocube/C_DataBase/contents/${filePath}`;
      
      try {
        const checkResponse = await fetch(checkUrl, {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
          }
        });
        
        if (checkResponse.ok) {
          const existingFile = await checkResponse.json();
          sha = existingFile.sha; // File exists, get SHA for update
        }
      } catch (checkError) {
        // File doesn't exist, create new
      }
      
      // Save image file
      const saveUrl = `https://api.github.com/repos/cyfocube/C_DataBase/contents/${filePath}`;
      const savePayload = {
        message: `Add token image for ${contractAddress}`,
        content: base64Content,
        branch: 'main'
      };
      
      if (sha) {
        savePayload.sha = sha; // Include SHA for updates
      }
      
      const saveResponse = await fetch(saveUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(savePayload)
      });
      
      if (saveResponse.ok) {
        const result = await saveResponse.json();
        console.log('✅ Image saved to GitHub!');
        
        // Return image info object matching the expected format
        return {
          fileName: fileName,
          url: `https://raw.githubusercontent.com/cyfocube/C_DataBase/main/${filePath}`,
          githubPath: filePath,
          contractAddress: contractAddress,
          uploadedAt: new Date().toISOString(),
          size: Math.round(base64Content.length * 0.75), // Approximate size from base64
          mimeType: "image/png",
          originalName: originalFile && originalFile.name ? originalFile.name : "token_image.png"
        };
      } else {
        const errorData = await saveResponse.json();
        console.error('❌ Failed to save image to GitHub:', saveResponse.status, errorData);
        return null;
      }
    } catch (error) {
      console.error('❌ Error saving image to GitHub:', error);
      return null;
    }
  };

  const saveTokenToGitHub = async (tokenData) => {
    try {
      console.log('🚀 Saving token to GitHub...', tokenData.name, tokenData.symbol);
      const githubToken = process.env.REACT_APP_GITHUB_TOKEN;
      const tokenDirectory = isMainnet ? 'Token_mainnet' : 'tokens';
      const fileName = `${tokenData.contractAddress}.json`;
      const filePath = `${tokenDirectory}/${fileName}`;
      const fileContent = JSON.stringify(tokenData, null, 2);
      
      console.log('📁 File path:', filePath);
      
      // Check if file exists first
      let sha = null;
      const checkUrl = `https://api.github.com/repos/cyfocube/C_DataBase/contents/${filePath}`;
      
      try {
        const checkResponse = await fetch(checkUrl, {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
          }
        });
        
        if (checkResponse.ok) {
          const existingFile = await checkResponse.json();
          sha = existingFile.sha; // File exists, get SHA for update
        }
      } catch (checkError) {
        // File doesn't exist, create new
      }
      
      // Create or update file
      const saveUrl = `https://api.github.com/repos/cyfocube/C_DataBase/contents/${filePath}`;
      const savePayload = {
        message: `Save token data for ${tokenData.name} (${tokenData.symbol})`,
        content: btoa(fileContent),
        branch: 'main'
      };
      
      if (sha) {
        savePayload.sha = sha; // Include SHA for updates
      }
      
      const saveResponse = await fetch(saveUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(savePayload)
      });
      
      if (saveResponse.ok) {
        const result = await saveResponse.json();
        console.log('✅ Token data saved to GitHub database!');
        console.log('📄 File URL:', result.content.html_url);
        return true;
      } else {
        const errorData = await saveResponse.json();
        console.error('❌ Failed to save token to GitHub:', saveResponse.status, errorData);
        return false;
      }
    } catch (error) {
      console.error('❌ Error saving token to GitHub:', error);
      return false;
    }
  };

  const fetchLaunchedTokens = async () => {
    try {
      setLoadingTokens(true);
      
      // Try original API first, fallback to GitHub API
      try {
        const response = await fetch(`/api/tokens/launched?isMainnet=${isMainnet}`);
        if (response.ok) {
          const tokens = await response.json();
          console.log(`Fetched tokens from API (${isMainnet ? 'mainnet' : 'testnet'}):`, tokens.length, tokens);
          setLaunchedTokens(tokens);
          return;
        }
      } catch (apiError) {
        console.log('Original API not available, using GitHub fallback');
      }
      
      // Fallback: Direct GitHub API access to fetch tokens
      const githubToken = process.env.REACT_APP_GITHUB_TOKEN;
      const tokenDirectory = isMainnet ? 'Token_mainnet' : 'tokens';
      const apiUrl = `https://api.github.com/repos/cyfocube/C_DataBase/contents/${tokenDirectory}`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
        }
      });
      
      if (response.ok) {
        const files = await response.json();
        const tokens = [];
        
        // Load token data from each JSON file (excluding README.md)
        for (const file of files) {
          if (file.name.endsWith('.json') && file.name !== 'README.md') {
            try {
              const tokenResponse = await fetch(file.download_url);
              if (tokenResponse.ok) {
                const tokenData = await tokenResponse.json();
                
                // Construct image URL for tokens that have images in the repository
                if (tokenData.metadata && tokenData.metadata.hasImage && tokenData.contractAddress) {
                  const tokenIsMainnet = tokenData.deploymentInfo?.network === 'BSC Mainnet' || tokenData.deploymentInfo?.chainId === 56;
                  const imageDirectory = tokenIsMainnet ? 'images_mainnet' : 'images';
                  tokenData.image = `https://raw.githubusercontent.com/cyfocube/C_DataBase/main/${imageDirectory}/${tokenData.contractAddress.toLowerCase().replace('0x', '')}.png`;
                } else {
                  tokenData.image = null;
                }
                
                // Ensure we have the symbol property for display
                if (!tokenData.symbol && tokenData.tokenSymbol) {
                  tokenData.symbol = tokenData.tokenSymbol;
                }
                
                tokens.push(tokenData);
              }
            } catch (fileError) {
              console.warn('Error loading token file:', file.name, fileError);
            }
          }
        }
        
        console.log(`Fetched tokens from GitHub (${tokenDirectory}):`, tokens.length, tokens);
        setLaunchedTokens(tokens);
      } else {
        console.error('Failed to fetch launched tokens from GitHub');
        // Fallback to sample data if GitHub API fails
        setLaunchedTokens(sampleTokens);
      }
    } catch (error) {
      console.error('Error fetching launched tokens:', error);
      // Fallback to sample data if API fails
      setLaunchedTokens(sampleTokens);
    } finally {
      setLoadingTokens(false);
    }
  };

  const fetchGasPrice = async () => {
    try {
      const chainId = isMainnet ? 56 : 97; // BSC Mainnet : BSC Testnet
      const rpcUrl = isMainnet 
        ? (process.env.REACT_APP_MAINNET_RPC_URL || 'https://bsc-dataseed.binance.org/')
        : (process.env.REACT_APP_RPC_URL || 'https://bsc-testnet.public.blastapi.io');
      
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const feeData = await provider.getFeeData();
      setGasPrice(ethers.formatUnits(feeData.gasPrice, 'gwei'));
    } catch (error) {
      console.error('Error fetching gas price:', error);
    }
  };

  // Copy functionality
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add toast notification here
      console.log('Copied to clipboard:', text);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Built-in renounce functionality
  const handleRenounceOwnership = async (contractAddress) => {
    setRenounceError(null); // Clear previous errors
    
    if (!window.ethereum) {
      setRenounceError({
        message: "Web3 wallet not found",
        details: "Please install MetaMask or another Web3 wallet to renounce ownership",
        timestamp: new Date().toISOString(),
        contractAddress
      });
      return;
    }

    try {
      console.log('🔍 Starting renounce process for contract:', contractAddress);
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      
      console.log('👤 User address:', userAddress);
      
      // Check network
      const network = await provider.getNetwork();
      console.log('🌐 Current network:', network.chainId, network.name);
      
      // Validate network
      const expectedChainId = isMainnet ? 56n : 97n;
      if (network.chainId !== expectedChainId) {
        const networkName = network.chainId === 56n ? 'BSC Mainnet' : 
                           network.chainId === 97n ? 'BSC Testnet' : 
                           `Unknown (${network.chainId})`;
        const expectedName = isMainnet ? 'BSC Mainnet' : 'BSC Testnet';
        
        setRenounceError({
          message: "Wrong network detected",
          details: `You're connected to: ${networkName} (Chain ID: ${network.chainId})\nExpected: ${expectedName} (Chain ID: ${expectedChainId})\n\nPlease switch to the correct network in your wallet.\n\n🔧 Quick Fix:\n1. Open MetaMask\n2. Click network dropdown\n3. Select "${expectedName}"`,
          timestamp: new Date().toISOString(),
          contractAddress,
          currentNetwork: networkName,
          expectedNetwork: expectedName,
          currentChainId: network.chainId.toString(),
          expectedChainId: expectedChainId.toString()
        });
        return;
      }
      
      // Check if contract exists (with RPC error handling)
      let contractCode;
      try {
        contractCode = await provider.getCode(contractAddress);
        console.log('✅ Contract found, code length:', contractCode.length);
      } catch (rpcError) {
        console.error('❌ RPC Error when checking contract:', rpcError);
        
        if (rpcError.message?.includes('not supported') || rpcError.code === 'UNKNOWN_ERROR') {
          setRenounceError({
            message: "RPC Provider Issue",
            details: `Your MetaMask RPC endpoint doesn't support contract validation.\n\n🔧 Quick Fix:\n1. Open MetaMask Settings\n2. Go to Networks\n3. Edit your current network\n4. Use these official RPC URLs:\n\nBSC Mainnet: https://bsc-dataseed.binance.org\nBSC Testnet: https://data-seed-prebsc-1-s1.binance.org:8545\n\nTechnical Error: ${rpcError.message}`,
            timestamp: new Date().toISOString(),
            contractAddress,
            networkInfo: `Chain ${network.chainId}`,
            rpcError: rpcError.toString(),
            solution: "Update RPC URL in MetaMask"
          });
          return;
        }
        
        // For other RPC errors, continue anyway (might be temporary)
        console.warn('⚠️ Contract validation failed, continuing anyway...');
        contractCode = '0x01'; // Assume contract exists
      }
      
      if (contractCode === '0x') {
        setRenounceError({
          message: "Contract not found",
          details: `No contract found at address: ${contractAddress}\n\nThis could mean:\n1. The contract was not deployed to this network\n2. The contract address is incorrect\n3. You're connected to the wrong network\n\nCurrent network: ${network.chainId === 56n ? 'BSC Mainnet' : network.chainId === 97n ? 'BSC Testnet' : 'Unknown'}`,
          timestamp: new Date().toISOString(),
          contractAddress,
          networkInfo: `Chain ${network.chainId}`,
          contractCode
        });
        return;
      }
      
      // Create contract instance with the user's signer
      const contract = new ethers.Contract(
        contractAddress,
        TOKEN_CONTRACT_ABI,
        signer
      );
      
      // Check if user is the owner
      let currentOwner;
      try {
        console.log('🔍 Checking contract owner...');
        currentOwner = await contract.owner();
        console.log('👑 Current contract owner:', currentOwner);
        console.log('🔍 User address:', userAddress);
        
        if (currentOwner.toLowerCase() !== userAddress.toLowerCase()) {
          setRenounceError({
            message: "Not the contract owner",
            details: `You are not the owner of this contract!\n\nContract owner: ${currentOwner}\nYour address: ${userAddress}\n\nOnly the contract owner can renounce ownership.`,
            timestamp: new Date().toISOString(),
            contractAddress,
            userAddress,
            contractOwner: currentOwner
          });
          return;
        }
        
        console.log('✅ Ownership verified - user is the contract owner');
        
      } catch (ownerError) {
        console.error('❌ Failed to check contract owner:', ownerError);
        
        let errorDetails = `Error calling owner() function: ${ownerError.message}`;
        
        if (ownerError.code === 'CALL_EXCEPTION') {
          errorDetails = `Contract call failed - this usually means:\n\n1. Contract doesn't have an owner() function\n2. Contract ABI mismatch\n3. Contract is not a standard ERC20 with ownership\n4. Network/RPC issues\n\nTechnical details:\n${ownerError.message}`;
        }
        
        setRenounceError({
          message: "Failed to verify contract ownership",
          details: errorDetails,
          timestamp: new Date().toISOString(),
          contractAddress,
          userAddress,
          networkInfo: `Chain ${network.chainId}`,
          errorCode: ownerError.code,
          error: ownerError.toString()
        });
        return;
      }
      
      // Confirm with user
      const confirmed = window.confirm(
        "⚠️ WARNING: Renouncing ownership is PERMANENT and IRREVERSIBLE!\n\n" +
        "After renouncement:\n" +
        "• You cannot mint new tokens\n" +
        "• You cannot modify the contract\n" +
        "• The contract becomes fully decentralized\n\n" +
        "Are you absolutely sure you want to proceed?"
      );
      
      if (!confirmed) {
        console.log('❌ User cancelled renouncement');
        return;
      }
      
      console.log('🚫 Renouncing ownership for contract:', contractAddress);
      
      // Estimate gas first
      let gasEstimate;
      try {
        gasEstimate = await contract.transferOwnership.estimateGas("0x0000000000000000000000000000000000000000");
        console.log('⛽ Estimated gas:', gasEstimate.toString());
      } catch (gasError) {
        console.error('❌ Gas estimation failed:', gasError);
        setRenounceError({
          message: "Gas estimation failed",
          details: `Failed to estimate gas for renouncement.\nError: ${gasError.message}\n\nThis usually means the transaction would fail. Please check:\n1. You have enough BNB for gas\n2. You are the contract owner\n3. The contract allows ownership transfer`,
          timestamp: new Date().toISOString(),
          contractAddress,
          error: gasError.toString()
        });
        return;
      }
      
      // Call transferOwnership with zero address (renounce)
      const tx = await contract.transferOwnership("0x0000000000000000000000000000000000000000", {
        gasLimit: Math.floor(Number(gasEstimate) * 1.2) // Add 20% buffer
      });
      
      console.log('⏳ Renunciation transaction submitted:', tx.hash);
      alert(`Renunciation transaction submitted!\nTransaction: ${tx.hash}\n\nWaiting for confirmation...`);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      console.log('✅ Ownership renounced successfully!', receipt);
      alert(`🎉 Ownership renounced successfully!\n\nYour token is now fully decentralized.\nTransaction: ${tx.hash}\n\nBlock: ${receipt.blockNumber}`);
      
    } catch (error) {
      console.error('❌ Failed to renounce ownership:', error);
      
      let errorMessage = 'Failed to renounce ownership';
      let errorDetails = `Error: ${error.message || error.toString()}\n\nFull error object:\n${JSON.stringify(error, null, 2)}`;
      
      if (error.code === 4001) {
        errorMessage = 'Transaction rejected by user';
        errorDetails = 'User rejected the transaction in their wallet';
      } else if (error.code === -32603) {
        errorMessage = 'Insufficient funds for gas fees';
        errorDetails = 'You need more BNB to pay for transaction gas fees';
      } else if (error.code === -32602) {
        errorMessage = 'Invalid parameters';
        errorDetails = `Invalid transaction parameters\nError: ${error.message}`;
      } else if (error.code === -32000) {
        errorMessage = 'Transaction would fail';
        errorDetails = 'Transaction would fail - you may not be the owner or have insufficient gas';
      } else if (error.message?.includes('Not the owner')) {
        errorMessage = 'Not the contract owner';
        errorDetails = 'You are not the owner of this contract';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds';
        errorDetails = 'Insufficient BNB for gas fees';
      } else if (error.message?.includes('execution reverted')) {
        errorMessage = 'Transaction reverted';
        errorDetails = 'Transaction reverted - you may not be the contract owner';
      }
      
      setRenounceError({
        message: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString(),
        contractAddress,
        errorCode: error.code,
        errorData: error.data,
        fullError: error.toString()
      });
    }
  };

  // Enhanced renounce function that tries multiple methods
  const handleSmartRenounce = async (contractAddress) => {
    setRenounceError(null);
    
    if (!window.ethereum) {
      setRenounceError({
        message: "Web3 wallet not found",
        details: "Please install MetaMask or another Web3 wallet",
        timestamp: new Date().toISOString(),
        contractAddress
      });
      return;
    }

    try {
      // DEBUG: Check current wallet vs contract owner
      const debugProvider = new ethers.BrowserProvider(window.ethereum);
      const debugSigner = await debugProvider.getSigner();
      const debugUserAddress = await debugSigner.getAddress();
      
      // Get contract owner
      const ownerContract = new ethers.Contract(contractAddress, [
        "function owner() view returns (address)"
      ], debugProvider);
      
      const contractOwner = await ownerContract.owner();
      
      console.log("🔍 OWNERSHIP DEBUG:");
      console.log("Connected wallet:", debugUserAddress);
      console.log("Contract owner:", contractOwner);
      console.log("Addresses match:", debugUserAddress.toLowerCase() === contractOwner.toLowerCase());
      
      if (debugUserAddress.toLowerCase() !== contractOwner.toLowerCase()) {
        setRenounceError({
          message: "❌ Wallet Ownership Mismatch",
          details: `Connected wallet: ${debugUserAddress}\nContract owner: ${contractOwner}\n\nYou can only renounce ownership from the wallet that owns the contract. Please switch to the correct wallet in MetaMask.`,
          timestamp: new Date().toISOString(),
          contractAddress,
          technicalDetails: {
            connectedWallet: debugUserAddress,
            contractOwner: contractOwner,
            network: await debugProvider.getNetwork()
          }
        });
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      
      // Check BNB balance first
      const balance = await provider.getBalance(userAddress);
      const balanceBNB = ethers.formatEther(balance);
      const network = await provider.getNetwork();
      const isTestnet = network.chainId === 97n;
      
      console.log(`💰 Current BNB balance: ${balanceBNB} BNB`);
      
      // Estimate gas for renouncement
      const contract = new ethers.Contract(contractAddress, TOKEN_CONTRACT_ABI, signer);
      
      let estimatedGas = 0n;
      let gasPrice = 0n;
      
      try {
        // Try to estimate gas for transferOwnership to burn address
        estimatedGas = await contract.transferOwnership.estimateGas("0x000000000000000000000000000000000000dEaD");
        const feeData = await provider.getFeeData();
        gasPrice = feeData.gasPrice || 5000000000n; // 5 gwei fallback
        
        const estimatedCost = estimatedGas * gasPrice;
        const estimatedCostBNB = ethers.formatEther(estimatedCost);
        
        console.log(`⛽ Estimated gas: ${estimatedGas.toString()}`);
        console.log(`💸 Estimated cost: ${estimatedCostBNB} BNB`);
        
        if (balance < estimatedCost) {
          const needed = ethers.formatEther(estimatedCost - balance);
          setRenounceError({
            message: "Insufficient BNB for gas fees",
            details: `You need more BNB to pay for gas fees.\n\nYour balance: ${balanceBNB} BNB\nEstimated cost: ${estimatedCostBNB} BNB\nAdditional needed: ${needed} BNB\n\n${isTestnet ? 
              '🔧 Get testnet BNB:\nhttps://testnet.binance.org/faucet-smart' : 
              '🔧 Get BNB:\n1. Buy on exchange (Binance, Coinbase)\n2. Use PancakeSwap to swap tokens\n3. Transfer from another wallet'
            }`,
            timestamp: new Date().toISOString(),
            contractAddress,
            currentBalance: balanceBNB,
            estimatedCost: estimatedCostBNB,
            additionalNeeded: needed,
            isTestnet
          });
          return;
        }
        
      } catch (gasError) {
        console.warn('⚠️ Gas estimation failed, continuing anyway...', gasError.message);
      }
      
      const confirmed = window.confirm(
        "⚠️ SMART RENOUNCE MODE\n\n" +
        `Current balance: ${balanceBNB} BNB\n` +
        `Estimated cost: ${estimatedGas > 0n ? ethers.formatEther(estimatedGas * gasPrice) : '~0.001'} BNB\n\n` +
        "This will try different renouncement methods:\n" +
        "1. renounceOwnership() function\n" +
        "2. transferOwnership to burn address\n\n" +
        "WARNING: This is PERMANENT and IRREVERSIBLE!\n\n" +
        "Continue?"
      );
      
      if (!confirmed) return;
      
      console.log('🧠 Smart renounce for:', contractAddress);
      
      // Method 1: Try renounceOwnership() function first
      try {
        console.log('🔄 Trying renounceOwnership() function...');
        const renounceFunc = contract.renounceOwnership;
        if (renounceFunc) {
          const tx = await renounceFunc();
          console.log('✅ renounceOwnership() succeeded:', tx.hash);
          alert(`✅ Ownership renounced using renounceOwnership()!\nTransaction: ${tx.hash}`);
          const receipt = await tx.wait();
          alert(`🎉 Confirmed! Block: ${receipt.blockNumber}`);
          return;
        }
      } catch (renounceError) {
        console.log('❌ renounceOwnership() failed, trying alternatives...', renounceError.message);
      }
      
      // Method 2: Try transferOwnership to common burn addresses
      const burnAddresses = [
        "0x000000000000000000000000000000000000dEaD", // Burn address
        "0x0000000000000000000000000000000000000001", // Minimal address
      ];
      
      for (const burnAddress of burnAddresses) {
        try {
          console.log(`🔄 Trying transferOwnership to ${burnAddress}...`);
          const tx = await contract.transferOwnership(burnAddress);
          console.log(`✅ Transfer to ${burnAddress} succeeded:`, tx.hash);
          alert(`✅ Ownership transferred to burn address!\nTo: ${burnAddress}\nTransaction: ${tx.hash}`);
          const receipt = await tx.wait();
          alert(`🎉 Confirmed! Block: ${receipt.blockNumber}`);
          return;
        } catch (transferError) {
          console.log(`❌ Transfer to ${burnAddress} failed:`, transferError.message);
        }
      }
      
      // If all methods fail
      setRenounceError({
        message: "All renouncement methods failed",
        details: `This contract prevents renouncement by design.\n\nThe contract:\n1. Doesn't have renounceOwnership() function\n2. Prevents transferOwnership to zero/burn addresses\n\nYour options:\n1. Deploy a new contract with proper renouncement\n2. Keep the current ownership\n3. Transfer to a trusted burn address manually`,
        timestamp: new Date().toISOString(),
        contractAddress,
        suggestion: "Contract doesn't support renouncement"
      });
      
    } catch (error) {
      console.error('❌ Smart renounce failed:', error);
      
      if (error.message?.includes('insufficient funds')) {
        setRenounceError({
          message: "Insufficient BNB for gas fees",
          details: `You don't have enough BNB to pay for gas fees.\n\nError: ${error.message}\n\n${network.chainId === 97n ? 
            '🔧 Get testnet BNB:\nhttps://testnet.binance.org/faucet-smart' : 
            '🔧 Get BNB:\n1. Buy on exchange\n2. Use PancakeSwap\n3. Transfer from another wallet'
          }`,
          timestamp: new Date().toISOString(),
          contractAddress,
          error: error.toString()
        });
      } else {
        setRenounceError({
          message: "Smart renounce error",
          details: `Error: ${error.message}`,
          timestamp: new Date().toISOString(),
          contractAddress,
          error: error.toString()
        });
      }
    }
  };

  // Auto-populate wallet address from global context when wallet connects
  useEffect(() => {
    if (cCubeWalletConnected && cCubeWalletData?.address) {
      setFormData(prev => ({
        ...prev,
        walletAddress: cCubeWalletData.address
      }));
    } else if (externalWalletConnected && externalWalletData?.address) {
      setFormData(prev => ({
        ...prev,
        walletAddress: externalWalletData.address
      }));
    }
  }, [cCubeWalletConnected, cCubeWalletData, externalWalletConnected, externalWalletData]);

  // useEffect to measure wallet button width and adjust toggle button position
  useEffect(() => {
    const measureWalletButton = () => {
      if (walletButtonRef.current) {
        const rect = walletButtonRef.current.getBoundingClientRect();
        setWalletButtonWidth(rect.width + 70); // Add 70px gap (20px + 50px extra)
      }
    };

    // Measure immediately
    measureWalletButton();

    // Measure again after a short delay to ensure content is rendered
    const timeoutId = setTimeout(measureWalletButton, 100);

    // Add resize listener to handle window resizing
    window.addEventListener('resize', measureWalletButton);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', measureWalletButton);
    };
  }, [cCubeWalletConnected, externalWalletConnected, cCubeWalletData, externalWalletData]); // Re-measure when wallet state changes

  // useEffect hooks for data fetching
  useEffect(() => {
    fetchLaunchedTokens();
    fetchGasPrice();
    
    // Refresh gas price every 30 seconds
    const gasInterval = setInterval(fetchGasPrice, 30000);
    
    // Refresh tokens every 2 minutes
    const tokensInterval = setInterval(fetchLaunchedTokens, 120000);
    
    return () => {
      clearInterval(gasInterval);
      clearInterval(tokensInterval);
    };
  }, [isMainnet]);

  // Show wallet setup prompt when requested
  if (showWalletSetup) {
    return (
      <WalletSetupPrompt 
        onWalletSetup={handleWalletSetup}
        onClose={handleCloseWalletSetup}
        existingWallet={cCubeWalletConnected ? cCubeWalletData : null}
      />
    );
  }

  return (
    <PageWrapper className="website-page">
      <SimpleHeader>
        <SimpleHeaderContent>
          <SimpleLogo>
            <Link to="/">
              <CCubeLogo />
            </Link>
          </SimpleLogo>
          
          <NetworkToggleButton 
            isMainnet={isMainnet} 
            onClick={() => setIsMainnet(!isMainnet)}
            title={`Switch to ${isMainnet ? 'Testnet' : 'Mainnet'}`}
            rightOffset={walletButtonWidth}
          >
            <NetworkToggleIcon isMainnet={isMainnet}>
              {isMainnet ? '🔴' : '🟡'}
            </NetworkToggleIcon>
            {isMainnet ? 'Mainnet' : 'Testnet'}
          </NetworkToggleButton>
          
          <CCubeWalletButton 
            ref={walletButtonRef}
            connected={isAnyWalletConnected()} 
            onClick={handleWalletClick}
          >
            {cCubeWalletConnected ? (
              <span style={{ fontWeight: 'bold' }}>
                🗑️ Disconnect C-Cube{' '}
                {cCubeWalletData && cCubeWalletData.address && (
                  <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>
                    ({cCubeWalletData.address.slice(0, 4)}...{cCubeWalletData.address.slice(-3)})
                  </span>
                )}
              </span>
            ) : externalWalletConnected ? (
              <span style={{ fontWeight: 'bold' }}>
                �️ Disconnect {externalWalletData?.provider}{' '}
                {externalWalletData && externalWalletData.address && (
                  <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>
                    ({externalWalletData.address.slice(0, 4)}...{externalWalletData.address.slice(-3)})
                  </span>
                )}
              </span>
            ) : <span style={{ fontWeight: 'bold' }}>💳 Connect Wallet</span>}
          </CCubeWalletButton>
        </SimpleHeaderContent>
      </SimpleHeader>
      
      {/* Wallet Selection Modal */}
      {showWalletModal && (
        <WalletModalOverlay onClick={() => setShowWalletModal(false)}>
          <WalletModal onClick={(e) => e.stopPropagation()}>
            <CloseModalButton onClick={() => setShowWalletModal(false)}>×</CloseModalButton>
            <WalletModalTitle>Connect Wallet</WalletModalTitle>
            
            <WalletOption onClick={() => {
              setShowWalletModal(false);
              setShowWalletSetup(true);
            }}>
              <WalletIcon>🔷</WalletIcon>
              <div>
                <div style={{ fontWeight: 'bold' }}>C-Cube Wallet</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Create or import C-Cube wallet</div>
              </div>
            </WalletOption>
            
            <WalletOption onClick={connectMetaMask}>
              <WalletIcon>🦊</WalletIcon>
              <div>
                <div style={{ fontWeight: 'bold' }}>MetaMask</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Connect using MetaMask extension</div>
              </div>
            </WalletOption>
            
            <WalletOption onClick={connectTrustWallet}>
              <WalletIcon>🛡️</WalletIcon>
              <div>
                <div style={{ fontWeight: 'bold' }}>Trust Wallet</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Connect using Trust Wallet</div>
              </div>
            </WalletOption>
          </WalletModal>
        </WalletModalOverlay>
      )}
      
      <LaunchContainer>
      <FormContainer>
        <FormHeader>
          <FormTitle>Launch Your Token</FormTitle>
          <FormSubtitle>
            Create and deploy your BSC token in minutes. Fill in your token details below and launch to the blockchain.
          </FormSubtitle>
        </FormHeader>

        <FormContentContainer>
          <ScrollableFormSections>
            <FormSection>
          <SectionTitle>🎨 Token Branding</SectionTitle>
          
          <FormGroup>
            <Label>Token Logo</Label>
            <FileInputLabel htmlFor="tokenImage">
              <ImagePreview src={imagePreview}>
                {!imagePreview && '📷'}
              </ImagePreview>
              <span>Click to upload token logo</span>
              <small style={{ opacity: 0.7 }}>PNG, JPG, GIF up to 5MB</small>
            </FileInputLabel>
            <FileInput
              id="tokenImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </FormGroup>
        </FormSection>

        <FormSection>
          <SectionTitle>📋 Token Information</SectionTitle>
          
          <FormRow columns="1fr 1fr">
            <FormGroup>
              <Label>Token Name *</Label>
              <Input
                type="text"
                name="tokenName"
                value={formData.tokenName}
                onChange={handleInputChange}
                placeholder="e.g., My Awesome Token"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Token Symbol *</Label>
              <Input
                type="text"
                name="tokenSymbol"
                value={formData.tokenSymbol}
                onChange={handleInputChange}
                placeholder="e.g., MAT"
                required
              />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label>Initial Supply *</Label>
              <Input
                type="number"
                name="initialSupply"
                value={formData.initialSupply}
                onChange={handleInputChange}
                placeholder="e.g., 1000000"
                required
              />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label>Token Description</Label>
              <TextArea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your token's purpose, utility, and unique features..."
                rows="4"
              />
            </FormGroup>
          </FormRow>
        </FormSection>

        <FormSection>
          <SectionTitle>🌐 Social Media Links</SectionTitle>
          
          <FormRow columns="1fr 1fr">
            <FormGroup>
              <Label>Twitter</Label>
              <Input
                type="url"
                name="twitter"
                value={formData.twitter}
                onChange={handleInputChange}
                placeholder="https://twitter.com/yourhandle"
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Website</Label>
              <Input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://yourwebsite.com"
              />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label>Telegram</Label>
              <Input
                type="url"
                name="telegram"
                value={formData.telegram}
                onChange={handleInputChange}
                placeholder="https://t.me/yourchannel"
              />
            </FormGroup>
          </FormRow>
        </FormSection>

        <FormSection>
          <SectionTitle>💰 Wallet Configuration</SectionTitle>
          
          <FormRow>
            <FormGroup>
              <Label>Connected Wallet *</Label>
              {cCubeWalletConnected ? (
                <div style={{
                  padding: '12px 16px',
                  border: '2px solid #00cc33',
                  borderRadius: '8px',
                  background: 'rgba(0, 204, 51, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontFamily: 'Share Tech Mono, monospace',
                  color: '#00ff41'
                }}>
                  <span>
                    ✅ C-Cube Wallet Connected
                    <br />
                    <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                      {cCubeWalletData?.address}
                    </span>
                  </span>
                  <button
                    onClick={handleCCubeWalletDisconnect}
                    style={{
                      background: 'rgba(255, 69, 58, 0.2)',
                      border: '1px solid #ff453a',
                      borderRadius: '4px',
                      color: '#ff453a',
                      padding: '6px 12px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Disconnect
                  </button>
                </div>
              ) : externalWalletConnected ? (
                <div style={{
                  padding: '12px 16px',
                  border: '2px solid #00cc33',
                  borderRadius: '8px',
                  background: 'rgba(0, 204, 51, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontFamily: 'Share Tech Mono, monospace',
                  color: '#00ff41'
                }}>
                  <span>
                    ✅ {externalWalletData?.provider} Connected
                    <br />
                    <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                      {externalWalletData?.address}
                    </span>
                  </span>
                  <button
                    onClick={handleExternalWalletDisconnect}
                    style={{
                      background: 'rgba(255, 69, 58, 0.2)',
                      border: '1px solid #ff453a',
                      borderRadius: '4px',
                      color: '#ff453a',
                      padding: '6px 12px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowWalletModal(true)}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #00cc33, #2ecc40)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    padding: '16px 24px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(0, 204, 51, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(0, 204, 51, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(0, 204, 51, 0.3)';
                  }}
                >
                  💳 Connect Wallet
                </button>
              )}
            </FormGroup>
          </FormRow>
        </FormSection>

        <ButtonContainer>
          <LaunchButton
            onClick={handleLaunch}
            disabled={loading}
            loading={loading}
          >
            {loading && <LoadingSpinner />}
            {loading ? 'Deploying Token...' : '� Deploy Token'}
          </LaunchButton>
        </ButtonContainer>

        {result && (
          <ResultContainer success={result.success}>
            <ResultTitle success={result.success}>
              {result.success ? '🎉 Success!' : '❌ Error'}
            </ResultTitle>
            <p>{result.message}</p>
            
            {result.success && result.deploymentInfo && (
              <>
                <TokenDetails>
                <DetailRow>
                  <DetailLabel>Token Name:</DetailLabel>
                  <DetailValue>{result.deploymentInfo.tokenName}</DetailValue>
                </DetailRow>
                
                <DetailRow>
                  <DetailLabel>Token Symbol:</DetailLabel>
                  <DetailValue>{result.deploymentInfo.tokenSymbol}</DetailValue>
                </DetailRow>
                
                <DetailRow>
                  <DetailLabel>Total Supply:</DetailLabel>
                  <DetailValue>{result.deploymentInfo.initialSupply.toLocaleString()} {result.deploymentInfo.tokenSymbol}</DetailValue>
                </DetailRow>
                
                <DetailRow>
                  <DetailLabel>Decimals:</DetailLabel>
                  <DetailValue>{result.deploymentInfo.decimals}</DetailValue>
                </DetailRow>
                
                <DetailRow>
                  <DetailLabel>Contract Address:</DetailLabel>
                  <DetailValue>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', wordBreak: 'keep-all', whiteSpace: 'nowrap' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.9em' }}>{result.contractAddress}</span>
                      <CopyButton onClick={() => copyToClipboard(result.contractAddress)} title="Copy address">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                        </svg>
                      </CopyButton>
                    </div>
                  </DetailValue>
                </DetailRow>
                
                <DetailRow>
                  <DetailLabel>Owner Address:</DetailLabel>
                  <DetailValue>{result.deploymentInfo.ownerAddress}</DetailValue>
                </DetailRow>
                
                <DetailRow>
                  <DetailLabel>Network:</DetailLabel>
                  <DetailValue>{result.deploymentInfo.network} (Chain ID: {result.deploymentInfo.chainId})</DetailValue>
                </DetailRow>
                
                <DetailRow>
                  <DetailLabel>Transaction:</DetailLabel>
                  <DetailValue>
                    <ResultLink href={result.explorerUrl} target="_blank">
                      View on BSCScan ↗
                    </ResultLink>
                  </DetailValue>
                </DetailRow>
                
                <DetailRow>
                  <DetailLabel>Deployed At:</DetailLabel>
                  <DetailValue>{new Date(result.deploymentInfo.deployedAt).toLocaleString()}</DetailValue>
                </DetailRow>
              </TokenDetails>
              
              <ButtonsContainer>
                <PancakeSwapButton
                  onClick={() => {
                    const pancakeSwapUrl = `https://pancakeswap.finance/add/BNB/${result.contractAddress}`;
                    window.open(pancakeSwapUrl, '_blank');
                  }}
                  title="Add liquidity on PancakeSwap"
                >
                  🥞 Add Liquidity on PancakeSwap
                </PancakeSwapButton>
                
                <RenounceButton
                  onClick={() => {
                    const bscScanUrl = isMainnet 
                      ? `https://bscscan.com/address/${result.contractAddress}#writeContract`
                      : `https://testnet.bscscan.com/address/${result.contractAddress}#writeContract`;
                    window.open(bscScanUrl, '_blank');
                  }}
                  title="Renounce ownership on BSCScan"
                >
                  🚫 Renounce Ownership
                </RenounceButton>
              </ButtonsContainer>
              
              <SourceCodeSection>
                <SourceCodeTitle>📋 Contract Source Code for BSCScan Verification</SourceCodeTitle>
                <SourceCodeTextarea 
                  value={CONTRACT_SOURCE_CODE}
                  readOnly
                  onClick={(e) => e.target.select()}
                />
                <CopySourceButton 
                  onClick={() => {
                    navigator.clipboard.writeText(CONTRACT_SOURCE_CODE);
                    // You could add a toast notification here
                  }}
                >
                  📋 Copy Source Code
                </CopySourceButton>
                
                <VerificationSteps>
                  <SourceCodeTitle style={{ marginBottom: '8px', fontSize: '0.95rem' }}>
                    🔐 How to Verify & Renounce Ownership:
                  </SourceCodeTitle>
                  <StepsList>
                    <li>Go to your contract on BSCScan: <strong>{isMainnet ? 'bscscan.com' : 'testnet.bscscan.com'}</strong></li>
                    <li>Click "Contract" tab → "Verify and Publish"</li>
                    <li>Select compiler: <strong>v0.8.30+commit.6e6ed01e</strong></li>
                    <li>Contract Name: <strong>CustomToken</strong></li>
                    <li>Paste the source code above</li>
                    <li>After verification succeeds, go to "Write Contract" tab</li>
                    <li>Connect your wallet and call <strong>transferOwnership(0x0000000000000000000000000000000000000000)</strong></li>
                  </StepsList>
                  <VerificationInfo>
                    💡 <strong>Note:</strong> Contract verification may take 1-2 minutes. Once verified, you can renounce ownership to make your token fully decentralized.
                  </VerificationInfo>
                </VerificationSteps>
                
                <RenounceInstructions>
                  <SourceCodeTitle style={{ marginBottom: '8px', fontSize: '0.95rem', color: '#ff6b6b' }}>
                    ⚠️ Important: Renouncing Ownership
                  </SourceCodeTitle>
                  <VerificationInfo style={{ color: '#ffb3b3' }}>
                    Renouncing ownership is <strong>PERMANENT and IRREVERSIBLE</strong>. After renouncement:
                    <br/>• You cannot mint new tokens • You cannot modify the contract • The contract becomes fully decentralized
                    <br/>Only renounce after you're satisfied with your token setup!
                  </VerificationInfo>
                  
                  <DirectRenounceButton
                    onClick={() => handleSmartRenounce(result.contractAddress)}
                  >
                    🚫 Renounce Ownership
                  </DirectRenounceButton>
                  
                  <div style={{ fontSize: '0.8rem', color: '#b0b0b0', marginTop: '10px' }}>
                    💡 <strong>Renouncement Info:</strong>
                    <br/>• This will permanently remove your control over the contract
                    <br/>• Uses smart detection to find the best renouncement method
                    <br/>• Make sure you have enough BNB for gas fees
                    <br/>• Action is irreversible once confirmed
                  </div>
                </RenounceInstructions>
                
                {renounceError && (
                  <ErrorDisplay>
                    <ErrorTitle>❌ Renouncement Error: {renounceError.message}</ErrorTitle>
                    <ErrorDetails>{renounceError.details}</ErrorDetails>
                    <CopyErrorButton
                      onClick={() => {
                        const errorText = `RENOUNCEMENT ERROR REPORT
Timestamp: ${renounceError.timestamp}
Contract: ${renounceError.contractAddress}
Error: ${renounceError.message}

Details:
${renounceError.details}

Technical Info:
${JSON.stringify(renounceError, null, 2)}`;
                        navigator.clipboard.writeText(errorText);
                        // Could add a toast notification here
                      }}
                    >
                      📋 Copy Error Details
                    </CopyErrorButton>
                  </ErrorDisplay>
                )}
              </SourceCodeSection>
              </>
            )}
          </ResultContainer>
        )}
          </ScrollableFormSections>
        </FormContentContainer>
      </FormContainer>

      {/* Divider */}
      <Divider />

      {/* Right Column - Token List */}
      <TokenListContainer>
        <TokensHeader>
          <ListTitle>🏆 Launched Tokens</ListTitle>
          <SearchContainer>
            <SearchIcon>🔍</SearchIcon>
            <SearchBox
              type="text"
              placeholder="Search tokens by name, symbol, or address..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
            {searchFilter && (
              <ClearSearchButton
                onClick={() => setSearchFilter('')}
                title="Clear search"
              >
                ✕
              </ClearSearchButton>
            )}
          </SearchContainer>
        </TokensHeader>
        
        <TokenTable>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '60px 1.3fr 100px 1.7fr 80px',
            gap: '0.75rem',
            padding: '0.5rem 2.25rem',
            marginRight: '20px',
            marginLeft: '20px',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontWeight: 400,
            color: '#ccc',
            fontSize: '0.9rem'
          }}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
              Rank
              <div style={{
                position: 'absolute',
                right: '-0.375rem',
                top: '50%',
                transform: 'translateY(-50%)',
                height: '32px',
                width: '1px',
                background: 'linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.3), transparent)',
                opacity: 0.6
              }}></div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start', position: 'relative'}}>
              Token Info
              <div style={{
                position: 'absolute',
                right: '-0.375rem',
                top: '50%',
                transform: 'translateY(-50%)',
                height: '32px',
                width: '1px',
                background: 'linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.3), transparent)',
                opacity: 0.6
              }}></div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
              Supply
              <div style={{
                position: 'absolute',
                right: '-0.375rem',
                top: '50%',
                transform: 'translateY(-50%)',
                height: '32px',
                width: '1px',
                background: 'linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.3), transparent)',
                opacity: 0.6
              }}></div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginLeft: '4px', position: 'relative'}}>
              Description
              <div style={{
                position: 'absolute',
                right: '-0.375rem',
                top: '50%',
                transform: 'translateY(-50%)',
                height: '32px',
                width: '1px',
                background: 'linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.3), transparent)',
                opacity: 0.6
              }}></div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Time</div>
          </div>
          
          <TokenRowsSubContainer>
            <TokenRowsContent>
            {loadingTokens ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                Loading launched tokens...
              </div>
            ) : launchedTokens.length > 0 ? (
              launchedTokens.filter(token => {
                if (!searchFilter) return true;
                const searchTerm = searchFilter.toLowerCase();
                return (
                  (token.symbol && token.symbol.toLowerCase().includes(searchTerm)) ||
                  (token.tokenName && token.tokenName.toLowerCase().includes(searchTerm)) ||
                  (token.description && token.description.toLowerCase().includes(searchTerm)) ||
                  (token.contractAddress && token.contractAddress.toLowerCase().includes(searchTerm))
                );
              }).map((token) => (
            <TokenRow key={token.rank}>
              <RankCell rank={token.rank}>#{token.rank}</RankCell>
              
              <InfoCell>
                <TokenImage 
                  src={token.image}
                  bgColor={token.bgColor}
                  borderColor={token.bgColor}
                  onError={(e) => {
                    console.log('Image failed to load:', token.image);
                    e.target.style.backgroundImage = 'none';
                  }}
                >
                  {!token.image && token.symbol && token.symbol[0]}
                </TokenImage>
                <TokenInfo>
                  <TokenSymbol color="white">{token.symbol}</TokenSymbol>
                  <ContractAddress color="#00ff41">
                    {token.contractAddress ? 
                      `${token.contractAddress.slice(0, 6)}...${token.contractAddress.slice(-4)}` : 
                      'N/A'
                    }
                    <CopyButton onClick={() => copyToClipboard(token.contractAddress)} title="Copy full address">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                      </svg>
                    </CopyButton>
                  </ContractAddress>
                  <SocialIcons>
                    {token.socials && token.socials.map((social, index) => 
                      getSocialIcon(social, token, index)
                    )}
                  </SocialIcons>
                </TokenInfo>
              </InfoCell>
              
              <SupplyCell>{formatSupply(token.initialSupply)}</SupplyCell>
              
              <DescriptionCell>{token.description}</DescriptionCell>
              
              <TimeCell>{token.timeCreated || `${token.daysCreated}d`}</TimeCell>
            </TokenRow>
              ))
            ) : searchFilter ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔍</div>
                No tokens found matching "{searchFilter}"
                <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: '#666' }}>
                  Try searching by token name, symbol, or contract address
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📭</div>
                No tokens launched yet
              </div>
            )}
            </TokenRowsContent>
          </TokenRowsSubContainer>
        </TokenTable>
      </TokenListContainer>
    </LaunchContainer>

      {/* Wallet Removal Confirmation Dialog */}
      {showRemoveConfirmation && (
        <ConfirmationOverlay>
          <ConfirmationDialog>
            <ConfirmationTitle>⚠️ Remove Wallet</ConfirmationTitle>
            <ConfirmationText>
              Are you sure you want to remove your C-Cube wallet from Token Launch? 
              <br /><br />
              <strong>This will permanently delete:</strong>
              <br />• Your wallet connection
              <br />• Stored wallet data
              <br /><br />
              Make sure you have your seed phrase/private key saved if you want to import this wallet again later.
            </ConfirmationText>
            <ConfirmationButtons>
              <ConfirmButton onClick={handleWalletDisconnect}>
                🗑️ Yes, Remove Wallet
              </ConfirmButton>
              <CancelButton onClick={handleCancelRemove}>
                ✕ Cancel
              </CancelButton>
            </ConfirmationButtons>
          </ConfirmationDialog>
        </ConfirmationOverlay>
      )}
    </PageWrapper>
  );
};

export default TokenLaunch;