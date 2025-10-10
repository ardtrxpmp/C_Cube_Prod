// Network configurations for cold wallet functionality
const networksData = [
  {
    id: 'ethereum',
    name: 'Ethereum Mainnet',
    chainId: 1,
    symbol: 'ETH',
    rpcUrl: 'https://cloudflare-eth.com',
    explorerUrl: 'https://etherscan.io',
    color: '#627EEA'
  },
  {
    id: 'polygon',
    name: 'Polygon',
    chainId: 137,
    symbol: 'MATIC',
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    color: '#8247E5'
  },
  {
    id: 'bsc',
    name: 'BSC Mainnet',
    chainId: 56,
    symbol: 'BNB',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    explorerUrl: 'https://bscscan.com',
    color: '#F3BA2F'
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum One',
    chainId: 42161,
    symbol: 'ETH',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    color: '#28A0F0'
  },
  {
    id: 'optimism',
    name: 'Optimism',
    chainId: 10,
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.optimism.io',
    explorerUrl: 'https://optimistic.etherscan.io',
    color: '#FF0420'
  }
];

export const networks = networksData;

export const getNetworkById = (id) => {
  return networks.find(network => network.id === id);
};

export const getNetworkByChainId = (chainId) => {
  return networks.find(network => network.chainId === chainId);
};

export const getNetworkByName = (name) => {
  return networks.find(network => network.name.toLowerCase().includes(name.toLowerCase()));
};

export default networks;