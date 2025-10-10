import React, { useContext } from 'react';
import styled from 'styled-components';
import { AppContext } from '../context/AppContext';

const NetworkSelectorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
`;

const NetworkLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.colors.text};
`;

const SelectWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const NetworkSelect = styled.select`
  width: 100%;
  padding: 10px 15px;
  background-color: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  appearance: none;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}33;
  }
`;

const SelectArrow = styled.div`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid ${({ theme }) => theme.colors.text};
  pointer-events: none;
`;

const NetworkBadge = styled.div`
  display: inline-flex;
  align-items: center;
  margin-top: 10px;
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${({ color }) => color || '#627EEA'}22;
  color: ${({ color }) => color || '#627EEA'};
  
  &:before {
    content: "";
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${({ color }) => color || '#627EEA'};
    margin-right: 6px;
  }
`;

const NetworkSelector = () => {
  const { networks, selectedNetwork, switchNetwork } = useContext(AppContext);

  const handleNetworkChange = (e) => {
    const networkId = e.target.value;
    switchNetwork(networkId);
  };

  // Safety check - if selectedNetwork is undefined, don't render or use first network as fallback
  if (!selectedNetwork) {
    return null;
  }

  return (
    <NetworkSelectorWrapper>
      <NetworkLabel>Network</NetworkLabel>
      <SelectWrapper>
        <NetworkSelect 
          value={selectedNetwork.id || ''} 
          onChange={handleNetworkChange}
        >
          {networks && networks.map(network => (
            <option 
              key={network.id} 
              value={network.id}
              style={network.isMultiChainView ? {fontWeight: 'bold', color: '#00CC33'} : {}}
            >
              {network.isMultiChainView ? '⭐ ' : ''}{network.name} {network.isTestnet ? '(Testnet)' : ''}
            </option>
          ))}
        </NetworkSelect>
        <SelectArrow />
      </SelectWrapper>
      
      <NetworkBadge color={selectedNetwork.color}>
        {selectedNetwork.isMultiChainView 
          ? 'Multi-Chain View' 
          : `${selectedNetwork.name} - ${selectedNetwork.symbol}`}
      </NetworkBadge>
    </NetworkSelectorWrapper>
  );
};

export default NetworkSelector;
